import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, UserCheck, Ban, LogIn, ArrowUp, ArrowDown, Filter, Info, CheckCircle, XCircle, Square, CheckSquare, Loader2 } from "lucide-react";
import { Student, StudentStatus } from "@/types/student";
import { fetchStudents, updateStudentStatus, blockStudent, getStatusColor, getStatusText } from "@/utils/studentService";

// Status mapping for display
const statusDisplayMap = {
  [StudentStatus.NEW_USER]: "New User",
  [StudentStatus.MOBILE_VERIFIED]: "Mobile Verified", 
  [StudentStatus.PROFILE_UPDATED]: "Profile Updated",
  [StudentStatus.PROFILE_APPROVED]: "Profile Approved",
  [StudentStatus.INTERVIEW_SCHEDULED]: "Interview Scheduled",
  [StudentStatus.DOCUMENT_UPLOADED]: "Document Uploaded",
  [StudentStatus.WAITING_FOR_PAYMENT]: "Waiting for Payment",
  [StudentStatus.PAYMENT_COMPLETED]: "Payment Completed",
  [StudentStatus.PAYMENT_VERIFIED]: "Payment Verified",
  [StudentStatus.RECEIPT_VERIFIED]: "Receipt Verified",
  [StudentStatus.CERTIFICATE_UPLOADED]: "Certificate Uploaded",
  [StudentStatus.NEXT_SEMESTER]: "Next Semester",
  [StudentStatus.ALUMNI]: "Alumni",
  [StudentStatus.BLOCKED]: "Blocked"
};

const allStatuses = Object.values(StudentStatus).filter(status => typeof status === 'number');
const statusSteps = [
  StudentStatus.NEW_USER,
  StudentStatus.MOBILE_VERIFIED,
  StudentStatus.PROFILE_UPDATED,
  StudentStatus.PROFILE_APPROVED,
  StudentStatus.INTERVIEW_SCHEDULED,
  StudentStatus.DOCUMENT_UPLOADED,
  StudentStatus.WAITING_FOR_PAYMENT,
  StudentStatus.PAYMENT_COMPLETED,
  StudentStatus.PAYMENT_VERIFIED,
  StudentStatus.RECEIPT_VERIFIED,
  StudentStatus.CERTIFICATE_UPLOADED,
  StudentStatus.NEXT_SEMESTER,
  StudentStatus.ALUMNI
];

// Mock data for fallback (will be replaced by API data)
const mockStudents: Student[] = [];

function getValidNextStatuses(student: Student): StudentStatus[] {
  // Get all valid statuses based on student's current state
  const base = Object.values(StudentStatus).filter(status => typeof status === 'number');
  let valid = base;
  
  // Filter based on student's current state
  if (!(student.interviewCompleted && student.documentsVerified)) {
    valid = valid.filter(s => s !== StudentStatus.PROFILE_APPROVED);
  }
  
  return valid;
}

