import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Users, DollarSign, CheckCircle, ArrowUp, ArrowDown, Loader2, ChevronDown } from "lucide-react";
import { Student, StudentStatus, Donor, PaymentAllotment, Transaction, PaymentMapping } from "@/types/student";
import { fetchStudents, updateStudentStatus, updateMultipleStudentStatuses, getStatusColor, getStatusText } from "@/utils/studentService";
import { 
  statusOrder, 
  getPreviousStatus as getPreviousStatusFromConfig,
  PAYMENT_ALLOTMENT_STATUS_OPTIONS 
} from "@/config/studentStatus";

// Mock data
const mockDonors: Donor[] = [
  { id: "DON001", name: "Rajesh Kumar", amount: 100000, allocated: 50000, unallocated: 50000 },
  { id: "DON002", name: "Priya Sharma", amount: 75000, allocated: 25000, unallocated: 50000 },
  { id: "DON003", name: "Amit Patel", amount: 120000, allocated: 80000, unallocated: 40000 },
];

const mockPaymentAllotments: PaymentAllotment[] = [
  { id: "ALLOC001", studentId: "STU001", studentName: "Rohan Verma", college: "Mumbai University", collegeFee: 75000, allottedAmount: 25000, status: 'pending', date: "2024-01-15" },
  { id: "ALLOC002", studentId: "STU002", studentName: "Sneha Gupta", college: "Delhi College", collegeFee: 120000, allottedAmount: 35000, status: 'paid', date: "2024-01-15" },
];

const mockTransactions: Transaction[] = [
  { id: "TXN-001", studentId: "STU002", studentName: "Sneha Gupta", college: "Delhi College", amount: 35000, date: "2024-01-15", status: 'completed' },
];

const mockPaymentMappings: PaymentMapping[] = [
  { id: "MAP001", donorId: "DON001", donorName: "Rajesh Kumar", transactionId: "TXN-001", studentId: "STU002", studentName: "Sneha Gupta", college: "Delhi College", amount: 35000, date: "2024-01-15" },
];

