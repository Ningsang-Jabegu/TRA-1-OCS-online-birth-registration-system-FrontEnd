import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "../../images/Image";

const HeroSection: React.FC = () => (
    // Hero Section
    <section className="bg-nepal-blue text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="lg:w-1/2 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        <span className="text-nepal-accent">Online</span> Birth Registration Certificate System
                    </h1>
                    <p className="text-lg opacity-90">
                        Register births and obtain official birth certificates through our secure and simplified online platform.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link to="/register">
                            <Button className="bg-white/100 text-nepal-blue hover:bg-white/85">
                                Register Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="transparent" className="bg-white/0 text-white hover:bg-white/30 border border-white/30">
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="lg:w-1/2 flex justify-center">
                    <Image name="logo" alt="Nepal Government Logo" className="h-56 md:h-72 w-auto" />
                </div>
            </div>
        </div>
    </section>
);

export default HeroSection;