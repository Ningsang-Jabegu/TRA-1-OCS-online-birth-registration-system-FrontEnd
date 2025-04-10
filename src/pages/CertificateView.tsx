
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import BilingualHeader from "@/components/BilingualHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Download, ArrowLeft, Printer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Mock certificate data
interface Certificate {
  id: string;
  childName: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  birthDistrict: string;
  birthMunicipality: string;
  birthWard: string;
  fatherName: string;
  fatherCitizenshipNo: string;
  motherName: string;
  motherCitizenshipNo: string;
  permanentAddress: string;
  registrationDate: string;
  certificateNo: string;
  issuedBy: string;
  issuedDate: string;
}

const CertificateView = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching certificate data
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      const mockCertificate: Certificate = {
        id: id || "BC-2023-001",
        childName: "Arjun Kumar Sharma",
        gender: "Male",
        dateOfBirth: "2023-05-15",
        placeOfBirth: "Hospital",
        birthDistrict: "Kathmandu",
        birthMunicipality: "Kathmandu Metropolitan City",
        birthWard: "10",
        fatherName: "Raj Kumar Sharma",
        fatherCitizenshipNo: "12345-678",
        motherName: "Sita Sharma",
        motherCitizenshipNo: "87654-321",
        permanentAddress: "Baluwatar, Kathmandu",
        registrationDate: "2023-05-20",
        certificateNo: "KTM-2023-12345",
        issuedBy: "District Administration Office, Kathmandu",
        issuedDate: "2023-05-25",
      };
      
      setCertificate(mockCertificate);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleDownload = () => {
    // In a real app, this would download the certificate
    toast({
      title: "Certificate Download",
      description: "Your certificate is being prepared for download.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          {!loading && certificate && (
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse space-y-6 w-full max-w-2xl">
              <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : certificate ? (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg print:shadow-none print:border-none">
              <CardContent className="p-8 print:p-0">
                <div className="certificate-container">
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <img
                        src="/lovable-uploads/f7085682-ba88-4978-b38a-376effea8a87.png"
                        alt="Nepal Government Logo"
                        className="h-24 w-auto"
                      />
                    </div>
                    
                    <div>
                      <h1 className="text-2xl font-bold text-nepal-red mb-1">
                        नेपाल सरकार
                      </h1>
                      <h2 className="text-xl font-semibold text-nepal-blue mb-1">
                        Government of Nepal
                      </h2>
                      <h3 className="text-lg font-semibold text-nepal-red mb-1">
                        गृह मन्त्रालय
                      </h3>
                      <h4 className="text-md font-medium text-nepal-blue mb-3">
                        Ministry of Home Affairs
                      </h4>
                      <h3 className="text-xl font-bold text-nepal-red">
                        जन्म दर्ता प्रमाणपत्र
                      </h3>
                      <h2 className="text-2xl font-bold text-nepal-blue mb-4">
                        Birth Registration Certificate
                      </h2>
                    </div>
                    
                    <div className="mb-4 border-b pb-2">
                      <p className="text-sm font-medium">
                        Certificate No: <span className="font-bold">{certificate.certificateNo}</span>
                      </p>
                      <p className="text-sm font-medium">
                        Registration Date: <span className="font-bold">
                          {new Date(certificate.registrationDate).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="certificate-body border-2 border-gray-300 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="certificate-field">
                        <span className="certificate-label">Child's Full Name:</span>
                        <span className="certificate-value">{certificate.childName}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Gender:</span>
                        <span className="certificate-value">{certificate.gender}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Date of Birth:</span>
                        <span className="certificate-value">
                          {new Date(certificate.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Place of Birth:</span>
                        <span className="certificate-value">{certificate.placeOfBirth}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Birth District:</span>
                        <span className="certificate-value">{certificate.birthDistrict}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Municipality/VDC:</span>
                        <span className="certificate-value">{certificate.birthMunicipality}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Ward No:</span>
                        <span className="certificate-value">{certificate.birthWard}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Permanent Address:</span>
                        <span className="certificate-value">{certificate.permanentAddress}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Father's Name:</span>
                        <span className="certificate-value">{certificate.fatherName}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Father's Citizenship No:</span>
                        <span className="certificate-value">{certificate.fatherCitizenshipNo}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Mother's Name:</span>
                        <span className="certificate-value">{certificate.motherName}</span>
                      </div>
                      
                      <div className="certificate-field">
                        <span className="certificate-label">Mother's Citizenship No:</span>
                        <span className="certificate-value">{certificate.motherCitizenshipNo}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="my-8 text-center">
                    <p className="text-sm text-gray-700 italic">
                      This is to certify that the details mentioned above have been extracted from
                      the birth register maintained by this office.
                    </p>
                  </div>
                  
                  <div className="certificate-footer flex justify-between mt-12 pt-6 border-t border-dashed border-gray-300">
                    <div className="signature-box">
                      <div className="border-b border-black min-w-[200px] h-16"></div>
                      <p className="text-sm mt-2">Applicant's Signature</p>
                    </div>
                    
                    <div className="signature-box text-right">
                      <div className="border-b border-black min-w-[200px] h-16"></div>
                      <p className="text-sm mt-2">Authorized Signature</p>
                      <p className="text-sm">{certificate.issuedBy}</p>
                      <p className="text-sm">
                        Issued Date: {new Date(certificate.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-12 border-t pt-6 text-center text-sm text-gray-600">
                    <p>
                      This certificate is automatically generated by the Online Birth Registration System.
                      To verify the authenticity of this certificate, please visit our website or contact the
                      concerned District Administration Office.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Certificate Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The certificate you are looking for could not be found or you may not have
              permission to view it.
            </p>
            <Link to="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CertificateView;
