import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Users, CreditCard, AlertCircle } from "lucide-react";
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
  { id: "DON002", name: "Sarah Wilson", unallocatedAmount: 0, email: "sarah.wilson@email.com" },
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
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Calculate total transaction amount
  const totalTransactionAmount = selectedTransactions.reduce((total: number, transaction: Transaction) => {
    return total + (transaction?.amount || 0);
  }, 0);

  // Calculate total unallocated amount from selected donors
  const totalUnallocatedAmount = selectedDonors.reduce((total: number, donorId: string) => {
    const donor = mockAvailableDonors.find(d => d.id === donorId);
    return total + (donor?.unallocatedAmount || 0);
  }, 0);

  // Filter donors based on search and availability
  const filteredDonors = mockAvailableDonors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesAvailability = !showOnlyAvailable || donor.unallocatedAmount > 0;
    
    return matchesSearch && matchesAvailability;
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
    toast({
      title: "Mapping Created",
      description: `Successfully mapped ${selectedTransactions.length} transaction(s) to ${selectedDonors.length} donor(s)`,
    });

    // Navigate back to transactions page
    navigate("/admin/transactions");
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
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
          <h2 className="text-2xl font-bold">Select Donors for Mapping</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateMapping}
            disabled={selectedDonors.length === 0 || totalUnallocatedAmount < totalTransactionAmount}
          >
            Create Mapping ({selectedDonors.length} donors)
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Selected Transactions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-3xl font-bold text-blue-600">₹{totalTransactionAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{selectedTransactions.length} Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Selected Donors</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-3xl font-bold text-green-600">₹{totalUnallocatedAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{selectedDonors.length} Donors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-soft ${totalUnallocatedAmount >= totalTransactionAmount ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Fund Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded-full ${totalUnallocatedAmount >= totalTransactionAmount ? 'bg-green-600' : 'bg-red-600'}`} />
              <div>
                <div className={`text-3xl font-bold ${totalUnallocatedAmount >= totalTransactionAmount ? 'text-green-600' : 'text-red-600'}`}>
                  {totalUnallocatedAmount >= totalTransactionAmount ? 'Sufficient' : 'Insufficient'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalUnallocatedAmount >= totalTransactionAmount 
                    ? `Surplus: ₹${(totalUnallocatedAmount - totalTransactionAmount).toLocaleString()}`
                    : `Shortfall: ₹${(totalTransactionAmount - totalUnallocatedAmount).toLocaleString()}`
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Donors Table */}
      <Card className="shadow-soft mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Available Donors</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-only-available"
                  checked={showOnlyAvailable}
                  onCheckedChange={(checked) => setShowOnlyAvailable(checked as boolean)}
                />
                <Label htmlFor="show-only-available">Show only available donors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedDonors.length === filteredDonors.length && filteredDonors.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label>Select All</Label>
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
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Donor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Unallocated Amount</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell className="font-medium">{donor.id}</TableCell>
                    <TableCell>{donor.name}</TableCell>
                    <TableCell>{donor.email}</TableCell>
                    <TableCell>₹{donor.unallocatedAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={donor.unallocatedAmount > 0 ? "default" : "secondary"}>
                        {donor.unallocatedAmount > 0 ? "Available" : "No Funds"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Transactions Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Selected Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTransactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>
                      <div>{transaction.studentName}</div>
                      <div className="text-sm text-muted-foreground">{transaction.studentId}</div>
                    </TableCell>
                    <TableCell>{transaction.college}</TableCell>
                    <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.status}</Badge>
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
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Confirm Transaction Mapping
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
                  <div className="text-2xl font-bold text-blue-700">₹{totalTransactionAmount.toLocaleString()}</div>
                  <div className="text-xs text-blue-600">{selectedTransactions.length} Transactions</div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-green-700">Total Donor Amount</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-green-700">₹{totalUnallocatedAmount.toLocaleString()}</div>
                  <div className="text-xs text-green-600">{selectedDonors.length} Donors</div>
                </CardContent>
              </Card>

              <Card className={`${totalUnallocatedAmount >= totalTransactionAmount ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`text-2xl font-bold ${totalUnallocatedAmount >= totalTransactionAmount ? 'text-green-700' : 'text-red-700'}`}>
                    {totalUnallocatedAmount >= totalTransactionAmount ? 'Sufficient' : 'Insufficient'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalUnallocatedAmount >= totalTransactionAmount 
                      ? `Surplus: ₹${(totalUnallocatedAmount - totalTransactionAmount).toLocaleString()}`
                      : `Shortfall: ₹${(totalTransactionAmount - totalUnallocatedAmount).toLocaleString()}`
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
                      <TableHead>Email</TableHead>
                      <TableHead>Unallocated Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDonors.map(donorId => {
                      const donor = mockAvailableDonors.find(d => d.id === donorId);
                      return donor ? (
                        <TableRow key={donor.id}>
                          <TableCell className="font-medium">{donor.id}</TableCell>
                          <TableCell>{donor.name}</TableCell>
                          <TableCell>{donor.email}</TableCell>
                          <TableCell>₹{donor.unallocatedAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={donor.unallocatedAmount > 0 ? "default" : "secondary"}>
                              {donor.unallocatedAmount > 0 ? "Available" : "No Funds"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ) : null;
                    })}
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
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransactions.map((transaction: Transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>
                          <div>{transaction.studentName}</div>
                          <div className="text-sm text-muted-foreground">{transaction.studentId}</div>
                        </TableCell>
                        <TableCell>{transaction.college}</TableCell>
                        <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
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
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium mb-1">Important:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• This action will map the selected transactions to the selected donors</li>
                    <li>• The donor amounts will be allocated to cover the transaction amounts</li>
                    <li>• This action cannot be undone once confirmed</li>
                    {totalUnallocatedAmount < totalTransactionAmount && (
                      <li className="text-red-600 font-medium">• Warning: Insufficient funds - some transactions may not be fully covered</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmMapping}
              disabled={totalUnallocatedAmount < totalTransactionAmount}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Mapping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 