import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
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
  login: (email: string, password: string) => Promise<any>;
  register: (...args: any[]) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (...args: any[]) => Promise<boolean>;
  resetPassword: (
    email: string,
    newPassword: string,
    role: UserRole,
    secretCode?: string
  ) => Promise<{
    success: boolean;
    message: { title: string; description: string };
  }>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isGuest: false,
  login: async () => ({
    success: false,
  }),
  register: async () => false,
  logout: () => {},
  updateUserProfile: async () => false,
  resetPassword: async () => ({
    success: false,
    message: {
      title: "Not Implemented",
      description: "resetPassword is not implemented.",
    },
  }),
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // const [userInfo, setUserInfo] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<any> => {
    // console.log("📤 Frontend sending login:", { email, password });

    const response = await apiFetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log("📥 Frontend received response:", data);
    try {
      if (response.ok && data.success) {
        // setUserInfo(data.user.ID);
        // setUserInfo(data.user.NAME);
        
        // setUser(()=>{
        //   id: data.user.ID;
        //   name: data.user.NAME
        //   email: data.user.email
        // });
        // setUserInfo(data.user.EMAIL);
        // setUserInfo(data.user.ROLE);
        // setUserInfo(data.user.PHONE);
        // setUserInfo(data.user.ADDRESS);
        // setUserInfo(data.user.PASSWORD_hash);
        // Set authenticated user in context (map backend fields to frontend User)
        const safeUser: User = {
          id: data.user.ID || data.user.id || String(data.user.ID),
          name: data.user.NAME || data.user.name || data.user.NAME || "",
          email: data.user.EMAIL || data.user.email || "",
          role: (data.user.ROLE || data.user.role) as UserRole || "Citizen",
          phone: data.user.PHONE || data.user.phone || "",
          address: data.user.ADDRESS || data.user.address || "",
        };

        setUser(safeUser);
        localStorage.setItem("auth_user_id", safeUser.id);
        // console.log(userInfo)
        toast({
          title: "Login Successful",
          description: data.message || `Welcome back, ${data.user.NAME}!`,
        });
        return {
          success: true,
          data: data.user,
        };
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.message || "Invalid email or password.",
        });
        return {
          success: false,
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description:
          data.message || "An error occurred during login. Please try again.",
      });
      return {
        success: false,
      };
    }
  };

  const register = async (..._args: any[]): Promise<boolean> => {
    try {
      // Registration should be handled by backend API now
      toast({
        variant: "destructive",
        title: "Registration Not Supported",
        description:
          "Registration is now handled by the backend. Please use the registration form that communicates with the backend API.",
      });
      return false;
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

  const updateUserProfile = async (..._args: any[]): Promise<boolean> => {
    try {
      // Expect args: single object { name, email, phone, address }
      const payload = _args[0] && typeof _args[0] === "object" ? _args[0] : {};
      const id = (user && user.id) || payload.id;
      if (!id) {
        toast({ variant: "destructive", title: "Update Failed", description: "User ID missing." });
        return false;
      }

      const res = await apiFetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: payload.name, email: payload.email, phone: payload.phone, address: payload.address }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const u = data.user;
        const safeUser: User = {
          id: u.ID || u.id,
          name: u.NAME || u.name || "",
          email: u.EMAIL || u.email || "",
          role: (u.ROLE || u.role) as UserRole || "Citizen",
          phone: u.PHONE || u.phone || "",
          address: u.ADDRESS || u.address || "",
        };
        setUser(safeUser);
        localStorage.setItem("auth_user_id", safeUser.id);
        toast({ title: data.message?.title || "Profile Updated", description: data.message?.description || "Profile updated successfully." });
        return true;
      } else {
        const desc = data.message?.description || "No changes made.";
        toast({ variant: "destructive", title: data.message?.title || "No changes", description: desc });
        return false;
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "There was an error updating your profile." });
      return false;
    }
  };

  const resetPassword = async (
    email: string,
    newPassword: string,
    role: UserRole,
    secretCode?: string
  ): Promise<{
    success: boolean;
    message: { title: string; description: string };
  }> => {
    try {
      const response = await apiFetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, role, secretCode }),
      });

      const data = await response.json();

      // console.log("📥 Frontend received password reset response:", data);

      if (response.ok && data.success) {
        return {
          success: true,
          message: {
            title: "Password Reset Successful",
            description: "Your password has been updated. You can now log in.",
          },
        };
      } else {
        // toast({
        //   variant: "destructive",
        //   title: "Password Reset Failed",
        //   description: data.message || "Could not reset password.",
        // });
        return {
          success: false,
          message: {
            title: "Password Reset Failed",
            description: data.message || "Could not reset password.",
          },
        };
      }
    } catch (error) {
      console.error("Password reset error:", error);
      // toast({
      //   variant: "destructive",
      //   title: "Password Reset Error",
      //   description: "An error occurred. Please try again.",
      // });
      return {
        success: false,
        message: {
          title: "Password Reset Failed",
          description: "An error occurred. Please try again.",
        },
      };
    }
  };

  // const user = "Nings";
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
