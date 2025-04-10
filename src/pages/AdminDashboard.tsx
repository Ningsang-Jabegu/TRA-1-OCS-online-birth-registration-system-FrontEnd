import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import BilingualHeader from "@/components/BilingualHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Eye, MoreHorizontal, Search, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Mock data for birth records
interface BirthRecord {
  id: string;
  childName: string;
  dateOfBirth: string;
  parentName: string;
  registrationDate: string;
  status: "approved" | "pending" | "rejected";
  district: string;
}

// Mock data for user accounts
interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Citizen" | "Guest";
  registeredDate: string;
  status: "active" | "inactive";
}

// Mock data for statistics
interface StatData {
  name: string;
  value: number;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BirthRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<BirthRecord | null>(null);
  const [recordStatusDialog, setRecordStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<"approved" | "pending" | "rejected">("pending");

  // Statistics data
  const [monthlyCertificates, setMonthlyCertificates] = useState<{ name: string; approved: number; pending: number; rejected: number }[]>([]);
  const [districtData, setDistrictData] = useState<StatData[]>([]);
  const [genderData, setGenderData] = useState<StatData[]>([]);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Mock records data
      const mockRecords: BirthRecord[] = [
        {
          id: "BC-2023-001",
          childName: "Arun Sharma",
          dateOfBirth: "2023-03-15",
          parentName: "Raj Sharma",
          registrationDate: "2023-03-20",
          status: "approved",
          district: "Kathmandu",
        },
        {
          id: "BC-2023-002",
          childName: "Sunita Gurung",
          dateOfBirth: "2023-04-10",
          parentName: "Mina Gurung",
          registrationDate: "2023-04-12",
          status: "pending",
          district: "Lalitpur",
        },
        {
          id: "BC-2023-003",
          childName: "Bijay Tamang",
          dateOfBirth: "2023-02-05",
          parentName: "Krishna Tamang",
          registrationDate: "2023-02-08",
          status: "rejected",
          district: "Bhaktapur",
        },
        {
          id: "BC-2023-004",
          childName: "Anita Basnet",
          dateOfBirth: "2023-01-22",
          parentName: "Shyam Basnet",
          registrationDate: "2023-01-25",
          status: "approved",
          district: "Kathmandu",
        },
        {
          id: "BC-2023-005",
          childName: "Ramesh Adhikari",
          dateOfBirth: "2023-05-02",
          parentName: "Hari Adhikari",
          registrationDate: "2023-05-05",
          status: "pending",
          district: "Lalitpur",
        },
      ];
      
      // Mock user accounts
      const mockUsers: UserAccount[] = [
        {
          id: "admin-123",
          name: "Administrator",
          email: "ningsang@obrc.gov.np",
          role: "Administrator",
          registeredDate: "2023-01-01",
          status: "active",
        },
        {
          id: "citizen-1",
          name: "John Citizen",
          email: "citizen@example.com",
          role: "Citizen",
          registeredDate: "2023-03-15",
          status: "active",
        },
        {
          id: "guest-1",
          name: "Guest User",
          email: "guest@example.com",
          role: "Guest",
          registeredDate: "2023-04-20",
          status: "active",
        },
        {
          id: "citizen-2",
          name: "Jane Doe",
          email: "jane@example.com",
          role: "Citizen",
          registeredDate: "2023-02-10",
          status: "inactive",
        },
        {
          id: "citizen-3",
          name: "Ram Sharma",
          email: "ram@example.com",
          role: "Citizen",
          registeredDate: "2023-05-05",
          status: "active",
        },
      ];
      
      // Mock monthly data
      const mockMonthlyData = [
        { name: "Jan", approved: 12, pending: 5, rejected: 2 },
        { name: "Feb", approved: 15, pending: 8, rejected: 3 },
        { name: "Mar", approved: 18, pending: 6, rejected: 1 },
        { name: "Apr", approved: 20, pending: 7, rejected: 2 },
        { name: "May", approved: 25, pending: 10, rejected: 4 },
        { name: "Jun", approved: 22, pending: 9, rejected: 3 },
      ];
      
      // Mock district data
      const mockDistrictData = [
        { name: "Kathmandu", value: 35 },
        { name: "Lalitpur", value: 20 },
        { name: "Bhaktapur", value: 15 },
        { name: "Kaski", value: 10 },
        { name: "Chitwan", value: 8 },
      ];
      
      // Mock gender data
      const mockGenderData = [
        { name: "Male", value: 55 },
        { name: "Female", value: 42 },
        { name: "Other", value: 3 },
      ];
      
      setRecords(mockRecords);
      setFilteredRecords(mockRecords);
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setMonthlyCertificates(mockMonthlyData);
      setDistrictData(mockDistrictData);
      setGenderData(mockGenderData);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(records);
      setFilteredUsers(users);
    } else {
      const searchLower = searchTerm.toLowerCase();
      
      // Filter records
      const filteredRecs = records.filter(
        (record) =>
          record.id.toLowerCase().includes(searchLower) ||
          record.childName.toLowerCase().includes(searchLower) ||
          record.parentName.toLowerCase().includes(searchLower) ||
          record.district.toLowerCase().includes(searchLower)
      );
      setFilteredRecords(filteredRecs);
      
      // Filter users
      const filteredUsrs = users.filter(
        (user) =>
          user.id.toLowerCase().includes(searchLower) ||
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower)
      );
      setFilteredUsers(filteredUsrs);
    }
  }, [searchTerm, records, users]);

  const updateRecordStatus = (recordId: string, newStatus: "approved" | "pending" | "rejected") => {
    const updatedRecords = records.map((record) =>
      record.id === recordId ? { ...record, status: newStatus } : record
    );
    
    setRecords(updatedRecords);
    setFilteredRecords(
      filteredRecords.map((record) =>
        record.id === recordId ? { ...record, status: newStatus } : record
      )
    );
    
    toast({
      title: "Status Updated",
      description: `Record ${recordId} status has been changed to ${newStatus}.`,
    });
    
    setRecordStatusDialog(false);
  };

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access the admin dashboard.
          </p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <BilingualHeader
          englishTitle="Administrator Dashboard"
          nepaliTitle="प्रशासक ड्यासबोर्ड"
          subtitle={`Welcome, ${user?.name || "Admin"}`}
        />

        <div className="my-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-nepal-red/10 to-nepal-red/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Registrations</p>
                    <h3 className="text-3xl font-bold mt-2">158</h3>
                    <p className="text-sm text-green-600 font-medium mt-1">↑ 12% from last month</p>
                  </div>
                  <div className="bg-nepal-red/20 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-nepal-red" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-nepal-blue/10 to-nepal-blue/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registered Users</p>
                    <h3 className="text-3xl font-bold mt-2">84</h3>
                    <p className="text-sm text-green-600 font-medium mt-1">↑ 8% from last month</p>
                  </div>
                  <div className="bg-nepal-blue/20 p-3 rounded-full">
                    <Users className="h-6 w-6 text-nepal-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-nepal-green/10 to-nepal-green/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                    <h3 className="text-3xl font-bold mt-2">27</h3>
                    <p className="text-sm text-amber-600 font-medium mt-1">↑ 5% from last month</p>
                  </div>
                  <div className="bg-nepal-green/20 p-3 rounded-full">
                    <FileBarChart className="h-6 w-6 text-nepal-green" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-semibold">System Management</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search records or users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="birth-records" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="birth-records">Birth Records</TabsTrigger>
            <TabsTrigger value="users">User Accounts</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="birth-records">
            <Card>
              <CardHeader>
                <CardTitle>Birth Registration Records</CardTitle>
                <CardDescription>
                  Manage and review all birth registrations in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
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
                        {filteredRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {record.id}
                            </TableCell>
                            <TableCell>{record.childName}</TableCell>
                            <TableCell>
                              {new Date(record.dateOfBirth).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{record.parentName}</TableCell>
                            <TableCell>
                              {new Date(record.registrationDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{record.district}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  record.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedRecord(record);
                                      setNewStatus(record.status);
                                      setRecordStatusDialog(true);
                                    }}
                                  >
                                    Change Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/certificate/${record.id}`}>
                                      View Certificate
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      toast({
                                        title: "Download Initiated",
                                        description: `Certificate ${record.id} download started.`,
                                      });
                                    }}
                                  >
                                    Download Certificate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No Records Found</h3>
                    <p className="text-gray-500 mt-1">
                      {searchTerm
                        ? "No records match your search criteria."
                        : "There are no birth registration records in the system."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>
                  Manage all registered users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
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
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.id}
                            </TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === "Administrator"
                                    ? "bg-purple-100 text-purple-800"
                                    : user.role === "Citizen"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(user.registeredDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "User Management",
                                    description: "This feature is not implemented in the demo.",
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No Users Found</h3>
                    <p className="text-gray-500 mt-1">
                      {searchTerm
                        ? "No users match your search criteria."
                        : "There are no registered users in the system."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Registrations</CardTitle>
                  <CardDescription>
                    Birth registration statistics by month
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyCertificates}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" />
                      <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                      <Bar dataKey="rejected" stackId="a" fill="#EF4444" name="Rejected" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registrations by District</CardTitle>
                  <CardDescription>
                    Birth registration distribution by district
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={districtData}
                      layout="vertical"
                      margin={{
                        top: 20,
                        right: 30,
                        left: 60,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} name="Registrations" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Registration by Gender</CardTitle>
                  <CardDescription>
                    Birth registration distribution by gender
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={genderData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
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
      </div>

      {/* Status Change Dialog */}
      <Dialog open={recordStatusDialog} onOpenChange={setRecordStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Record Status</DialogTitle>
            <DialogDescription>
              Update the status for record {selectedRecord?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as "approved" | "pending" | "rejected")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRecordStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRecord) {
                  updateRecordStatus(selectedRecord.id, newStatus);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminDashboard;
