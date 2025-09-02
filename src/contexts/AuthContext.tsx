import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import bcrypt from "bcryptjs";
import { toast } from "@/components/ui/use-toast";

export type UserRole = "Administrator" | "Citizen" | "Guest";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  passwordHash?: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updatedUser: Partial<User>) => Promise<boolean>;
  resetPassword: (
    email: string,
    newPassword: string,
    role: UserRole,
    secretCode?: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isGuest: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUserProfile: async () => false,
  resetPassword: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

const mockUsers: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  address?: string;
}[] = [
  {
    id: "admin-123",
    name: "Administrator",
    email: "ningsang@obrc.gov.np",
    passwordHash: bcrypt.hashSync("NJabegu#112", 10),
    role: "Administrator",
    phone: "+977 9812345678",
    address: "Kathmandu, Nepal",
  },
  {
    id: "citizen-123",
    name: "John Citizen",
    email: "citizen@example.com",
    passwordHash: bcrypt.hashSync("citizen123", 10),
    role: "Citizen",
  },
  {
    id: "guest-123",
    name: "Guest User",
    email: "guest@example.com",
    passwordHash: bcrypt.hashSync("guest123", 10),
    role: "Guest",
  },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("auth_user_id");
    if (storedUserId) {
      const matchedUser = mockUsers.find((u) => u.id === storedUserId);
      if (matchedUser) {
        const { passwordHash, ...safeUser } = matchedUser;
        setUser(safeUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("📤 Frontend sending login:", { email, password });

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("📥 Frontend received response:", data);

      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem("auth_user_id", data.user.ID);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.NAME}!`,
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.message || "Invalid email or password.",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
      });
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      if (mockUsers.some((u) => u.email === email)) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description:
            "This email is already registered. Please use a different email.",
        });
        return false;
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        passwordHash,
        role,
      };

      mockUsers.push(newUser);
      const { passwordHash: _, ...safeUser } = newUser;
      setUser(safeUser);
      localStorage.setItem("auth_user_id", safeUser.id);

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      });

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "An error occurred during registration. Please try again.",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user_id");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const updateUserProfile = async (
    updatedUser: Partial<User>
  ): Promise<boolean> => {
    try {
      if (!user) return false;
      const newUserData = { ...user, ...updatedUser };
      const userIndex = mockUsers.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        const { passwordHash } = mockUsers[userIndex];
        mockUsers[userIndex] = {
          ...newUserData,
          passwordHash,
        } as (typeof mockUsers)[number];
      }
      const { passwordHash: _, ...safeUser } = newUserData;
      setUser(safeUser);
      localStorage.setItem("auth_user_id", safeUser.id);
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  };

  const resetPassword = async (
    email: string,
    newPassword: string,
    role: UserRole,
    secretCode?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, role, secretCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now log in.",
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Password Reset Failed",
          description: data.message || "Could not reset password.",
        });
        return false;
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Password Reset Error",
        description: "An error occurred. Please try again.",
      });
      return false;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = !!user && user.role === "Administrator";
  const isGuest = !!user && user.role === "Guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isGuest,
        login,
        register,
        logout,
        updateUserProfile,
        resetPassword,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
