
import { Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, QrCode, Search } from "lucide-react";
import { servicesData } from "../db/LocalDataBase";
import HeroSection from "../components/homepage/HeroSection";
import ServicesSection from "../components/homepage/ServicesSection";
import Cta from "@/components/homepage/Cta";

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <ServicesSection />

      {/* Call to Action */}
      <Cta />
    </MainLayout>
  );
};

export default Index;
