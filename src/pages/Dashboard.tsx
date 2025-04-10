
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import BilingualHeader from "@/components/BilingualHeader";
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
import { FileText, Plus, Download, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Mock data for birth certificates
interface BirthRecord {
  id: string;
  childName: string;
  dateOfBirth: string;
  parentName: string;
  registrationDate: string;
  status: "approved" | "pending" | "rejected";
}

const Dashboard = () => {
  const { user, isAdmin, isCitizen, isGuest } = useAuth();
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching records
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      const mockRecords: BirthRecord[] = [
        {
          id: "BC-2023-001",
          childName: "Arun Sharma",
          dateOfBirth: "2023-03-15",
          parentName: "Raj Sharma",
          registrationDate: "2023-03-20",
          status: "approved",
        },
        {
          id: "BC-2023-002",
          childName: "Sunita Gurung",
          dateOfBirth: "2023-04-10",
          parentName: "Mina Gurung",
          registrationDate: "2023-04-12",
          status: "pending",
        },
      ];
      
      setRecords(mockRecords);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownloadCertificate = (id: string) => {
    // In a real app, this would download the certificate
    toast({
      title: "Certificate Download",
      description: `Certificate ${id} is being prepared for download.`,
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <BilingualHeader
            englishTitle="Dashboard"
            nepaliTitle="ड्यासबोर्ड"
            subtitle={`Welcome, ${user?.name || "User"}`}
          />
        </div>

        {isGuest ? (
          <div className="mt-8 text-center">
            <Card>
              <CardHeader>
                <CardTitle>Guest Access</CardTitle>
                <CardDescription>
                  As a guest, you can view the system's features but cannot register births or
                  generate certificates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Upgrade to a Citizen account to access full functionality or
                  contact an administrator for assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/">
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View System Features
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button>
                      Switch Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="birth-records" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="birth-records">Birth Records</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="birth-records">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Your Birth Records</h2>
                {isCitizen && (
                  <Link to="/birth-registration">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Register New Birth
                    </Button>
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin">
                    <Button>
                      <Eye className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : records.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {records.map((record) => (
                    <Card key={record.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{record.childName}</CardTitle>
                        <CardDescription>ID: {record.id}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Date of Birth:</span>{" "}
                            {new Date(record.dateOfBirth).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">Parent:</span> {record.parentName}
                          </p>
                          <p>
                            <span className="font-medium">Registered:</span>{" "}
                            {new Date(record.registrationDate).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            <span
                              className={`font-semibold ${
                                record.status === "approved"
                                  ? "text-green-600"
                                  : record.status === "pending"
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Link to={`/certificate/${record.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        {record.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadCertificate(record.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="w-full text-center py-8">
                  <CardContent>
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Birth Records Found</h3>
                    <p className="text-gray-500 mb-6">
                      You haven't registered any births yet. Start by registering a new birth.
                    </p>
                    {isCitizen && (
                      <Link to="/birth-registration">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Register New Birth
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    View and manage your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="text-base">{user?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="text-base">{user?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                      <p className="text-base">{user?.role}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Account ID</h3>
                      <p className="text-base">{user?.id}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline">Update Profile</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
