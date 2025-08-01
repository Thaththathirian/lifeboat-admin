import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  GraduationCap, 
  Receipt,
  UserCheck,
  AlertCircle,
  Info,
  Edit3,
  Image,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileType,
  MoreVertical,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Calendar,
  Phone,
  MapPin,
  Building,
  DollarSign,
  Gift,
  AlertTriangle,
  BookOpen,
  CreditCard,
  Hash,
  Briefcase,
  Users,
  Target,
  Mail,
  Activity
} from "lucide-react";
import { Student, StudentStatus } from "@/types/student";
import { getStatusText, getStatusColor, fetchStudentById, fetchStudentDocuments } from "@/utils/studentService";
import { useToast } from "@/hooks/use-toast";

// Student Profile API functions
interface PersonalDetails {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  mobile: string;
  email: string;
}

interface FamilyDetails {
  fatherName: string;
  fatherOccupationType: string;
  fatherOccupationDetails: string;
  motherName: string;
  motherOccupationType: string;
  motherOccupationDetails: string;
  parentsPhone: string;
  parentsPhoneLandline: string;
  familyDetails: string;
  familyAnnualIncome: string;
  numberOfSiblings: string;
  aspirations: string;
}

interface AcademicDetails {
  grade: string;
  presentSemester: string;
  academicYear: string;
  collegeName: string;
  collegeAddress: string;
  collegeWebsite: string;
  referencePersonName: string;
  referencePersonQualification: string;
  referencePersonPosition: string;
  totalCollegeFees: string;
  scholarshipAmountRequired: string;
  marks10th: string;
  marks12th: string;
  marksSem1: string;
  marksSem2: string;
  marksSem3: string;
  marksSem4: string;
  marksSem5: string;
  marksSem6: string;
  marksSem7: string;
  marksSem8: string;
  declaration: boolean;
  arrears: string;
  awareness: boolean;
  // Optional bank details for "other" college
  collegeBankName?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  ifscCode?: string;
}

interface Activity {
  id: string;
  type: 'student' | 'admin' | 'college';
  action: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  details?: Record<string, any>;
}

interface Document {
  id: string;
  name: string;
  type: 'personal' | 'academic' | 'receipt';
  status: 'verified' | 'rejected' | 'unverified';
  uploadedAt: string;
  fileSize: string;
  url?: string;
  fileType?: string;
}

// Add new interfaces for donation and transaction details
interface DonationDetails {
  totalDonatedAmount: number;
  donors: Array<{
    id: string;
    name: string;
    amount: number;
    transactionId: string;
    date: string;
  }>;
}

interface TransactionDetails {
  transactionId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  description: string;
}

interface MappingDetails {
  donorId: string;
  donorName: string;
  mappedAmount: number;
  mappedDate: string;
  status: 'active' | 'inactive';
}

// Mock document types for demonstration
const mockStudent: Student = {
  id: "29",
  name: "Ashok King",
  email: "ashok.king@example.com",
  mobile: "+91 9876543210",
  college: "N/A",
  status: StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP,
  statusText: "Eligible for Scholarship",
  appliedDate: "2024-01-15",
  scholarship: 50000,
  interviewCompleted: true,
  documentsVerified: false,
  statusBar: ["New User", "Personal Details Pending", "Personal Documents Pending", "Application Submitted", "Interview Scheduled", "Academic Documents Pending", "Academic Documents Submitted", "Eligible for Scholarship"],
  collegeFee: 75000,
  lastAllottedAmount: 25000
};

// Mock detailed student information
const mockPersonalDetails: PersonalDetails = {
  firstName: "Ashok",
  lastName: "King",
  gender: "Male",
  dob: "1998-05-15",
  street: "123 Main Street",
  city: "Chennai",
  state: "Tamil Nadu",
  pinCode: "600001",
  mobile: "+91 9876543210",
  email: "ashok.king@example.com"
};

const mockFamilyDetails: FamilyDetails = {
  fatherName: "Rajesh King",
  fatherOccupationType: "Private Sector",
  fatherOccupationDetails: "Software Engineer",
  motherName: "Priya King",
  motherOccupationType: "Homemaker",
  motherOccupationDetails: "Housewife",
  parentsPhone: "+91 9876543211",
  parentsPhoneLandline: "044-12345678",
  familyDetails: "Middle class family with 2 children",
  familyAnnualIncome: "₹8,00,000",
  numberOfSiblings: "1",
  aspirations: "To become a successful software engineer and help underprivileged students"
};

const mockAcademicDetails: AcademicDetails = {
  grade: "B.Tech",
  presentSemester: "6th Semester",
  academicYear: "2023-2024",
  collegeName: "Anna University",
  collegeAddress: "Sardar Patel Road, Guindy, Chennai - 600025",
  collegeWebsite: "www.annauniv.edu",
  referencePersonName: "Dr. S. Kumar",
  referencePersonQualification: "Ph.D. in Computer Science",
  referencePersonPosition: "Associate Professor",
  totalCollegeFees: "₹1,50,000",
  scholarshipAmountRequired: "₹50,000",
  marks10th: "92%",
  marks12th: "88%",
  marksSem1: "85%",
  marksSem2: "87%",
  marksSem3: "89%",
  marksSem4: "91%",
  marksSem5: "88%",
  marksSem6: "90%",
  marksSem7: "",
  marksSem8: "",
  declaration: true,
  arrears: "0",
  awareness: true,
  collegeBankName: "State Bank of India",
  accountNumber: "1234567890",
  confirmAccountNumber: "1234567890",
  ifscCode: "SBIN0001234"
};

