import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import BilingualHeader from "@/components/BilingualHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// select UI not used here; kept earlier during development
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Search, FileText, Users, FileBarChart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import coatOfArms from "@/assets/photoUsed/Coat_Of_Arms_Logo.png";
import { ResponsiveContainer, BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from "recharts";
import { format } from 'date-fns';

interface BirthRecord {
  id: string;
  childName: string;
  dateOfBirth: string;
  parentName?: string;
  registrationDate?: string;
  status: "approved" | "pending" | "rejected";
  district?: string;
  // allow extra fields
  [k: string]: any;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredDate?: string;
  status?: string;
}

interface StatData {
  name: string;
  value: number;
}

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BirthRecord[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRecord, setSelectedRecord] = useState<BirthRecord | null>(null);
  const [recordStatusDialog, setRecordStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<"approved" | "pending" | "rejected">("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // removed in-place view dialog; details open in full page route

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // stats
  const [districtData, setDistrictData] = useState<StatData[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ name: string; approved: number; pending: number; rejected: number; time?: number }[]>([]);

  // Fetch records and users from backend - callable so we can refresh on events
  const fetchAll = async () => {
    try {
      setLoading(true);
      const recRes = await apiFetch("/api/birth-records");
      if (recRes.ok) {
        const recData = await recRes.json();
        if (recData && recData.success && Array.isArray(recData.records)) {
          const mapped: BirthRecord[] = recData.records.map((r: any) => ({
            id: r.id || r.ID || r.certificateNo || r.CERTIFICATE_NO || "",
            childName: `${r.raw?.CHILD_FIRST_NAME || r.childFirstName || r.CHILD_FIRST_NAME || ""} ${r.raw?.CHILD_MIDDLE_NAME || r.childMiddleName || r.CHILD_MIDDLE_NAME || ""} ${r.raw?.CHILD_LAST_NAME || r.childLastName || r.CHILD_LAST_NAME || ""}`.trim(),
            dateOfBirth: r.dateOfBirth || r.raw?.DATE_OF_BIRTH || r.DATE_OF_BIRTH || "",
            parentName: `${r.raw?.FATHER_FIRST_NAME || r.fatherFirstName || ""} ${r.raw?.FATHER_LAST_NAME || r.fatherLastName || ""}`.trim(),
            registrationDate: r.raw?.REGISTERED_AT || r.registeredAt || r.registrationDate || "",
            status: (r.status || r.raw?.STATUS || "pending").toLowerCase(),
            district: r.raw?.DISTRICT || r.district || r.DISTRICT || "",
            raw: r.raw || r,
          }));
          setRecords(mapped);
          setFilteredRecords(mapped);

          // quick district aggregation
          const districtAgg: Record<string, number> = {};
          mapped.forEach((m) => {
            districtAgg[m.district || "Unknown"] = (districtAgg[m.district || "Unknown"] || 0) + 1;
          });
          setDistrictData(Object.keys(districtAgg).map((k) => ({ name: k, value: districtAgg[k] })));
        }
      }

      // optional users endpoint
      try {
        const usersRes = await apiFetch("/api/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (Array.isArray(usersData.users)) {
            setUsers(usersData.users.map((u: any) => ({ id: u.ID || u.id || "", name: u.NAME || u.name || "", email: u.EMAIL || u.email || "", role: u.ROLE || u.role || "Citizen", registeredDate: u.REGISTERED_AT || u.registeredDate || "", status: "active" })));
            setFilteredUsers(usersData.users);
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch and event listeners to refresh when other parts update users/records
  useEffect(() => {
    fetchAll();
    const onUsersUpdated = () => fetchAll();
    const onRecordsUpdated = () => fetchAll();
    window.addEventListener('users:updated', onUsersUpdated);
    window.addEventListener('records:updated', onRecordsUpdated);
    return () => {
      window.removeEventListener('users:updated', onUsersUpdated);
      window.removeEventListener('records:updated', onRecordsUpdated);
    };
  }, []);

  // compute monthly aggregates for chart whenever records change
  useEffect(() => {
    try {
      const agg: Record<string, { name: string; approved: number; pending: number; rejected: number; time: number }> = {};
      records.forEach((r) => {
        const rawDate = r.registrationDate || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.registeredAt || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || '';
        const dt = rawDate || r.raw?.REGISTERED_AT || r.raw?.REGISTERED_AT || r.registrationDate || r.registeredAt || r.raw?.REGISTERED_AT || '';
        if (!dt) return;
        const d = new Date(dt);
        if (isNaN(d.getTime())) return;
        const key = format(d, 'yyyy-MM');
        const label = format(d, 'MMM yyyy');
        if (!agg[key]) agg[key] = { name: label, approved: 0, pending: 0, rejected: 0, time: d.getTime() };
        const status = (r.status || (r.raw && (r.raw.STATUS || r.raw.status)) || 'pending').toLowerCase();
        if (status === 'approved') agg[key].approved += 1;
        else if (status === 'rejected') agg[key].rejected += 1;
        else agg[key].pending += 1;
      });
      const arr = Object.keys(agg).map((k) => agg[k]).sort((a, b) => a.time - b.time);
      setMonthlyData(arr);
    } catch (err) {
      console.warn('Could not compute monthly aggregates', err);
      setMonthlyData([]);
    }
  }, [records]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(records);
      setFilteredUsers(users);
      return;
    }
    const q = searchTerm.toLowerCase();
    setFilteredRecords(records.filter((r) => (r.id || "").toLowerCase().includes(q) || (r.childName || "").toLowerCase().includes(q) || (r.parentName || "").toLowerCase().includes(q) || (r.district || "").toLowerCase().includes(q)));
    setFilteredUsers(users.filter((u) => (u.id || "").toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)));
    setPage(1);
  }, [searchTerm, records, users]);

  useEffect(() => {
    const total = filteredRecords.length;
    const start = (page - 1) * pageSize;
    if (start >= total && total > 0) setPage(1);
  }, [filteredRecords, pageSize]);

  const total = filteredRecords.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = filteredRecords.slice(startIndex, endIndex);

  const updateRecordStatus = async (recordId: string, newStatus: "approved" | "pending" | "rejected", reason?: string) => {
    try {
      const body: any = { status: newStatus };
      if (reason) body.reason = reason;
      const res = await apiFetch(`/api/birth-record/${recordId}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to update status');
      }
  await res.json().catch(() => null);
      const updated = records.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r));
      setRecords(updated);
      setFilteredRecords(updated);
      toast({ title: 'Status Updated', description: `Record ${recordId} status changed to ${newStatus}.` });
    } catch (err: any) {
      console.error('Error updating status', err);
      toast({ variant: 'destructive', title: 'Update Failed', description: err?.message || 'Could not update record status.' });
    } finally {
      setRecordStatusDialog(false);
      setRejectDialogOpen(false);
      setRejectReason("");
    }
  };

  // --- Certificate builder & downloader (re-uses logic from CertificateView) ---
  const buildOfficialHtml = (rec: any) => {
    const esc = (v: any) => (v === null || v === undefined ? "" : String(v));
    const regNo = esc(rec.certificateNo || rec.CERTIFICATE_NO || rec.ID || "");
    const regDate = esc(rec.registeredAt || rec.REGISTERED_AT || "");
    const fullName = esc(rec.childFullName || `${rec.raw?.CHILD_FIRST_NAME || rec.childFirstName || ''} ${rec.raw?.CHILD_LAST_NAME || rec.childLastName || ''}`.trim());
    const dob = esc(rec.dateOfBirth || rec.raw?.DATE_OF_BIRTH || rec.DATE_OF_BIRTH || "");
    const place = esc(rec.placeOfBirth || rec.raw?.PLACE_OF_BIRTH || rec.PLACE_OF_BIRTH || "");
    const gender = esc(rec.raw?.GENDER || rec.gender || "");
    const province = esc(rec.raw?.PROVINCE || rec.province || "");
    const district = esc(rec.raw?.DISTRICT || rec.district || "");
    const informantName = esc(rec.raw?.INFORMANT_NAME || rec.informantName || rec.raw?.REGISTERED_BY || rec.registeredBy || "");
    const address = esc(rec.raw?.PERMANENT_ADDRESS || rec.permanentAddress || rec.raw?.ADDRESS || "");
    const fatherName = esc((rec.raw?.FATHER_FIRST_NAME || rec.fatherFirstName || "") + (rec.raw?.FATHER_LAST_NAME || rec.fatherLastName ? ` ${rec.raw?.FATHER_LAST_NAME || rec.fatherLastName}` : ""));
    const fathersLastName = esc(rec.raw?.FATHER_LAST_NAME || rec.fatherLastName || "");
    const fatherCitizenship = esc(rec.raw?.FATHER_CITIZENSHIP_NO || rec.fatherCitizenshipNo || "");
    const motherName = esc((rec.raw?.MOTHER_FIRST_NAME || rec.motherFirstName || "") + (rec.raw?.MOTHER_LAST_NAME || rec.motherLastName ? ` ${rec.raw?.MOTHER_LAST_NAME || rec.motherLastName}` : ""));
    const motherCitizenship = esc(rec.raw?.MOTHER_CITIZENSHIP_NO || rec.motherCitizenshipNo || "");
    const wardNo = esc(rec.wardNo || rec.raw?.WARD || rec.raw?.WARD_NO || "");
    const municipality = esc(rec.municipality || rec.raw?.MUNICIPALITY || "");
    const dobBS = esc(rec.dobBS || rec.raw?.NEPALI_DOB || rec.raw?.NEPALI_DATE || "");
    const dobAD = esc(rec.dobAD || rec.dateOfBirth || rec.raw?.DATE_OF_BIRTH || "");
    const placeOfBirth = esc(place);
    const registrarName = "Dr. Binod Kumar Bhattarai";

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
        This certificate is auto-generated by the Online Birth Registration System.
      </div>
    </div>`;
  };

  const downloadCertificate = async (recordId: string) => {
    try {
      toast({ title: 'Download Initiated', description: `Certificate ${recordId} download started.` });
      const res = await apiFetch(`/api/birth-record/${recordId}`);
      if (!res.ok) throw new Error('Could not fetch record');
      const data = await res.json();
      if (!data || !data.success || !data.record) throw new Error('Record not found');
      const rec = data.record;
      const html = buildOfficialHtml(rec);
      const tmp = document.createElement('div');
      tmp.style.position = 'fixed';
      tmp.style.left = '-9999px';
      tmp.innerHTML = html;
      document.body.appendChild(tmp);
      const canvas = await html2canvas(tmp as HTMLElement, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      document.body.removeChild(tmp);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`Birth Certificate - ${rec.childFullName || rec.certificateNo || rec.ID}.pdf`);
    } catch (err) {
      console.error('Download failed', err);
      toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate certificate PDF.' });
    }
  };

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
          <Link to="/dashboard"><Button>Return to Dashboard</Button></Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <BilingualHeader englishTitle="Administrator Dashboard" nepaliTitle="प्रशासक ड्यासबोर्ड" subtitle={`Welcome, ${user?.name || 'Admin'}`} />

        <div className="my-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Registrations</p>
                    <h3 className="text-3xl font-bold mt-2">{records.length}</h3>
                  </div>
                  <div className="bg-nepal-red/20 p-3 rounded-full"><FileText className="h-6 w-6 text-nepal-red" /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registered Users</p>
                    <h3 className="text-3xl font-bold mt-2">{users.length}</h3>
                  </div>
                  <div className="bg-nepal-blue/20 p-3 rounded-full"><Users className="h-6 w-6 text-nepal-blue" /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                    <h3 className="text-3xl font-bold mt-2">{records.filter(r => r.status === 'pending').length}</h3>
                  </div>
                  <div className="bg-nepal-green/20 p-3 rounded-full"><FileBarChart className="h-6 w-6 text-nepal-green" /></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">System Management</h2>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search records or users..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <Tabs defaultValue="birth-records">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="birth-records">Birth Records</TabsTrigger>
            <TabsTrigger value="users">User Accounts</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="birth-records">
            <Card>
              <CardHeader>
                <CardTitle>Birth Registration Records</CardTitle>
                <CardDescription>Manage and review all birth registrations in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded" />
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}
                  </div>
                ) : filteredRecords.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Child Name</TableHead>
                          <TableHead>Date of Birth</TableHead>
                          <TableHead>Parent</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageItems.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.id}</TableCell>
                            <TableCell>{record.childName}</TableCell>
                            <TableCell>{record.dateOfBirth ? new Date(record.dateOfBirth).toLocaleDateString() : ''}</TableCell>
                            <TableCell>{record.parentName}</TableCell>
                            <TableCell>{record.registrationDate ? new Date(record.registrationDate).toLocaleDateString() : ''}</TableCell>
                            <TableCell>{record.district}</TableCell>
                                            <TableCell>
                                              <div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'approved' ? 'bg-green-100 text-green-800' : record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{record.status}</span>
                                                {record.raw && (record.raw.REJECT_REASON || record.raw.rejectReason) ? (
                                                  <div className="text-xs text-red-600 mt-1">Reason: {record.raw.REJECT_REASON || record.raw.rejectReason}</div>
                                                ) : null}
                                              </div>
                                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setSelectedRecord(record); setNewStatus(record.status); setRecordStatusDialog(true); }}>Change Status</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/admin/record/${record.id}`)}>Open Details Page</DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/certificate/${record.id}`}>View Certificate</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => downloadCertificate(record.id)}>Download Certificate</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="text-sm text-gray-600">Showing {total === 0 ? 0 : startIndex + 1} - {endIndex} of {total} records</div>
                      <div className="flex items-center gap-2">
                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1 text-sm">
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No Records Found</h3>
                    <p className="text-gray-500 mt-1">{searchTerm ? 'No records match your search criteria.' : 'There are no birth registration records in the system.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>Manage all registered users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4"><div className="h-12 bg-gray-200 rounded" /><div className="h-16 bg-gray-200 rounded" /></div>
                ) : filteredUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Registered Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map(u => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.id}</TableCell>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.role}</TableCell>
                            <TableCell>{u.registeredDate}</TableCell>
                            <TableCell>{u.status}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${u.id}`)}>
                                <Eye className="h-4 w-4 mr-1" />View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6"><Users className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-700">No Users Found</h3></div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Monthly Registrations</CardTitle><CardDescription>Birth registration statistics by month</CardDescription></CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="approved" stroke="#10B981" name="Approved" strokeWidth={2} />
                        <Line type="monotone" dataKey="pending" stroke="#F59E0B" name="Pending" strokeWidth={2} />
                        <Line type="monotone" dataKey="rejected" stroke="#EF4444" name="Rejected" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Registrations by District</CardTitle><CardDescription>Birth registration distribution by district</CardDescription></CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={districtData} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#1C49A0" name="Registrations" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Status Change Dialog */}
        <Dialog open={recordStatusDialog} onOpenChange={setRecordStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Record Status</DialogTitle>
              <DialogDescription>Update the status for record {selectedRecord?.id}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full border rounded px-2 py-1">
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecordStatusDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!selectedRecord) return setRecordStatusDialog(false);
                if (newStatus === 'rejected') {
                  // close status dialog and open reject reason dialog
                  setRecordStatusDialog(false);
                  setRejectDialogOpen(true);
                  return;
                }
                updateRecordStatus(selectedRecord.id, newStatus);
              }}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject reason dialog triggered when changing status to rejected */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <div className="text-sm text-gray-600">Please provide a reason for rejecting this application.</div>
            </DialogHeader>
            <div className="py-4">
              <Label>Reason</Label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full border rounded p-2 mt-2" rows={5} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRejectDialogOpen(false); setRejectReason(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (selectedRecord) updateRecordStatus(selectedRecord.id, 'rejected', rejectReason); }}>Reject Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details are opened on a dedicated admin page */}
      </div>
    </MainLayout>
  );
};


export default AdminDashboard;
