
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import BilingualHeader from "@/components/BilingualHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Image from "../images/Image";

const BirthRegistration = () => {
  const { user, isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  
  // Form fields
  const [childFirstName, setChildFirstName] = useState("");
  const [childMiddleName, setChildMiddleName] = useState("");
  const [childLastName, setChildLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [birthDistrict, setBirthDistrict] = useState("");
  const [birthMunicipality, setBirthMunicipality] = useState("");
  const [birthWard, setBirthWard] = useState("");
  
  // Parents information
  const [fatherFirstName, setFatherFirstName] = useState("");
  const [fatherMiddleName, setFatherMiddleName] = useState("");
  const [fatherLastName, setFatherLastName] = useState("");
  const [fatherCitizenshipNo, setFatherCitizenshipNo] = useState("");
  
  const [motherFirstName, setMotherFirstName] = useState("");
  const [motherMiddleName, setMotherMiddleName] = useState("");
  const [motherLastName, setMotherLastName] = useState("");
  const [motherCitizenshipNo, setMotherCitizenshipNo] = useState("");
  
  // Additional details
  const [permanentAddress, setPermanentAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  
  const [loading, setLoading] = useState(false);
  
  // Redirect if not authenticated or is a guest
  if (!isAuthenticated || isGuest) {
    navigate("/login");
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!childFirstName || !childLastName || !gender || !dateOfBirth || !placeOfBirth ||
        !birthDistrict || !birthMunicipality || !birthWard ||
        !fatherFirstName || !fatherLastName || !fatherCitizenshipNo ||
        !motherFirstName || !motherLastName || !motherCitizenshipNo ||
        !permanentAddress || !contactNumber) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Registration Successful",
        description: "Birth registration has been submitted successfully.",
      });
      
      // Generate a mock certificate ID
      const certificateId = `BC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Navigate to the dashboard
      navigate(`/certificate/${certificateId}`);
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <BilingualHeader
          englishTitle="Birth Registration Form"
          nepaliTitle="जन्म दर्ता फारम"
        />
        
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Birth Registration Application</CardTitle>
              <CardDescription>
                Please fill in all the required information to register a birth.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Child Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-nepal-blue">
                    Child Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childFirstName">First Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="childFirstName"
                        value={childFirstName}
                        onChange={(e) => setChildFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childMiddleName">Middle Name</Label>
                      <Input
                        id="childMiddleName"
                        value={childMiddleName}
                        onChange={(e) => setChildMiddleName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childLastName">Last Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="childLastName"
                        value={childLastName}
                        onChange={(e) => setChildLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                      <Select
                        value={gender}
                        onValueChange={setGender}
                        required
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateOfBirth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={setDateOfBirth}
                            initialFocus
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                {/* Birth Location */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-nepal-blue">
                    Birth Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="placeOfBirth">Place of Birth <span className="text-red-500">*</span></Label>
                      <Select
                        value={placeOfBirth}
                        onValueChange={setPlaceOfBirth}
                        required
                      >
                        <SelectTrigger id="placeOfBirth">
                          <SelectValue placeholder="Select place" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="healthPost">Health Post</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDistrict">District <span className="text-red-500">*</span></Label>
                      <Input
                        id="birthDistrict"
                        value={birthDistrict}
                        onChange={(e) => setBirthDistrict(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthMunicipality">Municipality/VDC <span className="text-red-500">*</span></Label>
                      <Input
                        id="birthMunicipality"
                        value={birthMunicipality}
                        onChange={(e) => setBirthMunicipality(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthWard">Ward No. <span className="text-red-500">*</span></Label>
                      <Input
                        id="birthWard"
                        value={birthWard}
                        onChange={(e) => setBirthWard(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Father's Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-nepal-blue">
                    Father's Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherFirstName">First Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="fatherFirstName"
                        value={fatherFirstName}
                        onChange={(e) => setFatherFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherMiddleName">Middle Name</Label>
                      <Input
                        id="fatherMiddleName"
                        value={fatherMiddleName}
                        onChange={(e) => setFatherMiddleName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherLastName">Last Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="fatherLastName"
                        value={fatherLastName}
                        onChange={(e) => setFatherLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherCitizenshipNo">Citizenship Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="fatherCitizenshipNo"
                        value={fatherCitizenshipNo}
                        onChange={(e) => setFatherCitizenshipNo(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Mother's Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-nepal-blue">
                    Mother's Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motherFirstName">First Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="motherFirstName"
                        value={motherFirstName}
                        onChange={(e) => setMotherFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherMiddleName">Middle Name</Label>
                      <Input
                        id="motherMiddleName"
                        value={motherMiddleName}
                        onChange={(e) => setMotherMiddleName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherLastName">Last Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="motherLastName"
                        value={motherLastName}
                        onChange={(e) => setMotherLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="motherCitizenshipNo">Citizenship Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="motherCitizenshipNo"
                        value={motherCitizenshipNo}
                        onChange={(e) => setMotherCitizenshipNo(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-nepal-blue">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="permanentAddress">Permanent Address <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="permanentAddress"
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="contactNumber"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Remarks */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-nepal-blue">
                    Additional Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Any additional information you want to provide"
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => navigate("/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Registration"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default BirthRegistration;
