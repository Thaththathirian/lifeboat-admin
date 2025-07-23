import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  FileText, 
  Search, 
  Download,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users
} from 'lucide-react';
import { collegeColors } from '@/styles/college-colors';

// Mock data for verified colleges
const mockVerifiedColleges = [
  { 
    id: 'COL001', 
    name: 'Mumbai University', 
    contactPerson: 'Dr. Amit Sharma',
    phone: '+91-9876543210',
    email: 'admin@mumbai.edu.in',
    students: 45,
    establishedYear: '1995',
    address: '123 Education Street, Mumbai, Maharashtra',
    departments: 12,
    totalReceived: 4500000,
    status: 'Active'
  },
  { 
    id: 'COL002', 
    name: 'Delhi College of Engineering', 
    contactPerson: 'Prof. Priya Singh',
    phone: '+91-9876543211',
    email: 'info@dce.edu.in',
    students: 32,
    establishedYear: '2001',
    address: '456 Tech Road, Delhi',
    departments: 8,
    totalReceived: 3200000,
    status: 'Active'
  },
  { 
    id: 'COL003', 
    name: 'Chennai Medical College', 
    contactPerson: 'Dr. Rajesh Kumar',
    phone: '+91-9876543212',
    email: 'contact@cmc.edu.in',
    students: 28,
    establishedYear: '1998',
    address: '789 Medical Avenue, Chennai, Tamil Nadu',
    departments: 6,
    totalReceived: 2800000,
    status: 'Active'
  }
];

// Mock data for pending colleges
const mockPendingColleges = [
  { 
    id: 'COL004', 
    name: 'Pune Institute of Technology', 
    submitDate: '2024-07-01', 
    status: 'Document Review', 
    reason: 'University certificate pending',
    contactPerson: 'Dr. Rajesh Kumar',
    phone: '+91-9876543210',
    email: 'admin@pit.edu.in',
    establishedYear: '2010',
    departments: 8,
    totalStudents: 1200,
    address: '321 Tech Park, Pune, Maharashtra',
    documentsSubmitted: ['Registration Certificate', 'Affiliation Letter'],
    documentsPending: ['University Certificate', 'MOU Agreement']
  },
  { 
    id: 'COL005', 
    name: 'Chennai Arts College', 
    submitDate: '2024-06-15', 
    status: 'MOU Pending', 
    reason: 'Signed MOU awaiting upload',
    contactPerson: 'Prof. Meera Nair',
    phone: '+91-9876543211',
    email: 'info@cac.edu.in',
    establishedYear: '2008',
    departments: 5,
    totalStudents: 800,
    address: '654 Arts Street, Chennai, Tamil Nadu',
    documentsSubmitted: ['Registration Certificate', 'Affiliation Letter', 'University Certificate'],
    documentsPending: ['MOU Agreement']
  },
  { 
    id: 'COL006', 
    name: 'Bangalore Science Institute', 
    submitDate: '2024-07-10', 
    status: 'Initial Review', 
    reason: 'Application under initial review',
    contactPerson: 'Dr. Suresh Reddy',
    phone: '+91-9876543212',
    email: 'contact@bsi.edu.in',
    establishedYear: '2015',
    departments: 6,
    totalStudents: 950,
    address: '987 Science Boulevard, Bangalore, Karnataka',
    documentsSubmitted: ['Registration Certificate'],
    documentsPending: ['Affiliation Letter', 'University Certificate', 'MOU Agreement']
  }
];

