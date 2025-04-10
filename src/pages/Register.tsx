
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  CardTitle 
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

// List of valid admin secret codes
const validSecretCodes = [
  "100A", "100B", "100C", "100D", "100E", "100F", "100G", "100H", "100I", "100J",
  "100K", "100L", "100M", "100N", "100O", "100P", "100Q", "100R", "100S", "100T",
  "100U", "100V", "100W", "100X", "100Y", "100Z", "999A", "999B", "999C", "999D",
  "999E", "999F", "999G", "999H", "999I", "999J", "999K", "999L", "999M", "999N",
  "999O", "999P", "999Q", "999R", "999S", "999T", "999U", "999V", "999W", "999X",
  "999Y", "999Z"
];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Citizen");
  const [loading, setLoading] = useState(false);
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [secretCodeVerified, setSecretCodeVerified] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (value: string) => {
    setRole(value as UserRole);
    if (value === "Administrator" && !secretCodeVerified) {
      setShowSecretDialog(true);
    }
  };

  const verifySecretCode = () => {
    if (validSecretCodes.includes(secretCode)) {
      setSecretCodeVerified(true);
      setShowSecretDialog(false);
      toast({
        title: "Secret Code Verified",
        description: "Your administrator secret code has been verified.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Secret Code",
        description: "The secret code you entered is invalid. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
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
    
    try {
      const success = await register(email, password, name, role);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img
              src="/lovable-uploads/f7085682-ba88-4978-b38a-376effea8a87.png"
              alt="Nepal Coat of Arms"
              className="h-16 w-auto"
            />
          </div>
          
          <Card className="shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Register</CardTitle>
              <CardDescription className="text-center">
                Create a new account to access the birth registration system
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
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
                  <Label htmlFor="password">Password</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
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
                      <SelectItem value="Administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {role === "Administrator" ? (
                      <>Administrator: Full access to system and manage all records</>
                    ) : role === "Citizen" ? (
                      <>Citizen: Can register births and download certificates</>
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
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <div className="text-center">
                <span className="text-sm text-gray-500">Already have an account?</span>{" "}
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
              Please enter the secret code provided by the administration office to verify your administrator status.
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
                The secret code is provided by the administration office and is required for administrator access.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRole("Citizen");
              setShowSecretDialog(false);
            }}>
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
