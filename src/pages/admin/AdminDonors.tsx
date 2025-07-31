import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUp, ArrowDown, Eye, Users, Ban, Gift, LogIn, AlertTriangle, MapPin, Square, CheckSquare, DollarSign, IndianRupee } from "lucide-react";

// Mock data with actual student mapping information
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
    isBlocked: false,
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
    isBlocked: true,
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

export default function AdminDonors() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("");
  const [openDonor, setOpenDonor] = useState(null);
  const [openDonationDetails, setOpenDonationDetails] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);

  // Handle preserved selections when navigating back from donor mapping
  useEffect(() => {
    if (location.state?.selectedDonors) {
      setSelectedDonors(location.state.selectedDonors);
    }
  }, [location.state]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const handleBlockDonor = (donorId: string) => {
    // In a real application, this would make an API call
    alert(`Donor ${donorId} has been ${mockDonorMappings.find(d => d.donorId === donorId)?.isBlocked ? 'unblocked' : 'blocked'}`);
  };

  const handleDirectLogin = (donorId: string) => {
    // In a real application, this would redirect to donor login or generate a login link
    alert(`Direct login link generated for donor ${donorId}`);
  };

  const toggleDonorSelection = (donorId: string) => {
    setSelectedDonors(prev => 
      prev.includes(donorId) 
        ? prev.filter(id => id !== donorId)
        : [...prev, donorId]
    );
  };

  // Calculate unallocated amount for a donor
  const getUnallocatedAmount = (donor: any) => {
    const totalAllocated = donor.studentMappings.reduce((sum: number, mapping: any) => sum + mapping.amount, 0);
    return donor.totalDonated - totalAllocated;
  };

  // Calculate total unallocated amount for all donors
  const getTotalUnallocatedAmount = () => {
    return mockDonorMappings.reduce((sum, donor) => sum + getUnallocatedAmount(donor), 0);
  };

  // Calculate total unmapped transaction amount (sum of all unmapped transactions)
  const getTotalUnmappedTransactionAmount = () => {
    // This should be the sum of all unmapped transactions
    // For now, using a mock value that represents all unmapped transactions
    return 65900; // Mock value for all unmapped transactions
  };

  // Calculate cumulative amount for selected donors
  const getSelectedDonorsCumulativeAmount = () => {
    return selectedDonors.reduce((sum, donorId) => {
      const donor = mockDonorMappings.find(d => d.donorId === donorId);
      if (donor) {
        return sum + getUnallocatedAmount(donor);
      }
      return sum;
    }, 0);
  };

  const toggleSelectAll = () => {
    if (selectedDonors.length === filtered.length) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(filtered.map(d => d.donorId));
    }
  };

  const handleMapping = () => {
    if (selectedDonors.length === 0) {
      alert("Please select donors for mapping.");
      return;
    }
    
    // Preserve selected transactions if returning from mapping page
    const mappingState = {
      selectedDonors,
      selectedTransactions: location.state?.selectedTransactions || []
    };
    
    navigate('/admin/donor-mapping', { state: mappingState });
  };

  let filtered = mockDonorMappings.filter(d =>
    d.donorName.toLowerCase().includes(filter.toLowerCase()) || 
    d.donorId.toLowerCase().includes(filter.toLowerCase())
  );

  // Apply sorting
  if (sortBy) {
    filtered = [...filtered].sort((a, b) => {
      let aVal = sortBy === 'unallocated' ? getUnallocatedAmount(a) : a[sortBy];
      let bVal = sortBy === 'unallocated' ? getUnallocatedAmount(b) : b[sortBy];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  } else {
    // Default sorting by unallocated amount (highest to lowest)
    filtered = [...filtered].sort((a, b) => {
      const aUnallocated = getUnallocatedAmount(a);
      const bUnallocated = getUnallocatedAmount(b);
      return bUnallocated - aUnallocated; // Highest to lowest
    });
  }

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold">Donor Management</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Unallocated:</span>
              <Badge variant="default" className="bg-green-100 text-green-800 font-semibold text-base px-3 py-1">
                {getTotalUnallocatedAmount().toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-muted-foreground">Transactions:</span>
              <Badge variant="default" className="bg-orange-100 text-orange-800 font-semibold text-base px-3 py-1">
                {getTotalUnmappedTransactionAmount().toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download List</Button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Input
          className="max-w-xs"
          placeholder="Filter by donor name or ID..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button 
          variant="default" 
          disabled={selectedDonors.length === 0 || getSelectedDonorsCumulativeAmount() <= 0} 
          onClick={handleMapping}
          className="bg-green-600 hover:bg-green-700 h-auto py-3 px-4"
        >
          <IndianRupee className="inline h-4 w-4 mr-2" />
          {selectedDonors.length > 0 ? (
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-lg leading-tight">{getSelectedDonorsCumulativeAmount().toLocaleString()}</span>
              <span className="text-xs opacity-90 leading-tight">Map Donors</span>
            </div>
          ) : (
            "Map Donors"
          )}
        </Button>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Donor Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center cursor-pointer w-8" onClick={toggleSelectAll} title={selectedDonors.length === filtered.length ? 'Deselect All' : 'Select All'}>
                  {selectedDonors.length === filtered.length ? <CheckSquare className="h-5 w-5 text-blue-600 mx-auto" /> : <Square className="h-5 w-5 text-gray-400 mx-auto" />}
                </TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('donorId')}>Donor ID {sortBy === 'donorId' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('donorName')}>Name {sortBy === 'donorName' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('occupation')}>Occupation {sortBy === 'occupation' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('totalDonated')}>Total Donated {sortBy === 'totalDonated' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('unallocated')}>Unallocated Amount {sortBy === 'unallocated' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('lastDonation')}>Last Donation {sortBy === 'lastDonation' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('donationType')}>Donation Type {sortBy === 'donationType' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('autoDebit')}>Auto Debit {sortBy === 'autoDebit' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>

                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(donor => (
                <TableRow 
                  key={donor.donorId} 
                  className={`${donor.isBlocked ? "bg-red-50" : ""} cursor-pointer hover:bg-gray-50`}
                  onClick={(e) => {
                    // Don't trigger selection if clicking on actions column or checkbox column
                    const target = e.target as HTMLElement;
                    if (!target.closest('td:last-child') && !target.closest('td:first-child')) {
                      toggleDonorSelection(donor.donorId);
                    }
                  }}
                >
                  <TableCell className="text-center w-8" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => toggleDonorSelection(donor.donorId)} 
                      title={selectedDonors.includes(donor.donorId) ? 'Deselect' : 'Select'}
                      className="h-8 w-8 p-0"
                    >
                      {selectedDonors.includes(donor.donorId) ? <CheckSquare className="h-5 w-5 text-blue-600 mx-auto" /> : <Square className="h-5 w-5 text-gray-400 mx-auto" />}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">{donor.donorId}</TableCell>
                  <TableCell className="text-center">
                    {donor.donorName}
                  </TableCell>
                  <TableCell className="text-center">{donor.occupation}</TableCell>
                  <TableCell className="text-center">₹{donor.totalDonated.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-200 inline-block">
                      ₹{getUnallocatedAmount(donor).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{donor.lastDonation}</TableCell>
                  <TableCell className="text-center">{donor.donationType}</TableCell>
                  <TableCell className="text-center">
                    {donor.autoDebit
                      ? <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                      : <Badge variant="default" className="bg-yellow-100 text-yellow-800">No</Badge>
                    }
                  </TableCell>

                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1 justify-center">
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => setOpenDonor(donor)}
                        className="h-8 w-8 p-0"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBlockDonor(donor.donorId)}
                        className={`h-8 w-8 p-0 ${donor.isBlocked ? 'text-yellow-600 hover:text-yellow-700' : 'text-red-600 hover:text-red-700'}`}
                        title={donor.isBlocked ? "Unblock" : "Block"}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => setOpenDonationDetails(donor)}
                        className="h-8 w-8 p-0"
                        title="Donation Details"
                      >
                        <Gift className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDirectLogin(donor.donorId)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                        title="Direct Login"
                      >
                        <LogIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Donor Details Modal */}
      <Dialog open={!!openDonor} onOpenChange={() => setOpenDonor(null)}>
        <DialogContent className="max-w-4xl">
          {openDonor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {openDonor.donorName} ({openDonor.donorId})
                  {openDonor.isBlocked && <Ban className="h-5 w-5 text-red-500" />}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Donor Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Total Donated</div>
                    <div className="text-2xl font-bold text-green-600">₹{openDonor.totalDonated.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Active Students</div>
                    <div className="text-2xl font-bold text-blue-600">{openDonor.activeStudents}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Occupation</div>
                    <div className="text-lg">{openDonor.occupation}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Donation Type</div>
                    <div className="text-lg">{openDonor.donationType}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Last Donation</div>
                    <div className="text-lg">{openDonor.lastDonation}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Auto Debit</div>
                    <div className="text-lg">
                      {openDonor.autoDebit ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                      ) : (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">No</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Email</div>
                    <div className="text-lg">{openDonor.email}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Phone</div>
                    <div className="text-lg">{openDonor.phone}</div>
                  </div>
                </div>

                {/* Student Mappings */}
                {openDonor.studentMappings.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-4">Sponsored Students</h4>
                    <div className="space-y-3">
                      {openDonor.studentMappings.map((mapping, index) => (
                        <div key={mapping.studentId} className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{mapping.studentName}</div>
                            <div className="text-sm text-muted-foreground">{mapping.college}</div>
                            <div className="text-xs text-muted-foreground">Student ID: {mapping.studentId}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">₹{mapping.amount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Mapped: {mapping.mappingDate}</div>
                            <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                              {mapping.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No students currently mapped to this donor</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Donation Details Modal */}
      <Dialog open={!!openDonationDetails} onOpenChange={() => setOpenDonationDetails(null)}>
        <DialogContent className="max-w-2xl">
          {openDonationDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Donation History - {openDonationDetails.donorName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Total Donated</div>
                    <div className="text-2xl font-bold text-green-600">₹{openDonationDetails.totalDonated.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Donation Type</div>
                    <div className="text-lg">{openDonationDetails.donationType}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Donation History</h4>
                  <div className="space-y-3">
                    {openDonationDetails.donationHistory.map((donation, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{donation.date}</div>
                          <div className="text-sm text-muted-foreground">{donation.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">₹{donation.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 