const mockDocuments: Document[] = [
  // Personal Documents
  { id: "1", name: "Aadhar Card", type: "personal", status: "verified", uploadedAt: "2024-01-15", fileSize: "2.1 MB", fileType: "image/jpeg" },
  { id: "2", name: "PAN Card", type: "personal", status: "verified", uploadedAt: "2024-01-15", fileSize: "1.8 MB", fileType: "image/jpeg" },
  { id: "3", name: "Income Certificate", type: "personal", status: "unverified", uploadedAt: "2024-01-16", fileSize: "3.2 MB", fileType: "application/pdf" },
  { id: "4", name: "Caste Certificate", type: "personal", status: "rejected", uploadedAt: "2024-01-17", fileSize: "2.5 MB", fileType: "application/pdf" },
  
  // Academic Documents
  { id: "5", name: "10th Mark Sheet", type: "academic", status: "verified", uploadedAt: "2024-01-18", fileSize: "1.9 MB", fileType: "application/pdf" },
  { id: "6", name: "12th Mark Sheet", type: "academic", status: "verified", uploadedAt: "2024-01-18", fileSize: "2.3 MB", fileType: "application/pdf" },
  { id: "7", name: "Transfer Certificate", type: "academic", status: "unverified", uploadedAt: "2024-01-19", fileSize: "1.7 MB", fileType: "application/pdf" },
  { id: "8", name: "Character Certificate", type: "academic", status: "unverified", uploadedAt: "2024-01-19", fileSize: "1.5 MB", fileType: "application/pdf" },
  
  // Receipt Documents
  { id: "9", name: "College Fee Receipt", type: "receipt", status: "verified", uploadedAt: "2024-01-20", fileSize: "2.8 MB", fileType: "image/jpeg" },
  { id: "10", name: "Hostel Fee Receipt", type: "receipt", status: "unverified", uploadedAt: "2024-01-21", fileSize: "2.1 MB", fileType: "image/jpeg" },
  { id: "11", name: "Transport Fee Receipt", type: "receipt", status: "rejected", uploadedAt: "2024-01-22", fileSize: "1.9 MB", fileType: "image/jpeg" }
];

const mockDonationDetails: DonationDetails = {
  totalDonatedAmount: 75000,
  donors: [
    {
      id: "DON001",
      name: "TechCorp Foundation",
      amount: 50000,
      transactionId: "TXN2024001",
      date: "2024-01-15"
    },
    {
      id: "DON002", 
      name: "Education Trust",
      amount: 25000,
      transactionId: "TXN2024002",
      date: "2024-01-20"
    }
  ]
};

const mockTransactionDetails: TransactionDetails[] = [
  {
    transactionId: "TXN2024001",
    amount: 50000,
    date: "2024-01-15",
    status: "completed",
    paymentMethod: "Bank Transfer",
    description: "Scholarship payment for Ashok King"
  },
  {
    transactionId: "TXN2024002",
    amount: 25000,
    date: "2024-01-20",
    status: "completed", 
    paymentMethod: "Online Payment",
    description: "Additional scholarship support"
  }
];

const mockMappingDetails: MappingDetails[] = [
  {
    donorId: "DON001",
    donorName: "TechCorp Foundation",
    mappedAmount: 50000,
    mappedDate: "2024-01-15",
    status: "active"
  },
  {
    donorId: "DON002",
    donorName: "Education Trust", 
    mappedAmount: 25000,
    mappedDate: "2024-01-20",
    status: "active"
  }
];

        // Mock activities data
        const mockActivities: Activity[] = [
          {
            id: "1",
            type: "student",
            action: "Application Submitted",
            description: "Student submitted initial scholarship application",
            timestamp: "2024-01-10T09:15:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "2",
            type: "admin",
            action: "Status Changed",
            description: "Admin changed status from NEW_USER to PERSONAL_DETAILS_PENDING",
            timestamp: "2024-01-10T11:30:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "3",
            type: "student",
            action: "Personal Details Updated",
            description: "Student completed personal information form",
            timestamp: "2024-01-12T14:20:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "4",
            type: "student",
            action: "Documents Uploaded",
            description: "Student uploaded 4 personal documents (Aadhar, PAN, Income Certificate, Caste Certificate)",
            timestamp: "2024-01-13T16:45:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "5",
            type: "admin",
            action: "Document Verification",
            description: "Admin verified Aadhar Card and PAN Card documents",
            timestamp: "2024-01-14T10:15:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "6",
            type: "admin",
            action: "Document Rejected",
            description: "Admin rejected Caste Certificate - requires updated format",
            timestamp: "2024-01-14T10:20:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "7",
            type: "admin",
            action: "Interview Scheduled",
            description: "Admin scheduled interview for 2024-01-18 at 2:00 PM",
            timestamp: "2024-01-15T09:30:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "8",
            type: "student",
            action: "Interview Completed",
            description: "Student completed interview successfully",
            timestamp: "2024-01-18T15:45:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "9",
            type: "admin",
            action: "Status Updated",
            description: "Admin changed status to ELIGIBLE_FOR_SCHOLARSHIP",
            timestamp: "2024-01-18T16:00:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "10",
            type: "student",
            action: "Academic Documents Uploaded",
            description: "Student uploaded 4 academic documents (Marksheets, College ID, Fee Structure)",
            timestamp: "2024-01-19T11:20:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "11",
            type: "college",
            action: "Academic Documents Verified",
            description: "College verified all academic documents",
            timestamp: "2024-01-20T13:15:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "12",
            type: "student",
            action: "Payment Made",
            description: "Student made scholarship payment of ₹50,000",
            timestamp: "2024-01-21T14:30:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "13",
            type: "college",
            action: "Payment Receipt Verified",
            description: "College verified payment receipt and updated status",
            timestamp: "2024-01-22T09:00:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "14",
            type: "student",
            action: "Receipt Documents Uploaded",
            description: "Student uploaded 3 receipt documents (Tuition Fee, Hostel Fee, Transport Fee)",
            timestamp: "2024-01-23T12:45:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "15",
            type: "admin",
            action: "Final Review",
            description: "Admin completed final review of all documents and application",
            timestamp: "2024-01-24T16:20:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "16",
            type: "student",
            action: "Profile Updated",
            description: "Student updated contact information and address",
            timestamp: "2024-01-25T10:30:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "17",
            type: "admin",
            action: "Document Request",
            description: "Admin requested additional income proof documents",
            timestamp: "2024-01-26T14:15:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "18",
            type: "student",
            action: "Additional Documents Uploaded",
            description: "Student uploaded requested income proof documents",
            timestamp: "2024-01-27T16:45:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "19",
            type: "college",
            action: "Receipt Verification",
            description: "College verified tuition fee receipt and updated payment status",
            timestamp: "2024-01-28T11:30:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "20",
            type: "admin",
            action: "Scholarship Approved",
            description: "Admin approved final scholarship amount of ₹75,000",
            timestamp: "2024-01-29T15:45:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "21",
            type: "student",
            action: "Payment Confirmation",
            description: "Student confirmed receipt of scholarship payment via SMS",
            timestamp: "2024-01-30T09:15:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "22",
            type: "college",
            action: "Academic Progress Update",
            description: "College updated student's semester 5 marks (85%)",
            timestamp: "2024-02-05T14:30:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "23",
            type: "admin",
            action: "Follow-up Scheduled",
            description: "Admin scheduled 3-month follow-up call for progress review",
            timestamp: "2024-02-10T11:00:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "24",
            type: "student",
            action: "Feedback Submitted",
            description: "Student submitted scholarship program feedback and suggestions",
            timestamp: "2024-02-15T16:45:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "25",
            type: "admin",
            action: "Mentorship Assigned",
            description: "Admin assigned mentor (Dr. Priya Sharma) for academic guidance",
            timestamp: "2024-02-20T13:20:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "26",
            type: "college",
            action: "Attendance Update",
            description: "College reported 95% attendance for current semester",
            timestamp: "2024-02-25T10:15:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "27",
            type: "student",
            action: "Workshop Attended",
            description: "Student attended career development workshop organized by foundation",
            timestamp: "2024-03-01T15:30:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "28",
            type: "admin",
            action: "Performance Review",
            description: "Admin completed quarterly performance review - Excellent progress",
            timestamp: "2024-03-05T16:00:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "29",
            type: "college",
            action: "Project Submission",
            description: "College submitted student's final year project proposal",
            timestamp: "2024-03-10T12:45:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "30",
            type: "student",
            action: "Internship Application",
            description: "Student applied for summer internship through foundation network",
            timestamp: "2024-03-15T14:20:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "31",
            type: "admin",
            action: "Recommendation Letter",
            description: "Admin provided recommendation letter for internship application",
            timestamp: "2024-03-18T11:30:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "32",
            type: "college",
            action: "Semester Results",
            description: "College uploaded semester 6 results (88% - Distinction)",
            timestamp: "2024-03-25T09:45:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "33",
            type: "student",
            action: "Alumni Network",
            description: "Student joined foundation's alumni network and mentorship program",
            timestamp: "2024-04-01T13:15:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "34",
            type: "admin",
            action: "Success Story",
            description: "Admin featured student's success story in foundation newsletter",
            timestamp: "2024-04-05T15:20:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "35",
            type: "college",
            action: "Placement Update",
            description: "College reported student's placement offer from TechCorp (₹8.5 LPA)",
            timestamp: "2024-04-10T10:30:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "36",
            type: "student",
            action: "Gratitude Message",
            description: "Student sent thank you message to foundation and donors",
            timestamp: "2024-04-15T16:00:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "37",
            type: "admin",
            action: "Graduation Ceremony",
            description: "Admin invited student to attend foundation's annual graduation ceremony",
            timestamp: "2024-04-20T14:45:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "38",
            type: "college",
            action: "Final Transcript",
            description: "College uploaded final degree transcript and completion certificate",
            timestamp: "2024-04-25T11:20:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "39",
            type: "student",
            action: "Job Confirmation",
            description: "Student confirmed joining TechCorp as Software Engineer",
            timestamp: "2024-05-01T09:30:00Z",
            userId: "29",
            userName: "Ashok King"
          },
          {
            id: "40",
            type: "admin",
            action: "Case Study",
            description: "Admin documented student's journey as success case study",
            timestamp: "2024-05-05T16:15:00Z",
            userId: "admin1",
            userName: "Admin User"
          }
        ];

