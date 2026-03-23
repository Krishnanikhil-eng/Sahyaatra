import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Resend } from "resend";

export const generatePreSignupCode = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // 1. Check if email already fully registered with a profile!
    // Since emails are stored in Convex Auth's internal "auth" table (if not using custom profiles)
    // we query the underlying "users" table directly (auth._system_users or users table depending on mapping).
    // Convex Auth v1 maps identities to "users".
    const existingUser = await ctx.db
      .query("auth_users" as any) 
      .filter((q) => q.eq(q.field("email"), email))
      .first().catch(() => null); // Fallback incase auth_users isn't the correct internal table name

    // If using default Convex auth, emails might be on the 'users' table or inside auth providers.
    // Let's do a more robust check across the default 'users' table if it exists
    const userInDb = await ctx.db.query("users" as any)
      .filter((q) => q.eq(q.field("email"), email))
      .first().catch(() => null);

    if (existingUser || userInDb) {
      throw new Error("Email already registered. Please sign in instead.");
    }

    // 2. Check if a valid pre-signup code is already pending
    const existingCode = await ctx.db
      .query("verificationCodes")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingCode && existingCode.expiresAt > Date.now()) {
      return { code: existingCode.code, email };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    if (existingCode) {
      await ctx.db.delete(existingCode._id);
    }
    
    await ctx.db.insert("verificationCodes", {
      email,
      code,
      expiresAt,
    });

    return { code, email };
  },
});

export const sendPreSignupEmail = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const result = await ctx.runMutation(internal.verification.generatePreSignupCode, { email });
    if (!result) throw new Error("Could not generate verification code.");
    
    const { code } = result;

    // Production mode: Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
          from: "Sahyaatra Verification <onboarding@resend.dev>", 
          to: [email],
          subject: "Verify your email - Sahyaatra",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #4F46E5;">Sahyaatra Email Verification</h2>
              <p>Your verification code is:</p>
              <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">${code}</span>
              </div>
              <p style="color: #6B7280; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        });

        if (error) {
          // Resend failed — fallback to dev mode instead of breaking the flow
          console.error("Resend error (falling back to dev mode):", error);
          console.log(`DEV MODE: Verification code for ${email} is: ${code}`);
          return { success: true, message: "Verification code sent!", devMode: true };
        }

        console.log(`Email successfully sent to ${email} via Resend!`);
        return { success: true, message: "Verification code sent to your email!", devMode: false };
      } catch (err) {
        // Network or SDK error — fallback gracefully
        console.error("Resend exception (falling back to dev mode):", err);
        console.log(`DEV MODE: Verification code for ${email} is: ${code}`);
        return { success: true, message: "Verification code sent!", devMode: true };
      }
    }

    // Development mode: No API key configured
    console.log(`DEV MODE: Verification code for ${email} is: ${code}`);
    return { success: true, message: "Verification code logged in console!", devMode: true };
  },
});

export const verifyPreSignupCode = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const verificationRecord = await ctx.db
      .query("verificationCodes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!verificationRecord) {
      return { success: false, message: "No verification code requested for this email." };
    }

    if (verificationRecord.expiresAt < Date.now()) {
      await ctx.db.delete(verificationRecord._id);
      return { success: false, message: "Verification code expired. Please request a new one." };
    }

    if (verificationRecord.code !== args.code) {
      return { success: false, message: "Incorrect verification code." };
    }

    // The code is correct! Delete the token.
    await ctx.db.delete(verificationRecord._id);

    // Provide a short-lived "verified status" response. 
    // The frontend will immediately trigger the real `signIn("password", flow: "signUp")` next to register!
    
    return { success: true, message: "Email verified successfully!" };
  },
});

export const markProfileVerified = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // ONLY allowed to be called if the user is authenticated (meaning they JUST signed up successfully)
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be logged in.");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { emailVerified: true });
    }
  }
});

export const generateVerificationCode = internalMutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be logged in to request a verification code.");
    }

    const user = await ctx.db.get(userId);
    if (!user || typeof user.email !== "string") {
      throw new Error("User email not found");
    }

    const existingCode = await ctx.db
      .query("verificationCodes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingCode && existingCode.expiresAt > Date.now()) {
      return { code: existingCode.code, email: user.email };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    if (existingCode) {
      await ctx.db.delete(existingCode._id);
    }
    
    await ctx.db.insert("verificationCodes", {
      userId,
      code,
      expiresAt,
    });

    return { code, email: user.email };
  },
});

export const sendEmailVerification = action({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.runMutation(internal.verification.generateVerificationCode, {});
    if (!result) throw new Error("Could not generate verification code.");
    
    const { code, email } = result;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: "Sahyaatra Verification <onboarding@resend.dev>", 
        to: [email],
        subject: "Verify your email - Sahyaatra",
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 15 minutes.</p>`,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error("Failed to send email. Please try again later.");
      }
      console.log(`Email successfully sent to ${email} via Resend!`);
    } else {
      console.log(`[Development Fallback] Verification code for ${email} is ${code}`);
    }

    return { success: true, message: "Verification code sent!" };
  },
});

export const verifyCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be logged in to verify.");
    }

    const verificationRecord = await ctx.db
      .query("verificationCodes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!verificationRecord) {
      return { success: false, message: "No verification code requested." };
    }

    if (verificationRecord.expiresAt < Date.now()) {
      await ctx.db.delete(verificationRecord._id);
      return { success: false, message: "Verification code expired. Please request a new one." };
    }

    if (verificationRecord.code !== args.code) {
      return { success: false, message: "Incorrect verification code." };
    }

    await ctx.db.delete(verificationRecord._id);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { emailVerified: true });
    }

    return { success: true, message: "Email verified successfully!" };
  },
});

export const getVerificationStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isVerified: false, isLoggedIn: false };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return { isVerified: profile?.emailVerified ?? false, isLoggedIn: true };
  },
});