export default function AdminStudents({ initialTab = "all" }) {
  const [tab, setTab] = useState(initialTab);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "">("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [openStudent, setOpenStudent] = useState<Student | null>(null);
  const [statusModal, setStatusModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStatus, setNewStatus] = useState<StudentStatus>(StudentStatus.NEW_USER);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<StudentStatus>(StudentStatus.NEW_USER);
  
  // API state
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  
  // Ref to prevent multiple API calls
  const hasLoadedRef = useRef(false);

  // Fetch students from API - only call once on component mount
  useEffect(() => {
    // Prevent multiple API calls
    if (hasLoadedRef.current) {
      console.log('🚫 API already called, skipping...');
      return;
    }
    
    const loadStudents = async () => {
      console.log('🔄 Starting to load students...');
      hasLoadedRef.current = true; // Mark as called immediately
      setLoading(true);
      setError(null);
      
      // Check if auth token exists (same as college service)
      try {
        const adminAuth = localStorage.getItem('adminAuth');
        const authToken = adminAuth ? JSON.parse(adminAuth).access_token || JSON.parse(adminAuth).token : null;
        console.log('🔑 Auth token exists:', !!authToken);
        console.log('🔑 Auth token value:', authToken ? authToken.substring(0, 20) + '...' : 'null');
      } catch (error) {
        console.log('🔑 Auth token exists: false (error parsing)');
        console.log('🔑 Auth token value: null');
      }
      
      try {
        console.log('📡 Calling fetchStudents API...');
        const response = await fetchStudents({
          offset: 0,
          limit: 5, // Changed to 5 as requested
          status: undefined,
          search: undefined,
        });
        
        console.log('📥 API Response:', response);
        
        if (response.success) {
          console.log('✅ Successfully loaded students:', response.students.length);
          setStudents(response.students);
          setTotal(response.total);
        } else {
          console.error('❌ API returned error:', response.error);
          setError(response.error || 'Failed to fetch students');
          setStudents([]);
        }
      } catch (err) {
        console.error('💥 Exception during API call:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
        setStudents([]);
      } finally {
        setLoading(false);
        console.log('🏁 Finished loading students');
      }
    };

    loadStudents();
  }, []); // Empty dependency array - only call once on mount

  // Helper function to map tab to status
  const getTabStatus = (tab: string): StudentStatus | null => {
    switch (tab) {
      case "new_user": return StudentStatus.NEW_USER;
      case "mobile_verified": return StudentStatus.MOBILE_VERIFIED;
      case "profile_updated": return StudentStatus.PROFILE_UPDATED;
      case "profile_approved": return StudentStatus.PROFILE_APPROVED;
      case "interview_scheduled": return StudentStatus.INTERVIEW_SCHEDULED;
      case "document_uploaded": return StudentStatus.DOCUMENT_UPLOADED;
      case "waiting_for_payment": return StudentStatus.WAITING_FOR_PAYMENT;
      case "payment_completed": return StudentStatus.PAYMENT_COMPLETED;
      case "payment_verified": return StudentStatus.PAYMENT_VERIFIED;
      case "receipt_verified": return StudentStatus.RECEIPT_VERIFIED;
      case "certificate_uploaded": return StudentStatus.CERTIFICATE_UPLOADED;
      case "next_semester": return StudentStatus.NEXT_SEMESTER;
      case "alumni": return StudentStatus.ALUMNI;
      case "blocked": return StudentStatus.BLOCKED;
      default: return null;
    }
  };

  // Filter and sort students
  let filtered = students.filter(s =>
    (tab === "all" || s.status === getTabStatus(tab)) &&
    (s.name.toLowerCase().includes(filter.toLowerCase()) || 
     s.id.toLowerCase().includes(filter.toLowerCase()) || 
     s.college.toLowerCase().includes(filter.toLowerCase()))
  );

  filtered = filtered.sort((a, b) => {
    if (sortBy === "id") return sortDir === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    if (sortBy === "name") return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortBy === "status") return sortDir === "asc" ? a.status - b.status : b.status - a.status;
    if (sortBy === "college") return sortDir === "asc" ? a.college.localeCompare(b.college) : b.college.localeCompare(a.college);
    if (sortBy === "scholarship") return sortDir === "asc" ? a.scholarship - b.scholarship : b.scholarship - a.scholarship;
    return 0;
  });

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `TXN-${timestamp}-${randomStr}`.toUpperCase();
  };

  const handleChangeStatus = async () => {
    if (!selectedStudent) return;
    
    try {
      const result = await updateStudentStatus(selectedStudent.id, newStatus);
      
      if (result.success) {
        if (newStatus === StudentStatus.PAYMENT_COMPLETED) {
          const transactionId = generateTransactionId();
          console.log(`Transaction ID generated for student ${selectedStudent.id}: ${transactionId}`);
          alert(`Status updated to Payment Completed. Transaction ID: ${transactionId}`);
        } else {
          alert(`Status updated to ${getStatusText(newStatus)}`);
        }
        
        // Update the student in the local state instead of refreshing
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === selectedStudent.id 
              ? { ...student, status: newStatus, statusText: getStatusText(newStatus) }
              : student
          )
        );
      } else {
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (error) {
      alert(`Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setStatusModal(false);
  };

  const handleBlock = async () => {
    if (!selectedStudent) return;
    
    try {
      const result = await blockStudent(selectedStudent.id);
      
      if (result.success) {
        alert(`Student ${selectedStudent.name} has been blocked`);
        
        // Update the student in the local state instead of refreshing
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === selectedStudent.id 
              ? { ...student, status: StudentStatus.BLOCKED, statusText: getStatusText(StudentStatus.BLOCKED) }
              : student
          )
        );
      } else {
        alert(`Failed to block student: ${result.error}`);
      }
    } catch (error) {
      alert(`Error blocking student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setBlockModal(false);
  };

  const handleBulkStatus = async () => {
    try {
      let successCount = 0;
      const transactionIds: string[] = [];
      
      for (const studentId of selected) {
        const result = await updateStudentStatus(studentId, bulkStatus);
        if (result.success) {
          successCount++;
          if (bulkStatus === StudentStatus.PAYMENT_COMPLETED) {
            const transactionId = generateTransactionId();
            transactionIds.push(transactionId);
          }
        }
      }
      
      if (bulkStatus === StudentStatus.PAYMENT_COMPLETED && transactionIds.length > 0) {
        console.log("Bulk transaction IDs generated:", transactionIds);
        alert(`Bulk status updated to Payment Completed. ${transactionIds.length} transaction IDs generated.`);
      } else {
        alert(`Bulk status updated to ${getStatusText(bulkStatus)}. ${successCount} students updated.`);
      }
      
      // Update the students in the local state instead of refreshing
      setStudents(prevStudents => 
        prevStudents.map(student => 
          selected.includes(student.id)
            ? { ...student, status: bulkStatus, statusText: getStatusText(bulkStatus) }
            : student
        )
      );
      
      // Clear selection
      setSelected([]);
    } catch (error) {
      alert(`Error updating bulk status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setBulkStatusModal(false);
  };

  const allSelected = selected.length === filtered.length && filtered.length > 0;
  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map(s => s.id));
  };
  // For bulk, only show statuses allowed for all selected students
  const validBulkStatuses = selected.length > 0
    ? allStatuses.filter(status =>
        filtered.filter(s => selected.includes(s.id)).every(stu => getValidNextStatuses(stu).includes(status))
      )
    : [];

  return (
    <div className="main-content-container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Student Management</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => {
            console.log('🔄 Manual refresh triggered');
            setLoading(true);
            fetchStudents({ offset: 0, limit: 5 }).then(response => {
              if (response.success) {
                setStudents(response.students);
                setTotal(response.total);
                setError(null);
                console.log('✅ Manual refresh successful');
              } else {
                setError(response.error || 'Failed to refresh students');
                console.error('❌ Manual refresh failed:', response.error);
              }
              setLoading(false);
            }).catch(err => {
              setError(err instanceof Error ? err.message : 'Failed to refresh students');
              console.error('💥 Manual refresh exception:', err);
              setLoading(false);
            });
          }}>
            <Loader2 className="inline h-4 w-4 mr-2" />Refresh
          </Button>
          <Button variant="outline">Download List</Button>
          <Button variant="default" disabled={selected.length === 0} onClick={() => setBulkStatusModal(true)}>
            <UserCheck className="inline h-4 w-4 mr-2" />Bulk Status Change
          </Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-8 lg:grid-cols-16 gap-1">
          <TabsTrigger value="all" className="text-xs">All Students</TabsTrigger>
          <TabsTrigger value="new_user" className="text-xs">New User</TabsTrigger>
          <TabsTrigger value="mobile_verified" className="text-xs">Mobile Verified</TabsTrigger>
          <TabsTrigger value="profile_updated" className="text-xs">Profile Updated</TabsTrigger>
          <TabsTrigger value="profile_approved" className="text-xs">Profile Approved</TabsTrigger>
          <TabsTrigger value="interview_scheduled" className="text-xs">Interview Scheduled</TabsTrigger>
          <TabsTrigger value="document_uploaded" className="text-xs">Document Uploaded</TabsTrigger>
          <TabsTrigger value="waiting_for_payment" className="text-xs">Waiting for Payment</TabsTrigger>
          <TabsTrigger value="payment_completed" className="text-xs">Payment Completed</TabsTrigger>
          <TabsTrigger value="payment_verified" className="text-xs">Payment Verified</TabsTrigger>
          <TabsTrigger value="receipt_verified" className="text-xs">Receipt Verified</TabsTrigger>
          <TabsTrigger value="certificate_uploaded" className="text-xs">Certificate Uploaded</TabsTrigger>
          <TabsTrigger value="next_semester" className="text-xs">Next Semester</TabsTrigger>
          <TabsTrigger value="alumni" className="text-xs">Alumni</TabsTrigger>
          <TabsTrigger value="blocked" className="text-xs">Blocked</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full items-center">
        <Input
          className="max-w-xs"
          placeholder="Filter by name, ID, or college..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="border rounded px-3 py-2 text-sm bg-white"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value ? Number(e.target.value) as StudentStatus : "")}
          >
            <option value="">All Statuses</option>
            {allStatuses.map(status => (
              <option key={status} value={status}>{getStatusText(status)}</option>
            ))}
          </select>
        </div>
      </div>
      <Card className="shadow-soft overflow-x-auto">
        <CardHeader>
          <CardTitle>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Students...
              </div>
            ) : (
              `${tab === "all" ? "All" : getStatusText(getTabStatus(tab) || StudentStatus.NEW_USER)} Students (${filtered.length})`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer w-8" onClick={toggleSelectAll} title={allSelected ? 'Deselect All' : 'Select All'}>
                  {allSelected ? <CheckSquare className="h-5 w-5 text-blue-600 mx-auto" /> : <Square className="h-5 w-5 text-gray-400 mx-auto" />}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>Student ID {sortBy === "id" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>Name {sortBy === "name" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>Status {sortBy === "status" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("college")}>College {sortBy === "college" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("scholarship")}>Scholarship {sortBy === "scholarship" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(student => (
                <TableRow key={student.id} className="hover:bg-gray-50">
                  <TableCell className="w-8">
                    <Button size="icon" variant="ghost" onClick={() => toggleSelect(student.id)} title={selected.includes(student.id) ? 'Deselect' : 'Select'}>
                      {selected.includes(student.id) ? <CheckSquare className="h-5 w-5 text-blue-600 mx-auto" /> : <Square className="h-5 w-5 text-gray-400 mx-auto" />}
                    </Button>
                  </TableCell>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(student.status)}`}>
                      {getStatusText(student.status)}
                    </span>
                  </TableCell>
                  <TableCell>{student.college}</TableCell>
                  <TableCell>₹{student.scholarship.toLocaleString()}</TableCell>
                  <TableCell className="align-middle">
                    <div className="flex flex-row gap-1 justify-center items-center">
                      <Button size="icon" variant="ghost" title="View" onClick={() => setOpenStudent(student)}><Eye className="h-4 w-4 text-blue-600" /></Button>
                      <Button size="icon" variant="ghost" title="Change Status" onClick={() => { setSelectedStudent(student); setStatusModal(true); setNewStatus(student.status); }}><UserCheck className="h-4 w-4 text-green-600" /></Button>
                      <Button size="icon" variant="ghost" title="Block" onClick={() => { setSelectedStudent(student); setBlockModal(true); }}><Ban className="h-4 w-4 text-red-600" /></Button>
                      <Button size="icon" variant="ghost" title="Login as User" onClick={() => {}}><LogIn className="h-4 w-4 text-gray-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Student Details Modal */}
      <Dialog open={!!openStudent} onOpenChange={() => setOpenStudent(null)}>
        <DialogContent className="max-w-md w-full p-8 rounded-xl shadow-2xl mx-auto text-center bg-white flex flex-col items-center justify-center">
          {openStudent && (
            <>
              <DialogHeader>
                <DialogTitle>{openStudent.name} ({openStudent.id})</DialogTitle>
              </DialogHeader>
              <div className="mb-2"><b>Email:</b> {openStudent.email}</div>
              <div className="mb-2"><b>Mobile:</b> {openStudent.mobile}</div>
              <div className="mb-2"><b>College:</b> {openStudent.college}</div>
              <div className="mb-2"><b>Status:</b> <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(openStudent.status)} mx-auto block text-center`}>{getStatusText(openStudent.status)}</span></div>
              <div className="mb-2"><b>Scholarship:</b> ₹{openStudent.scholarship.toLocaleString()}</div>
              <div className="mb-4 flex flex-wrap gap-2 justify-center">
                {statusSteps.map((step, idx) => (
                  <span key={idx} className={`px-2 py-1 rounded text-xs font-semibold ${openStudent.statusBar.includes(getStatusText(step)) ? getStatusColor(step) : 'bg-gray-100 text-gray-400'}`}>{getStatusText(step)}</span>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Status Change Modal */}
      <Dialog open={statusModal} onOpenChange={() => setStatusModal(false)}>
        <DialogContent className="max-w-md w-full p-8 rounded-xl shadow-2xl mx-auto text-center bg-white flex flex-col items-center justify-center">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle>Change Status for {selectedStudent.name} ({selectedStudent.id})</DialogTitle>
              </DialogHeader>
              <div className="mb-4 flex items-center gap-2 text-red-600"><Info className="h-4 w-4" /> Warning: This action will be logged with your admin ID (ADM001).</div>
              <select className="w-full border rounded p-2 mb-4" value={newStatus} onChange={e => setNewStatus(Number(e.target.value) as StudentStatus)}>
                {getValidNextStatuses(selectedStudent).map(status => (
                  <option key={status} value={status} className={getStatusColor(status)}>{getStatusText(status)}</option>
                ))}
              </select>
              <Button variant="default" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleChangeStatus}><CheckCircle className="inline h-4 w-4 mr-2" />Confirm Status Change</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Bulk Status Change Modal */}
      <Dialog open={bulkStatusModal} onOpenChange={() => setBulkStatusModal(false)}>
        <DialogContent className="max-w-md w-full p-8 rounded-xl shadow-2xl mx-auto text-center bg-white flex flex-col items-center justify-center">
          {selected.length > 0 && (
            <>
              <DialogHeader>
                <DialogTitle>Bulk Status Change ({selected.length} students)</DialogTitle>
              </DialogHeader>
              <div className="mb-4 flex items-center gap-2 text-red-600"><Info className="h-4 w-4" /> Warning: This action will be logged with your admin ID (ADM001).</div>
              <select className="w-full border rounded p-2 mb-4" value={bulkStatus} onChange={e => setBulkStatus(Number(e.target.value) as StudentStatus)}>
                {validBulkStatuses.map(status => (
                  <option key={status} value={status} className={getStatusColor(status)}>{getStatusText(status)}</option>
                ))}
              </select>
              <Button variant="default" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleBulkStatus}><CheckCircle className="inline h-4 w-4 mr-2" />Confirm Bulk Status Change</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Block User Modal */}
      <Dialog open={blockModal} onOpenChange={() => setBlockModal(false)}>
        <DialogContent className="max-w-md w-full p-8 rounded-xl shadow-2xl mx-auto text-center bg-white flex flex-col items-center justify-center">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle>Block {selectedStudent.name} ({selectedStudent.id})</DialogTitle>
              </DialogHeader>
              <div className="mb-4 flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" /> Are you sure you want to block this user? This action will be logged with your admin ID (ADM001).</div>
              <Button variant="destructive" className="w-full" onClick={handleBlock}><Ban className="inline h-4 w-4 mr-2" />Confirm Block</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 