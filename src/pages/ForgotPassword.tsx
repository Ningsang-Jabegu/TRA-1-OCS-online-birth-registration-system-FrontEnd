import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "../images/Image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/contexts/AuthContext";
import { apiFetch } from '@/lib/api';
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [role, setRole] = useState<UserRole | "">("");
  const [secretCode, setSecretCode] = useState<string>("");

  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing Email",
        description: "Please enter your email address.",
      });
      return;
    }

    if (!recaptchaToken) {
      toast({
        variant: "destructive",
        title: "Captcha Required",
        description: "Please verify that you are not a robot.",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation
    if (!newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please enter both password fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match.",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        variant: "destructive",
        title: "Terms Agreement Required",
        description: "Please agree to the terms and conditions.",
      });
      return;
    }

    if (role === "Administrator" && !secretCode) {
      toast({
        variant: "destructive",
        title: "Secret Code Required",
        description: "Administrator role requires a secret code.",
      });
      return;
    }

    // verify that email belongs to the selected role
    try {
      const userRes = await apiFetch(`/api/user/${encodeURIComponent(email)}`);
      if (!userRes.ok) throw new Error('Could not verify account');
      const ud = await userRes.json().catch(() => null);
      if (!ud || !ud.success || !ud.user) {
        toast({ variant: 'destructive', title: 'Account Not Found', description: 'No account found for the provided email.' });
        return;
      }
      const actualRole = ud.user.role || ud.user.ROLE || '';
      if (role && actualRole && role !== actualRole) {
        toast({ variant: 'destructive', title: 'Role Mismatch', description: 'Selected role does not match the account role.' });
        return;
      }
    } catch (err) {
      console.warn('Role verification failed', err);
      toast({ variant: 'destructive', title: 'Verification Error', description: 'Could not verify account role. Please try again.' });
      return;
    }

    setLoading(true);

    try {
      const status = await resetPassword(email, newPassword, role as UserRole, secretCode);


      // return {
      //   success: false,
      //   message: {
      //     title: "Password Reset Failed",
      //     description: "An error occurred. Please try again."
      //   }
      // };

      setLoading(false);

      if (status.success) {
        toast({
          title: status.message.title,
          description: status.message.description || "Your password has been reset successfully. You can now log in with your new password.",
        });
        // Prefer SPA navigation, but fall back to full redirect if route fails
        try {
          navigate("/login");
          // ensure we actually land on the login page (fallback for edge cases)
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.assign('/login');
            }
          }, 250);
        } catch (err) {
          window.location.assign('/login');
        }
      } else {
        toast({
          variant: "destructive",
          title: status.message.title,
          description: status.message.description || "Could not reset password. Please check your details.",
        });
      }
    } catch (err) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Password Reset Error",
        description: `An error occurred: ${err}. Please try again.`,
      });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image name="logo" className="h-16 w-auto" />
          </div>

          <Card className="shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-center">
                {step === 1
                  ? "Enter your email to reset your password"
                  : "Create a new password for your account"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === 1 ? (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <ReCAPTCHA
                      sitekey={RECAPTCHA_SITE_KEY}
                      onChange={(token: string | null) =>
                        setRecaptchaToken(token)
                      }
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Email"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">
                      Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as UserRole)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Citizen">Citizen</SelectItem>
                        <SelectItem value="Guest">Guest</SelectItem>
                        <SelectItem value="Administrator">
                          Administrator
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {role === "Administrator"
                        ? "Administrator: Requires secret code"
                        : role === "Citizen"
                        ? "Citizen: Register births and download certificates"
                        : "Guest: View public information"}
                    </p>
                  </div>

                  {role === "Administrator" && (
                    <div className="space-y-2">
                      <Label htmlFor="secretCode">Secret Code</Label>
                      <Input
                        id="secretCode"
                        type="text"
                        placeholder="Enter administrator secret code"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) =>
                        setAgreedToTerms(checked as boolean)
                      }
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the terms and conditions for resetting my
                      password
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating Password..." : "Reset Password"}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex justify-center">
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  Remembered your password?
                </span>{" "}
                <Link
                  to="/login"
                  className="text-sm text-nepal-blue hover:underline"
                >
                  Login here
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;
