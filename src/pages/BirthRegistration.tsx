import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import BilingualHeader from "@/components/BilingualHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
// import Image from "../images/Image";
import crypto from "crypto";

// at the top of BirthRegistration.tsx
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import NepaliDate from "nepali-date-converter";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { apiFetch } from "@/lib/api";

import provinceDistrictMunicipalityData from "@/data/province_district_municipality";



function calculateAge(dob: Date | null): number | null {
  if (!dob) return null;
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const BirthRegistration = () => {
  // Province, District, Municipality, Ward state
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [ward, setWard] = useState("");
  // ...existing state declarations...
  // ...state declarations...
  const { isAuthenticated, isGuest, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isResubmit, setIsResubmit] = useState(false);

  // Form fields
  const [childFirstName, setChildFirstName] = useState("");
  const [childMiddleName, setChildMiddleName] = useState("");
  const [childLastName, setChildLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [nepaliDOB, setNepaliDOB] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  // (Removed unused birthDistrict, birthMunicipality, birthWard)

  // Province options
  const provinceOptions = provinceDistrictMunicipalityData.map((p: any) => ({ value: p.province, label: p.province }));
  const districtOptions = province
    ? provinceDistrictMunicipalityData.find((p: any) => p.province === province)?.districts.map((d: any) => ({ value: d.name, label: d.name })) || []
    : [];
  const municipalityOptions = province && district
    ? provinceDistrictMunicipalityData
        .find((p: any) => p.province === province)?.districts
        .find((d: any) => d.name === district)?.municipalities.map((m: any) => ({ value: m.municipality, label: m.municipality, wards: m.wards })) || []
    : [];
  const selectedMunicipality = municipalityOptions.find((m: any) => m.value === municipality);
  const wardCount = selectedMunicipality?.wards || 0;
  const wardOptions = wardCount ? Array.from({ length: wardCount }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })) : [];


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

  useEffect(() => {
    // Redirect if not authenticated or is a guest
    if (!isAuthenticated || isGuest) {
      navigate("/login");
    }
  }, [isAuthenticated, isGuest, navigate]);

  // If navigation provided a draft (from Dashboard re-apply), prefill form
  useEffect(() => {
    try {
      const draft = (location && (location as any).state && (location as any).state.draft) || null;
      if (!draft) return;
      setIsResubmit(true);

      // CSV keys may be uppercase or camelCase depending on source
      const get = (k: string[]) => {
        for (const key of k) {
          if (draft[key] !== undefined && draft[key] !== null) return draft[key];
        }
        return '';
      };

      setChildFirstName(get(['CHILD_FIRST_NAME','childFirstName','CHILD_NAME','childName']));
      setChildMiddleName(get(['CHILD_MIDDLE_NAME','childMiddleName']));
      setChildLastName(get(['CHILD_LAST_NAME','childLastName','LAST_NAME']));
      setGender((get(['GENDER','gender']) || '').toString());
      const dobRaw = get(['DATE_OF_BIRTH','dateOfBirth','DOB']);
      if (dobRaw) {
        const d = new Date(dobRaw);
        if (!isNaN(d.getTime())) setDateOfBirth(d);
      }
      setNepaliDOB(get(['NEPALI_DOB','nepaliDOB','NEPALI_DATE']));
      setPlaceOfBirth(get(['PLACE_OF_BIRTH','placeOfBirth','PLACE','BIRTH_PLACE']));
      setProvince(get(['PROVINCE','province']));
      setDistrict(get(['DISTRICT','district']));
      setMunicipality(get(['MUNICIPALITY','municipality','MUNICIPALITY_NAME']));
      setWard(get(['WARD','wardNo','WARD_NO','WARDNO','ward']));

      setFatherFirstName(get(['FATHER_FIRST_NAME','fatherFirstName','FATHER_NAME']));
      setFatherMiddleName(get(['FATHER_MIDDLE_NAME','fatherMiddleName']));
      setFatherLastName(get(['FATHER_LAST_NAME','fatherLastName']));
      setFatherCitizenshipNo(get(['FATHER_CITIZENSHIP_NO','fatherCitizenshipNo','FATHER_CIT_NO']));

      setMotherFirstName(get(['MOTHER_FIRST_NAME','motherFirstName','MOTHER_NAME']));
      setMotherMiddleName(get(['MOTHER_MIDDLE_NAME','motherMiddleName']));
      setMotherLastName(get(['MOTHER_LAST_NAME','motherLastName']));
      setMotherCitizenshipNo(get(['MOTHER_CITIZENSHIP_NO','motherCitizenshipNo','MOTHER_CIT_NO']));

      setPermanentAddress(get(['PERMANENT_ADDRESS','permanentAddress','ADDRESS']));
      setContactNumber(get(['CONTACT_NUMBER','contactNumber','PHONE']));
      setRemarks(get(['REMARKS','remarks']));
    } catch (err) {
      console.warn('Failed to preload draft into birth form', err);
    }
  }, [location]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
  !childFirstName ||
  !childLastName ||
  !gender ||
  (!dateOfBirth && !nepaliDOB) ||
  !placeOfBirth ||
  !province ||
  !district ||
  !municipality ||
  !ward ||
  !fatherFirstName ||
  !fatherLastName ||
  !fatherCitizenshipNo ||
  !motherFirstName ||
  !motherLastName ||
  !motherCitizenshipNo ||
  !permanentAddress ||
  !contactNumber
    ) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        childFirstName,
        childMiddleName,
        childLastName,
        gender,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : '',
        nepaliDOB,
        placeOfBirth,
        province,
        district,
        municipality,
        ward,
        fatherFirstName,
        fatherMiddleName,
        fatherLastName,
        fatherCitizenshipNo,
        motherFirstName,
        motherMiddleName,
        motherLastName,
        motherCitizenshipNo,
        permanentAddress,
        contactNumber,
        remarks,
    registeredBy: user?.id || '',
      };

  // include registeredBy from auth context if available
  if (user && user.id) payload.registeredBy = user.id;

      const res = await apiFetch('/api/register-birth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        toast({ title: 'Registration Successful', description: 'Birth registration has been submitted successfully.' });
        const certificateId = data.certificateNo || data.id;
        navigate(`/certificate/${certificateId}`);
      } else {
        toast({ variant: 'destructive', title: 'Registration Failed', description: data.message || 'Could not register birth.' });
      }
    } catch (err) {
      setLoading(false);
      console.error('Registration error:', err);
      toast({ variant: 'destructive', title: 'Registration Error', description: 'An error occurred while submitting registration.' });
    }
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
                      <Label htmlFor="childFirstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="childLastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="gender">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="gender"
                        className="w-full px-2 py-1 border rounded"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        {/* English Date Picker (AD) */}
                        <div className="border rounded px-2 py-1 w-full">
                          <DatePicker
                            selected={dateOfBirth}
                            onChange={(date: Date | null) => {
                              if (date) {
                                setDateOfBirth(date);

                                // AD → BS
                                const bsDate = new NepaliDate(date).format(
                                  "YYYY-MM-DD"
                                );
                                setNepaliDOB(bsDate);
                              }
                            }}
                            maxDate={new Date()}
                            dateFormat="dd MMMM yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            className="w-full px-2 py-1 border-none outline-none bg-transparent"
                            placeholderText="Select date"
                          />
                        </div>

                        {/* Nepali Date Picker (BS) */}
                        <div className="border rounded px-2 py-1 w-full">
                          <NepaliDatePicker
                            value={nepaliDOB}
                            onChange={(bsDate: string) => {
                              setNepaliDOB(bsDate);

                              // BS -> AD
                              const [yyyy, mm, dd] = bsDate
                                .split("-")
                                .map(Number);
                              const adDate = new NepaliDate(
                                yyyy,
                                mm,
                                dd
                              ).toJsDate();
                              setDateOfBirth(adDate);
                            }}
                            inputClassName="w-full px-2 py-1 border-none outline-none bg-transparent"
                            options={{
                              calenderLocale: "ne",
                              valueLocale: "en",
                            }}
                          />
                        </div>
                      </div>

                      {/* Age display */}
                      {dateOfBirth && (
                        <p className="text-xs text-gray-500">
                          {calculateAge(dateOfBirth)} years old
                        </p>
                      )}
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
                      <Label htmlFor="placeOfBirth">
                        Place of Birth <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="placeOfBirth"
                        className="w-full px-2 py-1 border rounded"
                        value={placeOfBirth}
                        onChange={e => setPlaceOfBirth(e.target.value)}
                        required
                      >
                        <option value="">Select place</option>
                        <option value="hospital">Hospital</option>
                        <option value="home">Home</option>
                        <option value="healthPost">Health Post</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="province">
                        Province <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        id="province"
                        options={provinceOptions}
                        value={province ? { value: province, label: province } : null}
                        onChange={option => {
                          setProvince(option?.value || "");
                          setDistrict("");
                          setMunicipality("");
                          setWard("");
                        }}
                        isSearchable
                        placeholder="Select province..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">
                        District <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        id="district"
                        options={districtOptions}
                        value={district ? { value: district, label: district } : null}
                        onChange={option => {
                          setDistrict(option?.value || "");
                          setMunicipality("");
                          setWard("");
                        }}
                        isSearchable
                        placeholder="Select district..."
                        isDisabled={!province}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="municipality">
                        Municipality/VDC <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        id="municipality"
                        options={municipalityOptions}
                        value={municipality ? { value: municipality, label: municipality } : null}
                        onChange={option => {
                          setMunicipality(option?.value || "");
                          setWard("");
                        }}
                        isSearchable
                        placeholder="Select municipality..."
                        isDisabled={!district}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ward">
                        Ward <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        id="ward"
                        options={wardOptions}
                        value={ward ? { value: ward, label: ward } : null}
                        onChange={option => setWard(option?.value || "")}
                        isSearchable={false}
                        placeholder="Select ward..."
                        isDisabled={!municipality}
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
                      <Label htmlFor="fatherFirstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="fatherLastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="fatherCitizenshipNo">
                        Citizenship Number{" "}
                        <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="motherFirstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="motherLastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="motherCitizenshipNo">
                        Citizenship Number{" "}
                        <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="permanentAddress">
                        Permanent Address{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="permanentAddress"
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">
                        Contact Number <span className="text-red-500">*</span>
                      </Label>
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
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (isResubmit ? "Re-Submitting..." : "Submitting...") : (isResubmit ? "Re-Submit" : "Submit Registration")}
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
