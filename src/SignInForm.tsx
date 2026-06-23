"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./components/ui/button";
import { useTranslation } from "react-i18next";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const { t } = useTranslation(['auth', 'common']);
  const [step, setStep] = useState<"signIn" | "signUp" | "verify">("signIn");
  const [submitting, setSubmitting] = useState(false);
  
  // Temporary state for the OTP verifier
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isDevMode, setIsDevMode] = useState(false);

  const sendPreSignupCode = useAction(api.verification.sendPreSignupEmail);
  const verifyPreSignupCode = useMutation(api.verification.verifyPreSignupCode);
  const markProfileVerified = useMutation(api.verification.markProfileVerified);

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (step === "signIn") {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", "signIn");
      
      try {
        await signIn("password", formData);
      } catch (error: any) {
        toast.error(error.message.includes("Invalid password") 
          ? t('auth:toast.invalidPassword')
          : t('auth:toast.signInFailed'));
        setSubmitting(false);
      }
    } else if (step === "signUp") {
      // Intercept and send Verification Code First!
      try {
        setPendingEmail(email);
        setPendingPassword(password);
        const response = await sendPreSignupCode({ email });
        const devMode = (response as any)?.devMode ?? false;
        setIsDevMode(devMode);
        if (devMode) {
          toast.info(t('auth:toast.devModeCode'));
        } else {
          toast.success(t('auth:toast.codeSentEmail'));
        }
        setStep("verify");
        startResendCooldown();
      } catch (error: any) {
        toast.error(error.message || t('auth:toast.sendCodeFailed'));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error(t('auth:toast.codeMustBe6'));
      return;
    }

    setSubmitting(true);
    try {
      // 1. Check the code
      const result = await verifyPreSignupCode({ email: pendingEmail, code: verificationCode });
      
      if (!result.success) {
        toast.error(result.message);
        setSubmitting(false);
        return;
      }

      // 2. Code is good! Tell Convex to create the real account!
      const formData = new FormData();
      formData.set("email", pendingEmail);
      formData.set("password", pendingPassword);
      formData.set("flow", "signUp");

      await signIn("password", formData);
      
      // 3. Successfully created. Immediately flag the profile as verified to let them in!
      await markProfileVerified({ email: pendingEmail });
      toast.success(t('auth:toast.accountCreated'));

    } catch (error: any) {
      toast.error(t('auth:toast.verifyFailed'));
      setSubmitting(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    try {
      setSubmitting(true);
      await sendPreSignupCode({ email: pendingEmail });
      toast.success(t('auth:toast.codeResent'));
      startResendCooldown();
    } catch (error: any) {
      toast.error(t('auth:toast.resendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="w-full text-center">
        <h3 className="text-xl font-bold mb-2">{t('auth:verify.title')}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {isDevMode 
            ? <span dangerouslySetInnerHTML={{ __html: t('auth:verify.codeSentConsole', { email: pendingEmail }) }} />
            : <span dangerouslySetInnerHTML={{ __html: t('auth:verify.codeSentEmail', { email: pendingEmail }) }} />
          }
        </p>
        {isDevMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-700">
            {t('auth:verify.devModeNotice')}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleVerifySubmit}>
          <input
            type="text"
            className="auth-input-field text-center font-mono tracking-widest text-lg"
            placeholder={t('auth:verify.placeholder')}
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
            required
            disabled={submitting}
          />
          <button className="auth-button" type="submit" disabled={submitting || verificationCode.length !== 6}>
            {submitting ? t('auth:verify.verifying') : t('auth:verify.verifyButton')}
          </button>
        </form>

        <div className="mt-4 flex flex-col space-y-2 text-sm text-secondary">
          <button
            type="button"
            className="text-primary hover:text-primary-hover font-medium cursor-pointer"
            onClick={handleResendCode}
            disabled={submitting || resendCooldown > 0}
          >
            {resendCooldown > 0 ? t('auth:verify.resendIn', { seconds: resendCooldown }) : t('auth:verify.resendCode')}
          </button>
          <button
            type="button"
            className="hover:underline cursor-pointer"
            onClick={() => setStep("signUp")}
            disabled={submitting}
          >
            {t('auth:verify.changeEmail')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={handleAuthSubmit}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder={t('auth:auth.email')}
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder={t('auth:auth.password')}
          required
        />
        <div className="flex flex-col gap-3">
          <button className="auth-button" type="submit" disabled={submitting}>
            {step === "signIn" ? t('auth:auth.signIn') : t('auth:auth.signUp')}
          </button>
          
          {step === "signIn" && (
            <button
              type="button"
              className="w-full px-4 py-3 rounded bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 border border-slate-700 flex items-center justify-center gap-2"
              disabled={submitting}
              onClick={() => {
                setSubmitting(true);
                signIn("anonymous").catch(() => {
                  toast.error(t('auth:toast.signInFailed', 'Failed to sign in'));
                  setSubmitting(false);
                });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M21 13a9 9 0 1 1-3-7.7L21 8"></path></svg>
              {t('auth:auth.signInAnonymous', 'Sign in anonymously')}
            </button>
          )}
        </div>
        
        <div className="text-center text-sm text-secondary">
          <span>
            {step === "signIn"
              ? t('auth:auth.noAccount')
              : t('auth:auth.hasAccount')}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
            onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}
          >
            {step === "signIn" ? t('auth:auth.signUpInstead') : t('auth:auth.signInInstead')}
          </button>
        </div>

        {/* Manual Verification Entry Point */}
        {step === "signIn" && (
          <div className="text-center mt-2">
            <button
              type="button"
              className="text-xs text-secondary hover:text-primary hover:underline cursor-pointer"
              onClick={() => setStep("verify")}
            >
              {t('auth:auth.haveCode')}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
