
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
import { apiFetch } from "@/lib/api";

const CertificateVerification = () => {
  const [lastName, setLastName] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showQRDialog, setShowQRDialog] = useState(false);
  
  // record fetched from backend after successful verification
  const [record, setRecord] = useState<any | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<null | 'verified' | 'pending' | 'rejected' | 'not-found'>(null);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName || !certificateNumber || !dateOfBirth) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all fields to verify the certificate." });
      return;
    }

    setLoading(true);
    setRecord(null);

    try {
      // Try direct lookup by certificate number / id first
      let res = await apiFetch(`/api/birth-record/${encodeURIComponent(certificateNumber)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.record) {
          const rec = data.record;
          setRecord(rec);
          // only treat as verified if status is explicit 'approved'
          const st = (rec.status || '').toString().toLowerCase();
          if (st === 'approved' || st === 'verified') {
            setVerificationStatus('verified');
            toast({ title: 'Certificate Verified', description: 'The certificate has been found and verified.' });
            return;
          } else if (st === 'rejected') {
            setVerificationStatus('rejected');
            setRejectedReason(rec.rejectReason || rec.REJECT_REASON || null);
            toast({ variant: 'destructive', title: 'Certificate Not Verified', description: 'The certificate has been rejected and cannot be displayed.' });
            return;
          } else {
            setVerificationStatus('pending');
            toast({ variant: 'destructive', title: 'Certificate Not Verified', description: 'The certificate is not yet approved.' });
            return;
          }
        }
      }

      // If direct lookup failed, use server-side fuzzy search endpoint
      res = await apiFetch(`/api/birth-record/search?name=${encodeURIComponent(lastName)}&dob=${encodeURIComponent(dateOfBirth)}`);
      if (!res.ok) throw new Error('Could not perform fuzzy search');
      const sdata = await res.json();
      if (!sdata || !sdata.success || !Array.isArray(sdata.matches) || sdata.matches.length === 0) {
        toast({ variant: "destructive", title: "Verification Failed", description: "No certificate was found with the provided details. Please check your information and try again." });
      } else {
        // pick highest score
        const best = sdata.matches[0];
        // best.record is a raw CSV row; fetch the normalized record to get status
        const identifier = best.record?.CERTIFICATE_NO || best.record?.ID || best.record?.certificateNo;
        if (!identifier) {
          toast({ variant: 'destructive', title: 'Verification Failed', description: 'Match found but missing identifier.' });
        } else {
          const fetchRes = await apiFetch(`/api/birth-record/${encodeURIComponent(identifier)}`);
          if (fetchRes.ok) {
            const fetchData = await fetchRes.json();
            if (fetchData && fetchData.success && fetchData.record) {
              const rec = fetchData.record;
              setRecord(rec);
              const st = (rec.status || '').toString().toLowerCase();
              if (st === 'approved' || st === 'verified') {
                setVerificationStatus('verified');
                toast({ title: 'Certificate Verified', description: `Match found (score ${(best.score||0).toFixed(2)})` });
                return;
              } else if (st === 'rejected') {
                setVerificationStatus('rejected');
                setRejectedReason(rec.rejectReason || rec.REJECT_REASON || null);
                toast({ variant: 'destructive', title: 'Certificate Not Verified', description: 'A matching certificate was found but it has been rejected.' });
                return;
              } else {
                setVerificationStatus('pending');
                toast({ variant: 'destructive', title: 'Certificate Not Verified', description: 'A matching certificate was found but it is pending approval.' });
                return;
              }
            }
          }
          // fallback if fetch failed
          setRecord(best.record);
          setVerificationStatus('not-found');
          toast({ variant: 'destructive', title: 'Verification Failed', description: 'Unable to fetch full record details.' });
        }
      }
    } catch (err: any) {
      console.error('Verification error', err);
      toast({ variant: 'destructive', title: 'Verification Error', description: err?.message || 'An error occurred while verifying.' });
    } finally {
      setLoading(false);
    }
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
                  <Label htmlFor="certificateNumber">Registration Number</Label>
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
                  <Label htmlFor="dateOfBirth">Date of Birth (AD)</Label>
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
          
          {verificationStatus === 'verified' && record && (
            <Card className="shadow-md border-green-200">
              <CardHeader className="space-y-1 bg-green-50 border-b border-green-100">
                <CardTitle className="text-xl text-green-800">Certificate Verified</CardTitle>
                <CardDescription className="text-green-700">
                  The certificate for {record.childFullName || record.raw?.CHILD_FIRST_NAME || ''} has been found and verified
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Registration Number</p>
                    <p className="text-base font-medium">{record.certificateNo || record.CERTIFICATE_NO || record.ID || record.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Registration Date</p>
                    <p className="text-base font-medium">{record.registeredAt || record.REGISTERED_AT ? new Date(record.registeredAt || record.REGISTERED_AT).toLocaleDateString() : ''}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Child's Full Name</p>
                    <p className="text-base font-medium">{record.childFullName || `${record.raw?.CHILD_FIRST_NAME || ''} ${record.raw?.CHILD_LAST_NAME || ''}`.trim()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Date of Birth</p>
                    <p className="text-base font-medium">{(record.dateOfBirth || record.raw?.DATE_OF_BIRTH) ? new Date(record.dateOfBirth || record.raw?.DATE_OF_BIRTH).toLocaleDateString() : ''}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Father's Name</p>
                    <p className="text-base font-medium">{record.fatherName || `${record.raw?.FATHER_FIRST_NAME || ''} ${record.raw?.FATHER_LAST_NAME || ''}`.trim()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Mother's Name</p>
                    <p className="text-base font-medium">{record.motherName || `${record.raw?.MOTHER_FIRST_NAME || ''} ${record.raw?.MOTHER_LAST_NAME || ''}`.trim()}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-center">
                  <Link to={`/certificate/${record.certificateNo || record.CERTIFICATE_NO || record.ID || record.id}`}>
                    <Button>
                      View Complete Certificate
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {verificationStatus && verificationStatus !== 'verified' && (
            <Card className="shadow-sm border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Certificate Not Verified</CardTitle>
                <CardDescription>
                  {verificationStatus === 'pending' && 'A matching certificate was found but it is still pending approval.'}
                  {verificationStatus === 'rejected' && 'A matching certificate was found but it has been rejected.'}
                  {verificationStatus === 'not-found' && 'No matching certificate details could be retrieved.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationStatus === 'rejected' && rejectedReason && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Rejection Reason</p>
                    <p className="text-base">{rejectedReason}</p>
                  </div>
                )}
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CERTIFICATE:${encodeURIComponent(certificateNumber || record?.certificateNo || record?.CERTIFICATE_NO || '')}`} 
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
