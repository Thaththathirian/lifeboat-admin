import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Eye, UserCheck, Ban, LogIn, ArrowUp, ArrowDown, Filter, Info, CheckCircle, XCircle, Square, CheckSquare, Loader2, ChevronDown, ChevronUp, CreditCard, DollarSign } from "lucide-react";
import { Student, StudentStatus } from "@/types/student";
import { fetchStudents, updateStudentStatus, blockStudent, getStatusColor, getStatusText } from "@/utils/studentService";
import { 
  statusDisplayMap, 
  statusOrder, 
  statusApiMap 
} from "@/config/studentStatus";

const allStatuses = Object.values(StudentStatus).filter(status => typeof status === 'number');
const statusSteps = statusOrder;

// Mock data for fallback (will be replaced by API data)
const mockStudents: Student[] = [];

function getValidNextStatuses(student: Student): StudentStatus[] {
  // Get all valid statuses based on student's current state
  const base = Object.values(StudentStatus).filter(status => typeof status === 'number');
  const valid = base;
  
  // Filter based on student's current state
  // Note: Removed PROFILE_APPROVED filter as it no longer exists in the new status enum
  // Additional filtering logic can be added here based on new status requirements
  
  return valid;
}

export default function AdminStudents() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "">("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
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
  const [status_counts, setStatusCounts] = useState<Record<string, number>>({});
  
  // Ref to prevent multiple API calls
  const hasLoadedRef = useRef(false);
  
  // Status grid state
  const [isStatusGridExpanded, setIsStatusGridExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<StudentStatus | null>(null);

  // Handle location state when coming back from payment allotment
  useEffect(() => {
    if (location.state?.activeTab) {
      // Set the current status to show the appropriate tab
      setCurrentStatus(location.state.activeTab === 'all' ? null : location.state.activeTab);
      
      // If preserveSelection is true, restore the selected students
      if (location.state?.preserveSelection && location.state?.selectedStudents) {
        setSelected(location.state.selectedStudents);
      }
    }
  }, [location.state]);

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
          setStatusCounts(response.status_counts);
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

  // Load students by status
  const loadStudentsByStatus = async (status: StudentStatus | null) => {
    console.log('🔄 Loading students for status:', status);
    setLoading(true);
    setError(null);
    setCurrentStatus(status);
    
    try {
      const response = await fetchStudents({
        offset: 0,
        limit: 5,
        status: status,
        search: undefined,
      });
      
      if (response.success) {
        setStudents(response.students);
        setTotal(response.total);
        setStatusCounts(response.status_counts || {});
        console.log('✅ Successfully loaded students for status:', status, 'Count:', response.students.length);
      } else {
        setError(response.error || 'Failed to fetch students');
        setStudents([]);
        console.error('❌ Failed to load students for status:', status, response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
      setStudents([]);
      console.error('💥 Exception loading students for status:', status, err);
    } finally {
      setLoading(false);
    }
  };

  // Handle status selection
  const handleStatusSelect = (status: StudentStatus | null) => {
    setIsStatusGridExpanded(false);
    loadStudentsByStatus(status);
  };



  // Filter and sort students
  let filtered = students.filter(s => {
    // Use currentStatus if set (from status grid), otherwise show all students
    const statusFilter = currentStatus !== null ? s.status === currentStatus : true;
    
    return statusFilter &&
      (s.name.toLowerCase().includes(filter.toLowerCase()) || 
       (s.id && s.id.toLowerCase().includes(filter.toLowerCase())) || 
       s.college.toLowerCase().includes(filter.toLowerCase()));
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === "id") {
      const aId = a.id || '';
      const bId = b.id || '';
      return sortDir === "asc" ? aId.localeCompare(bId) : bId.localeCompare(aId);
    }
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
        if (newStatus === StudentStatus.PAID) {
      const transactionId = generateTransactionId();
          console.log(`Transaction ID generated for student ${selectedStudent.id}: ${transactionId}`);
          alert(`Status updated to Paid. Transaction ID: ${transactionId}`);
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
          if (bulkStatus === StudentStatus.PAID) {
        const transactionId = generateTransactionId();
            transactionIds.push(transactionId);
          }
        }
      }
      
      if (bulkStatus === StudentStatus.PAID && transactionIds.length > 0) {
      console.log("Bulk transaction IDs generated:", transactionIds);
        alert(`Bulk status updated to Paid. ${transactionIds.length} transaction IDs generated.`);
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

  const handleUpdateToPaid = async (studentId: string) => {
    try {
      // Update student status to PAID
      const result = await updateStudentStatus(studentId, StudentStatus.PAID);
      if (!result.success) {
        console.error(`Failed to update status for student ${studentId}:`, result.error);
        alert(`Failed to update status for student ${studentId}`);
        return;
      }

      // Create transaction ID
      const transactionId = generateTransactionId();
      
      // In a real application, you would save this transaction to the database
      console.log(`Created transaction ${transactionId} for student ${studentId}`);
      
      alert(`Student status updated to Paid. Transaction ID: ${transactionId}`);
      
      // Refresh the students list
      loadStudentsByStatus(currentStatus);
      
    } catch (error) {
      console.error('Failed to update student to paid:', error);
      alert('Failed to update student status. Please try again.');
    }
  };

  const allSelected = selected.length === filtered.length && filtered.length > 0;
  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map(s => s.id));
  };
  // Calculate student counts for each status using API data
  const getStudentCountByStatus = (status: StudentStatus | null): number => {
    if (status === null) {
      return students.length; // All students
    }
    
    // Use status_counts from API if available
    if (status_counts && Object.keys(status_counts).length > 0) {
      const statusKey = getStatusKey(status);
      return status_counts[statusKey] || 0;
    }
    
    // Fallback to calculating from students array
    return students.filter(student => student.status === status).length;
  };

  // Helper function to convert StudentStatus enum to API status key
  const getStatusKey = (status: StudentStatus): string => {
    return statusApiMap[status] || 'unknown';
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
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              loadStudentsByStatus(currentStatus);
            }}
            className="w-full sm:w-auto"
          >
            <Loader2 className="inline h-4 w-4 mr-2" />Refresh
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">Download List</Button>
          <Button 
            variant="default" 
            disabled={selected.length === 0} 
            onClick={() => setBulkStatusModal(true)}
            className="w-full sm:w-auto"
          >
            <UserCheck className="inline h-4 w-4 mr-2" />Bulk Status Change
          </Button>
          <Button 
            variant="default" 
            disabled={selected.length === 0} 
            onClick={() => navigate('/admin/payment-allotment', { state: { selectedStudents: selected } })}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="inline h-4 w-4 mr-2" />Allot Payment
          </Button>
        </div>
      </div>
      {/* Status Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Student Status Filter</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsStatusGridExpanded(!isStatusGridExpanded)}
            className="flex items-center gap-2"
          >
            {isStatusGridExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Status Grid
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Status Grid
              </>
            )}
          </Button>
        </div>
        
        {/* Current Status Display */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">Current Status:</span>
          {currentStatus !== null ? (
            <Badge className={getStatusColor(currentStatus)}>
              {getStatusText(currentStatus)}
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800">All Students</Badge>
          )}
          {currentStatus !== null && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleStatusSelect(null)}
              className="text-xs"
            >
              Clear Filter
            </Button>
          )}
        </div>
        
        {/* Expandable Status Grid */}
        {isStatusGridExpanded && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {/* All Students */}
              <Button
                variant="outline"
                className={`h-24 sm:h-20 flex flex-col items-center justify-center gap-1 text-xs ${
                  currentStatus === null ? 'bg-blue-50 border-blue-300' : ''
                }`}
                onClick={() => handleStatusSelect(null)}
              >
                <div className="text-lg font-bold">All</div>
                <div className="text-xs text-gray-600">Students</div>
                <div className="text-sm font-semibold text-blue-600">
                  {getStudentCountByStatus(null)}
                </div>
              </Button>
              
              {/* Status Grid Items */}
              {allStatuses.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  className={`h-24 sm:h-20 flex flex-col items-center justify-center gap-1 text-xs ${
                    currentStatus === status ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  onClick={() => handleStatusSelect(status)}
                >
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`}></div>
                  <div className="font-medium text-center leading-tight">{getStatusText(status)}</div>
                  <div className="text-sm font-semibold text-gray-600">
                    {getStudentCountByStatus(status)}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full items-start sm:items-center">
        <Input
          className="w-full sm:max-w-xs"
          placeholder="Filter by name, ID, or college..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <select
            className="border rounded px-3 py-2 text-sm bg-white w-full sm:w-auto"
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
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Students...
              </div>
            ) : (
              `${currentStatus !== null ? getStatusText(currentStatus) : "All"} Students (${filtered.length})`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">
                {error.includes('Cannot read properties of null') || error.includes('toString') 
                  ? 'Unable to load student data. Please try refreshing the page.' 
                  : error}
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-gray-400 text-lg font-medium">
                        {loading ? 'Loading students...' : 'No students found'}
                      </div>
                      {!loading && (
                        <div className="text-gray-500 text-sm">
                          {error ? error : 'Try adjusting your filters or check back later.'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(student => {
                  // Generate a unique key for students without ID
                  const uniqueKey = student.id || `temp-${student.email}-${student.mobile}`;
                  const hasStudentId = student.id && student.id !== '';
                  
                  return (
                    <TableRow key={uniqueKey} className="hover:bg-gray-50">
                      <TableCell className="w-8">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => toggleSelect(uniqueKey)} 
                          title={selected.includes(uniqueKey) ? 'Deselect' : 'Select'}
                          disabled={!hasStudentId}
                        >
                          {selected.includes(uniqueKey) ? <CheckSquare className="h-5 w-5 text-blue-600 mx-auto" /> : <Square className="h-5 w-5 text-gray-400 mx-auto" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {hasStudentId ? (
                          <span className="font-mono text-sm">{student.id}</span>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Pending ID</span>
                        )}
                      </TableCell>
                      <TableCell>{student.name || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(student.status)}`}>
                          {getStatusText(student.status)}
                        </span>
                      </TableCell>
                      <TableCell>{student.college || 'N/A'}</TableCell>
                      <TableCell>₹{(student.scholarship || 0).toLocaleString()}</TableCell>
                      <TableCell className="align-middle">
                        <div className="flex flex-col sm:flex-row gap-1 justify-center items-center">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="View Details" 
                            onClick={() => navigate(`/admin/students/${student.id || 'pending'}`)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="Change Status" 
                            onClick={() => { 
                              setSelectedStudent(student); 
                              setStatusModal(true); 
                              setNewStatus(student.status); 
                            }}
                            className="h-8 w-8"
                          >
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="Block" 
                            onClick={() => { 
                              setSelectedStudent(student); 
                              setBlockModal(true); 
                            }}
                            className="h-8 w-8"
                          >
                            <Ban className="h-4 w-4 text-red-600" />
                          </Button>
                          {hasStudentId && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title="Login as User" 
                              onClick={() => {}}
                              className="h-8 w-8"
                            >
                              <LogIn className="h-4 w-4 text-gray-600" />
                            </Button>
                          )}
                          {hasStudentId && student.status === StudentStatus.PAYMENT_PENDING && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title="Mark as Paid" 
                              onClick={() => handleUpdateToPaid(uniqueKey)}
                              className="h-8 w-8"
                            >
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Modal */}
      <Dialog open={statusModal} onOpenChange={() => setStatusModal(false)}>
        <DialogContent className="max-w-md w-full p-8 rounded-xl shadow-2xl mx-auto text-center bg-white flex flex-col items-center justify-center">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Change Status for {selectedStudent.name} ({selectedStudent.id || 'Pending ID'})
                </DialogTitle>
              </DialogHeader>
              <div className="mb-4 flex items-center gap-2 text-red-600"><Info className="h-4 w-4" /> Warning: This action will be logged with your admin ID (ADM001).</div>
              <select className="w-full border rounded p-2 mb-4" value={newStatus} onChange={e => setNewStatus(Number(e.target.value) as StudentStatus)}>
                {allStatuses.map(status => (
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
                {allStatuses.map(status => (
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