export default function AdminColleges() {
  const [searchVerified, setSearchVerified] = useState('');
  const [searchPending, setSearchPending] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Filter functions
  const filteredVerified = mockVerifiedColleges.filter(college =>
    college.name.toLowerCase().includes(searchVerified.toLowerCase()) ||
    college.id.toLowerCase().includes(searchVerified.toLowerCase()) ||
    college.contactPerson.toLowerCase().includes(searchVerified.toLowerCase())
  );

  const filteredPending = mockPendingColleges.filter(college =>
    college.name.toLowerCase().includes(searchPending.toLowerCase()) ||
    college.id.toLowerCase().includes(searchPending.toLowerCase()) ||
    college.contactPerson.toLowerCase().includes(searchPending.toLowerCase())
  );

  const handleViewCollege = (college: any, type: 'verified' | 'pending') => {
    setSelectedCollege({ ...college, type });
    setDetailPanelOpen(true);
  };

  const handleApprove = (collegeId: string) => {
    // Mock approval logic
    console.log('Approving college:', collegeId);
    // In real app, would call API and update state
  };

  const handleReject = (collegeId: string) => {
    // Mock rejection logic
    console.log('Rejecting college:', collegeId);
    // In real app, would call API and update state
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Document Review':
        return <Badge className={`${collegeColors.pending.bg} ${collegeColors.pending.text}`}>
          Document Review
        </Badge>;
      case 'MOU Pending':
        return <Badge className={`${collegeColors.pending.bg} ${collegeColors.pending.text}`}>
          MOU Pending
        </Badge>;
      case 'Initial Review':
        return <Badge className="bg-purple-50 text-purple-800">
          Initial Review
        </Badge>;
      default:
        return <Badge className={`${collegeColors.verified.bg} ${collegeColors.verified.text}`}>
          {status}
        </Badge>;
    }
  };

  return (
    <div className="main-content-container">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">College Management</h1>
        <Button 
          variant="outline" 
          onClick={() => {
            // Export logic here
            console.log('Exporting data...');
          }}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="verified" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="verified" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verified Colleges ({filteredVerified.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pending Verification ({filteredPending.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verified" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search verified colleges..."
                value={searchVerified}
                onChange={(e) => setSearchVerified(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={collegeColors.table.header}>
                  <TableHead>College Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerified.map((college) => (
                  <TableRow key={college.id} className={collegeColors.table.row}>
                    <TableCell>
                      <div className="font-medium">{college.name}</div>
                      <div className="text-sm text-gray-500">{college.id}</div>
                    </TableCell>
                    <TableCell>{college.contactPerson}</TableCell>
                    <TableCell>{college.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{college.students} Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewCollege(college, 'verified')}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pending colleges..."
                value={searchPending}
                onChange={(e) => setSearchPending(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={collegeColors.table.header}>
                  <TableHead>College Name</TableHead>
                  <TableHead>Submit Date</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPending.map((college) => (
                  <TableRow key={college.id} className={collegeColors.table.row}>
                    <TableCell>
                      <div className="font-medium">{college.name}</div>
                      <div className="text-sm text-gray-500">{college.id}</div>
                    </TableCell>
                    <TableCell>{college.submitDate}</TableCell>
                    <TableCell>{college.contactPerson}</TableCell>
                    <TableCell>{getStatusBadge(college.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewCollege(college, 'pending')}
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(college.id)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(college.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Right-to-Left Detail Panel */}
      <Sheet open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                College Details
              </SheetTitle>
            </SheetHeader>
            
            {selectedCollege && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{selectedCollege.name}</h3>
                  <div className="text-sm text-gray-500">{selectedCollege.id}</div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Established: {selectedCollege.establishedYear}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Departments: {selectedCollege.departments}</span>
                    </div>
                    {selectedCollege.type === 'verified' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Active Students: {selectedCollege.students}</span>
                      </div>
                    )}
                    {selectedCollege.type === 'pending' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Total Students: {selectedCollege.totalStudents}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">{selectedCollege.contactPerson}</div>
                        <div className="text-gray-600">{selectedCollege.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedCollege.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">{selectedCollege.address}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Additional Info */}
                {selectedCollege.type === 'pending' && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-medium">Application Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Current Status:</span>
                          {getStatusBadge(selectedCollege.status)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Reason:</span>
                          <div className="text-gray-600 mt-1">{selectedCollege.reason}</div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Submit Date:</span>
                          <div className="text-gray-600">{selectedCollege.submitDate}</div>
                        </div>
                      </div>
                    </div>

                    {/* Documents Status */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Documents Status</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm font-medium mb-2">Submitted:</div>
                          {selectedCollege.documentsSubmitted?.map((doc: string) => (
                            <div key={doc} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Pending:</div>
                          {selectedCollege.documentsPending?.map((doc: string) => (
                            <div key={doc} className="flex items-center gap-2 text-sm">
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedCollege.type === 'verified' && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Financial Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Received:</span>
                        <span className="font-medium">₹{selectedCollege.totalReceived?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge className={`${collegeColors.verified.bg} ${collegeColors.verified.text}`}>
                          {selectedCollege.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedCollege.type === 'pending' && (
                  <div className="space-y-2 pt-4 border-t">
                    <Button 
                      className="w-full"
                      onClick={() => handleApprove(selectedCollege.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve College
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleReject(selectedCollege.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}