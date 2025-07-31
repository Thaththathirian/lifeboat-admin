import { useState, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";

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

// Mock data for reverted transactions (pairs of original and reverted transactions)
const mockRevertedTransactions = [
  {
    originalTransaction: {
      id: "TXN001",
      amount: 50000,
      totalAmount: 50000,
      date: "2024-01-15",
      description: "Scholarship Payment",
      source: "Bank Transfer",
      status: "Reverted",
      studentId: "STU001",
      studentName: "Rahul Kumar",
      college: "ABC Engineering College",
      type: "mapped",
      mappingId: "MAP001",
      donors: [
        { donorId: "DON001", donorName: "John Doe", amount: 30000 },
        { donorId: "DON002", donorName: "Sarah Wilson", amount: 20000 }
      ],
      revertDate: "2024-02-01",
      revertReason: "Student requested refund due to course change"
    },
    revertedTransaction: {
      id: "REV001",
      amount: 50000,
      totalAmount: 50000,
      date: "2024-02-01",
      description: "Reverted: Scholarship Payment",
      source: "System Revert",
      status: "Reverted",
      studentId: "STU001",
      studentName: "Rahul Kumar",
      college: "ABC Engineering College",
      type: "reverted",
      revertDate: "2024-02-01",
      revertReason: "Student requested refund due to course change"
    }
  },
  {
    originalTransaction: {
      id: "TXN003",
      amount: 60000,
      totalAmount: 60000,
      date: "2024-02-01",
      description: "Scholarship Disbursement",
      source: "Direct Credit",
      status: "Reverted",
      studentId: "STU003",
      studentName: "Amit Verma",
      college: "PQR Arts College",
      type: "unmapped",
      revertDate: "2024-02-15",
      revertReason: "Duplicate transaction detected"
    },
    revertedTransaction: {
      id: "REV002",
      amount: 60000,
      totalAmount: 60000,
      date: "2024-02-15",
      description: "Reverted: Scholarship Disbursement",
      source: "System Revert",
      status: "Reverted",
      studentId: "STU003",
      studentName: "Amit Verma",
      college: "PQR Arts College",
      type: "reverted",
      revertDate: "2024-02-15",
      revertReason: "Duplicate transaction detected"
    }
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



// TransactionRow component for expandable rows in "All Transactions" tab (without revert action)
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow 
        className="cursor-pointer hover:bg-muted/50 h-8"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="font-medium py-1 text-sm">{transaction.id}</TableCell>
        <TableCell className="py-1">
          <div className="text-sm">{transaction.studentName}</div>
          <div className="text-xs text-muted-foreground">{transaction.studentId}</div>
        </TableCell>
        <TableCell className="py-1 text-sm">{transaction.college}</TableCell>
        <TableCell className="py-1 text-sm">₹{transaction.totalAmount.toLocaleString()}</TableCell>
        <TableCell className="py-1 text-sm">{transaction.date}</TableCell>
                 <TableCell className="py-1 text-sm">{transaction.description}</TableCell>
         <TableCell className="py-1">
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
           <TableCell colSpan={7} className="p-0">
            <div className="bg-muted/30 p-2">
                               <div className="border rounded-lg p-3 bg-background">
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-base">Transaction: {transaction.id}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-muted-foreground">
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
                      <span className="text-sm font-semibold text-green-600 ml-1">
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
                  <div className="mt-2">
                    <span className="font-medium">Description:</span> {transaction.description}
                  </div>
                  {transaction.donors && transaction.donors.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Donors:</span>
                      <div className="mt-1 space-y-1">
                        {transaction.donors.map((donor: Donor, index: number) => (
                          <div key={donor.donorId} className="flex justify-between items-center p-1 bg-muted rounded text-xs">
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

// RevertedTransactionRow component for reverted transaction pairs
function RevertedTransactionRow({ pair }: { pair: { originalTransaction: Transaction; revertedTransaction: Transaction } }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
             <TableRow 
         className="cursor-pointer hover:bg-muted/50 h-8"
         onClick={() => setIsExpanded(!isExpanded)}
       >
         <TableCell className="font-medium py-1">
           <div className="flex items-center gap-2 text-sm">
             <span className="text-red-600">{pair.originalTransaction.id}</span>
             <span className="text-gray-400">→</span>
             <span className="text-orange-600">{pair.revertedTransaction.id}</span>
           </div>
         </TableCell>
         <TableCell className="py-1">
           <div className="text-sm">{pair.originalTransaction.studentName}</div>
           <div className="text-xs text-muted-foreground">{pair.originalTransaction.studentId}</div>
         </TableCell>
         <TableCell className="py-1 text-sm">{pair.originalTransaction.college}</TableCell>
         <TableCell className="py-1 text-sm">₹{pair.originalTransaction.totalAmount.toLocaleString()}</TableCell>
         <TableCell className="py-1 text-sm">{pair.originalTransaction.date}</TableCell>
         <TableCell className="py-1 text-sm">{pair.originalTransaction.description}</TableCell>
         <TableCell className="py-1">
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
            <TableCell colSpan={7} className="p-0">
              <div className="bg-muted/30 p-2">
                <div className="border rounded-lg p-3 bg-background">
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-base">Reverted Transaction Pair</h4>
                      <Badge variant="destructive">Reverted</Badge>
                    </div>
                    
                    {/* Original Transaction */}
                    <div className="mb-3 p-2 border-l-4 border-red-500 bg-red-50 rounded">
                      <h5 className="font-medium text-red-800 mb-1 text-xs">Original Transaction: {pair.originalTransaction.id}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                        <div><span className="font-medium">Student:</span> {pair.originalTransaction.studentName}</div>
                        <div><span className="font-medium">College:</span> {pair.originalTransaction.college}</div>
                        <div><span className="font-medium">Date:</span> {pair.originalTransaction.date}</div>
                        <div><span className="font-medium">Amount:</span> ₹{pair.originalTransaction.totalAmount.toLocaleString()}</div>
                        <div><span className="font-medium">Type:</span> {pair.originalTransaction.type === "unmapped" ? "Unmapped" : "Mapped"}</div>
                        <div><span className="font-medium">Description:</span> {pair.originalTransaction.description}</div>
                      </div>
                    </div>

                    {/* Reverted Transaction */}
                    <div className="mb-2 p-2 border-l-4 border-orange-500 bg-orange-50 rounded">
                      <h5 className="font-medium text-orange-800 mb-1 text-xs">Reverted Transaction: {pair.revertedTransaction.id}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                        <div><span className="font-medium">Revert Date:</span> {pair.revertedTransaction.revertDate}</div>
                        <div><span className="font-medium">Amount:</span> ₹{pair.revertedTransaction.totalAmount.toLocaleString()}</div>
                        <div><span className="font-medium">Source:</span> {pair.revertedTransaction.source}</div>
                        <div><span className="font-medium">Description:</span> {pair.revertedTransaction.description}</div>
                      </div>
                    </div>

                    {/* Revert Information */}
                    <div className="p-2 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                      <h5 className="font-medium text-yellow-800 mb-1 text-xs">Revert Information</h5>
                      <div className="text-xs">
                        <div><span className="font-medium">Reason:</span> {pair.originalTransaction.revertReason}</div>
                        <div><span className="font-medium">Revert Date:</span> {pair.originalTransaction.revertDate}</div>
                      </div>
                    </div>
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
        className="cursor-pointer hover:bg-muted/50 h-8"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="font-medium py-1 text-sm">{mapping.mappingId}</TableCell>
        <TableCell className="py-1 text-sm">{mapping.mappingDate}</TableCell>
        <TableCell className="py-1 text-sm">{mapping.transactions.length}</TableCell>
        <TableCell className="py-1 text-sm">₹{totalAmount.toLocaleString()}</TableCell>
                         <TableCell className="py-1">
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
           <TableCell colSpan={5} className="p-0">
             <div className="bg-muted/30 p-2">
               <div className="space-y-2">
                 {mapping.transactions.map((transaction: Transaction) => (
                                       <div key={transaction.id} className="border rounded-lg p-3 bg-background">
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-base">Transaction: {transaction.id}</h4>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleRevert(transaction.id, e)}
                              className="h-5 px-2 text-xs"
                              disabled={false}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Revert
                            </Button>
                          </div>
                        </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-muted-foreground">
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
                           <span className="text-sm font-semibold text-green-600 ml-1">
                             ₹{transaction.totalAmount.toLocaleString()}
                           </span>
                         </div>
                       </div>
                       <div className="mt-2">
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
  const location = useLocation();
  const [filter, setFilter] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    location.state?.selectedTransactions?.map((t: Transaction) => t.id) || []
  );
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
  const [revertedSortBy, setRevertedSortBy] = useState<string>("revertDate");
  const [revertedSortOrder, setRevertedSortOrder] = useState<"asc" | "desc">("desc");
    const [activeTab, setActiveTab] = useState<string>(location.state?.activeTab || "all");

  const { toast } = useToast();

  // Restore selected transactions when coming back from donor selection
  useEffect(() => {
    if (location.state?.selectedTransactions && location.state.returnToDonorSelection) {
      setSelectedTransactions(location.state.selectedTransactions.map((t: Transaction) => t.id));
    }
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);



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

  // Filter and sort reverted transactions
  const filteredRevertedTransactions = sortData(
    mockRevertedTransactions.filter(pair => {
      const matchesSearch = 
        pair.originalTransaction.studentName.toLowerCase().includes(filter.toLowerCase()) ||
        pair.originalTransaction.id.toLowerCase().includes(filter.toLowerCase()) ||
        pair.originalTransaction.college.toLowerCase().includes(filter.toLowerCase()) ||
        pair.revertedTransaction.id.toLowerCase().includes(filter.toLowerCase()) ||
        pair.originalTransaction.revertReason?.toLowerCase().includes(filter.toLowerCase());
      
      return matchesSearch;
    }),
    revertedSortBy,
    revertedSortOrder
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
    
    const navigationState = {
      selectedTransactions: selectedTransactionObjects,
      selectedDonors: location.state?.selectedDonors || [],
      returnToDonorSelection: false
    };
    
    console.log("Navigating to donor selection with state:", navigationState);
    
    // Navigate to donor selection page with selected transactions and preserve selected donors
    navigate("/admin/donor-selection", { 
      state: navigationState
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Transaction Management</h2>
          <Input
            placeholder="Filter transactions..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleMapDonor}
            disabled={selectedTransactions.length === 0}
            className={selectedTransactions.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
          >
            Map Donor {selectedTransactions.length > 0 && `(${selectedTransactions.length} selected)`}
          </Button>
          <Button variant="outline">Download Report</Button>
        </div>
      </div>

                           <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All Transactions ({filteredAllTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="unmapped">
              Unmapped Transactions ({filteredUnmapped.length})
            </TabsTrigger>
            <TabsTrigger value="mapped">
              Mapped Transactions ({filteredMapped.length})
            </TabsTrigger>
            <TabsTrigger value="reverted">
              Reverted Transactions ({filteredRevertedTransactions.length})
            </TabsTrigger>
          </TabsList>

        <TabsContent value="unmapped" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg">Unmapped Transactions</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 font-semibold text-sm px-2 py-1">
                      ₹{filteredUnmapped.reduce((sum, transaction) => sum + transaction.amount, 0).toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTransactions.length === filteredUnmapped.length && filteredUnmapped.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label className="text-sm">Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
                             <Table>
                 <TableHeader>
                   <TableRow className="h-8">
                     <TableHead className="w-8">
                       <Checkbox
                         checked={selectedTransactions.length === filteredUnmapped.length && filteredUnmapped.length > 0}
                         onCheckedChange={handleSelectAll}
                       />
                     </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("id");
                            setUnmappedSortOrder(unmappedSortBy === "id" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Transaction ID
                          {unmappedSortBy === "id" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("studentName");
                            setUnmappedSortOrder(unmappedSortBy === "studentName" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Student
                          {unmappedSortBy === "studentName" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("college");
                            setUnmappedSortOrder(unmappedSortBy === "college" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          College
                          {unmappedSortBy === "college" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("amount");
                            setUnmappedSortOrder(unmappedSortBy === "amount" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Amount
                          {unmappedSortBy === "amount" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("date");
                            setUnmappedSortOrder(unmappedSortBy === "date" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Date
                          {unmappedSortBy === "date" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                                                                       <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUnmappedSortBy("description");
                            setUnmappedSortOrder(unmappedSortBy === "description" && unmappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Description
                          {unmappedSortBy === "description" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-sm">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {filteredUnmapped.map(transaction => (
                    <TableRow key={transaction.id} className="h-8">
                      <TableCell className="py-1">
                        <Checkbox
                          checked={selectedTransactions.includes(transaction.id)}
                          onCheckedChange={(checked) => 
                            handleTransactionSelection(transaction.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="py-1 text-sm">{transaction.id}</TableCell>
                      <TableCell className="py-1">
                        <div className="text-sm">{transaction.studentName}</div>
                        <div className="text-xs text-muted-foreground">{transaction.studentId}</div>
                      </TableCell>
                      <TableCell className="py-1 text-sm">{transaction.college}</TableCell>
                      <TableCell className="py-1 text-sm">₹{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell className="py-1 text-sm">{transaction.date}</TableCell>
                                             <TableCell className="py-1 text-sm">{transaction.description}</TableCell>
                       <TableCell className="py-1">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleRevertTransaction(transaction.id, "unmapped")}
                           className="h-5 px-2 text-xs"
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

        <TabsContent value="mapped" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Mapped Transactions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                             <Table>
                 <TableHeader>
                   <TableRow className="h-8">
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMappedSortBy("mappingId");
                            setMappedSortOrder(mappedSortBy === "mappingId" && mappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Mapping ID
                          {mappedSortBy === "mappingId" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMappedSortBy("mappingDate");
                            setMappedSortOrder(mappedSortBy === "mappingDate" && mappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Mapping Date
                          {mappedSortBy === "mappingDate" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMappedSortBy("transactionCount");
                            setMappedSortOrder(mappedSortBy === "transactionCount" && mappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Total Transactions
                          {mappedSortBy === "transactionCount" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMappedSortBy("totalAmount");
                            setMappedSortOrder(mappedSortBy === "totalAmount" && mappedSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Total Amount
                          {mappedSortBy === "totalAmount" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                     <TableHead className="text-sm">Actions</TableHead>
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

         <TabsContent value="all" className="mt-4">
           <Card className="shadow-soft">
             <CardHeader className="pb-3">
               <CardTitle className="text-lg">All Transactions</CardTitle>
             </CardHeader>
             <CardContent className="pt-0">
               <Table>
                 <TableHeader>
                   <TableRow className="h-8">
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("id");
                            setAllSortOrder(allSortBy === "id" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Transaction ID
                          {allSortBy === "id" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("studentName");
                            setAllSortOrder(allSortBy === "studentName" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Student
                          {allSortBy === "studentName" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("college");
                            setAllSortOrder(allSortBy === "college" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          College
                          {allSortBy === "college" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("amount");
                            setAllSortOrder(allSortBy === "amount" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Amount
                          {allSortBy === "amount" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("date");
                            setAllSortOrder(allSortBy === "date" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Date
                          {allSortBy === "date" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                                           <TableHead className="text-sm">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAllSortBy("description");
                            setAllSortOrder(allSortBy === "description" && allSortOrder === "asc" ? "desc" : "asc");
                          }}
                          className="h-auto p-0 font-medium text-xs"
                        >
                          Description
                          {allSortBy === "description" && (
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                     <TableHead className="text-sm">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredAllTransactions.map(transaction => (
                     <TransactionRow 
                       key={transaction.id} 
                       transaction={transaction} 
                     />
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </TabsContent>

                  <TabsContent value="reverted" className="mt-4">
           <Card className="shadow-soft">
             <CardHeader className="pb-3">
               <CardTitle className="text-lg">Reverted Transactions</CardTitle>
             </CardHeader>
             <CardContent className="pt-0">
               <Tabs defaultValue="mapped" className="w-full">
                 <TabsList className="grid w-full grid-cols-2">
                   <TabsTrigger value="mapped">
                     Mapped Reverted ({filteredRevertedTransactions.filter(pair => pair.originalTransaction.type === "mapped").length})
                   </TabsTrigger>
                   <TabsTrigger value="unmapped">
                     Unmapped Reverted ({filteredRevertedTransactions.filter(pair => pair.originalTransaction.type === "unmapped").length})
                   </TabsTrigger>
                 </TabsList>

                 <TabsContent value="mapped" className="mt-4">
                   <Table>
                     <TableHeader>
                       <TableRow className="h-8">
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("id");
                               setRevertedSortOrder(revertedSortBy === "id" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Transaction Pair
                             {revertedSortBy === "id" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("studentName");
                               setRevertedSortOrder(revertedSortBy === "studentName" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Student
                             {revertedSortBy === "studentName" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("college");
                               setRevertedSortOrder(revertedSortBy === "college" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             College
                             {revertedSortBy === "college" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("amount");
                               setRevertedSortOrder(revertedSortBy === "amount" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Amount
                             {revertedSortBy === "amount" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("date");
                               setRevertedSortOrder(revertedSortBy === "date" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Date
                             {revertedSortBy === "date" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("description");
                               setRevertedSortOrder(revertedSortBy === "description" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Description
                             {revertedSortBy === "description" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {filteredRevertedTransactions
                         .filter(pair => pair.originalTransaction.type === "mapped")
                         .map((pair, index) => (
                           <RevertedTransactionRow 
                             key={`${pair.originalTransaction.id}-${pair.revertedTransaction.id}`} 
                             pair={pair} 
                           />
                         ))}
                     </TableBody>
                   </Table>
                 </TabsContent>

                 <TabsContent value="unmapped" className="mt-4">
                   <Table>
                     <TableHeader>
                       <TableRow className="h-8">
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("id");
                               setRevertedSortOrder(revertedSortBy === "id" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Transaction Pair
                             {revertedSortBy === "id" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("studentName");
                               setRevertedSortOrder(revertedSortBy === "studentName" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Student
                             {revertedSortBy === "studentName" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("college");
                               setRevertedSortOrder(revertedSortBy === "college" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             College
                             {revertedSortBy === "college" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("amount");
                               setRevertedSortOrder(revertedSortBy === "amount" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Amount
                             {revertedSortBy === "amount" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("date");
                               setRevertedSortOrder(revertedSortBy === "date" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Date
                             {revertedSortBy === "date" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                         <TableHead className="text-sm">
                           <Button
                             variant="ghost"
                             onClick={() => {
                               setRevertedSortBy("description");
                               setRevertedSortOrder(revertedSortBy === "description" && revertedSortOrder === "asc" ? "desc" : "asc");
                             }}
                             className="h-auto p-0 font-medium text-xs"
                           >
                             Description
                             {revertedSortBy === "description" && (
                               <ArrowUpDown className="ml-1 h-3 w-3" />
                             )}
                           </Button>
                         </TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {filteredRevertedTransactions
                         .filter(pair => pair.originalTransaction.type === "unmapped")
                         .map((pair, index) => (
                           <RevertedTransactionRow 
                             key={`${pair.originalTransaction.id}-${pair.revertedTransaction.id}`} 
                             pair={pair} 
                           />
                         ))}
                     </TableBody>
                   </Table>
                 </TabsContent>
               </Tabs>
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