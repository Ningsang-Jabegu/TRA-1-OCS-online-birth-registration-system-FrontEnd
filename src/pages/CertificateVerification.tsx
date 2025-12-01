
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Search, QrCode } from "lucide-react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";

const CertificateVerification = () => {
  const [lastName, setLastName] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showQRDialog, setShowQRDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannerSupported, setScannerSupported] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [noCameraFound, setNoCameraFound] = useState(false);
  const scanAnimationRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
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

  // Handle scanned QR code payload
  const handleScanned = async (raw: string) => {
    // raw expected: CERTIFICATE:<id> or just <id>
    const parts = raw.split(':');
    const maybeId = parts.length > 1 ? parts.slice(1).join(':') : parts[0];
    const identifier = maybeId.trim();
    if (!identifier) {
      toast({ variant: 'destructive', title: 'Scan Failed', description: 'Could not parse QR code.' });
      return;
    }

    setShowQRDialog(false);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/birth-record/${encodeURIComponent(identifier)}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      if (data && data.success && data.record) {
        const rec = data.record;
        setRecord(rec);
        const st = (rec.status || '').toString().toLowerCase();
        if (st === 'approved' || st === 'verified') {
          setVerificationStatus('verified');
          toast({ title: 'Certificate Verified', description: 'The certificate has been found and verified.' });
        } else if (st === 'rejected') {
          setVerificationStatus('rejected');
          setRejectedReason(rec.rejectReason || rec.REJECT_REASON || null);
          toast({ variant: 'destructive', title: 'Certificate Not Verified', description: 'The certificate has been rejected.' });
        } else {
          setVerificationStatus('pending');
          toast({ variant: 'destructive', title: 'Certificate Not Verified', description: 'The certificate is not yet approved.' });
        }
      } else {
        setVerificationStatus('not-found');
        toast({ variant: 'destructive', title: 'Verification Failed', description: 'No certificate found.' });
      }
    } catch (err: any) {
      console.error('Scan verification error', err);
      toast({ variant: 'destructive', title: 'Verification Error', description: err?.message || 'An error occurred while verifying scanned QR.' });
    } finally {
      setLoading(false);
    }
  };

  // Capture current video frame and try to decode using jsQR fallback
  const capturePhotoAndDecode = async () => {
    setScanError(null);
    if (!videoRef.current) {
      setScanError('No video available to capture.');
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setScanError('Unable to get canvas context.');
      return;
    }
    try {
      ctx.drawImage(video, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);

      // Try BarcodeDetector first if available
      const BarcodeDetectorCls = (window as any).BarcodeDetector;
      if (BarcodeDetectorCls) {
        try {
          const detector = new BarcodeDetectorCls({ formats: ['qr_code'] });
          const results = await detector.detect(canvas);
          if (results && results.length) {
            const raw = results[0].rawValue || results[0].raw || '';
            await handleScanned(raw);
            return;
          }
        } catch (e) {
          // fallthrough to jsQR
        }
      }

      // dynamic import of jsQR as fallback
      try {
        const jsqrModule: any = await import(/* webpackChunkName: "jsqr" */ 'jsqr');
        const jsQR = jsqrModule && jsqrModule.default ? jsqrModule.default : jsqrModule;
        if (typeof jsQR === 'function') {
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            await handleScanned(code.data);
            return;
          }
        }
      } catch (e) {
        console.warn('jsQR import/scan failed', e);
      }

      setScanError('No QR code detected in the captured frame. Try adjusting the camera or taking another photo.');
      toast({ variant: 'destructive', title: 'No QR Found', description: 'No QR code detected in the captured photo.' });
    } catch (err: any) {
      console.error('Capture/Decode error', err);
      setScanError(err?.message || 'Failed to capture or decode the image.');
    }
  };

  // Start camera and scanning loop
  const startScanner = async () => {
    try {
      setScannerSupported(null);
      if (!(navigator && (navigator as any).mediaDevices && (navigator as any).mediaDevices.getUserMedia)) {
        setScannerSupported(false);
        setScanError('Camera API not available in this browser.');
        return;
      }
      let stream: MediaStream | null = null;
      try {
        stream = await (navigator as any).mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      } catch (err: any) {
        // handle permission denied or no camera
        console.error('getUserMedia error', err);
        if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          setPermissionDenied(true);
          setScanError('Camera permission denied. Please allow camera access and try again.');
        } else {
          setNoCameraFound(true);
          setScanError('No camera found or cannot access camera.');
        }
        setScannerSupported(false);
        setScanning(false);
        return;
      }
      if (!stream) {
        setScannerSupported(false);
        setScanError('Could not obtain camera stream.');
        return;
      }
      const streamRef = stream;
      mediaStreamRef.current = streamRef;
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef;
        await videoRef.current.play();
      }
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // check BarcodeDetector support but don't bail out — keep preview running
      const BarcodeDetectorCls = (window as any).BarcodeDetector;
      let detector: any = null;
      if (!BarcodeDetectorCls) {
        setScannerSupported(false);
        // continue without a detector; user will still see preview and can capture manually
      } else {
        detector = new BarcodeDetectorCls({ formats: ['qr_code'] });
        setScannerSupported(true);
      }

      // mark scanning/preview active (show video) once stream is playing
      setScanning(true);
      setPermissionDenied(false);
      setNoCameraFound(false);
      setScanError(null);

      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scanFrame = async () => {
        try {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            scanAnimationRef.current = requestAnimationFrame(scanFrame);
            return;
          }
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          if (ctx) ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          if (detector) {
            const results = await detector.detect(canvas);
            if (results && results.length) {
              // take first
              const r = results[0];
              const raw = r.rawValue || r.raw || '';
              stopScanner();
              await handleScanned(raw);
              return;
            }
          }
        } catch (e) {
          // detection might fail on some frames; ignore
        }
        scanAnimationRef.current = requestAnimationFrame(scanFrame);
      };

      scanAnimationRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error('Scanner start failed', err);
      setScannerSupported(false);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    if (scanAnimationRef.current) {
      cancelAnimationFrame(scanAnimationRef.current);
      scanAnimationRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      try { videoRef.current.pause(); videoRef.current.srcObject = null; } catch (e) { /* ignore */ }
    }
  };

  useEffect(() => {
    if (showQRDialog) {
      // start scanner when dialog opens
      startScanner();
    } else {
      stopScanner();
    }
    // cleanup on unmount
    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQRDialog]);

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
          <div className="flex items-center justify-center p-2">
            <div className="bg-white p-2 rounded-lg border">
              {scannerSupported === false && (
                <div className="w-64 h-64 flex items-center justify-center p-4">
                  <div className="text-sm text-gray-600">Camera scanning not supported in this browser. You can verify manually by entering the registration number.</div>
                </div>
              )}
              <div className="w-64 h-64 relative bg-black flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted style={{ display: scanning ? 'block' : 'none' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {scanning && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Scanning…</div>
                )}
              </div>
              <p className="text-center mt-2 text-sm text-gray-500">Point your camera at the QR code on the certificate to scan and verify.</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Button variant="outline" onClick={() => setShowQRDialog(false)}>Close</Button>
                {scannerSupported === null && <Button onClick={() => startScanner()}>Start Scanner</Button>}
                {scannerSupported === false && (
                  <Button onClick={() => { setShowQRDialog(false); toast({ title: 'Manual Verify', description: 'Use the form to enter details and verify.' }); }}>Use Manual Verify</Button>
                )}
                {scanning && (
                  <Button onClick={() => capturePhotoAndDecode()}>Capture Photo</Button>
                )}
              </div>
              <div className="mt-3 text-center">
                {scanError && <p className="text-sm text-red-600">{scanError}</p>}
                {permissionDenied && <p className="text-sm text-yellow-700">Camera permission denied. Please allow camera access in your browser settings.</p>}
                {noCameraFound && <p className="text-sm text-yellow-700">No camera detected. Try a different device.</p>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CertificateVerification;
