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
import { RefreshCw } from "lucide-react";
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaValue, setCaptchaValue] = useState<string>("");
  const [userCaptcha, setUserCaptcha] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [role, setRole] = useState<UserRole | "">("");
  const [secretCode, setSecretCode] = useState<string>("");

  const navigate = useNavigate();

  // Generate a simple captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(captcha);
  };

  // Generate captcha on component mount
  useState(() => {
    generateCaptcha();
  });

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

    if (userCaptcha !== captchaValue) {
      toast({
        variant: "destructive",
        title: "Invalid Captcha",
        description: "The captcha you entered is incorrect. Please try again.",
      });
      generateCaptcha();
      setUserCaptcha("");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

 // Change the role state type
  const { resetPassword } = useAuth();

// Updated handleResetPassword
const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newPassword || !confirmPassword) {
    toast({
      variant: "destructive",
      title: "Missing Fields",
      description: "Please enter both password fields.",
    });
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

  setLoading(true);

  try {
    // Call resetPassword from AuthContext
    const success = await resetPassword(
      email,
      newPassword,
      role as UserRole,
      secretCode
    );

    setLoading(false);

    if (success) {
      toast({
        title: "Password Reset Successful",
        description:
          "Your password has been reset successfully. You can now log in with your new password.",
      });
      navigate("/login");
    } else {
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: "Could not reset password. Please check your details.",
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
                    <Label htmlFor="captcha">Verification</Label>
                    <div className="bg-gray-100 p-3 mb-2 text-center font-mono text-lg tracking-wider border border-gray-300 rounded-md">
                      {captchaValue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="captcha"
                        type="text"
                        placeholder="Enter captcha"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generateCaptcha}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
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
                      {role === "Administrator" ? (
                        <>Administrator: Requires secret code</>
                      ) : role === "Citizen" ? (
                        <>Citizen: Register births and download certificates</>
                      ) : (
                        <>Guest: View public information</>
                      )}
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
