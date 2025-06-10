import { FileText, Search, QrCode } from "lucide-react";
import { ReactNode } from "react";
import Logo from "../assets/photoUsed/Coat_Of_Arms_Logo.png";

// src/db/LocalDataBase.tsx

export interface ServiceItem {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

export const servicesData: ServiceItem[] = [
  {
    icon: <FileText className="h-6 w-6 text-nepal-red" />,
    iconBg: "bg-nepal-red/10",
    title: "Birth Registration",
    description:
      "Easily register births online without visiting government offices. Submit all required information digitally.",
    link: "/login",
    linkText: "Register Birth",
  },
  {
    icon: <Search className="h-6 w-6 text-nepal-blue" />,
    iconBg: "bg-nepal-blue/10",
    title: "Certificate Verification",
    description:
      "Quickly verify the authenticity of birth certificates using our secure verification system.",
    link: "/certificate-verification",
    linkText: "Verify Certificate",
  },
  {
    icon: <QrCode className="h-6 w-6 text-nepal-green" />,
    iconBg: "bg-nepal-green/10",
    title: "Digital Certificates",
    description:
      "Download and print official birth certificates with secure QR codes for verification.",
    link: "/login",
    linkText: "Learn More",
  },
];

// Image sources mapped by name
export const imageSrc: Record<string, { src: string; alt: string }> = {
  logo: { src: Logo as string, alt: "Coat of Arms Logo" },
  "birth-registration": {
    src: "/images/birth-registration.png",
    alt: "Birth Registration",
  },
  "certificate-verification": {
    src: "/images/certificate-verification.png",
    alt: "Certificate Verification",
  },
  "digital-certificates": {
    src: "/images/digital-certificates.png",
    alt: "Digital Certificates",
  },
  // add more as needed
};

export const websiteFirstLaunchedYear = 2024;