export default function AdminPaymentAllotment() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentAmounts, setStudentAmounts] = useState<{[key: string]: number}>({});
  const [studentStatuses, setStudentStatuses] = useState<{[key: string]: StudentStatus}>({});
  const [bulkStatus, setBulkStatus] = useState<StudentStatus | "">("");
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [donors] = useState<Donor[]>(mockDonors);
  const [paymentAllotments, setPaymentAllotments] = useState<PaymentAllotment[]>(mockPaymentAllotments);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [paymentMappings, setPaymentMappings] = useState<PaymentMapping[]>(mockPaymentMappings);
  const [activeTab, setActiveTab] = useState('students');
  const [showAllotmentDialog, setShowAllotmentDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [expandedMappings, setExpandedMappings] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [feeRangeFilter, setFeeRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchStudents({
        offset: 0,
        limit: 50,
        status: undefined,
        search: undefined,
      });
      
      if (response.success) {
        const studentsWithFees = response.students.map(student => ({
          ...student,
          collegeFee: Math.floor(Math.random() * 50000) + 50000,
          lastAllottedAmount: Math.floor(Math.random() * 20000) + 10000,
        }));
        setStudents(studentsWithFees);
    } else {
        setError(response.error || 'Failed to fetch students');
        setStudents([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `TXN-${timestamp}-${randomStr}`.toUpperCase();
  };

  // Function to get the previous status for a given status
  const getPreviousStatus = (currentStatus: StudentStatus): StudentStatus => {
    const previousStatus = getPreviousStatusFromConfig(currentStatus);
    return previousStatus || currentStatus; // Return same status if no previous available
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAmountChange = (studentId: string, amount: string) => {
    // Allow empty string or valid numbers
    const numericAmount = amount === '' ? '' : parseInt(amount) || 0;
    
    setStudentAmounts(prev => ({
      ...prev,
      [studentId]: numericAmount
    }));
  };

  const handleStatusChange = (studentId: string, status: StudentStatus) => {
    // Only allow PAYMENT_PENDING or ELIGIBLE_FOR_SCHOLARSHIP in payment allotment table
    if (!PAYMENT_ALLOTMENT_STATUS_OPTIONS.includes(status as any)) {
      alert("In payment allotment table, you can only change status to 'Payment Pending' or 'Eligible for Scholarship'.");
      return;
    }
    
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleBulkStatusChange = (status: StudentStatus) => {
    if (selectedStudents.length === 0) {
      alert("Please select students to change status.");
      return;
    }

    // Only allow PAYMENT_PENDING or ELIGIBLE_FOR_SCHOLARSHIP in payment allotment table
    if (!PAYMENT_ALLOTMENT_STATUS_OPTIONS.includes(status as any)) {
      alert("In payment allotment table, you can only change status to 'Payment Pending' or 'Eligible for Scholarship'.");
      return;
    }

    const newStatuses: {[key: string]: StudentStatus} = {};
    selectedStudents.forEach(studentId => {
      newStatuses[studentId] = status;
    });

    setStudentStatuses(prev => ({
      ...prev,
      ...newStatuses
    }));

    setBulkStatus("");
    alert(`Status updated to ${getStatusText(status)} for ${selectedStudents.length} students.`);
  };

  const handleAllotPayment = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select students to allot payment.");
      return;
    }

    const allotments: PaymentAllotment[] = [];
    
    for (const studentId of selectedStudents) {
      const student = students.find(s => s.id === studentId);
      if (!student) continue;

      const amount = studentAmounts[studentId] !== undefined && studentAmounts[studentId] !== '' ? studentAmounts[studentId] : (student.lastAllottedAmount || 0);
      
      const allotment: PaymentAllotment = {
        id: `ALLOC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentId: studentId,
        studentName: student.name,
        college: student.college,
        collegeFee: student.collegeFee || 0,
        allottedAmount: amount,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      };
      
      allotments.push(allotment);
    }

    // Update status for all selected students
    try {
      // Use the status from studentStatuses if set, otherwise default to PAYMENT_PENDING
      const statusToUpdate = bulkStatus || StudentStatus.PAYMENT_PENDING;
      
      // Send payload with status number and student IDs
      const payload = {
        status: statusToUpdate,
        studentIds: selectedStudents
      };
      
      console.log('Sending bulk status update payload:', payload);
      
      // Use the new bulk update function
      const result = await updateMultipleStudentStatuses(selectedStudents, statusToUpdate);
      
      if (!result.success) {
        console.error('Bulk status update failed:', result.error);
        alert(`Failed to update status for some students: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update student statuses:', error);
      alert('Failed to update student statuses. Please try again.');
    }

    setPaymentAllotments(prev => [...prev, ...allotments]);
    setSelectedStudents([]);
    setStudentAmounts({});
    setShowAllotmentDialog(false);
    
    alert(`Payment allotted to ${allotments.length} students. Status updated.`);
  };

  const handleUpdateToPaid = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select students to update to paid status.");
      return;
    }

    const newTransactions: Transaction[] = [];
    
    for (const studentId of selectedStudents) {
      const student = students.find(s => s.id === studentId);
      if (!student) continue;

      const transactionId = generateTransactionId();
      
      const transaction: Transaction = {
        id: transactionId,
        studentId: studentId,
        studentName: student.name,
        college: student.college,
        amount: studentAmounts[studentId] !== undefined && studentAmounts[studentId] !== '' ? studentAmounts[studentId] : (student.lastAllottedAmount || 0),
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
      };
      
      newTransactions.push(transaction);
      
             try {
         // Use the status from studentStatuses if set, otherwise default to PAID
         const statusToUpdate = studentStatuses[studentId] || StudentStatus.PAID;
         await updateStudentStatus(studentId, statusToUpdate);
       } catch (error) {
         console.error(`Failed to update status for student ${studentId}:`, error);
       }
    }

    setTransactions(prev => [...prev, ...newTransactions]);
    setSelectedStudents([]);
    setStudentAmounts({});
    setShowPaymentDialog(false);
    
    alert(`${newTransactions.length} students updated to Paid status. ${newTransactions.length} transaction IDs generated.`);
  };

  const handlePaymentMapping = () => {
    if (selectedDonors.length === 0 || selectedTransactions.length === 0) {
      alert("Please select both donors and transactions for mapping.");
      return;
    }

    const totalDonorAmount = getTotalSelectedDonorAmount();
    const totalTransactionAmount = getTotalSelectedTransactionAmount();

    if (totalTransactionAmount > totalDonorAmount) {
      alert("Total transaction amount exceeds total donor amount. Please adjust selections.");
      return;
    }

    const mappingId = `MAP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const mappings: PaymentMapping[] = [];
    
    // Create one mapping record for each transaction
    for (const transactionId of selectedTransactions) {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) continue;

      // Find the donor with the most unallocated amount for this transaction
      const availableDonors = selectedDonors.map(donorId => {
        const donor = donors.find(d => d.id === donorId);
        return donor;
      }).filter(donor => donor && donor.unallocated > 0);

      if (availableDonors.length === 0) continue;

      // Use the first available donor for this transaction
      const selectedDonor = availableDonors[0];
      
      const mapping: PaymentMapping = {
        id: mappingId,
        donorId: selectedDonor.id,
        donorName: selectedDonor.name,
        transactionId: transaction.id,
        studentId: transaction.studentId,
        studentName: transaction.studentName,
        college: transaction.college,
        amount: transaction.amount,
        date: new Date().toISOString().split('T')[0],
      };
      
      mappings.push(mapping);
    }

    setPaymentMappings(prev => [...prev, ...mappings]);
    setSelectedDonors([]);
    setSelectedTransactions([]);
    setShowMappingDialog(false);
    
    alert(`Payment mapping created with ID: ${mappingId} for ${mappings.length} transactions.`);
  };

  let filteredStudents = students.filter(student => {
    const statusFilterMatch = statusFilter === "all" || student.status === statusFilter;
    const searchMatch = !filter || 
      student.name.toLowerCase().includes(filter.toLowerCase()) ||
      (student.id && student.id.toLowerCase().includes(filter.toLowerCase())) ||
      student.college.toLowerCase().includes(filter.toLowerCase());
    const collegeFilterMatch = !collegeFilter || 
      student.college.toLowerCase().includes(collegeFilter.toLowerCase());
    
    let feeRangeMatch = true;
    if (feeRangeFilter && feeRangeFilter !== "all") {
      const fee = student.collegeFee || 0;
      switch (feeRangeFilter) {
        case "0-50000":
          feeRangeMatch = fee <= 50000;
          break;
        case "50000-100000":
          feeRangeMatch = fee > 50000 && fee <= 100000;
          break;
        case "100000-150000":
          feeRangeMatch = fee > 100000 && fee <= 150000;
          break;
        case "150000+":
          feeRangeMatch = fee > 150000;
          break;
      }
    }
    
    return statusFilterMatch && searchMatch && collegeFilterMatch && feeRangeMatch;
  });

  filteredStudents = filteredStudents.sort((a, b) => {
    if (sortBy === "name") return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortBy === "college") return sortDir === "asc" ? a.college.localeCompare(b.college) : b.college.localeCompare(a.college);
    if (sortBy === "status") return sortDir === "asc" ? a.status - b.status : b.status - a.status;
    if (sortBy === "collegeFee") return sortDir === "asc" ? (a.collegeFee || 0) - (b.collegeFee || 0) : (b.collegeFee || 0) - (a.collegeFee || 0);
    if (sortBy === "lastAllottedAmount") return sortDir === "asc" ? (a.lastAllottedAmount || 0) - (b.lastAllottedAmount || 0) : (b.lastAllottedAmount || 0) - (a.lastAllottedAmount || 0);
    if (sortBy === "appliedDate") return sortDir === "asc" ? new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime() : new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    return 0;
  });

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const getPendingStudents = () => {
    return paymentAllotments.filter(allotment => allotment.status === 'pending');
  };

  const getAvailableTransactions = () => {
    return transactions.filter(transaction => 
      !paymentMappings.some(mapping => mapping.transactionId === transaction.id)
    );
  };

  const handleMappingToggle = (mappingId: string) => {
    setExpandedMappings(prev => 
      prev.includes(mappingId) 
        ? prev.filter(id => id !== mappingId)
        : [...prev, mappingId]
    );
  };

  const getTransactionDetails = (transactionId: string) => {
    return transactions.find(t => t.id === transactionId);
  };

  const getDonorDetails = (donorId: string) => {
    return donors.find(d => d.id === donorId);
  };

  const getTotalSelectedDonorAmount = () => {
    return selectedDonors.reduce((total, donorId) => {
      const donor = donors.find(d => d.id === donorId);
      return total + (donor?.unallocated || 0);
    }, 0);
  };

  const getTotalSelectedTransactionAmount = () => {
    return selectedTransactions.reduce((total, transactionId) => {
      const transaction = transactions.find(t => t.id === transactionId);
      return total + (transaction?.amount || 0);
    }, 0);
  };

  const getRemainingAmount = () => {
    return getTotalSelectedDonorAmount() - getTotalSelectedTransactionAmount();
  };

  const handleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payment Allotment</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Donors</p>
                <p className="text-2xl font-bold">{donors.filter(d => d.unallocated > 0).length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Donors with unallocated funds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{getPendingStudents().length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Students waiting for payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Completed transactions</p>
          </CardContent>
        </Card>
      </div>

             <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
           <TabsTrigger value="students">Select Students</TabsTrigger>
           <TabsTrigger value="pending">Payment Pending</TabsTrigger>
           <TabsTrigger value="mapping">Payment Mapping</TabsTrigger>
           <TabsTrigger value="mapped">Mapped Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Students for Payment Allotment</CardTitle>
              <CardDescription>Select students and enter amounts for payment allotment</CardDescription>
            </CardHeader>
            <CardContent>
                             <div className="flex flex-col sm:flex-row gap-3 mb-4">
                 <Input
                   className="w-full sm:max-w-xs"
                   placeholder="Filter by name, ID, or college..."
                   value={filter}
                   onChange={e => setFilter(e.target.value)}
                 />
                 <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === "all" ? "all" : Number(value) as StudentStatus)}>
                   <SelectTrigger className="w-full sm:w-auto">
                     <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Statuses</SelectItem>
                     <SelectItem value={StudentStatus.NEW_USER.toString()}>New User</SelectItem>
                     <SelectItem value={StudentStatus.MOBILE_VERIFIED.toString()}>Mobile Verified</SelectItem>
                     <SelectItem value={StudentStatus.PROFILE_UPDATED.toString()}>Profile Updated</SelectItem>
                     <SelectItem value={StudentStatus.PERSONAL_DOCUMENTS_PENDING.toString()}>Personal Documents Pending</SelectItem>
                     <SelectItem value={StudentStatus.PERSONAL_DOCUMENTS_SUBMITTED.toString()}>Personal Documents Submitted</SelectItem>
                     <SelectItem value={StudentStatus.INTERVIEW_SCHEDULED.toString()}>Interview Scheduled</SelectItem>
                     <SelectItem value={StudentStatus.ACADEMIC_DOCUMENTS_PENDING.toString()}>Academic Documents Pending</SelectItem>
                     <SelectItem value={StudentStatus.ACADEMIC_DOCUMENTS_SUBMITTED.toString()}>Academic Documents Submitted</SelectItem>
                     <SelectItem value={StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP.toString()}>Eligible for Scholarship</SelectItem>
                     <SelectItem value={StudentStatus.PAYMENT_PENDING.toString()}>Payment Pending</SelectItem>
                     <SelectItem value={StudentStatus.PAID.toString()}>Paid</SelectItem>
                     <SelectItem value={StudentStatus.RECEIPT_DOCUMENTS_SUBMITTED.toString()}>Receipt Documents Submitted</SelectItem>
                     <SelectItem value={StudentStatus.ALUMNI.toString()}>Alumni</SelectItem>
                     <SelectItem value={StudentStatus.BLOCKED.toString()}>Blocked</SelectItem>
                   </SelectContent>
                 </Select>
                 <Input
                   className="w-full sm:max-w-xs"
                   placeholder="Filter by college..."
                   value={collegeFilter}
                   onChange={e => setCollegeFilter(e.target.value)}
                 />
                 <Select value={feeRangeFilter} onValueChange={setFeeRangeFilter}>
                   <SelectTrigger className="w-full sm:w-auto">
                     <SelectValue placeholder="All Fee Ranges" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Fee Ranges</SelectItem>
                     <SelectItem value="0-50000">₹0 - ₹50,000</SelectItem>
                     <SelectItem value="50000-100000">₹50,000 - ₹1,00,000</SelectItem>
                     <SelectItem value="100000-150000">₹1,00,000 - ₹1,50,000</SelectItem>
                     <SelectItem value="150000+">₹1,50,000+</SelectItem>
                   </SelectContent>
                 </Select>
                 {selectedStudents.length > 0 && (
                   <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">Bulk Status:</span>
                     <Select value={bulkStatus} onValueChange={(value) => {
                       if (value) {
                         handleBulkStatusChange(Number(value) as StudentStatus);
                       }
                     }}>
                       <SelectTrigger className="w-40">
                         <SelectValue placeholder="Change Status" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value={StudentStatus.PAYMENT_PENDING.toString()}>Payment Pending</SelectItem>
                         <SelectItem value={StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP.toString()}>Eligible for Scholarship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                 )}
               </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                      <TableHead className="w-12">
                    <input
                      type="checkbox"
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(filteredStudents.map(s => s.id || ''));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                      className="rounded"
                    />
                </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                        Name {sortBy === "name" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("college")}>
                        College {sortBy === "college" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                        Status {sortBy === "status" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("collegeFee")}>
                        College Fee {sortBy === "collegeFee" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("lastAllottedAmount")}>
                        Last Allotted {sortBy === "lastAllottedAmount" && (sortDir === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                      </TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading students...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map(student => (
                        <TableRow key={student.id || student.email}>
                          <TableCell>
                    <input
                      type="checkbox"
                              checked={selectedStudents.includes(student.id || '')}
                              onChange={() => handleStudentSelection(student.id || '')}
                      className="rounded"
                    />
                  </TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.college}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(student.status)}>
                              {getStatusText(student.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{(student.collegeFee || 0).toLocaleString()}</TableCell>
                          <TableCell>₹{(student.lastAllottedAmount || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="Amount"
                              className="w-24"
                              value={studentAmounts[student.id || ''] !== undefined ? studentAmounts[student.id || ''] : (student.lastAllottedAmount || '')}
                              onChange={(e) => handleAmountChange(student.id || '', e.target.value)}
                              disabled={!selectedStudents.includes(student.id || '')}
                            />
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={studentStatuses[student.id || '']?.toString() || student.status.toString()}
                              onValueChange={(value) => handleStatusChange(student.id || '', Number(value) as StudentStatus)}
                              disabled={!selectedStudents.includes(student.id || '')}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={StudentStatus.PAYMENT_PENDING.toString()}>Payment Pending</SelectItem>
                                <SelectItem value={StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP.toString()}>Eligible for Scholarship</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                </TableRow>
                      ))
                    )}
            </TableBody>
          </Table>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllotmentDialog(true)}
                  disabled={selectedStudents.length === 0}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Allot Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Pending Students</CardTitle>
              <CardDescription>Update payment pending students to paid status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead className="w-12">
                            <input
                              type="checkbox"
                          checked={selectedStudents.length === getPendingStudents().length && getPendingStudents().length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(getPendingStudents().map(s => s.studentId));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                              className="rounded"
                            />
                        </TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>College Fee</TableHead>
                      <TableHead>Allotted Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {getPendingStudents().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No payment pending students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getPendingStudents().map(allotment => (
                        <TableRow key={allotment.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(allotment.studentId)}
                              onChange={() => handleStudentSelection(allotment.studentId)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>{allotment.studentName}</TableCell>
                          <TableCell>{allotment.college}</TableCell>
                          <TableCell>₹{allotment.collegeFee.toLocaleString()}</TableCell>
                          <TableCell>₹{allotment.allottedAmount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(allotment.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{allotment.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    </TableBody>
                  </Table>
              </div>
                  
                  <div className="flex justify-end mt-4 gap-2">
                          <Button 
                            variant="outline" 
                  onClick={() => setShowPaymentDialog(true)}
                            disabled={selectedStudents.length === 0}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Update to Paid
                          </Button>
                  </div>
            </CardContent>
          </Card>
        </TabsContent>

                 <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
               <CardTitle>Payment Mapping</CardTitle>
               <CardDescription>Map donors to transactions</CardDescription>
            </CardHeader>
            <CardContent>
               {/* Amount Summary */}
               <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="text-center">
                     <p className="text-sm font-medium text-muted-foreground">Total Donor Amount</p>
                     <p className="text-2xl font-bold text-blue-600">₹{donors.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-sm font-medium text-muted-foreground">Total Transaction Amount</p>
                     <p className="text-2xl font-bold text-green-600">₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-sm font-medium text-muted-foreground">Selected Donors</p>
                     <p className="text-2xl font-bold text-purple-600">₹{getTotalSelectedDonorAmount().toLocaleString()}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-sm font-medium text-muted-foreground">Selected Transactions</p>
                     <p className="text-2xl font-bold text-orange-600">₹{getTotalSelectedTransactionAmount().toLocaleString()}</p>
                   </div>
                 </div>
                 <div className="mt-4 text-center">
                   <p className="text-sm font-medium text-muted-foreground">Remaining Amount</p>
                   <p className={`text-xl font-bold ${getRemainingAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     ₹{getRemainingAmount().toLocaleString()}
                   </p>
                 </div>
              </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div>
                   <h3 className="text-lg font-semibold mb-4">Select Donors</h3>
                   <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                           <TableHead className="w-12">
                             <input
                               type="checkbox"
                               checked={selectedDonors.length === donors.length}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setSelectedDonors(donors.map(d => d.id));
                                 } else {
                                   setSelectedDonors([]);
                                 }
                               }}
                               className="rounded"
                             />
                      </TableHead>
                           <TableHead>Donor Name</TableHead>
                           <TableHead>Unallocated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                         {donors.map(donor => (
                           <TableRow key={donor.id}>
                             <TableCell>
                               <input
                                 type="checkbox"
                                 checked={selectedDonors.includes(donor.id)}
                                 onChange={() => {
                                   setSelectedDonors(prev => 
                                     prev.includes(donor.id) 
                                       ? prev.filter(id => id !== donor.id)
                                       : [...prev, donor.id]
                                   );
                                 }}
                                 className="rounded"
                               />
                        </TableCell>
                             <TableCell>{donor.name}</TableCell>
                             <TableCell>₹{donor.unallocated.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-lg font-semibold mb-4">Select Transactions</h3>
                   <div className="overflow-x-auto">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead className="w-12">
                             <input
                               type="checkbox"
                               checked={selectedTransactions.length === getAvailableTransactions().length && getAvailableTransactions().length > 0}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setSelectedTransactions(getAvailableTransactions().map(t => t.id));
                                 } else {
                                   setSelectedTransactions([]);
                                 }
                               }}
                               className="rounded"
                             />
                           </TableHead>
                           <TableHead>Transaction ID</TableHead>
                           <TableHead>Student Name</TableHead>
                           <TableHead>Amount</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {getAvailableTransactions().length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={4} className="text-center py-8">
                               No available transactions found
                             </TableCell>
                           </TableRow>
                         ) : (
                           getAvailableTransactions().map(transaction => (
                             <TableRow key={transaction.id}>
                               <TableCell>
                                 <input
                                   type="checkbox"
                                   checked={selectedTransactions.includes(transaction.id)}
                                   onChange={() => handleTransactionSelection(transaction.id)}
                                   className="rounded"
                                 />
                               </TableCell>
                               <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                               <TableCell>{transaction.studentName}</TableCell>
                               <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                             </TableRow>
                           ))
                         )}
                       </TableBody>
                     </Table>
                   </div>
                 </div>
               </div>

               <div className="flex justify-end mt-4 gap-2">
                 <Button 
                   variant="outline" 
                   onClick={() => setShowMappingDialog(true)}
                   disabled={selectedDonors.length === 0 || selectedTransactions.length === 0}
                 >
                   <Users className="h-4 w-4 mr-2" />
                   Create Mapping
                 </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="mapped" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle>Mapped Payments</CardTitle>
               <CardDescription>View all payment mappings with detailed information</CardDescription>
             </CardHeader>
             <CardContent>
               {paymentMappings.length === 0 ? (
                 <div className="text-center py-8">
                   <p className="text-muted-foreground">No payment mappings found</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {(() => {
                     // Group mappings by mapping ID
                     const groupedMappings = paymentMappings.reduce((groups, mapping) => {
                       if (!groups[mapping.id]) {
                         groups[mapping.id] = [];
                       }
                       groups[mapping.id].push(mapping);
                       return groups;
                     }, {} as { [key: string]: PaymentMapping[] });

                     return Object.entries(groupedMappings).map(([mappingId, mappings]) => {
                       const isExpanded = expandedMappings.includes(mappingId);
                       const totalAmount = mappings.reduce((sum, m) => sum + m.amount, 0);
                       const uniqueDonors = [...new Set(mappings.map(m => m.donorName))];
                       const uniqueTransactions = [...new Set(mappings.map(m => m.transactionId))];
                       const uniqueStudents = [...new Set(mappings.map(m => m.studentName))];

                       return (
                         <div key={mappingId} className="border rounded-lg">
                           <div 
                             className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                             onClick={() => handleMappingToggle(mappingId)}
                           >
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                 <div className="flex items-center gap-2">
                                   <Badge variant="outline" className="font-mono text-xs">
                                     {mappingId}
                                   </Badge>
                                   <span className="text-sm text-muted-foreground">→</span>
                                   <Badge variant="secondary">
                                     {uniqueDonors.length} Donor{uniqueDonors.length > 1 ? 's' : ''}
                                   </Badge>
                                   <span className="text-sm text-muted-foreground">→</span>
                                   <Badge variant="secondary">
                                     {uniqueTransactions.length} Transaction{uniqueTransactions.length > 1 ? 's' : ''}
                                   </Badge>
                                 </div>
                                 <div className="text-sm text-muted-foreground">
                                   ₹{totalAmount.toLocaleString()}
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <span className="text-sm text-muted-foreground">
                                   {new Date(mappings[0].date).toLocaleDateString()}
                                 </span>
                                 <ChevronDown 
                                   className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                 />
                               </div>
                             </div>
                           </div>
                           
                           {isExpanded && (
                             <div className="border-t bg-gray-50 p-4 space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Donors Information */}
                                 <div>
                                   <h4 className="font-semibold mb-3 text-blue-600">Donors Information</h4>
                                   <div className="space-y-3">
                                     {uniqueDonors.map((donorName, index) => {
                                       const donorMappings = mappings.filter(m => m.donorName === donorName);
                                       const donorTotal = donorMappings.reduce((sum, m) => sum + m.amount, 0);
                                       const donor = donors.find(d => d.name === donorName);
                                       
                                       return (
                                         <div key={index} className="border rounded p-3 bg-white">
                                           <div className="flex justify-between items-center mb-2">
                                             <span className="font-medium">{donorName}</span>
                                             <Badge variant="outline">₹{donorTotal.toLocaleString()}</Badge>
                                           </div>
                                           <div className="text-xs text-muted-foreground space-y-1">
                                             <div>Total Amount: ₹{donor?.amount.toLocaleString() || 'N/A'}</div>
                                             <div>Allocated: ₹{donor?.allocated.toLocaleString() || 'N/A'}</div>
                                             <div>Unallocated: ₹{donor?.unallocated.toLocaleString() || 'N/A'}</div>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </div>
                                 
                                 {/* Transactions Information */}
                                 <div>
                                   <h4 className="font-semibold mb-3 text-green-600">Transactions Information</h4>
                                   <div className="space-y-3">
                                     {uniqueTransactions.map((transactionId, index) => {
                                       const transactionMappings = mappings.filter(m => m.transactionId === transactionId);
                                       const transaction = transactions.find(t => t.id === transactionId);
                                       const mapping = transactionMappings[0];
                                       
                                       return (
                                         <div key={index} className="border rounded p-3 bg-white">
                                           <div className="flex justify-between items-center mb-2">
                                             <span className="font-mono text-xs">{transactionId}</span>
                                             <Badge variant="outline">₹{mapping.amount.toLocaleString()}</Badge>
                                           </div>
                                           <div className="text-xs text-muted-foreground space-y-1">
                                             <div>Student: {mapping.studentName}</div>
                                             <div>College: {mapping.college}</div>
                                             <div>Status: {transaction?.status || 'completed'}</div>
                                             <div>Date: {new Date(mapping.date).toLocaleDateString()}</div>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </div>
                               </div>
                               
                               {/* Payment Summary */}
                               <div className="border-t pt-4">
                                 <h4 className="font-semibold mb-3 text-purple-600">Payment Summary</h4>
                                 <div className="bg-white p-3 rounded border">
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="text-center">
                                       <p className="text-xs text-muted-foreground">Total Donors</p>
                                       <p className="text-lg font-bold text-blue-600">{uniqueDonors.length}</p>
                                     </div>
                                     <div className="text-center">
                                       <p className="text-xs text-muted-foreground">Total Transactions</p>
                                       <p className="text-lg font-bold text-green-600">{uniqueTransactions.length}</p>
                                     </div>
                                     <div className="text-center">
                                       <p className="text-xs text-muted-foreground">Total Amount</p>
                                       <p className="text-lg font-bold text-purple-600">₹{totalAmount.toLocaleString()}</p>
                                     </div>
                                   </div>
                                   <div className="text-xs text-muted-foreground mt-2 text-center">
                                     Mapped on {new Date(mappings[0].date).toLocaleDateString()} at {new Date(mappings[0].date).toLocaleTimeString()}
                                   </div>
                                 </div>
                               </div>
                             </div>
                           )}
                         </div>
                       );
                     });
                   })()}
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showAllotmentDialog} onOpenChange={setShowAllotmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment Allotment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You are about to allot payment to {selectedStudents.length} students.</p>
            <div className="border rounded p-4 space-y-2">
              <h4 className="font-semibold">Selected Students:</h4>
              {selectedStudents.map(studentId => {
                const student = students.find(s => s.id === studentId);
                const amount = studentAmounts[studentId] !== undefined && studentAmounts[studentId] !== '' ? studentAmounts[studentId] : (student?.lastAllottedAmount || 0);
                return (
                  <p key={studentId} className="text-sm">
                    {student?.name} - ₹{amount.toLocaleString()}
                  </p>
                );
              })}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAllotmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAllotPayment}>
                Confirm Allotment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You are about to update {selectedStudents.length} students to paid status.</p>
            <div className="border rounded p-4 space-y-2">
              <h4 className="font-semibold">Selected Students:</h4>
              {selectedStudents.map(studentId => {
                const allotment = getPendingStudents().find(s => s.studentId === studentId);
                return (
                  <p key={studentId} className="text-sm">
                    {allotment?.studentName} - ₹{allotment?.allottedAmount.toLocaleString()}
                  </p>
                );
              })}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateToPaid}>
                Confirm Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

             <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Confirm Payment Mapping</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <p>You are about to create payment mapping for {selectedDonors.length} donors and {selectedTransactions.length} transactions.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
               <div className="text-center">
                 <p className="text-sm font-medium text-muted-foreground">Total Donor Amount</p>
                 <p className="text-xl font-bold text-blue-600">₹{getTotalSelectedDonorAmount().toLocaleString()}</p>
               </div>
               <div className="text-center">
                 <p className="text-sm font-medium text-muted-foreground">Selected Transactions</p>
                 <p className="text-xl font-bold text-green-600">₹{getTotalSelectedTransactionAmount().toLocaleString()}</p>
               </div>
               <div className="text-center">
                 <p className="text-sm font-medium text-muted-foreground">Remaining Amount</p>
                 <p className={`text-xl font-bold ${getRemainingAmount() >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                   ₹{getRemainingAmount().toLocaleString()}
                 </p>
               </div>
             </div>

            <div className="border rounded p-4 space-y-2">
              <h4 className="font-semibold">Selected Donors:</h4>
              {selectedDonors.map(donorId => {
                const donor = donors.find(d => d.id === donorId);
                 return (
                   <p key={donorId} className="text-sm">
                     {donor?.name} - ₹{donor?.unallocated.toLocaleString()}
                   </p>
                 );
              })}
            </div>

             <div className="border rounded p-4 space-y-2">
               <h4 className="font-semibold">Selected Transactions:</h4>
               {selectedTransactions.map(transactionId => {
                 const transaction = transactions.find(t => t.id === transactionId);
                 return (
                   <p key={transactionId} className="text-sm">
                     {transaction?.studentName} - ₹{transaction?.amount.toLocaleString()} ({transactionId})
                   </p>
                 );
               })}
             </div>

            <div className="flex justify-end space-x-2">
               <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
                 Cancel
               </Button>
               <Button onClick={handlePaymentMapping}>
                 Confirm Mapping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}