export default function StudentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<StudentStatus>(StudentStatus.NEW_USER);
  const [documentModal, setDocumentModal] = useState<Document | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
      const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'verified' | 'rejected' | 'unverified'>('verified');
  const [statusChangeAnimation, setStatusChangeAnimation] = useState<{
    isAnimating: boolean;
    newStatus: StudentStatus | null;
    timestamp: number;
  }>({ isAnimating: false, newStatus: null, timestamp: 0 });

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(null);
  const [familyDetails, setFamilyDetails] = useState<FamilyDetails | null>(null);
  const [academicDetails, setAcademicDetails] = useState<AcademicDetails | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [donationDetails] = useState<DonationDetails>(mockDonationDetails);
  const [transactionDetails] = useState<TransactionDetails[]>(mockTransactionDetails);
  const [mappingDetails] = useState<MappingDetails[]>(mockMappingDetails);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        
        // Fetch student details
        const studentData = await fetchStudentById(studentId);
        if (studentData) {
          setStudent(studentData);
        }
        
        // Fetch student documents
        const documentsData = await fetchStudentDocuments(studentId);
        if (documentsData && documentsData.length > 0) {
          setDocuments(documentsData);
        } else {
          // Fallback to mock documents if API doesn't return data
          setDocuments(mockDocuments);
        }
        
        // TODO: Fetch detailed student information from API
        // For now, using mock data
        setPersonalDetails(mockPersonalDetails);
        setFamilyDetails(mockFamilyDetails);
        setAcademicDetails(mockAcademicDetails);
        
        // TODO: Fetch student activities from API
        // For now, using mock data
        setActivities(mockActivities);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading student data:', error);
        // Fallback to mock data for development
        setStudent(mockStudent);
        setDocuments(mockDocuments);
        setPersonalDetails(mockPersonalDetails);
        setFamilyDetails(mockFamilyDetails);
        setAcademicDetails(mockAcademicDetails);
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [studentId]);

  const handleStatusChange = async (newStatus: StudentStatus) => {
    if (!student) return;
    
    try {
      // Start animation
      setStatusChangeAnimation({
        isAnimating: true,
        newStatus,
        timestamp: Date.now()
      });
      
      // TODO: Implement API call to update student status
      console.log('Updating status to:', newStatus);
      
      // Update the local state
      setStudent(prev => prev ? { ...prev, status: newStatus } : null);
      
      // Show success toast
      toast({
        title: "Status Updated Successfully!",
        description: `Student status changed to ${getStatusText(newStatus)}`,
        duration: 3000,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      // Stop animation after 2 seconds
      setTimeout(() => {
        setStatusChangeAnimation({
          isAnimating: false,
          newStatus: null,
          timestamp: 0
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error updating student status:', error);
      // Stop animation on error
      setStatusChangeAnimation({
        isAnimating: false,
        newStatus: null,
        timestamp: 0
      });
    }
  };

  const handleDocumentStatusChange = async (documentId: string, newStatus: 'verified' | 'rejected' | 'unverified') => {
    try {
      // TODO: Implement API call to update document status
      console.log('Updating document status:', documentId, newStatus);
      
      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? { ...doc, status: newStatus } : doc
      ));
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const handleBulkStatusChange = async () => {
    try {
      // TODO: Implement API call to update multiple document statuses
      console.log('Updating bulk document statuses:', Array.from(selectedDocuments), bulkStatus);
      
      // Update local state
      setDocuments(prev => prev.map(doc => 
        selectedDocuments.has(doc.id) ? { ...doc, status: bulkStatus } : doc
      ));
      
      // Clear selections and close modal
      setSelectedDocuments(new Set());
      setBulkStatusModal(false);
    } catch (error) {
      console.error('Error updating bulk document statuses:', error);
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(documentId)) {
      newSelection.delete(documentId);
    } else {
      newSelection.add(documentId);
    }
    setSelectedDocuments(newSelection);
  };

  const selectAllDocuments = (type: 'personal' | 'academic' | 'receipt') => {
    const documentsOfType = filterDocuments(type);
    const allIds = documentsOfType.map(doc => doc.id);
    setSelectedDocuments(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedDocuments(new Set());
  };

  const getStatusIcon = (status: 'verified' | 'rejected' | 'unverified') => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'unverified':
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusBadgeColor = (status: 'verified' | 'rejected' | 'unverified') => {
    switch (status) {
      case 'verified':
        return 'bg-green-200 text-green-900 border-green-300 shadow-sm';
      case 'rejected':
        return 'bg-red-200 text-red-900 border-red-400 shadow-sm';
      case 'unverified':
        return 'bg-orange-200 text-orange-900 border-orange-300 shadow-sm';
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-8 w-8 text-gray-400" />;
    
    if (fileType.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-8 w-8 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="h-8 w-8 text-green-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="h-8 w-8 text-orange-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileType className="h-8 w-8 text-blue-600" />;
    
    return <File className="h-8 w-8 text-gray-400" />;
  };

  const filterDocuments = (type: 'personal' | 'academic' | 'receipt') => {
    const filtered = documents.filter(doc => doc.type === type);
    
    // Sort documents: unverified first, then verified, then rejected
    return filtered.sort((a, b) => {
      const statusOrder = { 'unverified': 0, 'verified': 1, 'rejected': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatActivityTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActivityIcon = (type: 'student' | 'admin' | 'college') => {
    switch (type) {
      case 'student':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'admin':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'college':
        return <GraduationCap className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (type: 'student' | 'admin' | 'college') => {
    switch (type) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-green-100 text-green-800';
      case 'college':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 space-y-4">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-200 pb-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/students')}>
              <ChevronLeft className="h-4 w-4 " />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600">Student ID: {student.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Activities Button */}
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-sm"
              onClick={() => {
                // Scroll to top before navigating
                window.scrollTo(0, 0);
                navigate(`/admin/students/${student.id}/activities`);
              }}
            >
              <Activity className="h-4 w-4 text-blue-600" />
              Activities
            </Button>

            {/* Quick Navigation Links */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  const element = document.getElementById('documents-section');
                  if (element) {
                    const headerHeight = 140; // Account for main header + sticky header
                    const elementPosition = element.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                  }
                }}
              >
                <FileText className="h-3 w-3 mr-1" />
                Documents
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  const element = document.getElementById('transactions-section');
                  if (element) {
                    const headerHeight = 140; // Account for main header + sticky header
                    const elementPosition = element.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                  }
                }}
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Transactions
              </Button>
            </div>

            {/* Modern Status Badge with Edit Functionality */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`flex items-center gap-2 cursor-pointer transition-all duration-500 shadow-sm ${
                    statusChangeAnimation.isAnimating && statusChangeAnimation.newStatus === student.status
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 scale-105 shadow-lg animate-pulse'
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100'
                  }`}
                >
                  <Badge className={`${getStatusColor(student.status)} shadow-sm border transition-all duration-300 ${
                    statusChangeAnimation.isAnimating && statusChangeAnimation.newStatus === student.status
                      ? 'animate-bounce bg-yellow-200 text-yellow-900 border-yellow-400'
                      : ''
                  }`}>
                    {getStatusText(student.status)}
                    {statusChangeAnimation.isAnimating && statusChangeAnimation.newStatus === student.status && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </Badge>
                  <Edit3 className={`h-4 w-4 transition-colors duration-300 ${
                    statusChangeAnimation.isAnimating && statusChangeAnimation.newStatus === student.status
                      ? 'text-yellow-600 animate-spin'
                      : 'text-green-600'
                  }`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96">
                <div className="grid grid-cols-2 gap-1 p-1">
                  {Object.values(StudentStatus)
                    .filter(status => typeof status === 'number')
                    .map(status => (
                      <DropdownMenuItem 
                        key={status} 
                        onClick={() => handleStatusChange(status)}
                        className={`flex items-center gap-2 p-2 transition-all duration-200 ${
                          student.status === status 
                            ? 'bg-green-50 border border-green-200 rounded-md' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Badge className={`${getStatusColor(status)} ${
                          student.status === status ? 'ring-2 ring-green-300' : ''
                        }`}>
                          {getStatusText(status)}
                          {student.status === status && (
                            <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                          )}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="space-y-4">
        {/* Personal Details Section */}
        <div className="space-y-3">
          {/* Personal Details */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="border-b border-gray-100 pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {personalDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-md border border-blue-100">
                  <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-blue-600 font-medium">Full Name</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{personalDetails.firstName} {personalDetails.lastName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-md border border-purple-100">
                  <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-purple-600 font-medium">Date of Birth</div>
                    <div className="text-sm font-semibold text-gray-900">{new Date(personalDetails.dob).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50/50 rounded-md border border-green-100">
                  <Mail className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-green-600 font-medium">Email</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{personalDetails.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-orange-50/50 rounded-md border border-orange-100">
                  <Phone className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-orange-600 font-medium">Mobile</div>
                    <div className="text-sm font-semibold text-gray-900">{personalDetails.mobile}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-md border border-indigo-100">
                  <MapPin className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-indigo-600 font-medium">Address</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{personalDetails.street}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-teal-50/50 rounded-md border border-teal-100">
                  <Building className="h-4 w-4 text-teal-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-teal-600 font-medium">Location</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{personalDetails.city}, {personalDetails.state}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Personal details not available</p>
              </div>
            )}
          </CardContent>
        </Card>

         {/* Family Details */}
         <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50">
           <CardHeader className="border-b border-gray-100 pb-2">
             <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
               <User className="h-5 w-5 text-green-600" />
               Family Details
             </CardTitle>
           </CardHeader>
           <CardContent className="pt-3">
             {familyDetails ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                 <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-md border border-blue-100">
                   <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs text-blue-600 font-medium">Father's Name</div>
                     <div className="text-sm font-semibold text-gray-900 truncate">{familyDetails.fatherName}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-green-50/50 rounded-md border border-green-100">
                   <Briefcase className="h-4 w-4 text-green-600 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs text-green-600 font-medium">Father's Occupation</div>
                     <div className="text-sm font-semibold text-gray-900 truncate">{familyDetails.fatherOccupationType}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-md border border-purple-100">
                   <User className="h-4 w-4 text-purple-600 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs text-purple-600 font-medium">Mother's Name</div>
                     <div className="text-sm font-semibold text-gray-900 truncate">{familyDetails.motherName}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-orange-50/50 rounded-md border border-orange-100">
                   <Briefcase className="h-4 w-4 text-orange-600 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs text-orange-600 font-medium">Mother's Occupation</div>
                     <div className="text-sm font-semibold text-gray-900 truncate">{familyDetails.motherOccupationType}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-md border border-indigo-100">
                   <Phone className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs text-indigo-600 font-medium">Parents Phone</div>
                     <div className="text-sm font-semibold text-gray-900">{familyDetails.parentsPhone}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-teal-50/50 rounded-md border border-teal-100">
                   <DollarSign className="h-4 w-4 text-teal-600 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs text-teal-600 font-medium">Family Income</div>
                     <div className="text-sm font-semibold text-gray-900 truncate">{familyDetails.familyAnnualIncome}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-pink-50/50 rounded-md border border-pink-100">
                   <Users className="h-4 w-4 text-pink-600 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs text-pink-600 font-medium">Siblings</div>
                     <div className="text-sm font-semibold text-gray-900">{familyDetails.numberOfSiblings}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-yellow-50/50 rounded-md border border-yellow-100">
                   <Target className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs text-yellow-600 font-medium">Aspirations</div>
                     <div className="text-sm font-semibold text-gray-900 truncate">{familyDetails.aspirations}</div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-center text-gray-500">Family details not available</div>
             )}
           </CardContent>
         </Card>

         {/* Academic Details */}
         <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50">
           <CardHeader className="border-b border-gray-100 pb-2">
             <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
               <GraduationCap className="h-5 w-5 text-purple-600" />
               Academic Details
             </CardTitle>
           </CardHeader>
           <CardContent className="pt-3">
             {academicDetails ? (
               <div className="space-y-3">
                 {/* Basic Academic Info */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                   <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-md border border-blue-100">
                     <GraduationCap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs text-blue-600 font-medium">Grade</div>
                       <div className="text-sm font-semibold text-gray-900">{academicDetails.grade}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-green-50/50 rounded-md border border-green-100">
                     <BookOpen className="h-4 w-4 text-green-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs text-green-600 font-medium">Semester</div>
                       <div className="text-sm font-semibold text-gray-900">{academicDetails.presentSemester}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-md border border-purple-100">
                     <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs text-purple-600 font-medium">Academic Year</div>
                       <div className="text-sm font-semibold text-gray-900">{academicDetails.academicYear}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-orange-50/50 rounded-md border border-orange-100">
                     <Building className="h-4 w-4 text-orange-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs text-orange-600 font-medium">College Name</div>
                       <div className="text-sm font-semibold text-gray-900 truncate">{academicDetails.collegeName}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-md border border-indigo-100">
                     <DollarSign className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs text-indigo-600 font-medium">Total Fees</div>
                       <div className="text-sm font-semibold text-gray-900">₹{academicDetails.totalCollegeFees}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-teal-50/50 rounded-md border border-teal-100">
                     <Gift className="h-4 w-4 text-teal-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs text-teal-600 font-medium">Scholarship Required</div>
                       <div className="text-sm font-semibold text-gray-900">₹{academicDetails.scholarshipAmountRequired}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-pink-50/50 rounded-md border border-pink-100">
                     <AlertTriangle className="h-4 w-4 text-pink-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs text-pink-600 font-medium">Arrears</div>
                       <div className="text-sm font-semibold text-gray-900">{academicDetails.arrears}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-yellow-50/50 rounded-md border border-yellow-100">
                     <CheckCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs text-yellow-600 font-medium">Declaration</div>
                       <div className="text-sm font-semibold text-gray-900">{academicDetails.declaration ? 'Yes' : 'No'}</div>
                     </div>
                   </div>
                 </div>

                 {/* Marks Section */}
                 <div>
                   <h4 className="font-semibold text-gray-700 mb-2 text-sm">Academic Performance</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-[400px] overflow-y-auto">
                     <div className="text-center p-2 bg-blue-50 rounded-lg">
                       <div className="text-xs font-medium text-gray-600">10th</div>
                       <div className="text-sm font-bold text-blue-600">{academicDetails.marks10th}%</div>
                     </div>
                     <div className="text-center p-2 bg-green-50 rounded-lg">
                       <div className="text-xs font-medium text-gray-600">12th</div>
                       <div className="text-sm font-bold text-green-600">{academicDetails.marks12th}%</div>
                     </div>
                     <div className="text-center p-2 bg-purple-50 rounded-lg">
                       <div className="text-xs font-medium text-gray-600">Sem 1</div>
                       <div className="text-sm font-bold text-purple-600">{academicDetails.marksSem1}%</div>
                     </div>
                     <div className="text-center p-2 bg-orange-50 rounded-lg">
                       <div className="text-xs font-medium text-gray-600">Sem 2</div>
                       <div className="text-sm font-bold text-orange-600">{academicDetails.marksSem2}%</div>
                     </div>
                   </div>
                 </div>

                 {/* Bank Details if available */}
                 {academicDetails.collegeBankName && (
                   <div>
                     <h4 className="font-semibold text-gray-700 mb-3 text-sm">Bank Details</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-3">
                         <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                           <Building className="h-4 w-4 text-blue-600" />
                           <div className="flex-1">
                             <div className="text-xs text-blue-600 font-medium">Bank Name</div>
                             <div className="text-sm font-semibold text-gray-900">{academicDetails.collegeBankName}</div>
                           </div>
                         </div>
                         <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                           <CreditCard className="h-4 w-4 text-green-600" />
                           <div className="flex-1">
                             <div className="text-xs text-green-600 font-medium">Account Number</div>
                             <div className="text-sm font-semibold text-gray-900">{academicDetails.accountNumber}</div>
                           </div>
                         </div>
                       </div>
                       <div className="space-y-3">
                         <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                           <Hash className="h-4 w-4 text-purple-600" />
                           <div className="flex-1">
                             <div className="text-xs text-purple-600 font-medium">IFSC Code</div>
                             <div className="text-sm font-semibold text-gray-900">{academicDetails.ifscCode}</div>
                           </div>
                         </div>
                         <div className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                           <Info className="h-4 w-4 text-orange-600" />
                           <div className="flex-1">
                             <div className="text-xs text-orange-600 font-medium">Awareness</div>
                             <div className="text-sm font-semibold text-gray-900">{academicDetails.awareness ? 'Yes' : 'No'}</div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Additional Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-700">Scholarship Amount:</span>
                       <span className="text-gray-900">₹{student.scholarship.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-700">College Fee:</span>
                       <span className="text-gray-900">₹{student.collegeFee?.toLocaleString() || 'N/A'}</span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-700">Last Allotted:</span>
                       <span className="text-gray-900">₹{student.lastAllottedAmount?.toLocaleString() || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-700">Applied Date:</span>
                       <span className="text-gray-900">{student.appliedDate}</span>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-center text-gray-500">Academic details not available</div>
             )}
           </CardContent>
         </Card>
        </div>

        {/* Documents Section */}
        <div className="space-y-4" id="documents-section">
          {/* Documents Section */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-gray-800 text-lg">
                Documents & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-600">Document management and verification status</span>
              </div>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="personal" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                    <User className="h-3 w-3" />
                    Personal ({filterDocuments('personal').length})
                  </TabsTrigger>
                  <TabsTrigger value="academic" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                    <GraduationCap className="h-3 w-3" />
                    Academic ({filterDocuments('academic').length})
                  </TabsTrigger>
                  <TabsTrigger value="receipt" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
                    <Receipt className="h-3 w-3" />
                    Receipt ({filterDocuments('receipt').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-3">
                  {/* Bulk Actions Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllDocuments('personal')}
                        className="text-xs h-7 px-2"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="text-xs h-7 px-2"
                      >
                        Clear
                      </Button>
                      {selectedDocuments.size > 0 && (
                        <span className="text-xs text-gray-600">
                          {selectedDocuments.size} selected
                        </span>
                      )}
                    </div>
                    {selectedDocuments.size > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkStatusModal(true)}
                        className="text-xs h-7 px-2"
                      >
                        Update Status ({selectedDocuments.size})
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-[400px] overflow-y-auto">
                    {filterDocuments('personal').map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`relative aspect-[4/3] rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer group overflow-hidden bg-white ${
                          doc.status === 'rejected' ? 'border-red-300 bg-red-50' : 
                          doc.status === 'unverified' ? 'border-orange-300 bg-orange-50' : 
                          'hover:border-blue-300'
                        } ${selectedDocuments.has(doc.id) ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setDocumentModal(doc)}
                      >
                        {/* Selection Checkbox - Top Right */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDocumentSelection(doc.id);
                          }}
                        >
                          {selectedDocuments.has(doc.id) ? (
                            <CheckSquare className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Square className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>

                        {/* Document Thumbnail/Preview - Google Drive Style */}
                        <div className="w-full h-3/4 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                          {doc.fileType?.startsWith('image/') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-8 w-8 text-gray-400" />
                              <span className="text-xs text-gray-500 ml-1">Image</span>
                            </div>
                          ) : doc.fileType?.startsWith('video/') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileVideo className="h-8 w-8 text-gray-400" />
                              <span className="text-xs text-gray-500 ml-1">Video</span>
                            </div>
                          ) : doc.fileType?.includes('pdf') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-red-500" />
                            </div>
                          ) : doc.fileType?.includes('spreadsheet') || doc.fileType?.includes('excel') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileSpreadsheet className="h-8 w-8 text-green-600" />
                            </div>
                          ) : doc.fileType?.includes('word') || doc.fileType?.includes('document') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <File className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* File Name and Type Indicator - Bottom Section */}
                        <div className="p-2 bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            {/* File Type Indicator Icon */}
                            <div className="flex-shrink-0">
                              {doc.fileType?.includes('pdf') ? (
                                <FileText className="h-3 w-3 text-red-500" />
                              ) : doc.fileType?.includes('spreadsheet') || doc.fileType?.includes('excel') ? (
                                <FileSpreadsheet className="h-3 w-3 text-green-600" />
                              ) : doc.fileType?.includes('word') || doc.fileType?.includes('document') ? (
                                <FileText className="h-3 w-3 text-blue-600" />
                              ) : doc.fileType?.startsWith('image/') ? (
                                <Image className="h-3 w-3 text-red-500" />
                              ) : doc.fileType?.startsWith('video/') ? (
                                <FileVideo className="h-3 w-3 text-red-500" />
                              ) : (
                                <File className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            
                            {/* File Name */}
                            <h4 className="font-medium text-xs text-gray-900 truncate flex-1">{doc.name}</h4>
                          </div>
                          
                          {/* File Size and Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                            <Badge className={`${getStatusBadgeColor(doc.status)} text-xs px-2 py-0.5`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons - Hover Only */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocumentModal(doc);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Download:', doc.name);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="mt-3">
                  {/* Bulk Actions Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllDocuments('academic')}
                        className="text-xs h-7 px-2"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="text-xs h-7 px-2"
                      >
                        Clear
                      </Button>
                      {selectedDocuments.size > 0 && (
                        <span className="text-xs text-gray-600">
                          {selectedDocuments.size} selected
                        </span>
                      )}
                    </div>
                    {selectedDocuments.size > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkStatusModal(true)}
                        className="text-xs h-7 px-2"
                      >
                        Update Status ({selectedDocuments.size})
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-[400px] overflow-y-auto">
                    {filterDocuments('academic').map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`relative aspect-[4/3] rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer group overflow-hidden bg-white ${
                          doc.status === 'rejected' ? 'border-red-300 bg-red-50' : 
                          doc.status === 'unverified' ? 'border-orange-300 bg-orange-50' : 
                          'hover:border-blue-300'
                        } ${selectedDocuments.has(doc.id) ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setDocumentModal(doc)}
                      >
                        {/* Selection Checkbox - Top Right */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDocumentSelection(doc.id);
                          }}
                        >
                          {selectedDocuments.has(doc.id) ? (
                            <CheckSquare className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Square className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>

                        {/* Document Thumbnail/Preview - Google Drive Style */}
                        <div className="w-full h-3/4 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                          {doc.fileType?.startsWith('image/') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-8 w-8 text-gray-400" />
                              <span className="text-xs text-gray-500 ml-1">Image</span>
                            </div>
                          ) : doc.fileType?.startsWith('video/') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileVideo className="h-8 w-8 text-gray-400" />
                              <span className="text-xs text-gray-500 ml-1">Video</span>
                            </div>
                          ) : doc.fileType?.includes('pdf') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-red-500" />
                            </div>
                          ) : doc.fileType?.includes('spreadsheet') || doc.fileType?.includes('excel') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileSpreadsheet className="h-8 w-8 text-green-600" />
                            </div>
                          ) : doc.fileType?.includes('word') || doc.fileType?.includes('document') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <File className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* File Name and Type Indicator - Bottom Section */}
                        <div className="p-2 bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            {/* File Type Indicator Icon */}
                            <div className="flex-shrink-0">
                              {doc.fileType?.includes('pdf') ? (
                                <FileText className="h-3 w-3 text-red-500" />
                              ) : doc.fileType?.includes('spreadsheet') || doc.fileType?.includes('excel') ? (
                                <FileSpreadsheet className="h-3 w-3 text-green-600" />
                              ) : doc.fileType?.includes('word') || doc.fileType?.includes('document') ? (
                                <FileText className="h-3 w-3 text-blue-600" />
                              ) : doc.fileType?.startsWith('image/') ? (
                                <Image className="h-3 w-3 text-red-500" />
                              ) : doc.fileType?.startsWith('video/') ? (
                                <FileVideo className="h-3 w-3 text-red-500" />
                              ) : (
                                <File className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            
                            {/* File Name */}
                            <h4 className="font-medium text-xs text-gray-900 truncate flex-1">{doc.name}</h4>
                          </div>
                          
                          {/* File Size and Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                            <Badge className={`${getStatusBadgeColor(doc.status)} text-xs px-2 py-0.5`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons - Hover Only */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocumentModal(doc);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Download:', doc.name);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="receipt" className="mt-3">
                  {/* Bulk Actions Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllDocuments('receipt')}
                        className="text-xs h-7 px-2"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="text-xs h-7 px-2"
                      >
                        Clear
                      </Button>
                      {selectedDocuments.size > 0 && (
                        <span className="text-xs text-gray-600">
                          {selectedDocuments.size} selected
                        </span>
                      )}
                    </div>
                    {selectedDocuments.size > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkStatusModal(true)}
                        className="text-xs h-7 px-2"
                      >
                        Update Status ({selectedDocuments.size})
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-[400px] overflow-y-auto">
                    {filterDocuments('receipt').map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`relative aspect-[4/3] rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer group overflow-hidden bg-white ${
                          doc.status === 'rejected' ? 'border-red-300 bg-red-50' : 
                          doc.status === 'unverified' ? 'border-orange-300 bg-orange-50' : 
                          'hover:border-blue-300'
                        } ${selectedDocuments.has(doc.id) ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setDocumentModal(doc)}
                      >
                        {/* Selection Checkbox - Top Right */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDocumentSelection(doc.id);
                          }}
                        >
                          {selectedDocuments.has(doc.id) ? (
                            <CheckSquare className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Square className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>

                        {/* Document Thumbnail/Preview - Google Drive Style */}
                        <div className="w-full h-3/4 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                          {doc.fileType?.startsWith('image/') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-8 w-8 text-gray-400" />
                              <span className="text-xs text-gray-500 ml-1">Image</span>
                            </div>
                          ) : doc.fileType?.startsWith('video/') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileVideo className="h-8 w-8 text-gray-400" />
                              <span className="text-xs text-gray-500 ml-1">Video</span>
                            </div>
                          ) : doc.fileType?.includes('pdf') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-red-500" />
                            </div>
                          ) : doc.fileType?.includes('spreadsheet') || doc.fileType?.includes('excel') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileSpreadsheet className="h-8 w-8 text-green-600" />
                            </div>
                          ) : doc.fileType?.includes('word') || doc.fileType?.includes('document') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <File className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* File Name and Type Indicator - Bottom Section */}
                        <div className="p-2 bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            {/* File Type Indicator Icon */}
                            <div className="flex-shrink-0">
                              {doc.fileType?.includes('pdf') ? (
                                <FileText className="h-3 w-3 text-red-500" />
                              ) : doc.fileType?.includes('spreadsheet') || doc.fileType?.includes('excel') ? (
                                <FileSpreadsheet className="h-3 w-3 text-green-600" />
                              ) : doc.fileType?.includes('word') || doc.fileType?.includes('document') ? (
                                <FileText className="h-3 w-3 text-blue-600" />
                              ) : doc.fileType?.startsWith('image/') ? (
                                <Image className="h-3 w-3 text-red-500" />
                              ) : doc.fileType?.startsWith('video/') ? (
                                <FileVideo className="h-3 w-3 text-red-500" />
                              ) : (
                                <File className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            
                            {/* File Name */}
                            <h4 className="font-medium text-xs text-gray-900 truncate flex-1">{doc.name}</h4>
                          </div>
                          
                          {/* File Size and Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                            <Badge className={`${getStatusBadgeColor(doc.status)} text-xs px-2 py-0.5`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons - Hover Only */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocumentModal(doc);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Download:', doc.name);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

                     {/* Transactions Section */}
           <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50" id="transactions-section">
             <CardHeader className="border-b border-gray-100 pb-3">
               <CardTitle className="text-gray-800 text-lg">
                 Transactions & Donations
               </CardTitle>
             </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Financial transactions and donor information</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Donated Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Total Donated Amount</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">₹{donationDetails.totalDonatedAmount.toLocaleString()}</div>
                </div>

                {/* Donors Count */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Total Donors</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{donationDetails.donors.length}</div>
                </div>
              </div>

              {/* Donors List */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-3">Donors</h4>
                <div className="space-y-2">
                  {donationDetails.donors.map((donor) => (
                    <div key={donor.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Hash className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{donor.name}</div>
                          <div className="text-xs text-gray-500">ID: {donor.id}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">₹{donor.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{donor.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-3">Transactions</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {transactionDetails.map((transaction) => (
                    <div key={transaction.transactionId} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{transaction.transactionId}</span>
                        </div>
                        <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-gray-900 ml-1">₹{transaction.amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Method:</span>
                          <span className="font-medium text-gray-900 ml-1">{transaction.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium text-gray-900 ml-1">{transaction.date}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Description:</span>
                          <span className="font-medium text-gray-900 ml-1">{transaction.description}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mapping Details */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-3">Mapping Details</h4>
                <div className="space-y-2">
                  {mappingDetails.map((mapping) => (
                    <div key={mapping.donorId} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{mapping.donorName}</span>
                        </div>
                        <Badge className={mapping.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {mapping.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Donor ID:</span>
                          <span className="font-medium text-gray-900 ml-1">{mapping.donorId}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mapped Amount:</span>
                          <span className="font-medium text-gray-900 ml-1">₹{mapping.mappedAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mapped Date:</span>
                          <span className="font-medium text-gray-900 ml-1">{mapping.mappedDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>

            {/* Modals */}



             {/* Document View Modal */}
       <Dialog open={!!documentModal} onOpenChange={() => setDocumentModal(null)}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>
               {documentModal?.name}
             </DialogTitle>
           </DialogHeader>
                        <div className="flex items-center gap-2 mb-4">
               {documentModal && getFileIcon(documentModal.fileType)}
               <span className="text-sm text-gray-600">Document preview and management</span>
             </div>
             <div className="space-y-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 {documentModal && getStatusIcon(documentModal.status)}
                 <Badge className={documentModal ? getStatusBadgeColor(documentModal.status) : ''}>
                   {documentModal?.status.charAt(0).toUpperCase() + documentModal?.status.slice(1)}
                 </Badge>
               </div>
               <Button size="sm" variant="outline">
                 <Download className="h-4 w-4 mr-2" />
                 Download
               </Button>
             </div>
             <div className="bg-gray-100 rounded-lg p-4 text-center">
               {documentModal?.fileType?.startsWith('image/') ? (
                 <div className="text-center">
                   <Image className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                   <p className="text-sm text-gray-600">Image preview not available</p>
                 </div>
               ) : (
                 <div className="text-center">
                   <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                   <p className="text-sm text-gray-600">Document preview not available</p>
                 </div>
               )}
               <p className="text-xs text-gray-500 mt-1">
                 File: {documentModal?.name} • Size: {documentModal?.fileSize} • Uploaded: {documentModal?.uploadedAt}
               </p>
             </div>
             <div className="flex gap-2">
               <Button size="sm" className="flex-1" variant="outline" onClick={() => documentModal && handleDocumentStatusChange(documentModal.id, 'verified')}>
                 <CheckCircle className="h-4 w-4 mr-2" />
                 Mark as Verified
               </Button>
               <Button size="sm" className="flex-1" variant="outline" onClick={() => documentModal && handleDocumentStatusChange(documentModal.id, 'unverified')}>
                 <Clock className="h-4 w-4 mr-2 text-orange-600" />
                 Mark as Unverified
               </Button>
               <Button size="sm" className="flex-1" variant="outline" onClick={() => documentModal && handleDocumentStatusChange(documentModal.id, 'rejected')}>
                 <XCircle className="h-4 w-4 mr-2" />
                 Mark as Rejected
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Bulk Status Update Modal */}
       <Dialog open={bulkStatusModal} onOpenChange={setBulkStatusModal}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Edit3 className="h-5 w-5" />
               Bulk Update Status
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div className="text-center">
               <p className="text-sm text-gray-600 mb-2">
                 Update status for <span className="font-semibold text-blue-600">{selectedDocuments.size}</span> selected document{selectedDocuments.size !== 1 ? 's' : ''}
               </p>
               <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                 {Array.from(selectedDocuments).slice(0, 3).map(id => {
                   const doc = documents.find(d => d.id === id);
                   return doc ? (
                     <span key={id} className="bg-gray-100 px-2 py-1 rounded">
                       {doc.name}
                     </span>
                   ) : null;
                 })}
                 {selectedDocuments.size > 3 && (
                   <span className="text-gray-400">+{selectedDocuments.size - 3} more</span>
                 )}
               </div>
             </div>
             
             <div className="space-y-3">
               <label className="text-sm font-medium">Select New Status:</label>
               <div className="grid grid-cols-3 gap-2">
                 <Button
                   variant={bulkStatus === 'verified' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setBulkStatus('verified')}
                   className="flex items-center gap-2"
                 >
                   <CheckCircle className="h-4 w-4" />
                   Verified
                 </Button>
                 <Button
                   variant={bulkStatus === 'unverified' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setBulkStatus('unverified')}
                   className="flex items-center gap-2"
                 >
                   <Clock className="h-4 w-4" />
                   Unverified
                 </Button>
                 <Button
                   variant={bulkStatus === 'rejected' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setBulkStatus('rejected')}
                   className="flex items-center gap-2"
                 >
                   <XCircle className="h-4 w-4" />
                   Rejected
                 </Button>
               </div>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setBulkStatusModal(false)}>
               Cancel
             </Button>
             <Button onClick={handleBulkStatusChange}>
               Update {selectedDocuments.size} Document{selectedDocuments.size !== 1 ? 's' : ''}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
 );
}  