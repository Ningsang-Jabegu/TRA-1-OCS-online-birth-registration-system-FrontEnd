
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Search, QrCode } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";

const CertificateVerification = () => {
  const [lastName, setLastName] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  
  // Mock certificate data for verification
  const mockCertificate = {
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lastName || !certificateNumber || !dateOfBirth) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all fields to verify the certificate.",
      });
      return;
    }
    
    setLoading(true);
    
    // In a real app, this would call an API to verify the certificate
    setTimeout(() => {
      if (lastName.toLowerCase().includes("sharma") && (certificateNumber === "KTM-2023-12345" || certificateNumber === "12345")) {
        setShowVerification(true);
        toast({
          title: "Certificate Verified",
          description: "The certificate has been found and verified.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "No certificate was found with the provided details. Please check your information and try again.",
        });
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/">
            <Button variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <Card className="shadow-md mb-8">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Certificate Verification</CardTitle>
              <CardDescription>
                Verify and retrieve a birth certificate by providing the following information
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certificateNumber">Certificate Number</Label>
                  <Input
                    id="certificateNumber"
                    type="text"
                    placeholder="e.g. KTM-2023-12345"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Verify Certificate
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowQRDialog(true)}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR Code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {showVerification && (
            <Card className="shadow-md border-green-200">
              <CardHeader className="space-y-1 bg-green-50 border-b border-green-100">
                <CardTitle className="text-xl text-green-800">Certificate Verified</CardTitle>
                <CardDescription className="text-green-700">
                  The certificate for {mockCertificate.childName} has been found and verified
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Certificate Number</p>
                    <p className="text-base font-medium">{mockCertificate.certificateNo}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Registration Date</p>
                    <p className="text-base font-medium">{new Date(mockCertificate.registrationDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Child's Full Name</p>
                    <p className="text-base font-medium">{mockCertificate.childName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Date of Birth</p>
                    <p className="text-base font-medium">{new Date(mockCertificate.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Father's Name</p>
                    <p className="text-base font-medium">{mockCertificate.fatherName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Mother's Name</p>
                    <p className="text-base font-medium">{mockCertificate.motherName}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-center">
                  <Link to={`/certificate/BC-2023-001`}>
                    <Button>
                      View Complete Certificate
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Scan the QR code on your certificate to verify its authenticity
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="w-64 h-64 relative bg-gray-100 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CERTIFICATE:${mockCertificate.certificateNo}`} 
                  alt="QR Scanner Placeholder" 
                  className="w-48 h-48"
                />
              </div>
              <p className="text-center mt-4 text-sm text-gray-500">
                Position a QR code from a certificate in front of your camera
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQRDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CertificateVerification;
