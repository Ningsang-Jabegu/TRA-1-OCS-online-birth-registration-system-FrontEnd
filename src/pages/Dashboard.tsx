import { useState, useEffect, Fragment } from "react";
import { apiFetch } from "@/lib/api";
import { Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Download,
  ClipboardList,
  Eye,
  Search,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface BirthRecord {
  id: string;
  childName: string;
  dateOfBirth: string;
  gender: string;
  status: "pending" | "approved" | "rejected";
  certificateUrl?: string;
  raw?: any;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
  const res = await apiFetch('/api/birth-records');
        if (!res.ok) throw new Error('Failed to load records');
        const data = await res.json();
        if (data && data.success && Array.isArray(data.records)) {
          const mapped: BirthRecord[] = data.records.map((r: any) => ({
            id: r.id || r.certificateNo || r.raw?.ID || r.ID || '',
            childName: `${r.raw?.CHILD_FIRST_NAME || r.childFirstName || r.CHILD_FIRST_NAME || ''} ${r.raw?.CHILD_MIDDLE_NAME || r.childMiddleName || r.CHILD_MIDDLE_NAME || ''} ${r.raw?.CHILD_LAST_NAME || r.childLastName || r.CHILD_LAST_NAME || ''}`.trim(),
            dateOfBirth: r.dateOfBirth || r.raw?.DATE_OF_BIRTH || r.DATE_OF_BIRTH || '',
            gender: r.gender || r.raw?.GENDER || r.GENDER || '',
            status: (r.status || r.raw?.STATUS || r.STATUS || 'pending').toLowerCase(),
            certificateUrl: r.certificateUrl || r.raw?.CERTIFICATE_URL || r.CERTIFICATE_URL || (r.certificateNo ? `/certificate/${r.certificateNo}` : ''),
            raw: r.raw || r
          }));
          setRecords(mapped);
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.error('Error fetching records:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const pendingRecords = records.filter(record => record.status === "pending");
  const approvedRecords = records.filter(record => record.status === "approved");

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.name || "User"}!
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/profile/update">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
            {user?.role !== "Guest" && (
              <Link to="/birth-registration">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Register Birth
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Registrations
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
              <p className="text-xs text-muted-foreground">
                All registered births
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Certificates
              </CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready for download
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <RecordsList 
                records={records}
                loading={loading} 
                userRole={user?.role || "Guest"} 
              />
            </TabsContent>
            
            <TabsContent value="pending">
              <RecordsList 
                records={pendingRecords}
                loading={loading} 
                userRole={user?.role || "Guest"} 
              />
            </TabsContent>
            
            <TabsContent value="approved">
              <RecordsList 
                records={approvedRecords}
                loading={loading} 
                userRole={user?.role || "Guest"} 
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-8">
          <Link to="/certificate-verification">
            <Button variant="outline" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Quick Certificate Verification
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

interface RecordsListProps {
  records: BirthRecord[];
  loading: boolean;
  userRole: UserRole;
}

const RecordsList = ({ records, loading }: RecordsListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRecord, setModalRecord] = useState<any | null>(null);
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 p-4 rounded animate-pulse h-16">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">ID</th>
            <th className="pb-2 font-medium">Child Name</th>
            <th className="pb-2 font-medium">Date of Birth</th>
            <th className="pb-2 font-medium">Gender</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <Fragment key={record.id}>
              <tr className="border-b hover:bg-muted">
              <td className="py-4">{record.id}</td>
              <td className="py-4">{record.childName}</td>
              <td className="py-4">
                {record.dateOfBirth
                ? (() => {
                  try {
                    return format(new Date(record.dateOfBirth), "dd MMM yyyy");
                  } catch {
                    return record.dateOfBirth;
                  }
                  })()
                : "-"}
              </td>
              <td className="py-4">{record.gender || "-"}</td>
              <td className="py-4">
                <StatusBadge status={record.status} />
                {record.raw && (record.raw.REJECT_REASON || record.raw.rejectReason) ? (
                                                  <div className="text-xs text-red-600 mt-1">Reason: {record.raw.REJECT_REASON || record.raw.rejectReason}</div>
                                                ) : null}
              </td>
              <td className="py-4 text-right">
                <div className="flex justify-end items-center gap-2">
                {record.status === "approved" && record.certificateUrl && (
                  <Link to={record.certificateUrl}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                  </Link>
                )}

                {record.status === "rejected" && (
                  <Link to="/birth-registration" state={{ draft: record.raw || record }}>
                    <Button size="sm">
                      <Plus className="mr-2 h-3 w-3" />
                      Re-apply
                    </Button>
                  </Link>
                )}
                <button
                  className="text-sm text-indigo-600 hover:underline"
                  onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                >
                  {expandedId === record.id ? "Hide" : "Details"}
                </button>
                </div>
              </td>
              </tr>

              {expandedId === record.id && (
              <tr className="bg-gray-50">
                <td colSpan={6} className="p-4 text-sm text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary fields */}
                  <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Certificate No</div>
                    <div className="font-medium">{record.raw?.certificateNo || record.id || "N/A"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Child Name</div>
                    <div className="font-medium">{record.childName || "N/A"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">
                    {record.dateOfBirth
                      ? (() => {
                        try {
                        return format(new Date(record.dateOfBirth), "dd MMM yyyy");
                        } catch {
                        return record.dateOfBirth;
                        }
                      })()
                      : "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Gender</div>
                    <div className="font-medium">{record.gender || "N/A"}</div>
                  </div>
                  </div>

                  {/* Secondary / contextual fields */}
                  <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Place of Birth</div>
                    <div className="font-medium">
                    {record.raw?.placeOfBirth ||
                      record.raw?.PLACE_OF_BIRTH ||
                      record.raw?.BIRTH_PLACE ||
                      "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Father / Mother</div>
                    <div className="font-medium">
                    {(record.raw?.fatherName ||
                      record.raw?.FATHER_NAME ||
                      record.raw?.dadName) ||
                      "—"}{" "}
                    /{" "}
                    {(record.raw?.motherName ||
                      record.raw?.MOTHER_NAME ||
                      record.raw?.momName) ||
                      "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Registrar / Office</div>
                    <div className="font-medium">
                    {record.raw?.registrar || record.raw?.office || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium capitalize">{record.status}</div>
                  </div>
                  </div>
                </div>

                {/* Optional extra fields (safe preview) */}
                {(() => {
                  const raw = record.raw || {};
                  const excludeKeys = new Set([
                  "raw",
                  "attachments",
                  "photos",
                  "photo",
                  "certificatePdf",
                  "certificateUrl",
                  "CERTIFICATE_URL",
                  "CHILD_FIRST_NAME",
                  "CHILD_LAST_NAME",
                  "CHILD_MIDDLE_NAME",
                  "DATE_OF_BIRTH",
                  "GENDER",
                  "FATHER_NAME",
                  "MOTHER_NAME",
                  ]);
                  const extras = Object.entries(raw)
                  .filter(
                    ([k, v]) =>
                    !excludeKeys.has(k) &&
                    (typeof v === "string" || typeof v === "number" || typeof v === "boolean") &&
                    String(v).trim().length > 0
                  )
                  .slice(0, 6);
                  if (extras.length === 0) return null;
                  return (
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground mb-2">More details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extras.map(([k, v]) => (
                      <div key={k} className="text-sm">
                      <div className="text-xxs text-muted-foreground">{k}</div>
                      <div className="font-medium">{String(v)}</div>
                      </div>
                    ))}
                    </div>
                  </div>
                  );
                })()}

                {/* Action row */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {record.status === "approved" && record.certificateUrl ? (
                    <Link to={record.certificateUrl}>
                      <Button size="sm">
                        <Download className="mr-2 h-3 w-3" />
                        Open Certificate
                      </Button>
                    </Link>
                  ) : (
                    // For pending/rejected, show a button that opens a modal with details
                    <Button
                      size="sm"
                      variant={record.status === "rejected" ? "destructive" : "outline"}
                      onClick={() => {
                        setModalRecord(record);
                        setModalOpen(true);
                      }}
                    >
                      <Download className="mr-2 h-3 w-3" />
                      {record.status === "pending" ? "Certificate (Pending)" : "Certificate (Rejected)"}
                    </Button>
                  )}

                  {record.status === "rejected" && (
                    <Link to="/birth-registration" state={{ draft: record.raw || record }}>
                      <Button size="sm">
                        <Plus className="mr-2 h-3 w-3" />
                        Re-apply
                      </Button>
                    </Link>
                  )}

                  <Link to={`/records/${record.id}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-3 w-3" />
                      View Record
                    </Button>
                  </Link>
                </div>
                </td>
              </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      {/* Modal for pending/rejected certificate details */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate Unavailable</DialogTitle>
            <DialogDescription>
              This certificate is not available for download. The record status is <strong>{modalRecord?.status}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-sm">
              <div><strong>ID:</strong> {modalRecord?.id || modalRecord?.raw?.ID || 'N/A'}</div>
              <div className="mt-2"><strong>Child:</strong> {modalRecord?.childName || `${modalRecord?.raw?.CHILD_FIRST_NAME || ''} ${modalRecord?.raw?.CHILD_LAST_NAME || ''}`.trim() || 'N/A'}</div>
              <div className="mt-2"><strong>Date of Birth:</strong> {modalRecord?.dateOfBirth || modalRecord?.raw?.DATE_OF_BIRTH || 'N/A'}</div>
              <div className="mt-2"><strong>Reason (if rejected):</strong> {modalRecord?.raw?.REJECT_REASON || modalRecord?.raw?.rejectReason || '—'}</div>
              <div className="mt-2"><strong>Registered At:</strong> {modalRecord?.registeredAt || modalRecord?.raw?.REGISTERED_AT || 'N/A'}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
            {modalRecord?.status === 'rejected' && (
              <Link to="/birth-registration" state={{ draft: modalRecord?.raw || modalRecord }}>
                <Button>Re-apply</Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "approved":
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Approved
        </span>
      );
    case "pending":
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          Pending
        </span>
      );
    case "rejected":
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          Rejected
        </span>
      );
    default:
      return null;
  }
};

export default Dashboard;
