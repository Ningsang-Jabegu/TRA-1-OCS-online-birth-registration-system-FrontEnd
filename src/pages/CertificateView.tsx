import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Printer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import coatOfArms from "@/assets/photoUsed/Coat_Of_Arms_Logo.png";

interface Certificate {
  id?: string;
  childName?: string;
  gender?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  certificateNo?: string;
  registrationDate?: string;
}

export default function CertificateView() {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [registrarNameState, setRegistrarNameState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const recordRawRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    const fetchRecord = async () => {
      setLoading(true);
      try {
        if (!id) {
          setLoading(false);
          return;
        }
        const res = await apiFetch(`/api/birth-record/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.record) {
            const r = data.record;
            recordRawRef.current = r.raw || r;
            // attempt to resolve registrar name if REGISTERED_BY looks like an id/email
            (async () => {
              try {
                const regBy = r.REGISTERED_BY || r.registeredBy || r.registered_by || r.registeredById || r.registered_by_id || '';
                if (regBy) {
                  const userRes = await apiFetch(`/api/user/${encodeURIComponent(regBy)}`);
                  if (userRes.ok) {
                    const ud = await userRes.json().catch(() => null);
                    if (ud && ud.success && ud.user) {
                      const name = ud.user.NAME || ud.user.name || ud.user.NAME || '';
                      if (name) setRegistrarNameState(name);
                    }
                  }
                }
              } catch (err) {
                // ignore registrar name lookup failures
                console.warn('Registrar lookup failed', err);
              }
            })();
            const cert: Certificate = {
              id: r.CERTIFICATE_NO || r.ID || id,
              childName: `${r.CHILD_FIRST_NAME || r.childFirstName || ""} ${r.CHILD_LAST_NAME || r.childLastName || ""}`.trim(),
              gender: r.GENDER || r.gender || "",
              dateOfBirth: r.DATE_OF_BIRTH || r.dateOfBirth || "",
              placeOfBirth: r.PLACE_OF_BIRTH || r.placeOfBirth || "",
              certificateNo: r.CERTIFICATE_NO || r.certificateNo || r.ID,
              registrationDate: r.REGISTERED_AT || r.registeredAt || "",
            };
            if (mounted) setCertificate(cert);
          }
        }
      } catch (e) {
        console.error("Error fetching certificate:", e);
        toast({ variant: "destructive", title: "Fetch Error", description: "Could not load certificate data." });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRecord();
    return () => { mounted = false; };
  }, [id]);

  // --- OFFICIAL HTML BUILDER ---
  const buildOfficialHtml = (cert: Certificate) => {
    const rec = recordRawRef.current || {};
    const esc = (v: any) => (v === null || v === undefined ? "" : String(v));
    const regNo = esc(cert.certificateNo || rec.CERTIFICATE_NO || rec.ID || "");
    const regDateRaw = esc(cert.registrationDate || rec.REGISTERED_AT || "");
    const formatRegisteredAt = (s: string) => {
      if (!s) return '';
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      const year = d.getFullYear();
      const month = d.toLocaleString('en-US', { month: 'long' });
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${year} ${month} ${day} | ${hh}:${mm}:${ss}`;
    };
    const regDate = formatRegisteredAt(regDateRaw);
    const fullName = esc(cert.childName || `${rec.CHILD_FIRST_NAME || ""} ${rec.CHILD_LAST_NAME || ""}`.trim());
    const dob = esc(cert.dateOfBirth || rec.DATE_OF_BIRTH || rec.dateOfBirth || "");
    const place = esc(cert.placeOfBirth || rec.PLACE_OF_BIRTH || rec.placeOfBirth || rec.BIRTH_PLACE || "");
    const gender = esc(cert.gender || rec.GENDER || rec.gender || "");

    // additional fields requested
    const informantName = esc(rec.INFORMANT_NAME || rec.informantName || rec.INFORMANT || rec.INFORMANT_FULL_NAME || "");
    const province = esc(rec.PROVINCE || rec.province || rec.PROVINCE_NAME || "");
    const address = esc(rec.PERMANENT_ADDRESS || rec.permanentAddress || rec.ADDRESS || rec.address || "");
    const fatherName = esc((rec.FATHER_FIRST_NAME || rec.fatherFirstName || rec.FATHER_NAME || "") + (rec.FATHER_LAST_NAME || rec.fatherLastName ? ` ${rec.FATHER_LAST_NAME || rec.fatherLastName}` : ""));
    const fathersLastName = esc(rec.FATHER_LAST_NAME || rec.fatherLastName || "");
    const fatherCitizenship = esc(rec.FATHER_CITIZENSHIP_NO || rec.fatherCitizenshipNo || rec.FATHER_NIN || rec.FATHER_CITIZENSHIP || "");
    const motherName = esc((rec.MOTHER_FIRST_NAME || rec.motherFirstName || rec.MOTHER_NAME || "") + (rec.MOTHER_LAST_NAME || rec.motherLastName ? ` ${rec.MOTHER_LAST_NAME || rec.motherLastName}` : ""));
    const motherCitizenship = esc(rec.MOTHER_CITIZENSHIP_NO || rec.motherCitizenshipNo || rec.MOTHER_NIN || rec.MOTHER_CITIZENSHIP || "");
    const wardNo = esc(rec.WARD || rec.WARD_NO || rec.WARDNO || rec.WARD_NUMBER || rec.WARD_NO_NAME || "");
    const municipality = esc(rec.MUNICIPALITY || rec.MUNICIPALITY_NAME || rec.municipality || rec.MUNICIPALITY_EN || "");
    const district = esc(rec.DISTRICT || rec.district || rec.DISTRICT_NAME || rec.DISTRICT_EN || "");
    // Prefer common CSV keys for Nepali (B.S.) date and Gregorian (A.D.) date
    const dobBS = esc(
      rec.NEPALI_DOB || rec.NEPALI_DATE || rec.DATE_OF_BIRTH_BS || rec.DOB_BS || rec.DOBBS || rec.dateOfBirthBS || ""
    );
    const dobAD = esc(rec.DATE_OF_BIRTH || rec.dateOfBirth || rec.DOB || "");
    const placeOfBirth = esc(place);
    const registrarName = esc(registrarNameState || rec.REGISTRAR_NAME || rec.REGISTERED_BY_NAME || rec.REGISTERED_BY || 'Local Registrar');

    return `
    <div id="page" style="width:210mm; height:297mm; margin:0 auto; position:relative; background:#fff; box-shadow:0 0 0 1px #999 inset; box-sizing:border-box; padding:18mm; overflow:hidden; font-family:Inter, Arial, sans-serif;">
      <img src="${coatOfArms}" alt="Emblem" style="position:absolute; left:50%; top:130mm; transform:translate(-50%,-50%); width:160mm; opacity:0.06; pointer-events:none; z-index:0;"/>
      <div style="position:absolute; left:-20mm; top:120mm; width:260mm; transform:rotate(-22deg); text-align:center; font-weight:700; font-size:48px; color:#000; opacity:0.06; pointer-events:none; z-index:1;">
        Birth Registration Certificate
      </div>

      <div style="position:relative; z-index:2; display:flex; align-items:flex-start; gap:12px;">
        <div style="width:80px; flex:0 0 80px;">
          <img src="${coatOfArms}" alt="Coat of arms" style="width:80px; height:auto; display:block;" />
        </div>
        <div style="flex:1; text-align:center;">
          <div style="font-size:12px;">Schedule–12</div>
          <div style="font-size:12px; margin-top:4px;">(Related with Rule 7)</div>
          <div style="font-size:14px; font-weight:700; margin-top:8px;">Government of Nepal</div>
          <div style="font-size:12px; margin-top:4px;">Ministry of Federal Affairs and Local Development</div>
          <div style="font-size:14px; font-weight:700; margin-top:8px;">Office of Local Registrar</div>
          <div style="font-size:12px; margin-top:2px;">${province}, ${district} District, ${municipality} Municipality</div>
          <div style="margin-top:10px; font-size:20px; font-weight:800; text-decoration:underline;">जन्म दर्ता प्रमाणपत्र</div>
          <div style="font-size:16px; font-weight:700; margin-top:4px;">(Birth Registration Certificate)</div>
        </div>
        <div style="width:80px; flex:0 0 80px;"></div>
      </div>

        <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:13px;">
        <div>Registration No.: <strong>${regNo}</strong></div>
        <div>Date of Registration: <strong>${regDate}</strong></div>
      </div>

      <div style="margin-top:16px; font-size:13px; line-height:1.6; text-align:justify; padding:10px;">
      This is to certify, as per the birth register maintained at this office and the information provided by <strong>${informantName || 'the informant'}</strong> in the information form of schedule 2, that Mr/Ms. <strong>${fullName}</strong>, son/daughter of <strong>Mr. ${fatherName || '—'}</strong> and <strong>Mrs. ${motherName || '—'} (${fathersLastName})</strong>, a resident of Ward No. <strong>${wardNo || '—'}</strong>, <strong>${municipality || '—'}</strong>, was born on <strong>${dobBS || dobAD || dob || '—'}</strong> (AD: ${dobAD || dob || '—'}) at <strong>${placeOfBirth || place}</strong>.
      </div>

      <div style="margin-top:12px; border:1px solid #000; padding:6px; box-sizing:border-box; font-size:13px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div style="border:1px dashed #000; padding:8px;">
            <div><strong>पूरा नाम / Full Name : </strong>${fullName}</div>
          </div>
          <div style="border:1px dashed #000; padding:8px;">
            <div><strong>जन्म मिति / Date of Birth : </strong>${dob}</div>
          </div>
          <div style="border:1px dashed #000; padding:8px;">
            <div><strong>लिङ्ग / Sex : </strong>${gender}</div>
          </div>
          <div style="border:1px dashed #000; padding:8px;">
            <div><strong>स्थायी ठेगाना / Permanent Address : </strong>${address}</div>
          </div>
        </div>
        <div style="display:grid; margin-top:8px; margin-bottom:8px; grid-column:1 / 3; gap:6px;">
          <div style="border:1px dashed #000; padding:8px;">
            <div><strong>जन्मस्थान / Birth Place : </strong>${place}</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
         
          <div style="border:1px dashed #000; padding:8px;">
            <div style="font-weight:700; margin-bottom:6px;">बाबुको विवरण / Father's Details</div>
            <div><strong>पूरा नाम / Full Name : </strong>${fatherName}</div>
            <div style="margin-top:6px;"><strong>NIN / Citizenship No. :</strong> ${fatherCitizenship}</div>
          </div>
          
          <div style="border:1px dashed #000; padding:8px;">
            <div style="font-weight:700; margin-bottom:6px;">आमाको विवरण / Mother's Details</div>
            <div><strong>पूरा नाम / Full Name : </strong>${motherName}</div>
            <div style="margin-top:6px;"><strong>NIN / Citizenship No. :</strong> ${motherCitizenship}</div>
          </div>
          <div style="border:1px dashed #000; padding:8px;">
            <div><strong>लिङ्ग / Sex : </strong>${gender}</div>
          </div>
          <div style="border:1px dashed #000; padding:8px;">
            <div><strong>जन्मस्थान / Birth Place : </strong>${place}</div>
          </div>
        </div>
        <div style="display:grid; margin-top:8px; margin-bottom:8px; grid-column:1 / 3; gap:6px;">
          <div style="border:1px dashed #000; padding:8px;">
            <div style="font-weight:700; margin-bottom:6px;">सूचकको विवरण / Informant's Details</div>
            <div><strong>पूरा नाम / Full Name : </strong>${fatherName}</div>
            <div style="margin-top:6px;"><strong>Relationship::</strong> Father</div>
            <div style="margin-top:6px;"><strong>NIN / Citizenship No.:</strong> ${fatherCitizenship}</div>
          </div>
        </div>
      </div>

      <!-- signature row -->
      <div style="display:flex; justify-content:space-between; margin-top:18px; align-items:flex-start; font-size:13px; z-index:2; position:relative;">
        <div style="width:45%;">
          <div style="font-weight:700; margin-bottom:12px;">Date, District and Citizenship No. if Citizenship Certificate is Issued to :</div>
          <div style="margin-top:6px;"><strong>A. Father :</strong> ${fatherCitizenship}</div>
          <div style="margin-top:6px;"><strong>B. Mother :</strong> ${motherCitizenship}</div>
        </div>

        <div style="width:45%; text-align:left;">
          <div style="font-weight:700; margin-bottom:6px;">Local registrar's :</div>
          <div style="border:1px solid #000; width:220px; height:60px; margin-bottom:6px;">
            <div style="width:80px; flex:0 0 80px;">
              <img src="${coatOfArms}" alt="Coat of arms" style="width:80px; height:auto; display:block; filter:grayscale(100%) contrast(110%);" />
            </div>  
          </div>
          <div><strong>Signature :</strong></div>
          <div style="margin-top:6px;"><strong>Name and surname:</strong> ${registrarName}</div>
          <div style="margin-top:6px;"><strong>Date:</strong> ${regDate}</div>
        </div>
      </div>

      <div style="text-align:center; margin-top:24px; font-size:11px; color:#555;">
        This certificate is auto-generated by the Online Birth Registration System. To verify the certificate, visit our system and use the Certificate Verification feature.
      </div>
      
      <!-- QR CODE -->
      <div style="position:absolute; right:18mm; bottom:18mm; z-index:3; text-align:center;">
        <div style="font-size:10px; color:#333; margin-bottom:4px;">Scan to verify</div>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=CERTIFICATE:${encodeURIComponent(regNo)}" alt="QR Code" style="width:64px; height:64px; background:#fff; padding:4px; border:1px solid #ddd;" />
      </div>
    </div>`;
  };

  const handleDownload = async () => {
    if (!certificate) return;
    try {
      const html = buildOfficialHtml(certificate);
      const tmp = document.createElement("div");
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      tmp.innerHTML = html;
      document.body.appendChild(tmp);
      const canvas = await html2canvas(tmp, { scale: 2, useCORS: true, backgroundColor: "#fff" });
      document.body.removeChild(tmp);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`Birth Certificate - ${certificate.childName || certificate.certificateNo}.pdf`);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Download Failed", description: "Could not generate certificate PDF." });
    }
  };

  const handlePrint = async () => {
    if (!certificate) return;
    const html = buildOfficialHtml(certificate);
    const win = window.open("", "_blank");
    if (!win) return toast({ variant: "destructive", title: "Print Failed", description: "Popup blocked." });
    win.document.open();
    win.document.write(`<!doctype html><html><head><title>Print</title></head><body>${html}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 800);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center print:hidden">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>

          {!loading && certificate && (
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Print</Button>
              <Button size="sm" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/>Download</Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : certificate ? (
          <div className="max-w-5xl mx-auto bg-gray-100 p-6 rounded-lg">
            {/* Live Preview */}
            <div
              className="certificate-preview"
              dangerouslySetInnerHTML={{ __html: buildOfficialHtml(certificate) }}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Certificate Not Found</h2>
            <Link to="/dashboard"><Button>Return to Dashboard</Button></Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
