
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";

export type UserRole = "Administrator" | "Citizen" | "Guest";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCitizen: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for existing user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, we would make an API call to authenticate
      // This is a mock implementation
      if (email === "ningsang@obrc.gov.np" && password === "NJabegu#112") {
        const adminUser = {
          id: "admin-123",
          email: "ningsang@obrc.gov.np",
          name: "Administrator",
          role: "Administrator" as UserRole
        };
        
        setUser(adminUser);
        localStorage.setItem("user", JSON.stringify(adminUser));
        toast({
          title: "Login Successful",
          description: "Welcome back, Administrator!",
        });
        return true;
      }
      
      // Mock example users for demonstration
      const testUsers = [
        {
          id: "citizen-1",
          email: "citizen@example.com",
          password: "citizen123",
          name: "John Citizen",
          role: "Citizen" as UserRole
        },
        {
          id: "guest-1",
          email: "guest@example.com",
          password: "guest123",
          name: "Guest User",
          role: "Guest" as UserRole
        }
      ];
      
      const foundUser = testUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${foundUser.name}!`,
        });
        return true;
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      });
      return false;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
      });
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // In a real app, we would make an API call to register the user
      // This is a mock implementation
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      toast({
        title: "Registration Successful",
        description: "You are now registered and logged in.",
      });
      return true;
    } catch (error) {
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
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "Administrator";
  const isCitizen = user?.role === "Citizen";
  const isGuest = user?.role === "Guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isCitizen,
        isGuest,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
