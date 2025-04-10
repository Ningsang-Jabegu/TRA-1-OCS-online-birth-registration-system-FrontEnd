import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { format } from "date-fns";

interface BirthRecord {
  id: string;
  childName: string;
  dateOfBirth: string;
  gender: string;
  status: "pending" | "approved" | "rejected";
  certificateUrl?: string;
}

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const mockRecords: BirthRecord[] = [
        {
          id: "BR001",
          childName: "Arjun Kumar Sharma",
          dateOfBirth: "2023-05-15",
          gender: "Male",
          status: "approved",
          certificateUrl: "/certificate/BC-2023-001",
        },
        {
          id: "BR002",
          childName: "Maya Rai",
          dateOfBirth: "2023-06-22",
          gender: "Female",
          status: "pending",
        },
        {
          id: "BR003",
          childName: "Rajesh Tamang",
          dateOfBirth: "2023-07-10",
          gender: "Male",
          status: "approved",
          certificateUrl: "/certificate/BC-2023-002",
        },
      ];
      
      setRecords(mockRecords);
      setLoading(false);
    }, 1000);
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

const RecordsList = ({ records, loading, userRole }: RecordsListProps) => {
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
            <tr key={record.id} className="border-b">
              <td className="py-4">{record.id}</td>
              <td className="py-4">{record.childName}</td>
              <td className="py-4">{format(new Date(record.dateOfBirth), "dd MMM yyyy")}</td>
              <td className="py-4">{record.gender}</td>
              <td className="py-4">
                <StatusBadge status={record.status} />
              </td>
              <td className="py-4 text-right">
                <div className="flex justify-end gap-2">
                  {record.status === "approved" && record.certificateUrl && (
                    <Link to={record.certificateUrl}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
