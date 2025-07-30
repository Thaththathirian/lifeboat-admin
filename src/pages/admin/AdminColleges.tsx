import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pagination } from '@/components/ui/pagination';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Search, 
  Download,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  LogIn
} from 'lucide-react';
import { collegeColors } from '@/styles/college-colors';
import { 
  getVerifiedColleges, 
  getUnverifiedColleges, 
  approveCollege, 
  rejectCollege,
  updateCollegeStatus,
  deleteCollege,
  type College 
} from '@/utils/collegeService';

export default function AdminColleges() {
  const [searchVerified, setSearchVerified] = useState('');
  const [searchUnverified, setSearchUnverified] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // API data states
  const [verifiedColleges, setVerifiedColleges] = useState<College[]>([]);
  const [unverifiedColleges, setUnverifiedColleges] = useState<College[]>([]);
  const [loadingVerified, setLoadingVerified] = useState(false);
  const [loadingUnverified, setLoadingUnverified] = useState(false);
  const [errorVerified, setErrorVerified] = useState<string | null>(null);
  const [errorUnverified, setErrorUnverified] = useState<string | null>(null);
  const [totalVerified, setTotalVerified] = useState(0);
  const [totalUnverified, setTotalUnverified] = useState(0);

  // Pagination states
  const [verifiedOffset, setVerifiedOffset] = useState(0);
  const [unverifiedOffset, setUnverifiedOffset] = useState(0);
  const limit = 10;

  // Fetch verified colleges
  const fetchVerifiedColleges = async () => {
    setLoadingVerified(true);
    setErrorVerified(null);
    
    try {
      const response = await getVerifiedColleges(limit, verifiedOffset);
      if (response.success && response.data) {
        setVerifiedColleges(response.data);
        setTotalVerified(response.total || 0);
      } else {
        setErrorVerified(response.error || 'Failed to fetch verified colleges');
      }
    } catch (error) {
      setErrorVerified('An unexpected error occurred');
      console.error('Error fetching verified colleges:', error);
    } finally {
      setLoadingVerified(false);
    }
  };

  // Fetch unverified colleges
  const fetchUnverifiedColleges = async () => {
    setLoadingUnverified(true);
    setErrorUnverified(null);
    
    try {
      const response = await getUnverifiedColleges(limit, unverifiedOffset);
      if (response.success && response.data) {
        setUnverifiedColleges(response.data);
        setTotalUnverified(response.total || 0);
      } else {
        setErrorUnverified(response.error || 'Failed to fetch unverified colleges');
      }
    } catch (error) {
      setErrorUnverified('An unexpected error occurred');
      console.error('Error fetching unverified colleges:', error);
    } finally {
      setLoadingUnverified(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchVerifiedColleges();
    fetchUnverifiedColleges();
  }, [verifiedOffset, unverifiedOffset]);

  // Filter functions
  const filteredVerified = verifiedColleges.filter(college =>
    college.name.toLowerCase().includes(searchVerified.toLowerCase()) ||
    (college.representative_name || college.contactPerson || '').toLowerCase().includes(searchVerified.toLowerCase())
  );

  const filteredUnverified = unverifiedColleges.filter(college =>
    college.name.toLowerCase().includes(searchUnverified.toLowerCase()) ||
    (college.representative_name || college.contactPerson || '').toLowerCase().includes(searchUnverified.toLowerCase())
  );

  const handleViewCollege = (college: any, type: 'verified' | 'unverified') => {
    setSelectedCollege({ ...college, type });
    setDetailPanelOpen(true);
  };

  const handleApprove = async (collegeId: string) => {
    try {
      const response = await updateCollegeStatus(collegeId, 1);
      if (response.success) {
        // Refresh both lists to reflect the status change
        fetchVerifiedColleges();
        fetchUnverifiedColleges();
        // Close detail panel if it's open for this college
        if (selectedCollege?.id === collegeId) {
          setDetailPanelOpen(false);
        }
      } else {
        console.error('Failed to approve college:', response.error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error approving college:', error);
    }
  };

  const handleReject = async (collegeId: string) => {
    try {
      const response = await deleteCollege(collegeId);
      if (response.success) {
        // Refresh only the unverified colleges list since the college is deleted
        fetchUnverifiedColleges();
        // Close detail panel if it's open for this college
        if (selectedCollege?.id === collegeId) {
          setDetailPanelOpen(false);
        }
      } else {
        console.error('Failed to reject college:', response.error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error rejecting college:', error);
    }
  };

  const handleUnverifyCollege = async (collegeId: string) => {
    try {
      const response = await updateCollegeStatus(collegeId, 0);
      if (response.success) {
        // Refresh both lists to reflect the status change
        fetchVerifiedColleges();
        fetchUnverifiedColleges();
        // Close detail panel if it's open for this college
        if (selectedCollege?.id === collegeId) {
          setDetailPanelOpen(false);
        }
      } else {
        console.error('Failed to unverify college:', response.error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error unverifying college:', error);
    }
  };

  const handleDirectLogin = (collegeId: string) => {
    // In a real application, this would redirect to college login or generate a login link
    alert(`Direct login link generated for college ${collegeId}`);
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
      case 'Active':
      case '1':
        return <Badge className={`${collegeColors.verified.bg} ${collegeColors.verified.text}`}>
          Active
        </Badge>;
      default:
        return <Badge className={`${collegeColors.pending.bg} ${collegeColors.pending.text}`}>
          Pending
        </Badge>;
    }
  };

  const handleExport = () => {
    // Export logic here
    console.log('Exporting data...');
  };

  // Pagination handlers
  const handleVerifiedPageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    setVerifiedOffset(newOffset);
  };

  const handleUnverifiedPageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    setUnverifiedOffset(newOffset);
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  // Apply sorting to verified colleges
  let sortedVerified = [...filteredVerified];
  if (sortBy) {
    sortedVerified = sortedVerified.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="main-content-container">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">College Management</h1>
        <Button 
          variant="outline" 
          onClick={handleExport}
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
            Verified Colleges ({totalVerified})
          </TabsTrigger>
          <TabsTrigger value="unverified" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pending Verification ({totalUnverified})
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

          {errorVerified && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorVerified}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <Table>
                             <TableHeader>
                 <TableRow className={collegeColors.table.header}>
                   <TableHead className="text-center cursor-pointer" onClick={() => handleSort('name')}>College Name {sortBy === 'name' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                   <TableHead className="text-center cursor-pointer" onClick={() => handleSort('representative_name')}>Contact Person {sortBy === 'representative_name' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                   <TableHead className="text-center cursor-pointer" onClick={() => handleSort('representative_mobile')}>Phone {sortBy === 'representative_mobile' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                   <TableHead className="text-center cursor-pointer" onClick={() => handleSort('activeStudents')}>Students {sortBy === 'activeStudents' && (sortDir === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                   <TableHead className="text-center">Actions</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {loadingVerified ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading verified colleges...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedVerified.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {errorVerified ? 'Failed to load colleges' : 'No verified colleges found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedVerified.map((college) => (
                    <TableRow key={college.id} className={collegeColors.table.row}>
                                             <TableCell className="text-center">
                         <div className="font-medium">{college.name}</div>
                       </TableCell>
                                               <TableCell className="text-center">{college.representative_name || college.contactPerson}</TableCell>
                        <TableCell className="text-center">{college.representative_mobile || college.phone}</TableCell>
                       <TableCell className="text-center">
                         <Badge variant="secondary">{college.activeStudents || 0} Active</Badge>
                       </TableCell>
                                               <TableCell className="text-center">
                         <div className="flex gap-1 justify-center">
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handleViewCollege(college, 'verified')}
                             className="h-8 w-8 p-0"
                             title="View Details"
                           >
                             <Eye className="h-4 w-4" />
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handleUnverifyCollege(college.id)}
                             className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                             title="Unverify College"
                           >
                             <XCircle className="h-4 w-4" />
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handleDirectLogin(college.id)}
                             className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                             title="Direct Login"
                           >
                             <LogIn className="h-4 w-4" />
                           </Button>
                         </div>
                       </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination for verified colleges */}
          <Pagination
            currentPage={Math.floor(verifiedOffset / limit) + 1}
            totalPages={Math.ceil(totalVerified / limit)}
            onPageChange={handleVerifiedPageChange}
            totalItems={totalVerified}
            itemsPerPage={limit}
            className="mt-4"
          />
        </TabsContent>

        <TabsContent value="unverified" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pending colleges..."
                value={searchUnverified}
                onChange={(e) => setSearchUnverified(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </div>

          {errorUnverified && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorUnverified}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <Table>
                                                           <TableHeader>
                  <TableRow className={collegeColors.table.header}>
                    <TableHead className="text-center">College Name</TableHead>
                    <TableHead className="text-center">Submit Date</TableHead>
                    <TableHead className="text-center">Contact Person</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                                 {loadingUnverified ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center py-8">
                       <div className="flex items-center justify-center gap-2">
                         <Loader2 className="h-4 w-4 animate-spin" />
                         <span>Loading unverified colleges...</span>
                       </div>
                     </TableCell>
                   </TableRow>
                                 ) : filteredUnverified.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                       {errorUnverified ? 'Failed to load colleges' : 'No unverified colleges found'}
                     </TableCell>
                   </TableRow>
                ) : (
                  filteredUnverified.map((college) => (
                    <TableRow key={college.id} className={collegeColors.table.row}>
                                             <TableCell className="text-center">
                         <div className="font-medium">{college.name}</div>
                       </TableCell>
                                               <TableCell className="text-center">{college.submitted_at || college.submitDate || 'N/A'}</TableCell>
                        <TableCell className="text-center">{college.representative_name || college.contactPerson}</TableCell>
                                               <TableCell className="text-center">
                         <div className="flex gap-1 justify-center">
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handleViewCollege(college, 'unverified')}
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
                             onClick={() => handleDirectLogin(college.id)}
                             className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                             title="Direct Login"
                           >
                             <LogIn className="h-4 w-4" />
                           </Button>
                         </div>
                       </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination for unverified colleges */}
          <Pagination
            currentPage={Math.floor(unverifiedOffset / limit) + 1}
            totalPages={Math.ceil(totalUnverified / limit)}
            onPageChange={handleUnverifiedPageChange}
            totalItems={totalUnverified}
            itemsPerPage={limit}
            className="mt-4"
          />
        </TabsContent>
      </Tabs>

      {/* Right-to-Left Detail Panel */}
      <Sheet open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0 shadow-2xl border-l-2 border-gray-200">
          <div className="h-full flex flex-col bg-white rounded-l-lg shadow-xl">
            <SheetHeader className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-tl-lg">
              <SheetTitle className="flex items-center gap-2 text-gray-800">
                <Building2 className="h-5 w-5 text-blue-600" />
                College Details
              </SheetTitle>
            </SheetHeader>
            
            {selectedCollege && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-gray-50">
                {/* Basic Information */}
                <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-900">{selectedCollege.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Established: {selectedCollege.established_year || selectedCollege.establishedYear}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Departments: {selectedCollege.no_of_departments || selectedCollege.departments}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Total Students: {selectedCollege.no_of_student || selectedCollege.students || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Passed Out: {selectedCollege.no_of_passed_out || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Pass Percentage: {selectedCollege.pass_percentage || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">{selectedCollege.representative_name || selectedCollege.contactPerson}</div>
                        <div className="text-gray-600">{selectedCollege.representative_mobile || selectedCollege.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedCollege.email}</span>
                    </div>
                    {selectedCollege.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{selectedCollege.website}</span>
                      </div>
                    )}
                    {selectedCollege.representative_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Rep Email: {selectedCollege.representative_email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">{selectedCollege.address}</span>
                    </div>
                  </div>
                </div>

                {/* Coordinator Information */}
                {(selectedCollege.coordinator_name || selectedCollege.coordinator_email || selectedCollege.coordinator_phone) && (
                  <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900">Coordinator Information</h4>
                    <div className="space-y-2">
                      {selectedCollege.coordinator_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Name: {selectedCollege.coordinator_name}</span>
                        </div>
                      )}
                      {selectedCollege.coordinator_designation && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Designation: {selectedCollege.coordinator_designation}</span>
                        </div>
                      )}
                      {selectedCollege.coordinator_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{selectedCollege.coordinator_email}</span>
                        </div>
                      )}
                      {selectedCollege.coordinator_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{selectedCollege.coordinator_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {(selectedCollege.fee_concession || selectedCollege.facilities) && (
                  <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900">Additional Information</h4>
                    <div className="space-y-2">
                      {selectedCollege.fee_concession && (
                        <div className="text-sm">
                          <div className="font-medium">Fee Concession:</div>
                          <div className="text-gray-600 mt-1">{selectedCollege.fee_concession}</div>
                        </div>
                      )}
                      {selectedCollege.facilities && (
                        <div className="text-sm">
                          <div className="font-medium">Facilities:</div>
                          <div className="text-gray-600 mt-1">{selectedCollege.facilities}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Information */}
                {(selectedCollege.bank_name || selectedCollege.account_no || selectedCollege.ifcs_code) && (
                  <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900">Bank Information</h4>
                    <div className="space-y-2">
                      {selectedCollege.bank_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Bank: {selectedCollege.bank_name}</span>
                        </div>
                      )}
                      {selectedCollege.account_no && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Account: {selectedCollege.account_no}</span>
                        </div>
                      )}
                      {selectedCollege.ifcs_code && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">IFSC: {selectedCollege.ifcs_code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status and Additional Info */}
                {selectedCollege.type === 'unverified' && (
                  <>
                    <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-gray-900">Application Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Current Status:</span>
                          {getStatusBadge(selectedCollege.status)}
                        </div>
                        {selectedCollege.reason && (
                          <div className="text-sm">
                            <span className="font-medium">Reason:</span>
                            <div className="text-gray-600 mt-1">{selectedCollege.reason}</div>
                          </div>
                        )}
                        {selectedCollege.submitDate && (
                          <div className="text-sm">
                            <span className="font-medium">Submit Date:</span>
                            <div className="text-gray-600">{selectedCollege.submitDate}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Documents Status */}
                    {(selectedCollege.documentsSubmitted || selectedCollege.documentsPending) && (
                      <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <h4 className="font-medium text-gray-900">Documents Status</h4>
                        <div className="space-y-2">
                          {selectedCollege.documentsSubmitted && selectedCollege.documentsSubmitted.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">Submitted:</div>
                              {selectedCollege.documentsSubmitted.map((doc: string) => (
                                <div key={doc} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span>{doc}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {selectedCollege.documentsPending && selectedCollege.documentsPending.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">Pending:</div>
                              {selectedCollege.documentsPending.map((doc: string) => (
                                <div key={doc} className="flex items-center gap-2 text-sm">
                                  <XCircle className="h-3 w-3 text-red-600" />
                                  <span>{doc}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Financial Information for verified colleges */}
                {selectedCollege.type === 'verified' && (
                  <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900">Financial Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Received:</span>
                        <span className="font-medium">₹{selectedCollege.totalReceived?.toLocaleString() || '0'}</span>
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
                {selectedCollege.type === 'unverified' && (
                  <div className="space-y-2 pt-4 border-t bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedCollege.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve College
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(selectedCollege.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                )}

                {/* Action Buttons for Verified Colleges */}
                {selectedCollege.type === 'verified' && (
                  <div className="space-y-2 pt-4 border-t bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <Button 
                      variant="outline" 
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleUnverifyCollege(selectedCollege.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Unverify College
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