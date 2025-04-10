
import { Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, QrCode, Search } from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
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
                  <Button className="bg-white text-nepal-blue hover:bg-gray-100">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <img
                src="/lovable-uploads/f7085682-ba88-4978-b38a-376effea8a87.png"
                alt="Nepal Government Logo"
                className="h-56 md:h-72 w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-nepal-red/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-nepal-red" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Birth Registration</h3>
              <p className="text-gray-600 mb-4">
                Easily register births online without visiting government offices. 
                Submit all required information digitally.
              </p>
              <Link to="/login" className="text-nepal-blue font-medium hover:underline inline-flex items-center">
                Register Birth
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-nepal-blue/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-nepal-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Certificate Verification</h3>
              <p className="text-gray-600 mb-4">
                Quickly verify the authenticity of birth certificates using our
                secure verification system.
              </p>
              <Link to="/certificate-verification" className="text-nepal-blue font-medium hover:underline inline-flex items-center">
                Verify Certificate
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-nepal-green/10 rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-nepal-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Digital Certificates</h3>
              <p className="text-gray-600 mb-4">
                Download and print official birth certificates with secure QR codes
                for verification.
              </p>
              <Link to="/login" className="text-nepal-blue font-medium hover:underline inline-flex items-center">
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-nepal-blue py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Register a Birth?</h2>
          <p className="text-xl mb-8">
            Join thousands of citizens who have already simplified their birth
            registration process with our digital system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-white text-nepal-blue hover:bg-gray-100">
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/certificate-verification">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Verify Certificate
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
