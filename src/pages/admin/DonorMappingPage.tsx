import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, CheckCircle, Loader2, DollarSign, Users, ArrowUpDown, Search, Filter, AlertTriangle, Edit, CreditCard as PaymentIcon } from "lucide-react";

// Mock data matching the structure from AdminDonors
const mockDonorMappings = [
  {
    donorId: "DON001",
    donorName: "John Doe",
    occupation: "Businessman",
    totalDonated: 100000,
    lastDonation: "2024-01-10",
    donationType: "Monthly",
    autoDebit: true,
    activeStudents: 2,
    isBlocked: false,
    email: "john.doe@email.com",
    phone: "+91-9876543210",
    studentMappings: [
      {
        studentId: "STU001",
        studentName: "Rahul Kumar",
        college: "Mumbai University",
        amount: 35000,
        mappingDate: "2024-01-15",
        status: "Active"
      },
      {
        studentId: "STU002",
        studentName: "Priya Sharma",
        college: "Delhi College",
        amount: 25000,
        mappingDate: "2024-01-20",
        status: "Active"
      }
    ],
    donationHistory: [
      { date: "2024-01-10", amount: 25000, type: "Monthly" },
      { date: "2023-12-10", amount: 25000, type: "Monthly" },
      { date: "2023-11-10", amount: 25000, type: "Monthly" },
      { date: "2023-10-10", amount: 25000, type: "Monthly" }
    ]
  },
  {
    donorId: "DON002",
    donorName: "Sarah Wilson",
    occupation: "Doctor",
    totalDonated: 50000,
    lastDonation: "2024-01-05",
    donationType: "Quarterly",
    autoDebit: false,
    activeStudents: 1,
    isBlocked: false,
    email: "sarah.wilson@email.com",
    phone: "+91-9876543211",
    studentMappings: [
      {
        studentId: "STU003",
        studentName: "Amit Patel",
        college: "Bangalore Institute",
        amount: 50000,
        mappingDate: "2024-01-10",
        status: "Active"
      }
    ],
    donationHistory: [
      { date: "2024-01-05", amount: 50000, type: "Quarterly" },
      { date: "2023-10-05", amount: 50000, type: "Quarterly" }
    ]
  },
  {
    donorId: "DON003",
    donorName: "Amit Patel",
    occupation: "Engineer",
    totalDonated: 75000,
    lastDonation: "2024-02-12",
    donationType: "One-Time",
    autoDebit: false,
    activeStudents: 0,
    isBlocked: true,
    email: "amit.patel@email.com",
    phone: "+91-9876543212",
    studentMappings: [],
    donationHistory: [
      { date: "2024-02-12", amount: 75000, type: "One-Time" }
    ]
  },
  {
    donorId: "DON004",
    donorName: "Priya Sharma",
    occupation: "Teacher",
    totalDonated: 120000,
    lastDonation: "2024-03-01",
    donationType: "Monthly",
    autoDebit: true,
    activeStudents: 3,
    isBlocked: false,
    email: "priya.sharma@email.com",
    phone: "+91-9876543213",
    studentMappings: [
      {
        studentId: "STU004",
        studentName: "Neha Gupta",
        college: "Chennai University",
        amount: 40000,
        mappingDate: "2024-02-01",
        status: "Active"
      },
      {
        studentId: "STU005",
        studentName: "Vikram Singh",
        college: "Pune College",
        amount: 30000,
        mappingDate: "2024-02-15",
        status: "Active"
      },
      {
        studentId: "STU006",
        studentName: "Meera Das",
        college: "Hyderabad Institute",
        amount: 50000,
        mappingDate: "2024-03-01",
        status: "Active"
      }
    ],
    donationHistory: [
      { date: "2024-03-01", amount: 40000, type: "Monthly" },
      { date: "2024-02-01", amount: 40000, type: "Monthly" },
      { date: "2024-01-01", amount: 40000, type: "Monthly" }
    ]
  },
  {
    donorId: "DON005",
    donorName: "Vikram Singh",
    occupation: "Lawyer",
    totalDonated: 30000,
    lastDonation: "2024-01-20",
    donationType: "Quarterly",
    autoDebit: false,
    activeStudents: 1,
    isBlocked: false,
    email: "vikram.singh@email.com",
    phone: "+91-9876543214",
    studentMappings: [
      {
        studentId: "STU007",
        studentName: "Rohit Sinha",
        college: "Kolkata University",
        amount: 30000,
        mappingDate: "2024-01-25",
        status: "Active"
      }
    ],
    donationHistory: [
      { date: "2024-01-20", amount: 30000, type: "Quarterly" }
    ]
  }
];

