import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PaymentMappingConfirmation } from "@/components/ui/payment-mapping-confirmation";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const mockDonorMappings = [
  { 
    id: "MAP001", 
    donorId: "DON001", 
    donorName: "John Doe", 
    studentId: "STU001", 
    studentName: "Rahul Kumar", 
    amountAllocated: 50000, 
    allocationDate: "2024-01-15",
    status: "Active",
    college: "ABC Engineering College"
  },
  { 
    id: "MAP002", 
    donorId: "DON002", 
    donorName: "Sarah Wilson", 
    studentId: "STU002", 
    studentName: "Priya Singh", 
    amountAllocated: 50000, 
    allocationDate: "2024-01-20",
    status: "Active",
    college: "XYZ Medical College"
  },
  { 
    id: "MAP003", 
    donorId: "DON004", 
    donorName: "Priya Sharma", 
    studentId: "STU003", 
    studentName: "Amit Verma", 
    amountAllocated: 40000, 
    allocationDate: "2024-02-01",
    status: "Completed",
    college: "PQR Arts College"
  },
];

const mockAvailableDonors = [
  { id: "DON001", name: "John Doe", unallocatedAmount: 50000 },
  { id: "DON002", name: "Sarah Wilson", unallocatedAmount: 0 },
  { id: "DON003", name: "Amit Patel", unallocatedAmount: 75000 },
  { id: "DON004", name: "Priya Sharma", unallocatedAmount: 80000 },
];

const mockEligibleStudents = [
  { id: "STU004", name: "Neha Patel", college: "Tech University", requiredAmount: 60000 },
  { id: "STU005", name: "Rohit Sharma", college: "Science College", requiredAmount: 45000 },
  { id: "STU006", name: "Anita Das", college: "Commerce College", requiredAmount: 55000 },
];

export default function DonorMapping() {
  const [filter, setFilter] = useState("");
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [mappingDialog, setMappingDialog] = useState(false);
  const [studentAllocations, setStudentAllocations] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  const filtered = mockDonorMappings.filter(mapping =>
    mapping.donorName.toLowerCase().includes(filter.toLowerCase()) || 
    mapping.studentName.toLowerCase().includes(filter.toLowerCase()) ||
    mapping.donorId.toLowerCase().includes(filter.toLowerCase()) ||
    mapping.studentId.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDonorSelection = (donorId: string, checked: boolean) => {
    if (checked) {
      setSelectedDonors([...selectedDonors, donorId]);
    } else {
      setSelectedDonors(selectedDonors.filter(id => id !== donorId));
    }
  };

  const handleAllocation = (studentId: string, amount: number) => {
    setStudentAllocations({...studentAllocations, [studentId]: amount});
  };

  const getTotalSelectedAmount = () => {
    return selectedDonors.reduce((total, donorId) => {
      const donor = mockAvailableDonors.find(d => d.id === donorId);
      return total + (donor?.unallocatedAmount || 0);
    }, 0);
  };

  const getTotalAllocatedAmount = () => {
    return Object.values(studentAllocations).reduce((total, amount) => total + amount, 0);
  };

  const handleCreateMapping = () => {
    const totalSelected = getTotalSelectedAmount();
    const totalAllocated = getTotalAllocatedAmount();
    
    if (totalAllocated > totalSelected) {
      toast({
        title: "Invalid Allocation",
        description: "Total allocated amount exceeds available donor funds",
        variant: "destructive"
      });
      return;
    }

    // Logic for creating mappings
    toast({
      title: "Mapping Created",
      description: "Donor-student mapping has been successfully created",
    });
    setMappingDialog(false);
    setSelectedDonors([]);
    setStudentAllocations({});
  };

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Donor-Student Mapping</h2>
        <div className="flex gap-2">
          <Dialog open={mappingDialog} onOpenChange={setMappingDialog}>
            <DialogTrigger asChild>
              <Button>Create New Mapping</Button>
            </DialogTrigger>
          </Dialog>
          
          <PaymentMappingConfirmation
            open={mappingDialog}
            onOpenChange={setMappingDialog}
            selectedTransactions={mockEligibleStudents.map(student => ({
              id: student.id,
              amount: studentAllocations[student.id] || 0,
              date: new Date().toISOString().split('T')[0],
              studentId: student.id,
              studentName: student.name,
              college: student.college,
              description: `Required: ₹${student.requiredAmount.toLocaleString()}`
            }))}
            selectedDonors={mockAvailableDonors.filter(donor => selectedDonors.includes(donor.id)).map(donor => ({
              id: donor.id,
              name: donor.name,
              unallocatedAmount: donor.unallocatedAmount
            }))}
            totalTransactionAmount={getTotalAllocatedAmount()}
            totalDonorAmount={getTotalSelectedAmount()}
            onConfirm={handleCreateMapping}
            title="Create Donor-Student Mapping"
            showTransactionDescription={true}
          />
          <Button variant="outline">Download Report</Button>
        </div>
      </div>

      <Input
        className="mb-4 max-w-xs"
        placeholder="Filter mappings..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Current Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Mapping ID</TableHead>
                <TableHead className="text-center">Donor</TableHead>
                <TableHead className="text-center">Student</TableHead>
                <TableHead className="text-center">College</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(mapping => (
                <TableRow key={mapping.id}>
                  <TableCell className="text-center">{mapping.id}</TableCell>
                  <TableCell className="text-center">
                    <div>{mapping.donorName}</div>
                    <div className="text-sm text-muted-foreground">{mapping.donorId}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div>{mapping.studentName}</div>
                    <div className="text-sm text-muted-foreground">{mapping.studentId}</div>
                  </TableCell>
                  <TableCell className="text-center">{mapping.college}</TableCell>
                  <TableCell className="text-center">₹{mapping.amountAllocated.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{mapping.allocationDate}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={mapping.status === "Active" ? "default" : "secondary"}>
                      {mapping.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" variant="outline">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}