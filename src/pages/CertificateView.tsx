import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import BilingualHeader from "@/components/BilingualHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft, Printer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "../images/Image";

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
  const certificateRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = async () => {
    if (!certificate || !certificateRef.current) return;

    try {
      toast({
        title: "Preparing Download",
        description: "Your certificate is being prepared for download...",
      });

      const certificateElement = certificateRef.current;

      // Create a temporary wrapper with watermark for PDF generation
      const tempWrapper = document.createElement("div");
      tempWrapper.style.position = "relative";
      tempWrapper.style.width = "210mm"; // A4 width
      tempWrapper.style.height = "297mm"; // A4 height
      tempWrapper.style.padding = "20mm";
      tempWrapper.style.backgroundColor = "white";

      // Add watermark pattern - updated to be horizontal with reduced line height
      const watermarkDiv = document.createElement("div");
      watermarkDiv.style.position = "absolute";
      watermarkDiv.style.top = "0";
      watermarkDiv.style.left = "0";
      watermarkDiv.style.width = "100%";
      watermarkDiv.style.height = "100%";
      watermarkDiv.style.display = "flex";
      watermarkDiv.style.flexDirection = "column";
      watermarkDiv.style.justifyContent = "space-around";
      watermarkDiv.style.opacity = "0.4";
      watermarkDiv.style.pointerEvents = "none";
      watermarkDiv.style.zIndex = "1";

      // Create horizontal rows of watermark text with reduced line height
      for (let i = 0; i < 30; i++) {
        // Adjusted number of rows
        const watermarkRow = document.createElement("div");
        watermarkRow.style.display = "flex";
        watermarkRow.style.justifyContent = "flex-start";
        watermarkRow.style.flexWrap = "nowrap";
        watermarkRow.style.whiteSpace = "nowrap";
        watermarkRow.style.lineHeight = "0.8rem"; // Reduced line height
        watermarkRow.style.overflow = "hidden";

        // Fill each row with repeated text
        let rowContent = "";
        for (let j = 0; j < 20; j++) {
          rowContent += "जन्म दर्ता प्रमाणपत्र Birth Registration Certificate ";
        }

        watermarkRow.textContent = rowContent;
        watermarkRow.style.fontSize = "8px";
        watermarkRow.style.color = "#555";
        watermarkDiv.appendChild(watermarkRow);
      }

      // Clone the certificate for PDF
      const certificateClone = certificateElement.cloneNode(
        true
      ) as HTMLElement;
      certificateClone.style.position = "relative";
      certificateClone.style.zIndex = "2";

      // Add to wrapper
      tempWrapper.appendChild(watermarkDiv);
      tempWrapper.appendChild(certificateClone);
      document.body.appendChild(tempWrapper);

      // Generate PDF
      const canvas = await html2canvas(tempWrapper, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Remove temporary elements
      document.body.removeChild(tempWrapper);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Birth Registration Certificate - ${certificate.childName}.pdf`);

      toast({
        title: "Download Complete",
        description: "Your certificate has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description:
          "There was an error generating your certificate. Please try again.",
      });
    }
  };

  const handlePrint = () => {
    if (!certificateRef.current) return;

    // Create print-specific content with watermark
    const printContent = document.createElement("div");
    printContent.className = "certificate-container";
    printContent.style.width = "210mm";
    printContent.style.height = "297mm";
    printContent.style.margin = "0 auto";
    printContent.style.position = "relative";
    printContent.style.overflow = "hidden";
    printContent.style.backgroundColor = "white";

    // Add watermark for printing with horizontal layout
    const watermarkDiv = document.createElement("div");
    watermarkDiv.className = "certificate-watermark";

    // Create horizontal rows of watermark text with reduced line height
    for (let i = 0; i < 40; i++) {
      // More rows for print
      const watermarkRow = document.createElement("div");
      watermarkRow.style.display = "flex";
      watermarkRow.style.justifyContent = "flex-start";
      watermarkRow.style.flexWrap = "nowrap";
      watermarkRow.style.whiteSpace = "nowrap";
      watermarkRow.style.lineHeight = "0.8rem"; // Reduced line height
      watermarkRow.style.overflow = "hidden";

      // Fill each row with repeated text
      let rowContent = "";
      for (let j = 0; j < 20; j++) {
        rowContent += "जन्म दर्ता प्रमाणपत्र Birth Registration Certificate ";
      }

      watermarkRow.textContent = rowContent;
      watermarkRow.style.fontSize = "8px";
      watermarkRow.style.color = "#555";
      watermarkDiv.appendChild(watermarkRow);
    }

    // Clone the certificate for printing
    const certificateClone = certificateRef.current.cloneNode(
      true
    ) as HTMLElement;
    certificateClone.style.position = "relative";
    certificateClone.style.zIndex = "2";
    certificateClone.style.padding = "20mm";
    certificateClone.style.backgroundColor = "white";
    certificateClone.style.boxSizing = "border-box";

    // Remove any non-printable elements
    const nonPrintableElements =
      certificateClone.querySelectorAll(".print\\:hidden");
    nonPrintableElements.forEach((el) => {
      el.parentNode?.removeChild(el);
    });

    // Add to print container
    printContent.appendChild(watermarkDiv);
    printContent.appendChild(certificateClone);

    // Add print-specific styles
    const style = document.createElement("style");
    style.textContent = `
      @page {
        size: A4;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .certificate-container {
        width: 210mm;
        height: 297mm;
        padding: 20mm;
        box-sizing: border-box;
        page-break-after: always;
        background-color: white !important;
        position: relative !important;
        overflow: hidden !important;
      }
      .certificate-watermark {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        opacity: 0.4 !important;
        z-index: 1 !important;
        pointer-events: none !important;
        transform: none !important;
        display: flex !important;
        flex-direction: column !important;
      }
      .certificate-watermark div {
        line-height: 0.8rem !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        font-size: 8px !important;
        color: #555 !important;
      }
      .certificate-body {
        border: 2px solid #ddd !important;
        padding: 1.5rem !important;
        background-color: white !important;
        position: relative !important;
        z-index: 2 !important;
      }
      .certificate-field {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        margin-bottom: 0.5rem !important;
      }
      .certificate-label {
        font-weight: 600 !important;
        text-align: right !important;
      }
      .certificate-value {
        border-bottom: 1px dashed #666 !important;
        text-align: left !important;
      }
      .signature-box {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      .handwriting {
        font-family: 'Dancing Script', cursive !important;
        font-size: 1.25rem !important;
      }
    `;

    // Open a new window and write the content
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(
        "<!DOCTYPE html><html><head><title>Print Certificate</title>"
      );
      printWindow.document.write(
        '<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600&display=swap" rel="stylesheet">'
      );
      printWindow.document.write("</head><body>");
      printWindow.document.write(style.outerHTML);
      printWindow.document.write(printContent.outerHTML);
      printWindow.document.write("</body></html>");
      printWindow.document.close();

      // Wait for resources to load before printing
      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = function () {
            printWindow.close();
          };
        }, 1000); // Increased timeout for loading resources
      };
    } else {
      toast({
        variant: "destructive",
        title: "Print Failed",
        description:
          "Unable to open print window. Please check your browser settings.",
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center print:hidden">
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
                <div className="certificate-container" ref={certificateRef}>
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <Image
                        name="logo"
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
                        Certificate No:{" "}
                        <span className="font-bold">
                          {certificate.certificateNo}
                        </span>
                      </p>
                      <p className="text-sm font-medium">
                        Registration Date:{" "}
                        <span className="font-bold">
                          {new Date(
                            certificate.registrationDate
                          ).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="certificate-body border-2 border-gray-300 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="certificate-field">
                        <span className="certificate-label">
                          Child's Full Name:
                        </span>
                        <span className="certificate-value">
                          {certificate.childName}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">Gender:</span>
                        <span className="certificate-value">
                          {certificate.gender}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Date of Birth:
                        </span>
                        <span className="certificate-value">
                          {new Date(
                            certificate.dateOfBirth
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Place of Birth:
                        </span>
                        <span className="certificate-value">
                          {certificate.placeOfBirth}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Birth District:
                        </span>
                        <span className="certificate-value">
                          {certificate.birthDistrict}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Municipality/VDC:
                        </span>
                        <span className="certificate-value">
                          {certificate.birthMunicipality}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">Ward No:</span>
                        <span className="certificate-value">
                          {certificate.birthWard}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Permanent Address:
                        </span>
                        <span className="certificate-value">
                          {certificate.permanentAddress}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Father's Name:
                        </span>
                        <span className="certificate-value">
                          {certificate.fatherName}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Father's Citizenship No:
                        </span>
                        <span className="certificate-value">
                          {certificate.fatherCitizenshipNo}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Mother's Name:
                        </span>
                        <span className="certificate-value">
                          {certificate.motherName}
                        </span>
                      </div>

                      <div className="certificate-field">
                        <span className="certificate-label">
                          Mother's Citizenship No:
                        </span>
                        <span className="certificate-value">
                          {certificate.motherCitizenshipNo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="my-8 text-center">
                    <p className="text-sm text-gray-700 italic">
                      This is to certify that the details mentioned above have
                      been extracted from the birth register maintained by this
                      office.
                    </p>
                  </div>

                  <div className="certificate-footer flex justify-between mt-12 pt-6 border-t border-dashed border-gray-300">
                    <div className="signature-box">
                      <div className="border-b border-black min-w-[200px] h-16 flex items-end justify-center">
                        <p className="handwriting text-xl mb-1">
                          Raj Kumar Sharma
                        </p>
                      </div>
                      <p className="text-sm mt-2">Applicant's Signature</p>
                    </div>

                    <div className="signature-box text-right">
                      <div className="border-b border-black min-w-[200px] h-16 flex items-end justify-center">
                        <Image
                          name="authorized-signature"
                          alt="Authorized Signature"
                          className="h-24 w-auto -mb-5"
                        />
                      </div>
                      <p className="text-sm mt-2">Authorized Signature</p>
                      <p className="text-sm">{certificate.issuedBy}</p>
                      <p className="text-sm">
                        Issued Date:{" "}
                        {new Date(certificate.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 border-t pt-6 text-center text-sm text-gray-600">
                    <p>
                      This certificate is automatically generated by the Online
                      Birth Registration System. To verify the authenticity of
                      this certificate, please visit our website or contact the
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
              The certificate you are looking for could not be found or you may
              not have permission to view it.
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
