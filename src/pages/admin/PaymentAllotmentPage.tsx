import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentMappingConfirmation } from "@/components/ui/payment-mapping-confirmation";
import { ArrowLeft, CreditCard, CheckCircle, Loader2, DollarSign } from "lucide-react";
import { Student, StudentStatus } from "@/types/student";
import { fetchStudents, updateStudentStatus, getStatusColor, getStatusText } from "@/utils/studentService";

interface PaymentAllotmentPageProps {
  selectedStudents?: string[];
}

export default function PaymentAllotmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedStudents = location.state?.selectedStudents || [];
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentAmounts, setStudentAmounts] = useState<{[key: string]: number}>({});
  const [processing, setProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (selectedStudents.length === 0) {
      navigate('/admin/students');
      return;
    }
    loadSelectedStudents();
  }, [selectedStudents]);

  const loadSelectedStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchStudents({
        offset: 0,
        limit: 100,
        status: undefined,
        search: undefined,
      });
      
      if (response.success) {
        // Filter only selected students and add mock data for demonstration
        const selectedStudentsData = response.students
          .filter(student => selectedStudents.includes(student.id || ''))
          .map(student => ({
            ...student,
            collegeFee: Math.floor(Math.random() * 50000) + 50000, // Mock college fee
            lastAllottedAmount: Math.floor(Math.random() * 20000) + 10000, // Mock last allotted amount
          }));
        
        setStudents(selectedStudentsData);
        
        // Initialize amounts with last allotted amounts
        const initialAmounts: {[key: string]: number} = {};
        selectedStudentsData.forEach(student => {
          initialAmounts[student.id || ''] = student.lastAllottedAmount || 0;
        });
        setStudentAmounts(initialAmounts);
      } else {
        setError(response.error || 'Failed to fetch students');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (studentId: string, amount: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    
    // Allow empty string or valid numbers
    const numAmount = cleanAmount === '' ? 0 : (parseFloat(cleanAmount) || 0);
    
    setStudentAmounts(prev => ({
      ...prev,
      [studentId]: numAmount
    }));
  };

  const handleAllotPayment = async () => {
    setProcessing(true);
    
    try {
      // Update student statuses to PAYMENT_PENDING
      const updatePromises = students.map(async (student) => {
        const result = await updateStudentStatus(student.id || '', StudentStatus.PAYMENT_PENDING);
        if (!result.success) {
          console.error(`Failed to update status for student ${student.id}:`, result.error);
        }
        return result;
      });

      await Promise.all(updatePromises);
      
      setShowConfirmDialog(false);
      setProcessing(false);
      
      // Show success message and redirect back to students page with active tab
      alert(`Payment allotted to ${students.length} students. Status updated to Payment Pending.`);
      navigate('/admin/students', { state: { activeTab: 'all', preserveSelection: false } });
      
    } catch (error) {
      console.error('Failed to allot payments:', error);
      alert('Failed to allot payments. Please try again.');
      setProcessing(false);
    }
  };

  const getTotalAmount = () => {
    return Object.values(studentAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  if (loading) {
    return (
      <div className="main-content-container">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading selected students...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/students', { 
              state: { 
                activeTab: 'all', 
                preserveSelection: true,
                selectedStudents: selectedStudents 
              } 
            })}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Payment Allotment</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-green-600">₹{getTotalAmount().toLocaleString()}</div>
          </div>
          <Button 
            variant="default" 
            onClick={() => setShowConfirmDialog(true)}
            disabled={processing}
            className="bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Confirm Allotment
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Selected Students ({students.length})</CardTitle>
          <CardDescription>
            Review and adjust payment amounts for the selected students. 
            Students will be updated to "Payment Pending" status after allotment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>College Fee</TableHead>
                  <TableHead>Last Allotted</TableHead>
                  <TableHead>Allot Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">
                      {student.id || 'Pending ID'}
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.college}</TableCell>
                    <TableCell>₹{(student.collegeFee || 0).toLocaleString()}</TableCell>
                    <TableCell>₹{(student.lastAllottedAmount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={studentAmounts[student.id || ''] ? studentAmounts[student.id || ''].toString() : ''}
                        onChange={(e) => handleAmountChange(student.id || '', e.target.value)}
                        className="w-32"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {getStatusText(student.status)}
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
      <PaymentMappingConfirmation
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        selectedTransactions={students.map(student => ({
          id: student.id || '',
          amount: studentAmounts[student.id || ''] || 0,
          date: new Date().toISOString().split('T')[0],
          studentId: student.id || '',
          studentName: student.name || '',
          college: student.college || '',
          description: `College Fee: ₹${(student.collegeFee || 0).toLocaleString()}`
        }))}
        selectedDonors={[]} // No donors in payment allotment
        totalTransactionAmount={getTotalAmount()}
        totalDonorAmount={0} // No donor amount in payment allotment
        onConfirm={handleAllotPayment}
        title="Confirm Payment Allotment"
        showTransactionDescription={true}
      />
    </div>
  );
} 