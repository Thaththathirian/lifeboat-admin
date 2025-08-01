import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentMappingConfirmation } from "@/components/ui/payment-mapping-confirmation";
import { MappingResultPopup } from "@/components/ui/mapping-result-popup";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Users, CreditCard, AlertCircle, Edit } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// TypeScript interfaces
interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  source: string;
  status: string;
  studentId: string;
  studentName: string;
  college: string;
}

interface Donor {
  id: string;
  name: string;
  email: string;
  unallocatedAmount: number;
  status: string;
}

// Mock data for available donors
const mockAvailableDonors = [
  { id: "DON001", name: "John Doe", unallocatedAmount: 50000, email: "john.doe@email.com" },
  { id: "DON002", name: "Sarah Wilson", unallocatedAmount: 1520, email: "sarah.wilson@email.com" },
  { id: "DON003", name: "Amit Patel", unallocatedAmount: 75000, email: "amit.patel@email.com" },
  { id: "DON004", name: "Priya Sharma", unallocatedAmount: 80000, email: "priya.sharma@email.com" },
  { id: "DON005", name: "Rajesh Kumar", unallocatedAmount: 120000, email: "rajesh.kumar@email.com" },
  { id: "DON006", name: "Mohan Das", unallocatedAmount: 45000, email: "mohan.das@email.com" },
  { id: "DON007", name: "Sita Devi", unallocatedAmount: 60000, email: "sita.devi@email.com" },
  { id: "DON008", name: "Lakshmi Bai", unallocatedAmount: 35000, email: "lakshmi.bai@email.com" },
  { id: "DON009", name: "Vikram Singh", unallocatedAmount: 90000, email: "vikram.singh@email.com" },
  { id: "DON010", name: "Anita Das", unallocatedAmount: 55000, email: "anita.das@email.com" },
];

