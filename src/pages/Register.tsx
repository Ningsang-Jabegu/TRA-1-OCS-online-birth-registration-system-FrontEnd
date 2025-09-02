import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserRole } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import Image from "../images/Image";
import { adminSecretCodes } from "../db/LocalDataBase";
// import bcrypt from 'bcryptjs';
import { handlePasswordHashing } from "../lib/utils";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Citizen");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [secretCodeVerified, setSecretCodeVerified] = useState(false);
  const navigate = useNavigate();

  //  const handlePasswordHashing = async (plainPassword: string) => {
  //     const saltRounds = 10; // You can adjust the salt rounds based on your security requirements
  //     const salt = await bcrypt.genSalt(saltRounds);
  //     const hash = await bcrypt.hash(plainPassword, salt);
  //     return { salt, hash };
  //   };

  const sendDataToBackend = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !address
    ) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    if (phone === "" || phone.length < 5) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Phone number must be at least 5 digits long.",
      });
      return;
    }

    if (address === "" || address.length < 5) {
      toast({
        variant: "destructive",
        title: "Invalid Address",
        description:
          "You must enter address to continue the registration process.",
      });
      return;
    }

    if (role === "Administrator" && !secretCodeVerified) {
      setShowSecretDialog(true);
      return;
    }

    setLoading(true);

    try {
      const code = role === "Administrator" ? secretCode : "0";
      // Hash the password and get the salt
      // const { salt, hash } = await handlePasswordHashing(password);

      const id = `${role.toLowerCase()}-${uuidv4()}`;
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          email,
          password, // ✅ send plain password
          phone,
          address,
          role: role,
          secretCode: code,
        }),
      });

      const data = await response.json();
      // console.log(
      //   "Registration request:",
      //   id,
      //   name,
      //   email,
      //   role,
      //   hash,
      //   salt,
      //   phone,
      //   address,
      //   code
      // );
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.error || "An error occurred during registration.",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Registration Successful",
        description: data.message || "Your account has been created.",
      });

      navigate("/dashboard");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the registration server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (value: string) => {
    setRole(value as UserRole);
    if (value === "Administrator") {
      if (!name.trim()) {
        toast({
          variant: "destructive",
          title: "Full Name Required",
          description:
            "Please enter your full name before selecting Administrator.",
        });
        setRole("Citizen");
        return;
      }
      const admin = adminSecretCodes[name.trim()];
      if (admin) {
        setShowSecretDialog(true);
      } else {
        toast({
          variant: "destructive",
          title: "Name Not Recognized",
          description:
            "The full name does not match any of our Administrator officers.",
        });
        setRole("Citizen");
      }
    }
  };

  const verifySecretCode = () => {
    const admin = adminSecretCodes[name.trim()];
    if (admin && admin.code === secretCode.trim()) {
      setSecretCode(admin.code);
      setSecretCodeVerified(true);
      setShowSecretDialog(false);
      toast({
        title: "Secret Code Verified",
        description: "Your administrator secret code has been verified.",
      });
    } else {
      setSecretCodeVerified(false);
      toast({
        variant: "destructive",
        title: "Invalid Secret Code",
        description:
          "The secret code or name you entered is invalid. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !address
    ) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    if (role === "Administrator" && !secretCodeVerified) {
      setShowSecretDialog(true);
      return;
    }

    setLoading(true);
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
              <CardTitle className="text-2xl text-center">Register</CardTitle>
              <CardDescription className="text-center">
                Create a new account to access the birth registration system.
                All fields marked with <span className="text-red-500">*</span>{" "}
                are required.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
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
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Kathmandu, Nepal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={role}
                    onValueChange={handleRoleChange}
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
                      <>
                        Administrator: Access to system and manage records
                        accoding to the access granted by the organization.
                      </>
                    ) : role === "Citizen" ? (
                      <>
                        Citizen: Can register births and download certificates
                      </>
                    ) : (
                      <>Guest: Can only view public information</>
                    )}
                  </p>
                </div>
                {role === "Administrator" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      {secretCodeVerified
                        ? "Administrator secret code verified ✓"
                        : "Administrator role requires a secret code verification"}
                    </p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  onClick={sendDataToBackend}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>{" "}
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  Already have an account?
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

      <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administrator Verification</DialogTitle>
            <DialogDescription>
              Please enter the secret code provided by the administration office
              to verify your administrator status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="secretCode">Secret Code</Label>
              <Input
                id="secretCode"
                type="text"
                placeholder="e.g. 100A"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                The secret code is provided by the administration office and is
                required for administrator access.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRole("Citizen");
                setShowSecretDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={verifySecretCode}>Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Register;
