import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, RotateCcw, ArrowUpDown, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

// TypeScript interfaces
interface Donor {
  donorId: string;
  donorName: string;
  amount: number;
}

interface Transaction {
  id: string;
  amount: number;
  totalAmount: number;
  date: string;
  description: string;
  source: string;
  status: string;
  studentId: string;
  studentName: string;
  college: string;
  type?: "unmapped" | "mapped";
  mappingId?: string;
  donors?: Donor[];
  revertDate?: string;
  revertReason?: string;
}

interface Mapping {
  mappingId: string;
  mappingDate: string;
  transactions: Transaction[];
  totalAmount?: number;
}

// Mock data for transactions
const mockUnmappedTransactions = [
  {
    id: "TXN001",
    amount: 50000,
    date: "2024-01-15",
    description: "Scholarship Payment",
    source: "Bank Transfer",
    status: "Pending",
    studentId: "STU001",
    studentName: "Rahul Kumar",
    college: "ABC Engineering College"
  },
  {
    id: "TXN002",
    amount: 40000,
    date: "2024-01-20",
    description: "Tuition Fee Payment",
    source: "Online Payment",
    status: "Pending",
    studentId: "STU002",
    studentName: "Priya Singh",
    college: "XYZ Medical College"
  },
  {
    id: "TXN003",
    amount: 60000,
    date: "2024-02-01",
    description: "Scholarship Disbursement",
    source: "Direct Credit",
    status: "Pending",
    studentId: "STU003",
    studentName: "Amit Verma",
    college: "PQR Arts College"
  },
  {
    id: "TXN004",
    amount: 35000,
    date: "2024-02-05",
    description: "Fee Payment",
    source: "Bank Transfer",
    status: "Pending",
    studentId: "STU004",
    studentName: "Neha Patel",
    college: "Tech University"
  }
];

const mockMappedTransactions = [
  {
    mappingId: "MAP001",
    mappingDate: "2024-01-12",
    transactions: [
      {
        id: "TXN005",
        totalAmount: 150000,
        date: "2024-01-10",
        description: "Scholarship Payment",
        source: "Multiple Sources",
        status: "Completed",
        studentId: "STU005",
        studentName: "Rahul Kumar",
        college: "ABC Engineering College",
        donors: [
          { donorId: "DON001", donorName: "John Doe", amount: 50000 },
          { donorId: "DON003", donorName: "Amit Patel", amount: 40000 },
          { donorId: "DON005", donorName: "Rajesh Kumar", amount: 30000 },
          { donorId: "DON007", donorName: "Sita Devi", amount: 20000 },
          { donorId: "DON009", donorName: "Vikram Singh", amount: 10000 }
        ]
      },
      {
        id: "TXN007",
        totalAmount: 80000,
        date: "2024-01-15",
        description: "Tuition Fee Payment",
        source: "Multiple Sources",
        status: "Reverted",
        revertDate: "2024-01-25",
        revertReason: "Student requested refund",
        studentId: "STU007",
        studentName: "Priya Singh",
        college: "XYZ Medical College",
        donors: [
          { donorId: "DON002", donorName: "Sarah Wilson", amount: 30000 },
          { donorId: "DON004", donorName: "Priya Sharma", amount: 25000 },
          { donorId: "DON006", donorName: "Mohan Das", amount: 15000 },
          { donorId: "DON008", donorName: "Lakshmi Bai", amount: 10000 }
        ]
      }
    ]
  },
  {
    mappingId: "MAP002",
    mappingDate: "2024-01-20",
    transactions: [
      {
        id: "TXN006",
        totalAmount: 120000,
        date: "2024-01-18",
        description: "Tuition Fee Payment",
        source: "Multiple Sources",
        status: "Completed",
        studentId: "STU006",
        studentName: "Anita Das",
        college: "Commerce College",
        donors: [
          { donorId: "DON001", donorName: "John Doe", amount: 40000 },
          { donorId: "DON003", donorName: "Amit Patel", amount: 35000 },
          { donorId: "DON005", donorName: "Rajesh Kumar", amount: 25000 },
          { donorId: "DON007", donorName: "Sita Devi", amount: 20000 }
        ]
      },
      {
        id: "TXN008",
        totalAmount: 95000,
        date: "2024-01-22",
        description: "Scholarship Disbursement",
        source: "Multiple Sources",
        status: "Completed",
        studentId: "STU008",
        studentName: "Amit Verma",
        college: "PQR Arts College",
        donors: [
          { donorId: "DON002", donorName: "Sarah Wilson", amount: 35000 },
          { donorId: "DON004", donorName: "Priya Sharma", amount: 30000 },
          { donorId: "DON006", donorName: "Mohan Das", amount: 20000 },
          { donorId: "DON008", donorName: "Lakshmi Bai", amount: 10000 }
        ]
      }
    ]
  }
];



