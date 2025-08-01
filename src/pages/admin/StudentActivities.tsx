import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft,
  Activity,
  User,
  Shield,
  Building,
  Clock,
  Calendar,
  ArrowLeft,
  Filter,
  Search,
  Hash
} from "lucide-react";
import { Student, StudentStatus } from "@/types/student";
import { fetchStudentById } from "@/utils/studentService";

interface Activity {
  id: string;
  type: 'student' | 'admin' | 'college';
  action: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  details?: Record<string, any>;
}

export default function StudentActivities() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'student' | 'admin' | 'college'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  console.log('🎯 StudentActivities component loaded with studentId:', studentId);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const loadStudentAndActivities = async () => {
      if (!studentId) {
        console.log('❌ No studentId provided');
        return;
      }
      
      console.log('🔄 Starting to load student and activities for studentId:', studentId);
      
      try {
        setLoading(true);
        
        // Fetch student data
        console.log('📡 Fetching student data...');
        // Temporarily bypass API call for testing
        const studentData = null; // await fetchStudentById(studentId);
        console.log('📥 Student data received:', studentData);
        
        // If student not found, create a mock student for development
        if (!studentData) {
          console.log('⚠️ Student not found in API, creating mock student for development');
          const mockStudent: Student = {
            id: studentId,
            name: `Student ${studentId}`,
            email: `student${studentId}@example.com`,
            mobile: `+91${studentId}0000000`,
            college: `College ${studentId}`,
            status: StudentStatus.APPLICATION_SUBMITTED,
            statusText: 'Application Submitted',
            appliedDate: new Date().toISOString(),
            scholarship: 50000,
            interviewCompleted: false,
            documentsVerified: false,
            statusBar: ['Personal Details', 'Documents', 'Application']
          };
          setStudent(mockStudent);
        } else {
          setStudent(studentData);
        }

        // Get the student name for activities
        const studentName = studentData?.name || `Student ${studentId}`;
        console.log('👤 Using student name for activities:', studentName);
        
        // Mock activities data - in real app, this would come from API
        console.log('📝 Creating mock activities...');
        const mockActivities: Activity[] = [
          {
            id: "1",
            type: "student",
            action: "Application Submitted",
            description: "Student submitted initial scholarship application",
            timestamp: "2024-01-10T09:15:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "2",
            type: "admin",
            action: "Application Review",
            description: "Admin began reviewing application and documents",
            timestamp: "2024-01-12T14:30:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "3",
            type: "student",
            action: "Documents Uploaded",
            description: "Student uploaded Aadhar card and PAN card",
            timestamp: "2024-01-15T11:45:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "4",
            type: "admin",
            action: "Document Verification",
            description: "Admin verified personal identification documents",
            timestamp: "2024-01-16T16:20:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "5",
            type: "student",
            action: "Academic Records",
            description: "Student uploaded 10th and 12th mark sheets",
            timestamp: "2024-01-18T13:10:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "6",
            type: "college",
            action: "College Verification",
            description: "College verified student enrollment and records",
            timestamp: "2024-01-20T10:30:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "7",
            type: "admin",
            action: "Academic Review",
            description: "Admin reviewed academic credentials and performance",
            timestamp: "2024-01-22T15:45:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "8",
            type: "student",
            action: "Fee Receipts",
            description: "Student uploaded college fee payment receipts",
            timestamp: "2024-01-25T09:20:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "9",
            type: "admin",
            action: "Financial Review",
            description: "Admin reviewed financial documents and fee structure",
            timestamp: "2024-01-26T14:15:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "10",
            type: "college",
            action: "Fee Confirmation",
            description: "College confirmed fee structure and requirements",
            timestamp: "2024-01-28T11:00:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "11",
            type: "admin",
            action: "Initial Approval",
            description: "Admin approved initial scholarship amount of ₹50,000",
            timestamp: "2024-01-29T16:30:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "12",
            type: "student",
            action: "Payment Confirmation",
            description: "Student confirmed receipt of initial scholarship payment",
            timestamp: "2024-01-30T10:45:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "13",
            type: "admin",
            action: "Progress Review",
            description: "Admin reviewed student's academic progress and performance",
            timestamp: "2024-02-05T13:20:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "14",
            type: "college",
            action: "Semester Update",
            description: "College updated semester 5 results (92% - Distinction)",
            timestamp: "2024-02-10T09:30:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "15",
            type: "student",
            action: "Additional Documents",
            description: "Student uploaded updated academic certificates and achievements",
            timestamp: "2024-02-15T14:15:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "16",
            type: "admin",
            action: "Enhanced Approval",
            description: "Admin increased scholarship amount to ₹75,000 based on performance",
            timestamp: "2024-02-18T16:45:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "17",
            type: "student",
            action: "Thank You Message",
            description: "Student sent gratitude message to foundation and donors",
            timestamp: "2024-02-20T12:00:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "18",
            type: "college",
            action: "Attendance Report",
            description: "College reported 98% attendance for current semester",
            timestamp: "2024-02-22T10:30:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "19",
            type: "admin",
            action: "Mentorship Assignment",
            description: "Admin assigned career mentor to student for guidance",
            timestamp: "2024-02-25T15:20:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "20",
            type: "admin",
            action: "Scholarship Approved",
            description: "Admin approved final scholarship amount of ₹75,000",
            timestamp: "2024-01-29T15:45:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "21",
            type: "student",
            action: "Payment Confirmation",
            description: "Student confirmed receipt of scholarship payment via SMS",
            timestamp: "2024-01-30T09:15:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "22",
            type: "admin",
            action: "Follow-up Call",
            description: "Admin conducted follow-up call to check student's well-being",
            timestamp: "2024-02-01T11:30:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "23",
            type: "college",
            action: "Academic Excellence",
            description: "College reported student's outstanding academic performance",
            timestamp: "2024-02-05T14:45:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "24",
            type: "student",
            action: "Career Workshop",
            description: "Student attended career development workshop organized by foundation",
            timestamp: "2024-02-10T16:20:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "25",
            type: "admin",
            action: "Progress Assessment",
            description: "Admin completed monthly progress assessment - Excellent",
            timestamp: "2024-02-15T13:10:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "26",
            type: "college",
            action: "Attendance Update",
            description: "College reported 95% attendance for current semester",
            timestamp: "2024-02-25T10:15:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "27",
            type: "student",
            action: "Workshop Attended",
            description: "Student attended career development workshop organized by foundation",
            timestamp: "2024-03-01T15:30:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "28",
            type: "admin",
            action: "Performance Review",
            description: "Admin completed quarterly performance review - Excellent progress",
            timestamp: "2024-03-05T16:00:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "29",
            type: "college",
            action: "Project Submission",
            description: "College submitted student's final year project proposal",
            timestamp: "2024-03-10T12:45:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "30",
            type: "student",
            action: "Internship Application",
            description: "Student applied for summer internship through foundation network",
            timestamp: "2024-03-15T14:20:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "31",
            type: "admin",
            action: "Recommendation Letter",
            description: "Admin provided recommendation letter for internship application",
            timestamp: "2024-03-18T11:30:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "32",
            type: "college",
            action: "Semester Results",
            description: "College uploaded semester 6 results (88% - Distinction)",
            timestamp: "2024-03-25T09:45:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "33",
            type: "student",
            action: "Alumni Network",
            description: "Student joined foundation's alumni network and mentorship program",
            timestamp: "2024-04-01T13:15:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "34",
            type: "admin",
            action: "Success Story",
            description: "Admin featured student's success story in foundation newsletter",
            timestamp: "2024-04-05T15:20:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "35",
            type: "college",
            action: "Placement Update",
            description: "College reported student's placement offer from TechCorp (₹8.5 LPA)",
            timestamp: "2024-04-10T10:30:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "36",
            type: "student",
            action: "Gratitude Message",
            description: "Student sent thank you message to foundation and donors",
            timestamp: "2024-04-15T16:00:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "37",
            type: "admin",
            action: "Final Review",
            description: "Admin completed final year review - Outstanding achievement",
            timestamp: "2024-04-20T14:30:00Z",
            userId: "admin1",
            userName: "Admin User"
          },
          {
            id: "38",
            type: "college",
            action: "Graduation Update",
            description: "College confirmed student's graduation with honors",
            timestamp: "2024-04-25T11:15:00Z",
            userId: "college1",
            userName: "College Admin"
          },
          {
            id: "39",
            type: "student",
            action: "Alumni Contribution",
            description: "Student pledged to contribute back to foundation as alumni",
            timestamp: "2024-05-01T13:45:00Z",
            userId: studentId,
            userName: studentName
          },
          {
            id: "40",
            type: "admin",
            action: "Case Study",
            description: "Admin documented student's journey as success case study",
            timestamp: "2024-05-05T16:15:00Z",
            userId: "admin1",
            userName: "Admin User"
          }
        ];

        setActivities(mockActivities);
        console.log('✅ Mock activities loaded successfully.');
      } catch (error) {
        console.error('Error loading student activities:', error);
      } finally {
        setLoading(false);
        console.log('✅ Loading process finished.');
      }
    };

    loadStudentAndActivities();
  }, [studentId]);

  const getActivityIcon = (type: 'student' | 'admin' | 'college') => {
    switch (type) {
      case 'student':
        return <User className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'college':
        return <Building className="h-3 w-3" />;
    }
  };

  const getActivityBadgeColor = (type: 'student' | 'admin' | 'college') => {
    switch (type) {
      case 'student':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'college':
        return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = searchQuery === '' || 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  console.log('🎯 Render state:', { 
    loading, 
    student: !!student, 
    activitiesCount: activities.length, 
    filteredCount: filteredActivities.length,
    filter,
    searchQuery
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/students/${studentId}`)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Activities</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{student.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">ID: {student.id}</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                  {student.status}
                </Badge>
              </div> */}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Activities</p>
                <p className="text-2xl font-bold text-blue-900">{activities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Student Actions</p>
                <p className="text-2xl font-bold text-green-900">
                  {activities.filter(a => a.type === 'student').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Admin Actions</p>
                <p className="text-2xl font-bold text-purple-900">
                  {activities.filter(a => a.type === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">College Actions</p>
                <p className="text-2xl font-bold text-orange-900">
                  {activities.filter(a => a.type === 'college').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter by:</span>
        <div className="flex gap-2">
          {(['all', 'student', 'admin', 'college'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="capitalize"
            >
              {filterType === 'all' ? 'All' : filterType}
            </Button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Activity className="h-5 w-5 text-blue-600" />
            Activity Timeline
            <Badge variant="secondary" className="ml-2">
              {filteredActivities.length} activities
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activities found for the selected filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Activity Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>

                                         {/* Activity Content */}
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                         <h3 className="text-sm font-semibold text-gray-900">
                           {activity.action}
                         </h3>
                         <Badge className={getActivityBadgeColor(activity.type)}>
                           {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                         </Badge>
                       </div>
                       
                       <p className="text-sm text-gray-600 mb-2">
                         {activity.description}
                       </p>
                       
                       <div className="flex items-center gap-4 text-xs text-gray-500">
                         {activity.type !== 'student' && (
                           <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                             <User className="h-3 w-3 text-blue-500" />
                             <span className="font-medium">{activity.userName}</span>
                           </div>
                         )}
                         <div className="flex items-center gap-1">
                           <Clock className="h-3 w-3 text-gray-400" />
                           <span>{formatActivityTime(activity.timestamp)}</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <Calendar className="h-3 w-3 text-gray-400" />
                           <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 