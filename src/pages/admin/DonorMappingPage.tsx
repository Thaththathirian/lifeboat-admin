import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, CheckCircle, Loader2, DollarSign, Users, MapPin, ArrowUpDown, Search, Filter, AlertTriangle } from "lucide-react";
import { Donor, Transaction, PaymentMapping } from "@/types/student";

// Mock data for demonstration
const mockDonors: Donor[] = [
  { id: "DON001", name: "Rajesh Kumar", amount: 100000, allocated: 50000, unallocated: 50000 },
  { id: "DON002", name: "Priya Sharma", amount: 75000, allocated: 25000, unallocated: 50000 },
  { id: "DON003", name: "Amit Patel", amount: 120000, allocated: 80000, unallocated: 40000 },
  { id: "DON004", name: "Vikram Singh", amount: 150000, allocated: 100000, unallocated: 50000 },
  { id: "DON005", name: "Neha Gupta", amount: 80000, allocated: 30000, unallocated: 50000 },
  { id: "DON006", name: "Suresh Kumar", amount: 200000, allocated: 150000, unallocated: 50000 },
];

const mockTransactions: Transaction[] = [
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

const mockPaymentMappings: PaymentMapping[] = [
  { id: "MAP001", donorId: "DON001", donorName: "Rajesh Kumar", transactionId: "TXN-001", studentId: "STU001", studentName: "Rahul Kumar", college: "Mumbai University", amount: 35000, date: "2024-01-15" },
];

export default function DonorMappingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedDonors = location.state?.selectedDonors || [];
  
  const [donors, setDonors] = useState<Donor[]>(mockDonors);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [paymentMappings, setPaymentMappings] = useState<PaymentMapping[]>(mockPaymentMappings);
  const [selectedDonorIds, setSelectedDonorIds] = useState<string[]>(selectedDonors);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [donorAmounts, setDonorAmounts] = useState<{[key: string]: number}>({});

  // Filtering and sorting states
  const [donorSearch, setDonorSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [donorSortBy, setDonorSortBy] = useState<keyof Donor>("name");
  const [transactionSortBy, setTransactionSortBy] = useState<keyof Transaction>("studentName");
  const [donorSortDir, setDonorSortDir] = useState<"asc" | "desc">("asc");
  const [transactionSortDir, setTransactionSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (selectedDonorIds.length === 0) {
      navigate('/admin/donors');
      return;
    }
    loadDonorsAndTransactions();
  }, [selectedDonorIds]);

  const loadDonorsAndTransactions = async () => {
    setLoading(true);
    
    try {
      // Filter donors to only show selected donors from the donors page
      const selectedDonorsData = mockDonors.filter(donor => selectedDonorIds.includes(donor.id));
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
        initialAmounts[donor.id] = donor.unallocated;
      });
      setDonorAmounts(initialAmounts);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove the handleDonorAmountChange function since we don't need editable amounts

  const handleMapping = async () => {
    setProcessing(true);
    
    try {
      const newMappings: PaymentMapping[] = [];
      const unmappedTransactions = getUnmappedTransactions();
      
      // Create a copy of donor amounts to track changes
      const updatedDonorAmounts = { ...donorAmounts };
      
      // Sort donors by unallocated amount (highest first) to prioritize using donors with more funds
      const sortedDonors = [...donors].sort((a, b) => 
        (updatedDonorAmounts[b.id] || 0) - (updatedDonorAmounts[a.id] || 0)
      );
      
      // Map all unmapped transactions to donors
      for (const transaction of unmappedTransactions) {
        // Find a donor with sufficient unallocated amount (prioritize highest unallocated)
        const availableDonor = sortedDonors.find(donor => 
          (updatedDonorAmounts[donor.id] || 0) >= transaction.amount
        );

        if (availableDonor) {
          const mapping: PaymentMapping = {
            id: `MAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            donorId: availableDonor.id,
            donorName: availableDonor.name,
            transactionId: transaction.id,
            studentId: transaction.studentId,
            studentName: transaction.studentName,
            college: transaction.college,
            amount: transaction.amount,
            date: new Date().toISOString().split('T')[0]
          };
          
          newMappings.push(mapping);
          
          // Update donor amounts in our tracking object
          updatedDonorAmounts[availableDonor.id] = updatedDonorAmounts[availableDonor.id] - transaction.amount;
        }
      }

      // Handle surplus amount - return it to the donor with the highest remaining unallocated amount
      const totalUsed = unmappedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
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
        unallocated: updatedDonorAmounts[donor.id] || 0
      }));
      setDonors(updatedDonors);

      setPaymentMappings(prev => [...prev, ...newMappings]);
      setProcessing(false);
      setShowConfirmDialog(false);
      
    } catch (error) {
      console.error('Failed to create mappings:', error);
      setProcessing(false);
    }
  };

  const getTotalUnallocatedAmount = () => {
    return Object.values(donorAmounts).reduce((sum, amount) => sum + amount, 0);
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
    return getUnmappedTransactions().reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const canMapTransactions = () => {
    const totalUnallocated = getTotalUnallocatedAmount();
    const totalUnmapped = getTotalUnmappedAmount();
    return totalUnallocated >= totalUnmapped;
  };

  // Filter and sort donors
  const getFilteredAndSortedDonors = () => {
    const filtered = donors.filter(donor => 
      donor.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
      donor.id.toLowerCase().includes(donorSearch.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[donorSortBy];
      const bValue = b[donorSortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return donorSortDir === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return donorSortDir === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  };

  // Filter and sort transactions
  const getFilteredAndSortedTransactions = () => {
    const filtered = getUnmappedTransactions().filter(transaction => 
      transaction.studentName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      transaction.studentId.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      transaction.college.toLowerCase().includes(transactionSearch.toLowerCase())
    );

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

    return filtered;
  };

  const handleSort = (type: 'donor' | 'transaction', field: string) => {
    if (type === 'donor') {
      if (donorSortBy === field) {
        setDonorSortDir(donorSortDir === 'asc' ? 'desc' : 'asc');
      } else {
        setDonorSortBy(field as keyof Donor);
        setDonorSortDir('asc');
      }
    } else {
      if (transactionSortBy === field) {
        setTransactionSortDir(transactionSortDir === 'asc' ? 'desc' : 'asc');
      } else {
        setTransactionSortBy(field as keyof Transaction);
        setTransactionSortDir('asc');
      }
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

  const filteredDonors = getFilteredAndSortedDonors();
  const filteredTransactions = getFilteredAndSortedTransactions();

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/donors', { state: { selectedDonors: selectedDonorIds } })}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Donors
          </Button>
          <h2 className="text-2xl font-bold">Donor Payment Mapping</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Unallocated</div>
            <div className="text-2xl font-bold text-blue-600">₹{getTotalUnallocatedAmount().toLocaleString()}</div>
          </div>
                     <Button 
             variant="default" 
             onClick={() => setShowConfirmDialog(true)}
             disabled={processing || getTotalTransactions() === 0 || !canMapTransactions()}
             className="bg-blue-600 hover:bg-blue-700"
           >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Map All Transactions
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredDonors.length}</div>
              <div className="text-sm text-gray-600">Selected Donors</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getTotalTransactions()}</div>
              <div className="text-sm text-gray-600">Unmapped Transactions</div>
            </div>
          </CardContent>
        </Card>
                 <Card>
           <CardContent className="p-4">
             <div className="text-center">
               <div className={`text-2xl font-bold ${canMapTransactions() ? 'text-purple-600' : 'text-red-600'}`}>
                 ₹{getTotalUnmappedAmount().toLocaleString()}
               </div>
               <div className="text-sm text-gray-600">Total Transaction Amount</div>
               {!canMapTransactions() && (
                 <div className="text-xs text-red-600 mt-1">
                   Insufficient funds
                 </div>
               )}
             </div>
           </CardContent>
         </Card>
             </div>

       {/* Insufficient Funds Warning */}
       {!canMapTransactions() && getTotalTransactions() > 0 && (
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
                   Total unmapped transactions (₹{getTotalUnmappedAmount().toLocaleString()}) exceed available unallocated amount (₹{getTotalUnallocatedAmount().toLocaleString()}). 
                   Please go back and select more donors to proceed with mapping.
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

       {/* Selected Donors Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selected Donors ({filteredDonors.length})
          </CardTitle>
          <CardDescription>
            Review donor information and available amounts for mapping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search donors..."
                value={donorSearch}
                onChange={(e) => setDonorSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('donor', 'id')}
                      className="flex items-center gap-1"
                    >
                      Donor ID
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('donor', 'name')}
                      className="flex items-center gap-1"
                    >
                      Name
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('donor', 'amount')}
                      className="flex items-center gap-1"
                    >
                      Total Donated
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                                     <TableHead>
                     <Button
                       variant="ghost"
                       onClick={() => handleSort('donor', 'allocated')}
                       className="flex items-center gap-1"
                     >
                       Allocated
                       <ArrowUpDown className="h-4 w-4" />
                     </Button>
                   </TableHead>
                                       <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('donor', 'unallocated')}
                        className="flex items-center gap-1"
                      >
                        Unallocated Amount
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map(donor => (
                  <TableRow key={donor.id}>
                    <TableCell className="font-mono text-sm">{donor.id}</TableCell>
                    <TableCell className="font-semibold">{donor.name}</TableCell>
                    <TableCell>₹{donor.amount.toLocaleString()}</TableCell>
                                         <TableCell>₹{donor.allocated.toLocaleString()}</TableCell>
                                           <TableCell>
                        <div className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-200">
                          ₹{donor.unallocated.toLocaleString()}
                        </div>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Unmapped Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Unmapped Transactions ({filteredTransactions.length})
          </CardTitle>
          <CardDescription>
            All transactions will be mapped to available donors
          </CardDescription>
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
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('transaction', 'id')}
                      className="flex items-center gap-1"
                    >
                      Transaction ID
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('transaction', 'studentId')}
                      className="flex items-center gap-1"
                    >
                      Student ID
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('transaction', 'studentName')}
                      className="flex items-center gap-1"
                    >
                      Student Name
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('transaction', 'college')}
                      className="flex items-center gap-1"
                    >
                      College
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('transaction', 'amount')}
                      className="flex items-center gap-1"
                    >
                      Amount
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('transaction', 'date')}
                      className="flex items-center gap-1"
                    >
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.studentId}</TableCell>
                    <TableCell className="font-semibold">{transaction.studentName}</TableCell>
                    <TableCell>{transaction.college}</TableCell>
                    <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        {transaction.status}
                      </Badge>
                    </TableCell>
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
                   <CardTitle className="text-xs font-medium text-blue-700">Total Transaction Amount</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-0">
                   <div className="text-2xl font-bold text-blue-700">₹{getTotalUnmappedAmount().toLocaleString()}</div>
                   <div className="text-xs text-blue-600">{filteredTransactions.length} Transactions</div>
                 </CardContent>
               </Card>

               <Card className="border-green-200 bg-green-50">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-xs font-medium text-green-700">Total Donor Amount</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-0">
                   <div className="text-2xl font-bold text-green-700">₹{getTotalUnallocatedAmount().toLocaleString()}</div>
                   <div className="text-xs text-green-600">{filteredDonors.length} Donors</div>
                 </CardContent>
               </Card>

               <Card className={`${canMapTransactions() ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-xs font-medium">Status</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-0">
                   <div className={`text-2xl font-bold ${canMapTransactions() ? 'text-green-700' : 'text-red-700'}`}>
                     {canMapTransactions() ? 'Sufficient' : 'Insufficient'}
                   </div>
                   <div className="text-xs text-muted-foreground">
                     {canMapTransactions() 
                       ? `Surplus: ₹${(getTotalUnallocatedAmount() - getTotalUnmappedAmount()).toLocaleString()}`
                       : `Shortfall: ₹${(getTotalUnmappedAmount() - getTotalUnallocatedAmount()).toLocaleString()}`
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
                       <TableHead>Status</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {filteredDonors.map(donor => (
                       <TableRow key={donor.id}>
                         <TableCell className="font-medium">{donor.id}</TableCell>
                         <TableCell>{donor.name}</TableCell>
                         <TableCell>₹{donor.amount.toLocaleString()}</TableCell>
                         <TableCell>₹{donor.allocated.toLocaleString()}</TableCell>
                         <TableCell>₹{donor.unallocated.toLocaleString()}</TableCell>
                         <TableCell>
                           <Badge variant={donor.unallocated > 0 ? "default" : "secondary"}>
                             {donor.unallocated > 0 ? "Available" : "No Funds"}
                           </Badge>
                         </TableCell>
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
                       <TableHead>Status</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {filteredTransactions.map(transaction => (
                       <TableRow key={transaction.id}>
                         <TableCell className="font-medium">{transaction.id}</TableCell>
                         <TableCell>
                           <div>{transaction.studentName}</div>
                           <div className="text-sm text-muted-foreground">{transaction.studentId}</div>
                         </TableCell>
                         <TableCell>{transaction.college}</TableCell>
                         <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                         <TableCell>{transaction.date}</TableCell>
                         <TableCell>
                           <Badge variant="secondary">{transaction.status}</Badge>
                         </TableCell>
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
                     <li>• This action will map all unmapped transactions to the selected donors</li>
                     <li>• The donor amounts will be allocated to cover the transaction amounts</li>
                     <li>• This action cannot be undone once confirmed</li>
                     {canMapTransactions() && getTotalUnallocatedAmount() > getTotalUnmappedAmount() && (
                       <li className="text-green-600 font-medium">
                         • Surplus amount (₹{(getTotalUnallocatedAmount() - getTotalUnmappedAmount()).toLocaleString()}) will be returned to the donor with the highest remaining unallocated amount
                       </li>
                     )}
                     {!canMapTransactions() && (
                       <li className="text-red-600 font-medium">• Warning: Insufficient funds - some transactions may not be fully covered</li>
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
               disabled={processing || !canMapTransactions()}
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