const mockTransactions = [
  { id: "TXN-001", studentId: "STU001", studentName: "Rahul Kumar", college: "Mumbai University", amount: 15000, date: "2024-01-15", status: 'completed' },
  { id: "TXN-002", studentId: "STU002", studentName: "Priya Sharma", college: "Delhi College", amount: 12000, date: "2024-01-20", status: 'completed' },
  { id: "TXN-003", studentId: "STU003", studentName: "Amit Patel", college: "Bangalore Institute", amount: 18000, date: "2024-02-01", status: 'completed' },
  { id: "TXN-004", studentId: "STU004", studentName: "Sneha Gupta", college: "Chennai University", amount: 14000, date: "2024-02-05", status: 'completed' },
  { id: "TXN-005", studentId: "STU005", studentName: "Kavya Reddy", college: "Hyderabad University", amount: 16000, date: "2024-02-10", status: 'completed' },
  { id: "TXN-006", studentId: "STU006", studentName: "Vikram Singh", college: "Pune Institute", amount: 1300, date: "2024-02-15", status: 'completed' },
  { id: "TXN-007", studentId: "STU007", studentName: "Meera Das", college: "Kolkata University", amount: 1700, date: "2024-02-20", status: 'completed' },
  { id: "TXN-008", studentId: "STU008", studentName: "Arjun Reddy", college: "Ahmedabad Institute", amount: 1500, date: "2024-02-25", status: 'completed' },
  { id: "TXN-009", studentId: "STU009", studentName: "Pooja Sharma", college: "Jaipur College", amount: 1400, date: "2024-03-01", status: 'completed' },
];

const mockPaymentMappings = [
  { id: "MAP001", donorId: "DON001", donorName: "Rajesh Kumar", transactionId: "TXN-001", studentId: "STU001", studentName: "Rahul Kumar", college: "Mumbai University", amount: 35000, date: "2024-01-15" },
];

