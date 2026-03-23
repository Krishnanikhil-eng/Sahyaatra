import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Mail, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { SignOutButton } from "../SignOutButton";

export function VerificationGuard({ children }: { children: React.ReactNode }) {
  // Gracefully check the user's verification status
  const status = useQuery(api.verification.getVerificationStatus);
  const sendCode = useAction(api.verification.sendEmailVerification);
  const verifyCode = useMutation(api.verification.verifyCode);

  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Auto-send a code strictly when the page first loads if they aren't verified yet
  useEffect(() => {
    // Only send if we definitively know they are logged in but unverified
    if (status && status.isLoggedIn && !status.isVerified && !codeSent) {
      handleSendCode();
    }
  }, [status]); // Only depend on status changes

  const handleSendCode = async () => {
    try {
      setIsSending(true);
      await sendCode();
      setCodeSent(true);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setIsVerifying(true);
      const result = await verifyCode({ code });
      
      if (result.success) {
        toast.success(result.message);
        // We do not need to do anything else! The `status` query will automatically
        // update context and the component will unmount itself to reveal the children!
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 1. Loading state (waiting for convex to tell us who is logged in)
  if (status === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 2. If they are not logged in OR they are already verified, render the normal app!
  if (!status.isLoggedIn || status.isVerified) {
    return <>{children}</>;
  }

  // 3. Otherwise, they ARE logged in but NOT verified. Intercept and show the guard screen.
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit security code to your email address to secure your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="code"
                  id="code"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-3 text-center tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} // Numeric only
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-3 px-4"
                disabled={code.length !== 6 || isVerifying}
              >
                {isVerifying ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify Account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Didn't receive the code?
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full flex justify-center"
                onClick={handleSendCode}
                disabled={isSending}
              >
                {isSending ? "Sending New Code..." : "Resend Code"}
              </Button>
              
              <div className="text-center pt-4">
                 <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
