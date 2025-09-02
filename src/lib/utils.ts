import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import bcrypt from "bcryptjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to handle password hashing
// This function uses bcrypt to hash the password before sending it to the backend
export const handlePasswordHashing = async (plainPassword: string, userSalt: string="") => {
  const saltRounds = 10; // You can adjust the salt rounds based on your security requirements
  const salt = userSalt === "" ? await bcrypt.genSalt(saltRounds) : userSalt; // If userSalt is provided, use it; otherwise generate a new one
  const hash = await bcrypt.hash(plainPassword, salt);
  return { salt, hash };
};