export default function DonorSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get selected transactions from navigation state
  const selectedTransactions = location.state?.selectedTransactions || [];
  const [selectedDonors, setSelectedDonors] = useState<string[]>(location.state?.selectedDonors || []);
  const [searchFilter, setSearchFilter] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [mappingResult, setMappingResult] = useState<any>(null);

  // Restore selected donors when coming back from transactions page
  useEffect(() => {
    console.log("Location state:", location.state);
    if (location.state?.selectedDonors && location.state.selectedDonors.length > 0) {
      console.log("Restoring selected donors:", location.state.selectedDonors);
      setSelectedDonors(location.state.selectedDonors);
    }
  }, [location.state?.selectedDonors]);

  // Calculate total transaction amount
  const totalTransactionAmount = selectedTransactions.reduce((total: number, transaction: Transaction) => {
    return total + (transaction?.amount || 0);
  }, 0);

  // Calculate total unallocated amount from selected donors
  const totalUnallocatedAmount = selectedDonors.reduce((total: number, donorId: string) => {
    const donor = mockAvailableDonors.find(d => d.id === donorId);
    return total + (donor?.unallocatedAmount || 0);
  }, 0);

  // Filter donors based on search
  const filteredDonors = mockAvailableDonors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesSearch;
  });

  const handleDonorSelection = (donorId: string, checked: boolean) => {
    if (checked) {
      setSelectedDonors([...selectedDonors, donorId]);
    } else {
      setSelectedDonors(selectedDonors.filter(id => id !== donorId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDonors(filteredDonors.map(d => d.id));
    } else {
      setSelectedDonors([]);
    }
  };

  const handleCreateMapping = () => {
    if (selectedDonors.length === 0) {
      toast({
        title: "No Donors Selected",
        description: "Please select at least one donor for mapping",
        variant: "destructive"
      });
      return;
    }

    if (totalUnallocatedAmount < totalTransactionAmount) {
      toast({
        title: "Insufficient Funds",
        description: `Selected donors have ₹${totalUnallocatedAmount.toLocaleString()} available, but transactions require ₹${totalTransactionAmount.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmMapping = () => {
    // Logic for creating mappings
    setShowConfirmDialog(false);
    
    // Generate single mapping ID for the entire operation
    const singleMappingId = `MAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Show success result popup
    setMappingResult({
      success: true,
      message: `Successfully mapped ${selectedTransactions.length} transaction(s) to ${selectedDonors.length} donor(s)`,
      mappedIds: [singleMappingId],
      totalAmount: totalTransactionAmount
    });
    setShowResultPopup(true);
  };

  const handleBack = () => {
    navigate("/admin/transactions");
  };

  if (selectedTransactions.length === 0) {
    return (
      <div className="main-content-container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
            <h2 className="text-2xl font-bold">Donor Selection</h2>
          </div>
        </div>
        <Card className="shadow-soft">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              No transactions selected. Please go back and select transactions to map.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Donor Payment Mapping</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Unallocated Amount:</span>
              <Badge variant="default" className="bg-green-100 text-green-800 font-semibold text-sm px-2 py-1">
                ₹{mockAvailableDonors.reduce((total, donor) => total + donor.unallocatedAmount, 0).toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Transaction Amount:</span>
              <Badge variant="default" className="bg-purple-100 text-purple-800 font-semibold text-sm px-2 py-1">
                ₹{totalTransactionAmount.toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>
      </div>





      {/* Available Donors Table */}
      <Card className="shadow-soft mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Available Donors ({filteredDonors.length})</CardTitle>
                         <div className="flex items-center gap-4">
               <div className="flex gap-2">
                                                                                                                                       <Button 
                     onClick={() => navigate("/admin/transactions", { 
                       state: { 
                         selectedTransactions: selectedTransactions,
                         returnToDonorSelection: true,
                         selectedDonors: selectedDonors,
                         activeTab: "unmapped"
                       } 
                     })}
                     className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg px-6 py-6 leading-tight"
                   >
                     <Edit className="h-5 w-5 mr-3" />
                     Edit Transactions
                   </Button>
                                                                   <Button 
                    onClick={handleCreateMapping}
                    className={`px-6 py-6 text-lg font-semibold text-white leading-tight ${
                      selectedDonors.length === 0 
                        ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed' 
                        : totalUnallocatedAmount >= totalTransactionAmount 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold leading-none">₹{totalUnallocatedAmount.toLocaleString()}</span>
                      <span className="text-sm leading-none">Map Payments</span>
                    </div>
                  </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors by name or email..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                                      <TableHead className="w-12">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedDonors.length === filteredDonors.length && filteredDonors.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-xs text-muted-foreground">All</span>
                      </div>
                    </TableHead>
                  <TableHead className="text-center">Donor ID</TableHead>
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Unallocated Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map(donor => (
                  <TableRow key={donor.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDonors.includes(donor.id)}
                        onCheckedChange={(checked) => 
                          handleDonorSelection(donor.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium text-center">{donor.id}</TableCell>
                    <TableCell className="text-center">{donor.name}</TableCell>
                    <TableCell className="text-center">{donor.email}</TableCell>
                    <TableCell className="text-center">
                      {donor.unallocatedAmount > 0 ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 font-semibold">
                          ₹{donor.unallocatedAmount.toLocaleString()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">₹{donor.unallocatedAmount.toLocaleString()}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>



      {/* Confirmation Dialog */}
      <PaymentMappingConfirmation
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        selectedTransactions={selectedTransactions}
        selectedDonors={selectedDonors.map(donorId => {
          const donor = mockAvailableDonors.find(d => d.id === donorId);
          return donor ? {
            id: donor.id,
            name: donor.name,
            email: donor.email,
            unallocatedAmount: donor.unallocatedAmount
          } : null;
        }).filter(Boolean)}
        totalTransactionAmount={totalTransactionAmount}
        totalDonorAmount={totalUnallocatedAmount}
        onConfirm={handleConfirmMapping}
        title="Confirm Transaction Mapping"
        showDonorEmail={true}
        showTransactionDescription={true}
      />

      {/* Result Popup */}
      <MappingResultPopup
        open={showResultPopup}
        onOpenChange={setShowResultPopup}
        result={mappingResult}
        onClose={() => {
          setShowResultPopup(false);
          setMappingResult(null);
          // Navigate to transactions page after popup closes
          navigate('/admin/transactions');
        }}
      />
    </div>
  );
} 