// TransactionRow component for expandable rows in "All Transactions" tab
function TransactionRow({ transaction, onRevertTransaction }: { transaction: Transaction; onRevertTransaction: (transactionId: string, type: "unmapped" | "mapped") => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleRevert = (transactionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row expansion
    onRevertTransaction(transactionId, transaction.type || "mapped"); // Handle unmapped transactions
  };

  return (
    <>
      <TableRow 
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="font-medium">{transaction.id}</TableCell>
        <TableCell>
          <div>{transaction.studentName}</div>
          <div className="text-sm text-muted-foreground">{transaction.studentId}</div>
        </TableCell>
        <TableCell>{transaction.college}</TableCell>
        <TableCell>₹{transaction.totalAmount.toLocaleString()}</TableCell>
        <TableCell>{transaction.date}</TableCell>
                 <TableCell>{transaction.description}</TableCell>
         <TableCell>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleRevert(transaction.id, e)}
              className="h-6 px-2"
                             disabled={false}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Revert
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
                 <TableRow>
           <TableCell colSpan={7} className="p-0">
            <div className="bg-muted/30 p-6">
                               <div className="border rounded-lg p-6 bg-background">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-xl">Transaction: {transaction.id}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Student:</span> {transaction.studentName} ({transaction.studentId})
                    </div>
                    <div>
                      <span className="font-medium">College:</span> {transaction.college}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {transaction.date}
                    </div>
                    <div>
                      <span className="font-medium">Total Amount:</span> 
                      <span className="text-lg font-semibold text-green-600 ml-2">
                        ₹{transaction.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {transaction.type === "unmapped" ? "Unmapped" : "Mapped"}
                    </div>
                    {transaction.type === "mapped" && (
                      <div>
                        <span className="font-medium">Mapping ID:</span> {transaction.mappingId}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="font-medium">Description:</span> {transaction.description}
                  </div>
                  {transaction.donors && transaction.donors.length > 0 && (
                    <div className="mt-4">
                      <span className="font-medium">Donors:</span>
                      <div className="mt-2 space-y-2">
                        {transaction.donors.map((donor: Donor, index: number) => (
                          <div key={donor.donorId} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span>{donor.donorName} ({donor.donorId})</span>
                            <span className="font-medium">₹{donor.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// MappingRow component for expandable rows
function MappingRow({ mapping, onRevertTransaction }: { mapping: Mapping; onRevertTransaction: (transactionId: string, type: "unmapped" | "mapped") => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const totalAmount = mapping.transactions.reduce((sum: number, t: Transaction) => sum + t.totalAmount, 0);
  const hasRevertedTransactions = mapping.transactions.some((t: Transaction) => t.status === "Reverted");

  const handleRevert = (transactionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row expansion
    onRevertTransaction(transactionId, "mapped");
  };

  return (
    <>
      <TableRow 
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="font-medium">{mapping.mappingId}</TableCell>
        <TableCell>{mapping.mappingDate}</TableCell>
        <TableCell>{mapping.transactions.length}</TableCell>
        <TableCell>₹{totalAmount.toLocaleString()}</TableCell>
                         <TableCell>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            
            
          </div>
        </TableCell>
       </TableRow>
              {isExpanded && (
         <TableRow>
           <TableCell colSpan={4} className="p-0">
             <div className="bg-muted/30 p-6">
               <div className="space-y-6">
                 {mapping.transactions.map((transaction: Transaction) => (
                                       <div key={transaction.id} className="border rounded-lg p-6 bg-background">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-xl">Transaction: {transaction.id}</h4>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleRevert(transaction.id, e)}
                              className="h-8 px-3"
                              disabled={false}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Revert
                            </Button>
                          </div>
                        </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-muted-foreground">
                         <div>
                           <span className="font-medium">Student:</span> {transaction.studentName} ({transaction.studentId})
                         </div>
                         <div>
                           <span className="font-medium">College:</span> {transaction.college}
                         </div>
                         <div>
                           <span className="font-medium">Date:</span> {transaction.date}
                         </div>
                         <div>
                           <span className="font-medium">Total Amount:</span> 
                           <span className="text-lg font-semibold text-green-600 ml-2">
                             ₹{transaction.totalAmount.toLocaleString()}
                           </span>
                         </div>
                       </div>
                       <div className="mt-4">
                         <span className="font-medium">Description:</span> {transaction.description}
                       </div>

                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </TableCell>
         </TableRow>
       )}
    </>
  );
}

export default function AdminTransactions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [revertDialog, setRevertDialog] = useState(false);
  const [transactionToRevert, setTransactionToRevert] = useState<string>("");
  const [revertReason, setRevertReason] = useState("");
  const [revertTransactionType, setRevertTransactionType] = useState<"unmapped" | "mapped">("unmapped");
  
  // Sorting and filtering states
  const [unmappedSortBy, setUnmappedSortBy] = useState<string>("date");
  const [unmappedSortOrder, setUnmappedSortOrder] = useState<"asc" | "desc">("desc");
  const [mappedSortBy, setMappedSortBy] = useState<string>("mappingDate");
  const [mappedSortOrder, setMappedSortOrder] = useState<"asc" | "desc">("desc");
  const [allSortBy, setAllSortBy] = useState<string>("date");
  const [allSortOrder, setAllSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<string>("unmapped");
  
  const { toast } = useToast();



  // Sorting function
  const sortData = <T extends Record<string, unknown>>(data: T[], sortBy: string, sortOrder: "asc" | "desc") => {
    return [...data].sort((a, b) => {
      let aValue = a[sortBy as keyof T];
      let bValue = b[sortBy as keyof T];
      
      if (sortBy === "amount" || sortBy === "totalAmount") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Filter and sort unmapped transactions
  const filteredUnmapped = sortData(
    mockUnmappedTransactions.filter(transaction => {
      const matchesSearch = transaction.studentName.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.id.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.college.toLowerCase().includes(filter.toLowerCase());
      
      return matchesSearch;
    }),
    unmappedSortBy,
    unmappedSortOrder
  );

  // Filter and sort mapped transactions
  const filteredMapped = sortData(
    mockMappedTransactions.filter(mapping => {
      const matchesSearch = mapping.mappingId.toLowerCase().includes(filter.toLowerCase()) ||
        mapping.transactions.some(transaction =>
          transaction.studentName.toLowerCase().includes(filter.toLowerCase()) ||
          transaction.id.toLowerCase().includes(filter.toLowerCase()) ||
          transaction.college.toLowerCase().includes(filter.toLowerCase()) ||
          (transaction.donors && transaction.donors.some(donor =>
            donor.donorName.toLowerCase().includes(filter.toLowerCase())
          ))
        );
      
      return matchesSearch;
    }).map(mapping => ({
      ...mapping,
      totalAmount: mapping.transactions.reduce((sum: number, t: Transaction) => sum + t.totalAmount, 0),
      transactionCount: mapping.transactions.length
    })),
    mappedSortBy,
    mappedSortOrder
  );

  // Combine all transactions for the "All Transactions" tab
  const allTransactions = [
    ...mockUnmappedTransactions.map(t => ({ ...t, type: "unmapped", totalAmount: t.amount })),
    ...mockMappedTransactions.flatMap(mapping => 
      mapping.transactions.map(t => ({ ...t, type: "mapped", mappingId: mapping.mappingId }))
    )
  ];

  // Filter and sort all transactions
  const filteredAllTransactions = sortData(
    allTransactions.filter(transaction => {
      const matchesSearch = transaction.studentName.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.id.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.college.toLowerCase().includes(filter.toLowerCase()) ||
        (transaction.donors && transaction.donors.some(donor =>
          donor.donorName.toLowerCase().includes(filter.toLowerCase())
        ));
      
      return matchesSearch;
    }),
    allSortBy,
    allSortOrder
  );

  const handleTransactionSelection = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, transactionId]);
    } else {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(filteredUnmapped.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleMapDonor = () => {
    if (selectedTransactions.length === 0) {
      toast({
        title: "No Transactions Selected",
        description: "Please select at least one transaction to map",
        variant: "destructive"
      });
      return;
    }
    
    // Get the full transaction objects for the selected IDs
    const selectedTransactionObjects = mockUnmappedTransactions.filter(transaction => 
      selectedTransactions.includes(transaction.id)
    );
    
    // Navigate to donor selection page with selected transactions
    navigate("/admin/donor-selection", { 
      state: { selectedTransactions: selectedTransactionObjects }
    });
  };

  const getTotalSelectedAmount = () => {
    return selectedTransactions.reduce((total, transactionId) => {
      const transaction = mockUnmappedTransactions.find(t => t.id === transactionId);
      return total + (transaction?.amount || 0);
    }, 0);
  };

  const handleRevertTransaction = (transactionId: string, type: "unmapped" | "mapped" = "mapped") => {
    setTransactionToRevert(transactionId);
    setRevertTransactionType(type);
    setRevertDialog(true);
  };

  const handleConfirmRevert = () => {
    if (!revertReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for reverting this transaction",
        variant: "destructive"
      });
      return;
    }

    // Find the transaction and update its status
    const today = new Date().toISOString().split('T')[0];
    
    // Update the transaction status based on type
    // In a real app, this would be an API call
    if (revertTransactionType === "mapped") {
      toast({
        title: "Transaction Reverted",
        description: `Transaction ${transactionToRevert} has been reverted. Highest donor amount returned to unallocated.`,
      });
    } else {
      toast({
        title: "Transaction Reverted",
        description: `Transaction ${transactionToRevert} has been reverted.`,
      });
    }

    setRevertDialog(false);
    setTransactionToRevert("");
    setRevertReason("");
    setRevertTransactionType("unmapped");
  };

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Transaction Management</h2>
        <div className="flex gap-2">
          {selectedTransactions.length > 0 && (
            <Button onClick={handleMapDonor}>
              Map Donor ({selectedTransactions.length} selected)
            </Button>
          )}
          <Button variant="outline">Download Report</Button>
        </div>
      </div>

             <div className="flex flex-col sm:flex-row gap-4 mb-6">
         <div className="flex-1">
           <Input
             placeholder="Filter transactions..."
             value={filter}
             onChange={e => setFilter(e.target.value)}
             className="max-w-md"
           />
         </div>
         
       </div>

                           <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unmapped">
              Unmapped Transactions ({filteredUnmapped.length})
            </TabsTrigger>
            <TabsTrigger value="mapped">
              Mapped Transactions ({filteredMapped.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Transactions ({filteredAllTransactions.length})
            </TabsTrigger>
          </TabsList>

        <TabsContent value="unmapped" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unmapped Transactions</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTransactions.length === filteredUnmapped.length && filteredUnmapped.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                             <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-12">
                       <Checkbox
                         checked={selectedTransactions.length === filteredUnmapped.length && filteredUnmapped.length > 0}
                         onCheckedChange={handleSelectAll}
                       />
                     </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("id");
                            setUnmappedSortOrder(unmappedSortBy === "id" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Transaction ID
                          {unmappedSortBy === "id" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("studentName");
                            setUnmappedSortOrder(unmappedSortBy === "studentName" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Student
                          {unmappedSortBy === "studentName" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("college");
                            setUnmappedSortOrder(unmappedSortBy === "college" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          College
                          {unmappedSortBy === "college" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("amount");
                            setUnmappedSortOrder(unmappedSortBy === "amount" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Amount
                          {unmappedSortBy === "amount" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("date");
                            setUnmappedSortOrder(unmappedSortBy === "date" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Date
                          {unmappedSortBy === "date" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                                                                       <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("description");
                            setUnmappedSortOrder(unmappedSortBy === "description" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Description
                          {unmappedSortBy === "description" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {filteredUnmapped.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={(checked) => 
                            handleTransactionSelection(transaction.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>
                        <div>{transaction.studentName}</div>
                        <div className="text-sm text-muted-foreground">{transaction.studentId}</div>
                      </TableCell>
                      <TableCell>{transaction.college}</TableCell>
                      <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                                             <TableCell>{transaction.description}</TableCell>
                       <TableCell>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleRevertTransaction(transaction.id, "unmapped")}
                           className="h-6 px-2"
                         >
                           <RotateCcw className="h-3 w-3 mr-1" />
                           Revert
                         </Button>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapped" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Mapped Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                             <Table>
                 <TableHeader>
                   <TableRow>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMappedSortBy("mappingId");
                            setMappedSortOrder(mappedSortBy === "mappingId" && mappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Mapping ID
                          {mappedSortBy === "mappingId" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMappedSortBy("mappingDate");
                            setMappedSortOrder(mappedSortBy === "mappingDate" && mappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Mapping Date
                          {mappedSortBy === "mappingDate" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMappedSortBy("transactionCount");
                            setMappedSortOrder(mappedSortBy === "transactionCount" && mappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Total Transactions
                          {mappedSortBy === "transactionCount" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMappedSortBy("totalAmount");
                            setMappedSortOrder(mappedSortBy === "totalAmount" && mappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Total Amount
                          {mappedSortBy === "totalAmount" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                     <TableHead>Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                                   <TableBody>
                    {filteredMapped.map(mapping => (
                      <MappingRow 
                        key={mapping.mappingId} 
                        mapping={mapping} 
                        onRevertTransaction={handleRevertTransaction}
                      />
                    ))}
                  </TableBody>
               </Table>
            </CardContent>
          </Card>
                 </TabsContent>

         <TabsContent value="all" className="mt-6">
           <Card className="shadow-soft">
             <CardHeader>
               <CardTitle>All Transactions</CardTitle>
             </CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("id");
                            setAllSortOrder(allSortBy === "id" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Transaction ID
                          {allSortBy === "id" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("studentName");
                            setAllSortOrder(allSortBy === "studentName" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Student
                          {allSortBy === "studentName" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("college");
                            setAllSortOrder(allSortBy === "college" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          College
                          {allSortBy === "college" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("amount");
                            setAllSortOrder(allSortBy === "amount" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Amount
                          {allSortBy === "amount" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("date");
                            setAllSortOrder(allSortBy === "date" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Date
                          {allSortBy === "date" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("description");
                            setAllSortOrder(allSortBy === "description" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium"
                        >
                          Description
                          {allSortBy === "description" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                     <TableHead>Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredAllTransactions.map(transaction => (
                     <TransactionRow 
                       key={transaction.id} 
                       transaction={transaction} 
                       onRevertTransaction={handleRevertTransaction}
                     />
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </TabsContent>
              </Tabs>

               {/* Revert Transaction Dialog */}
        <Dialog open={revertDialog} onOpenChange={setRevertDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Revert Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Transaction ID</Label>
                <div className="mt-2 p-3 bg-muted rounded">
                  <div className="text-sm font-medium">{transactionToRevert}</div>
                </div>
              </div>
              
              <div>
                <Label>Transaction Type</Label>
                <div className="mt-2 p-3 bg-muted rounded">
                  <div className="text-sm font-medium">
                    {revertTransactionType === "unmapped" ? "Unmapped Transaction" : "Mapped Transaction"}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason for Revert</Label>
                <textarea
                  id="reason"
                  className="mt-2 w-full p-3 border rounded-md"
                  placeholder="Enter reason for reverting this transaction..."
                  value={revertReason}
                  onChange={(e) => setRevertReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <div className="font-medium">⚠️ Important:</div>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>• Transaction will be marked as "Reverted" (not deleted)</li>
                    {revertTransactionType === "mapped" && (
                      <li>• Highest contributing donor amount will be returned to unallocated</li>
                    )}
                    <li>• Student will see this transaction as reverted</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setRevertDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmRevert}>
                Confirm Revert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
     </div>
   );
 } 