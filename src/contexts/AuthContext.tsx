import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "@/components/ui/use-toast";

export type UserRole = "Administrator" | "Citizen" | "Guest";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  password?: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean; // Add isGuest property to fix error in BirthRegistration.tsx
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updatedUser: Partial<User>) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isGuest: false, // Initialize isGuest property
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

// Modify the type of mockUsers array to fix the optional phone and address properties
type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
};

// Mock user database
const mockUsers: MockUser[] = [
  {
    id: "admin-123",
    name: "Administrator",
    email: "ningsang@obrc.gov.np",
    password: "NJabegu#112",
    role: "Administrator" as UserRole,
    phone: "+977 9812345678",
    address: "Kathmandu, Nepal",
  },
  {
    id: "citizen-123",
    name: "John Citizen",
    email: "citizen@example.com",
    password: "citizen123",
    role: "Citizen" as UserRole,
  },
  {
    id: "guest-123",
    name: "Guest User",
    email: "guest@example.com",
    password: "guest123",
    role: "Guest" as UserRole,
  },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    try {
      // Find user in mock database
      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        // Remove password before storing
        const { password, ...userWithoutPassword } = foundUser;

        // Store the user object without the password
        setUser(userWithoutPassword);

        // Store only a non-sensitive user ID in localStorage (never the full user object)
        localStorage.setItem("auth_user_id", userWithoutPassword.id);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${foundUser.name}!`,
        });

        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
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

  // Register function
  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<boolean> => {
    // Simulate API call
    try {
      // Check if user already exists
      if (mockUsers.some((u) => u.email === email)) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description:
            "This email is already registered. Please use a different email.",
        });
        return false;
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role,
      };

      // Add to mock database (in a real app, this would be an API call)
      mockUsers.push(newUser);

      // Remove password before storing
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);

      // Store only the user ID in localStorage
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ userId: userWithoutPassword.id })
      );

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

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");

    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  // Update user profile
  const updateUserProfile = async (
    updatedUser: Partial<User>
  ): Promise<boolean> => {
    try {
      if (!user) return false;

      // Create updated user object
      const newUserData = { ...user, ...updatedUser };

      // Update in mock database (in a real app, this would be an API call)
      const userIndex = mockUsers.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        const { password } = mockUsers[userIndex];
        // Using the fixed type here
        mockUsers[userIndex] = {
          ...newUserData,
          password,
        } as MockUser;
      }

      // Remove password before storing
      const { password: _, ...userWithoutPassword } = newUserData;

      // Update local state and storage
      setUser(userWithoutPassword);
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ userId: userWithoutPassword.id })
      );

      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  };

  // Reset password
  const resetPassword = async (
    email: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      // Find user in mock database
      const userIndex = mockUsers.findIndex((u) => u.email === email);

      if (userIndex !== -1) {
        // Update password
        mockUsers[userIndex].password = newPassword;
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Password reset error:", error);
      return false;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = !!user && user.role === "Administrator";
  const isGuest = !!user && user.role === "Guest"; // Add isGuest calculation

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isGuest, // Include isGuest in the context value
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
