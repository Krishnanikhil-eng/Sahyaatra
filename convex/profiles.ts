import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProfile = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const targetUserId = args.userId || currentUserId;

    if (!targetUserId) return null;

    const user = await ctx.db.get(targetUserId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .unique();

    if (!profile) return null;

    return {
      ...profile,
      email: user?.email,
    };
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
    interests: v.array(v.string()),
    avatar: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    let avatarUrl = args.avatar;
    if (args.storageId) {
      avatarUrl = (await ctx.storage.getUrl(args.storageId)) || args.avatar;
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        name: args.name,
        bio: args.bio,
        interests: args.interests,
        avatar: avatarUrl,
      });
      return existingProfile._id;
    } else {
      return await ctx.db.insert("profiles", {
        userId,
        name: args.name,
        bio: args.bio,
        interests: args.interests,
        verified: false,
        avatar: avatarUrl,
      });
    }
  },
});

export const getUserStats = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const targetUserId = args.userId || currentUserId;

    if (!targetUserId) return null;

    // Count trips created
    const tripsCreated = await ctx.db
      .query("trips")
      .withIndex("by_author", (q) => q.eq("authorId", targetUserId))
      .collect();

    // Count trips joined
    const tripsJoined = await ctx.db
      .query("tripRequests")
      .withIndex("by_requester", (q) => q.eq("requesterId", targetUserId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // Calculate total budget managed
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();

    const totalBudgetManaged = budgets.reduce((sum, budget) => sum + budget.totalBudget, 0);

    return {
      tripsCreated: tripsCreated.length,
      tripsJoined: tripsJoined.length,
      totalBudgetManaged,
      completedTrips: tripsCreated.filter(trip => trip.status === "completed").length,
    };
  },
});
