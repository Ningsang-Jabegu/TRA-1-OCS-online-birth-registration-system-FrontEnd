
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, FileText, UserPlus, Search } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <img
              src="/lovable-uploads/f7085682-ba88-4978-b38a-376effea8a87.png"
              alt="Nepal Coat of Arms"
              className="h-24 w-auto mx-auto mb-6"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-nepal-blue mb-4">
              Online Birth Registration and Certificate System
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-nepal-red mb-4">
              नेपाल सरकार - जन्म दर्ता तथा प्रमाणपत्र प्रणाली
            </p>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              A secure and efficient platform for registering births and
              generating official birth certificates in Nepal. Easy to use for
              all citizens with 24/7 accessibility.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="font-medium">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="font-medium">
                      Register Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="font-medium"
                    >
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Key Features of Our System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-nepal-red/10 w-14 h-14 flex items-center justify-center mb-4">
                <FileText className="h-7 w-7 text-nepal-red" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Digital Certificates</h3>
              <p className="text-gray-600">
                Generate official birth certificates with unique QR codes for
                verification and validity.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-nepal-blue/10 w-14 h-14 flex items-center justify-center mb-4">
                <UserPlus className="h-7 w-7 text-nepal-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Registration</h3>
              <p className="text-gray-600">
                Register births with a simple form that can be completed in
                minutes from anywhere.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-nepal-green/10 w-14 h-14 flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-nepal-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quick Retrieval</h3>
              <p className="text-gray-600">
                Access and download your certificates anytime from your personal
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Process Steps */}
              <div className="hidden md:block absolute left-1/2 -ml-0.5 w-0.5 h-full bg-gray-300"></div>
              
              {/* Step 1 */}
              <div className="relative flex items-start mb-12 md:mb-16">
                <div className="hidden md:flex flex-col items-center mr-4">
                  <div className="rounded-full bg-nepal-red text-white w-10 h-10 flex items-center justify-center font-bold z-10">
                    1
                  </div>
                  <div className="h-full w-0.5 bg-gray-300"></div>
                </div>
                <div className="md:w-1/2 md:pr-8">
                  <div className="md:hidden rounded-full bg-nepal-red text-white w-10 h-10 flex items-center justify-center font-bold mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
                  <p className="text-gray-600">
                    Register with your email and choose your role: Citizen or Guest.
                    Administrators are pre-registered.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative flex md:flex-row-reverse items-start mb-12 md:mb-16">
                <div className="hidden md:flex flex-col items-center ml-4">
                  <div className="rounded-full bg-nepal-blue text-white w-10 h-10 flex items-center justify-center font-bold z-10">
                    2
                  </div>
                  <div className="h-full w-0.5 bg-gray-300"></div>
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <div className="md:hidden rounded-full bg-nepal-blue text-white w-10 h-10 flex items-center justify-center font-bold mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fill Birth Details</h3>
                  <p className="text-gray-600">
                    Complete the registration form with all necessary information
                    about the child and parents.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative flex items-start">
                <div className="hidden md:flex flex-col items-center mr-4">
                  <div className="rounded-full bg-nepal-green text-white w-10 h-10 flex items-center justify-center font-bold z-10">
                    3
                  </div>
                </div>
                <div className="md:w-1/2 md:pr-8">
                  <div className="md:hidden rounded-full bg-nepal-green text-white w-10 h-10 flex items-center justify-center font-bold mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Get Your Certificate</h3>
                  <p className="text-gray-600">
                    Once approved, generate, download, and print your official
                    birth certificate anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-nepal-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Ready to Register a Birth?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who have already simplified their birth registration
            process with our digital system.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-nepal-blue hover:bg-gray-100">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-nepal-blue hover:bg-gray-100">
                    Register Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-nepal-blue/20">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