export default function DonorMappingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedDonors = location.state?.selectedDonors || [];
  
  const [donors, setDonors] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>(mockTransactions);
  const [paymentMappings, setPaymentMappings] = useState<any[]>(mockPaymentMappings);
  const [selectedDonorIds, setSelectedDonorIds] = useState<string[]>(selectedDonors);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [donorAmounts, setDonorAmounts] = useState<{[key: string]: number}>({});
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  // Filtering and sorting states
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionSortBy, setTransactionSortBy] = useState<keyof any>("studentName");
  const [transactionSortDir, setTransactionSortDir] = useState<"asc" | "desc">("asc");

  // Calculate unallocated amount for a donor (same as AdminDonors)
  const getUnallocatedAmount = (donor: any) => {
    const totalAllocated = donor.studentMappings.reduce((sum: number, mapping: any) => sum + mapping.amount, 0);
    return donor.totalDonated - totalAllocated;
  };

  useEffect(() => {
    if (selectedDonorIds.length === 0) {
      navigate('/admin/donors');
      return;
    }
    
    // Restore selected transactions if returning from donors page
    if (location.state?.selectedTransactions && location.state.selectedTransactions.length > 0) {
      setSelectedTransactions(location.state.selectedTransactions);
    }
    
    loadDonorsAndTransactions();
  }, [selectedDonorIds, location.state]);

  const loadDonorsAndTransactions = async () => {
    setLoading(true);
    
    try {
      // Filter donors to only show selected donors from the donors page
      const selectedDonorsData = mockDonorMappings.filter(donor => selectedDonorIds.includes(donor.donorId));
      setDonors(selectedDonorsData);
      
      // Get unmapped transactions (transactions not in payment mappings)
      const mappedTransactionIds = paymentMappings.map(mapping => mapping.transactionId);
      const unmappedTransactions = transactions.filter(transaction => 
        !mappedTransactionIds.includes(transaction.id)
      );
      setTransactions(unmappedTransactions);
      
      // Initialize donor amounts with their unallocated amounts (all unallocated is available)
      const initialAmounts: {[key: string]: number} = {};
      selectedDonorsData.forEach(donor => {
        initialAmounts[donor.donorId] = getUnallocatedAmount(donor);
      });
      setDonorAmounts(initialAmounts);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSelection = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, transactionId]);
    } else {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
    }
  };

  const toggleSelectAllTransactions = () => {
    const filteredTransactions = getFilteredAndSortedTransactions();
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  const handleMapping = async () => {
    setProcessing(true);
    
    try {
      const newMappings: any[] = [];
      const selectedTransactionsData = getFilteredAndSortedTransactions().filter(transaction => 
        selectedTransactions.includes(transaction.id)
      );
      
      // Create a copy of donor amounts to track changes
      const updatedDonorAmounts = { ...donorAmounts };
      
      // Sort donors by unallocated amount (highest first) to prioritize using donors with more funds
      const sortedDonors = [...donors].sort((a, b) => 
        (updatedDonorAmounts[b.donorId] || 0) - (updatedDonorAmounts[a.donorId] || 0)
      );
      
      // Map selected transactions to donors
      for (const transaction of selectedTransactionsData) {
        // Find a donor with sufficient unallocated amount (prioritize highest unallocated)
        const availableDonor = sortedDonors.find(donor => 
          (updatedDonorAmounts[donor.donorId] || 0) >= transaction.amount
        );

        if (availableDonor) {
          const mapping: any = {
            id: `MAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            donorId: availableDonor.donorId,
            donorName: availableDonor.donorName,
            transactionId: transaction.id,
            studentId: transaction.studentId,
            studentName: transaction.studentName,
            college: transaction.college,
            amount: transaction.amount,
            date: new Date().toISOString().split('T')[0]
          };
          
          newMappings.push(mapping);
          
          // Update donor amounts in our tracking object
          updatedDonorAmounts[availableDonor.donorId] = updatedDonorAmounts[availableDonor.donorId] - transaction.amount;
        }
      }

      // Handle surplus amount - return it to the donor with the highest remaining unallocated amount
      const totalUsed = selectedTransactionsData.reduce((sum, transaction) => sum + transaction.amount, 0);
      const totalAvailable = Object.values(donorAmounts).reduce((sum, amount) => sum + amount, 0);
      const surplus = totalAvailable - totalUsed;
      
      if (surplus > 0) {
        // Find the donor with the highest remaining unallocated amount
        const donorWithHighestRemaining = Object.entries(updatedDonorAmounts)
          .sort(([,a], [,b]) => b - a)[0];
        
        if (donorWithHighestRemaining) {
          const [donorId, currentAmount] = donorWithHighestRemaining;
          updatedDonorAmounts[donorId] = currentAmount + surplus;
        }
      }

      // Update the donor amounts state with the final amounts
      setDonorAmounts(updatedDonorAmounts);
      
      // Update the donors data to reflect the new unallocated amounts
      const updatedDonors = donors.map(donor => ({
        ...donor,
        unallocated: updatedDonorAmounts[donor.donorId] || 0
      }));
      setDonors(updatedDonors);

      setPaymentMappings(prev => [...prev, ...newMappings]);
      setProcessing(false);
      setShowConfirmDialog(false);
      setSelectedTransactions([]);
      
    } catch (error) {
      console.error('Failed to create mappings:', error);
      setProcessing(false);
    }
  };

  const getTotalUnallocatedAmount = () => {
    // This should match the total unallocated amount of ALL donors from the donors page
    return mockDonorMappings.reduce((sum, donor) => sum + getUnallocatedAmount(donor), 0);
  };

  const getMappingAmount = () => {
    // This should match the cumulative amount from selected donors on the donors page
    return donors.reduce((sum, donor) => sum + getUnallocatedAmount(donor), 0);
  };

  const getUnmappedTransactions = () => {
    const mappedTransactionIds = paymentMappings.map(mapping => mapping.transactionId);
    return transactions.filter(transaction => 
      !mappedTransactionIds.includes(transaction.id)
    );
  };

  const getTotalTransactions = () => {
    return getUnmappedTransactions().length;
  };

  const getTotalUnmappedAmount = () => {
    // This should match the total unmapped transaction amount from the donors page
    // Using the same mock value as AdminDonors page
    return 65900; // Mock value for all unmapped transactions
  };

  const getSelectedTransactionsAmount = () => {
    const selectedTransactionsData = getFilteredAndSortedTransactions().filter(transaction => 
      selectedTransactions.includes(transaction.id)
    );
    return selectedTransactionsData.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const canMapTransactions = () => {
    const mappingAmount = getMappingAmount();
    const totalSelected = getSelectedTransactionsAmount();
    return mappingAmount >= totalSelected;
  };

  // Filter and sort transactions
  const getFilteredAndSortedTransactions = () => {
    const filtered = getUnmappedTransactions().filter(transaction => 
      transaction.studentName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      transaction.studentId.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      transaction.college.toLowerCase().includes(transactionSearch.toLowerCase())
    );

    if (transactionSortBy) {
    filtered.sort((a, b) => {
      const aValue = a[transactionSortBy];
      const bValue = b[transactionSortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return transactionSortDir === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return transactionSortDir === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
    } else {
      // Default sorting by amount (highest to lowest)
      filtered.sort((a, b) => b.amount - a.amount);
    }

    return filtered;
  };

  const handleSort = (field: string) => {
      if (transactionSortBy === field) {
        setTransactionSortDir(transactionSortDir === 'asc' ? 'desc' : 'asc');
      } else {
      setTransactionSortBy(field as keyof any);
        setTransactionSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="main-content-container">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading donor mapping data...</span>
          </div>
        </div>
      </div>
    );
  }

  const filteredTransactions = getFilteredAndSortedTransactions();

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Donor Payment Mapping</h2>
        <div className="flex items-center gap-4">
          <div className="bg-green-100 border border-green-200 rounded-lg px-4 py-2">
            <div className="text-sm text-green-700">Unallocated Amount</div>
            <div className="text-xl font-bold text-green-800">₹{getTotalUnallocatedAmount().toLocaleString()}</div>
        </div>
          <div className="bg-purple-100 border border-purple-200 rounded-lg px-4 py-2">
            <div className="text-sm text-purple-700">All Transaction Amount</div>
            <div className="text-xl font-bold text-purple-800">₹{getTotalUnmappedAmount().toLocaleString()}</div>
          </div>
        </div>
             </div>

       {/* Insufficient Funds Warning */}
      {selectedTransactions.length > 0 && getSelectedTransactionsAmount() > getMappingAmount() && (
         <Card className="mb-6 border-red-200 bg-red-50">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="flex-shrink-0">
                 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                   <DollarSign className="h-5 w-5 text-red-600" />
                 </div>
               </div>
               <div className="flex-1">
                 <h3 className="text-lg font-semibold text-red-800">Insufficient Funds</h3>
                 <p className="text-red-700">
                  Selected transactions (₹{getSelectedTransactionsAmount().toLocaleString()}) exceed available mapping amount (₹{getMappingAmount().toLocaleString()}). 
                  Please select fewer transactions or go back and select more donors.
                 </p>
                 <div className="mt-2">
                   <Button 
                     variant="outline" 
                     onClick={() => navigate('/admin/donors', { state: { selectedDonors: selectedDonorIds } })}
                     className="border-red-300 text-red-700 hover:bg-red-100"
                   >
                     ← Back to Donors
                   </Button>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       )}

      {/* Unmapped Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Unmapped Transactions ({filteredTransactions.length})
          </CardTitle>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-2">
                <div className="text-sm text-blue-700">Mapping Amount</div>
                <div className="text-lg font-bold text-blue-800">₹{getMappingAmount().toLocaleString()}</div>
              </div>
              <div className={`px-4 py-2 rounded-lg border ${
                getSelectedTransactionsAmount() < getMappingAmount() 
                  ? 'bg-green-100 border-green-200' 
                  : getSelectedTransactionsAmount() === getMappingAmount()
                  ? 'bg-blue-100 border-blue-200'
                  : 'bg-red-100 border-red-200'
              }`}>
                <div className="text-sm text-gray-700">Transaction Amount</div>
                <div className={`text-lg font-bold ${
                  getSelectedTransactionsAmount() < getMappingAmount() 
                    ? 'text-green-800' 
                    : getSelectedTransactionsAmount() === getMappingAmount()
                    ? 'text-blue-800'
                    : 'text-red-800'
                }`}>
                  ₹{getSelectedTransactionsAmount().toLocaleString()}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/donors', { 
                  state: { 
                    selectedDonors: selectedDonorIds,
                    selectedTransactions: selectedTransactions,
                    returnToMapping: true
                  } 
                })}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 font-semibold text-sm"
              >
                <Edit className="h-5 w-5" />
                <span>Edit Donors</span>
              </Button>
              <Button 
                variant="default" 
                onClick={() => setShowConfirmDialog(true)}
                disabled={processing || selectedTransactions.length === 0 || getSelectedTransactionsAmount() > getMappingAmount()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 font-semibold text-sm"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PaymentIcon className="h-4 w-4 mr-2" />
                    Map Payments
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={toggleSelectAllTransactions}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('id')}
                      className="flex items-center justify-center gap-1 w-full"
                    >
                      Transaction ID
                      {transactionSortBy === 'id' && (
                      <ArrowUpDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('studentId')}
                      className="flex items-center justify-center gap-1 w-full"
                    >
                      Student ID
                      {transactionSortBy === 'studentId' && (
                      <ArrowUpDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('studentName')}
                      className="flex items-center justify-center gap-1 w-full"
                    >
                      Student Name
                      {transactionSortBy === 'studentName' && (
                      <ArrowUpDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('college')}
                      className="flex items-center justify-center gap-1 w-full"
                    >
                      College
                      {transactionSortBy === 'college' && (
                      <ArrowUpDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('amount')}
                      className="flex items-center justify-center gap-1 w-full"
                    >
                      Amount
                      {transactionSortBy === 'amount' && (
                      <ArrowUpDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('date')}
                      className="flex items-center justify-center gap-1 w-full"
                    >
                      Date
                      {transactionSortBy === 'date' && (
                      <ArrowUpDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(transaction => (
                  <TableRow 
                    key={transaction.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      // Don't trigger selection if clicking on checkbox
                      const target = e.target as HTMLElement;
                      if (!target.closest('td:first-child')) {
                        const isSelected = selectedTransactions.includes(transaction.id);
                        handleTransactionSelection(transaction.id, !isSelected);
                      }
                    }}
                  >
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={(e) => handleTransactionSelection(transaction.id, e.target.checked)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-center">{transaction.id}</TableCell>
                    <TableCell className="font-mono text-sm text-center">{transaction.studentId}</TableCell>
                    <TableCell className="font-semibold text-center">{transaction.studentName}</TableCell>
                    <TableCell className="text-center">{transaction.college}</TableCell>
                    <TableCell className="text-center">₹{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{transaction.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

             {/* Confirmation Dialog */}
       <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <AlertTriangle className="h-5 w-5 text-blue-600" />
               Confirm Payment Mapping
             </DialogTitle>
           </DialogHeader>
           
           <div className="space-y-6">
             {/* Summary Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Card className="border-blue-200 bg-blue-50">
                 <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-blue-700">Selected Transactions</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-blue-700">₹{getSelectedTransactionsAmount().toLocaleString()}</div>
                  <div className="text-xs text-blue-600">{selectedTransactions.length} Transactions</div>
                 </CardContent>
               </Card>

               <Card className="border-green-200 bg-green-50">
                 <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-green-700">Available Amount</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-green-700">₹{getMappingAmount().toLocaleString()}</div>
                  <div className="text-xs text-green-600">{donors.length} Donors</div>
                 </CardContent>
               </Card>

              <Card className={`${
                getSelectedTransactionsAmount() < getMappingAmount() 
                  ? 'border-green-200 bg-green-50' 
                  : getSelectedTransactionsAmount() === getMappingAmount()
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-red-200 bg-red-50'
              }`}>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-xs font-medium">Status</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-0">
                  <div className={`text-2xl font-bold ${
                    getSelectedTransactionsAmount() < getMappingAmount() 
                      ? 'text-green-700' 
                      : getSelectedTransactionsAmount() === getMappingAmount()
                      ? 'text-blue-700'
                      : 'text-red-700'
                  }`}>
                    {getSelectedTransactionsAmount() < getMappingAmount() 
                      ? 'Sufficient' 
                      : getSelectedTransactionsAmount() === getMappingAmount()
                      ? 'Exact Match'
                      : 'Insufficient'
                    }
                   </div>
                   <div className="text-xs text-muted-foreground">
                    {getSelectedTransactionsAmount() < getMappingAmount() 
                      ? `Surplus: ₹${(getMappingAmount() - getSelectedTransactionsAmount()).toLocaleString()}`
                      : getSelectedTransactionsAmount() === getMappingAmount()
                      ? 'Perfect Match'
                      : `Shortfall: ₹${(getSelectedTransactionsAmount() - getMappingAmount()).toLocaleString()}`
                     }
                   </div>
                 </CardContent>
               </Card>
             </div>

             {/* Selected Donors */}
             <div>
               <h3 className="text-lg font-semibold mb-3 text-green-700">Selected Donors</h3>
               <div className="max-h-48 overflow-y-auto border rounded-md">
                 <Table>
                   <TableHeader className="sticky top-0 bg-background z-10">
                     <TableRow>
                       <TableHead>Donor ID</TableHead>
                       <TableHead>Name</TableHead>
                       <TableHead>Total Donated</TableHead>
                       <TableHead>Allocated</TableHead>
                       <TableHead>Unallocated Amount</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                    {donors.map(donor => (
                      <TableRow key={donor.donorId} className={donor.isBlocked ? "bg-red-50" : ""}>
                        <TableCell className="font-medium">{donor.donorId}</TableCell>
                        <TableCell>{donor.donorName}</TableCell>
                        <TableCell>₹{donor.totalDonated.toLocaleString()}</TableCell>
                        <TableCell>₹{donor.studentMappings.reduce((sum: number, mapping: any) => sum + mapping.amount, 0).toLocaleString()}</TableCell>
                        <TableCell>₹{getUnallocatedAmount(donor).toLocaleString()}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
             </div>

             {/* Selected Transactions */}
             <div>
               <h3 className="text-lg font-semibold mb-3 text-blue-700">Selected Transactions</h3>
               <div className="max-h-48 overflow-y-auto border rounded-md">
                 <Table>
                   <TableHeader className="sticky top-0 bg-background z-10">
                     <TableRow>
                       <TableHead>Transaction ID</TableHead>
                       <TableHead>Student</TableHead>
                       <TableHead>College</TableHead>
                       <TableHead>Amount</TableHead>
                       <TableHead>Date</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                    {filteredTransactions.filter(transaction => selectedTransactions.includes(transaction.id)).map(transaction => (
                       <TableRow key={transaction.id}>
                         <TableCell className="font-medium">{transaction.id}</TableCell>
                         <TableCell>
                           <div>{transaction.studentName}</div>
                           <div className="text-sm text-muted-foreground">{transaction.studentId}</div>
                         </TableCell>
                         <TableCell>{transaction.college}</TableCell>
                         <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                         <TableCell>{transaction.date}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
             </div>

             {/* Warning Message */}
             <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
               <div className="flex items-start gap-3">
                 <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                 <div className="text-sm text-yellow-800">
                   <div className="font-medium mb-1">Important:</div>
                   <ul className="space-y-1 text-xs">
                    <li>• This action will map all selected transactions to the available donors</li>
                     <li>• The donor amounts will be allocated to cover the transaction amounts</li>
                     <li>• This action cannot be undone once confirmed</li>
                    {getSelectedTransactionsAmount() < getMappingAmount() && (
                       <li className="text-green-600 font-medium">
                        • Surplus amount (₹{(getMappingAmount() - getSelectedTransactionsAmount()).toLocaleString()}) will be returned to the donor with the highest remaining unallocated amount
                      </li>
                    )}
                    {getSelectedTransactionsAmount() === getMappingAmount() && (
                      <li className="text-blue-600 font-medium">
                        • Perfect match - all mapping amount will be used
                       </li>
                     )}
                    {getSelectedTransactionsAmount() > getMappingAmount() && (
                      <li className="text-red-600 font-medium">• Warning: Insufficient mapping amount - some transactions may not be fully covered</li>
                     )}
                   </ul>
                 </div>
               </div>
             </div>
           </div>

           <div className="flex justify-end gap-3 mt-6">
             <Button 
               variant="outline" 
               onClick={() => setShowConfirmDialog(false)}
               disabled={processing}
             >
               Cancel
             </Button>
             <Button 
               variant="default" 
               onClick={handleMapping}
              disabled={processing || getSelectedTransactionsAmount() > getMappingAmount()}
               className="bg-blue-600 hover:bg-blue-700"
             >
               {processing ? (
                 <>
                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                   Processing...
                 </>
               ) : (
                 <>
                   <CheckCircle className="h-4 w-4 mr-2" />
                   Confirm Mapping
                 </>
               )}
             </Button>
           </div>
         </DialogContent>
       </Dialog>
    </div>
  );
} 