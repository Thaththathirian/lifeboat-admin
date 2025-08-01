import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description?: string;
  source?: string;
  status?: string;
  studentId: string;
  studentName: string;
  college: string;
}

interface Donor {
  id: string;
  name: string;
  email?: string;
  unallocatedAmount: number;
  status?: string;
  totalDonated?: number;
  allocated?: number;
  isBlocked?: boolean;
  studentMappings?: any[];
}

interface PaymentMappingConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTransactions: Transaction[];
  selectedDonors: Donor[];
  totalTransactionAmount: number;
  totalDonorAmount: number;
  onConfirm: () => void;
  processing?: boolean;
  title?: string;
  showDonorEmail?: boolean;
  showTransactionDescription?: boolean;
  showTransactionStatus?: boolean;
  showDonorStatus?: boolean;
  showDonorAllocated?: boolean;
  showDonorTotalDonated?: boolean;
}

export function PaymentMappingConfirmation({
  open,
  onOpenChange,
  selectedTransactions,
  selectedDonors,
  totalTransactionAmount,
  totalDonorAmount,
  onConfirm,
  processing = false,
  title = "Confirm Payment Mapping",
  showDonorEmail = false,
  showTransactionDescription = false,
  showTransactionStatus = false,
  showDonorStatus = false,
  showDonorAllocated = false,
  showDonorTotalDonated = false,
}: PaymentMappingConfirmationProps) {
  const isSufficient = totalDonorAmount >= totalTransactionAmount;
  const surplus = totalDonorAmount - totalTransactionAmount;
  const shortfall = totalTransactionAmount - totalDonorAmount;

  const getUnallocatedAmount = (donor: Donor) => {
    if (donor.unallocatedAmount !== undefined) {
      return donor.unallocatedAmount;
    }
    if (donor.totalDonated && donor.studentMappings) {
      const allocated = donor.studentMappings.reduce((sum: number, mapping: any) => sum + mapping.amount, 0);
      return donor.totalDonated - allocated;
    }
    return 0;
  };

  // Sample data for demonstration
  const sampleTransactions: Transaction[] = [
    { id: "TXN001", amount: 25000, date: "2024-01-15", studentId: "STU001", studentName: "John Doe", college: "Engineering College" },
    { id: "TXN002", amount: 15000, date: "2024-01-16", studentId: "STU002", studentName: "Jane Smith", college: "Medical College" },
    { id: "TXN003", amount: 30000, date: "2024-01-17", studentId: "STU003", studentName: "Bob Johnson", college: "Business School" }
  ];

  const sampleDonors: Donor[] = [
    { id: "DON001", name: "Alice Wilson", unallocatedAmount: 40000, totalDonated: 100000 },
    { id: "DON002", name: "Charlie Brown", unallocatedAmount: 35000, totalDonated: 75000 }
  ];

  const transactions = selectedTransactions.length > 0 ? selectedTransactions : sampleTransactions;
  const donors = selectedDonors.length > 0 ? selectedDonors : sampleDonors;
  const transactionTotal = totalTransactionAmount > 0 ? totalTransactionAmount : 70000;
  const donorTotal = totalDonorAmount > 0 ? totalDonorAmount : 75000;

  const isActuallySufficient = donorTotal >= transactionTotal;
  const actualSurplus = donorTotal - transactionTotal;
  const actualShortfall = transactionTotal - donorTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Summary Cards - made smaller and badge-like */}
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <div className="text-xs font-medium text-blue-700">Transactions:</div>
              <div className="text-xs font-bold text-blue-700">₹{transactionTotal.toLocaleString()}</div>
              <div className="text-xs text-blue-600">({transactions.length})</div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <div className="text-xs font-medium text-green-700">Available:</div>
              <div className="text-xs font-bold text-green-700">₹{donorTotal.toLocaleString()}</div>
              <div className="text-xs text-green-600">({donors.length})</div>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isActuallySufficient 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="text-xs font-medium">Status:</div>
              <div className={`text-xs font-bold ${
                isActuallySufficient ? 'text-green-700' : 'text-red-700'
              }`}>
                {isActuallySufficient ? 'Sufficient' : 'Insufficient'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isActuallySufficient 
                  ? `(+₹${actualSurplus.toLocaleString()})`
                  : `(-₹${actualShortfall.toLocaleString()})`
                }
              </div>
            </div>
          </div>

          {/* Selected Donors */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-green-700">Selected Donors</h3>
            <div className={`border rounded-md ${donors.length <= 5 ? '' : 'max-h-[160px] overflow-y-auto'} relative`}>
              <table className="w-full">
                <thead className="sticky top-0 bg-blue-50 z-10 border-b">
                  <tr className="h-8">
                    <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Donor ID</th>
                    <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Name</th>
                    {showDonorEmail && <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Email</th>}
                    {showDonorTotalDonated && <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Total Donated</th>}
                    {showDonorAllocated && <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Allocated</th>}
                    <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Unallocated Amount</th>
                  </tr>
                </thead>
                <tbody>
                 {donors.map((donor, index) => (
                   <tr key={donor.id} className={`h-8 ${index < donors.length - 1 ? 'border-b' : ''}`}>
                     <td className="font-medium py-1 text-xs px-2 text-center">{donor.id}</td>
                     <td className="py-1 text-xs px-2 text-center">{donor.name}</td>
                     {showDonorEmail && <td className="py-1 text-xs px-2 text-center">{donor.email}</td>}
                     {showDonorTotalDonated && (
                       <td className="py-1 text-xs px-2 text-center">₹{donor.totalDonated?.toLocaleString() || '0'}</td>
                     )}
                     {showDonorAllocated && (
                       <td className="py-1 text-xs px-2 text-center">
                         ₹{donor.studentMappings?.reduce((sum: number, mapping: any) => sum + mapping.amount, 0).toLocaleString() || '0'}
                       </td>
                     )}
                     <td className="py-1 text-xs px-2 text-center">₹{getUnallocatedAmount(donor).toLocaleString()}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         {/* Selected Transactions */}
         <div>
           <h3 className="text-sm font-semibold mb-2 text-blue-700">Selected Transactions</h3>
           <div className={`border rounded-md ${transactions.length <= 5 ? '' : 'max-h-[160px] overflow-y-auto'} relative`}>
              <table className="w-full">
                <thead className="sticky top-0 bg-blue-50 z-10 border-b">
                  <tr className="h-8">
                    <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Transaction ID</th>
                    <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Student</th>
                    <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">College</th>
                    <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Amount</th>
                    <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Date</th>
                    {showTransactionDescription && <th className="h-8 py-1 text-xs text-center font-medium bg-blue-50 px-2">Description</th>}
                  </tr>
                </thead>
                <tbody>
                 {transactions.map((transaction, index) => (
                   <tr key={transaction.id} className={`h-8 ${index < transactions.length - 1 ? 'border-b' : ''}`}>
                     <td className="font-medium py-1 text-xs px-2 text-center">{transaction.id}</td>
                     <td className="py-1 text-xs px-2 text-center">
                       <div>{transaction.studentName}</div>
                       <div className="text-xs text-gray-500">{transaction.studentId}</div>
                     </td>
                     <td className="py-1 text-xs px-2 text-center">{transaction.college}</td>
                     <td className="py-1 text-xs px-2 text-center">₹{transaction.amount.toLocaleString()}</td>
                     <td className="py-1 text-xs px-2 text-center">{transaction.date}</td>
                     {showTransactionDescription && (
                       <td className="py-1 text-xs px-2 text-center">{transaction.description}</td>
                     )}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

          {/* Warning Message */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <div className="font-medium mb-1">Important:</div>
                <ul className="space-y-0.5 text-xs">
                  <li>• This action will map all selected transactions to the selected donors</li>
                  <li>• The donor amounts will be allocated to cover the transaction amounts</li>
                  <li>• This action cannot be undone once confirmed</li>
                  {isActuallySufficient && (
                    <li className="text-green-600 font-medium">
                      • Surplus amount (₹{actualSurplus.toLocaleString()}) will be returned to the donor with the highest remaining unallocated amount
                    </li>
                  )}
                  {!isActuallySufficient && (
                    <li className="text-red-600 font-medium">• Warning: Insufficient mapping amount - some transactions may not be fully covered</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={processing}
            size="sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={processing || !isActuallySufficient}
            size="sm"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg"
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
  );
}