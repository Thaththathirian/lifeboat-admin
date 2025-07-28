import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { pageStateManager } from "@/utils/pageState"
import { useToast } from "@/components/ui/use-toast" // Added missing import

// Pages
import LandingPage from "@/pages/LandingPage"
import NotFound from "@/pages/NotFound"

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminMessages from "@/pages/admin/AdminMessages"
import AdminNotifications from "@/pages/admin/AdminNotifications"
import AdminStudents from "@/pages/admin/AdminStudents"
import AdminColleges from "@/pages/admin/AdminColleges"
import AdminDonors from "@/pages/admin/AdminDonors"
import AdminPaymentAllotment from "@/pages/admin/AdminPaymentAllotment"
import AdminOAuthCallback from "@/pages/admin/AdminOAuthCallback"
import AdminOAuthTest from "@/pages/admin/AdminOAuthTest"

// Admin College Pages
import RegisteredColleges from './pages/admin/colleges/RegisteredColleges';
import PendingColleges from './pages/admin/colleges/PendingColleges';
import ScholarshipAccount from './pages/admin/colleges/ScholarshipAccount';
import ReceiptManagement from './pages/admin/colleges/ReceiptManagement';
import CollegeInspection from './pages/admin/CollegeInspection';
import AddCollege from './pages/admin/colleges/AddCollege';
import EditCollege from './pages/admin/colleges/EditCollege';

// Admin Donor Pages
import AllDonors from './pages/admin/donors/AllDonors';
import DonorMapping from './pages/admin/donors/DonorMapping';
import DonationReports from './pages/admin/donors/DonationReports';
import AutoMessaging from './pages/admin/donors/AutoMessaging';
import DonorForm from './pages/admin/donors/DonorForm';

// Mock admin user data
const mockAdminUser = {
  id: "admin1",
  name: "Admin User",
  email: "admin@scholarship.com",
  type: "admin" as const,
  avatar: undefined
}

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const savedAuth = localStorage.getItem('adminAuth');
  console.log('🔍 ProtectedAdminRoute: Checking auth...');
  console.log('🔍 Saved auth:', savedAuth ? 'Present' : 'Not present');
  
  if (!savedAuth) {
    console.log('❌ No auth found, redirecting to login');
    return <Navigate to="/" replace />
  }
  
  try {
    const parsedAuth = JSON.parse(savedAuth);
    console.log('🔍 Parsed auth:', parsedAuth);
    
    if (parsedAuth.type !== 'admin') {
      console.log('❌ Auth type is not admin, redirecting to login');
      return <Navigate to="/" replace />
    }
    
    console.log('✅ Auth is valid, showing protected content');
  } catch (error) {
    console.log('❌ Error parsing auth, redirecting to login');
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

// Admin Dashboard Component
function AdminDashboardWithOAuth({ 
  currentUser, 
  currentPath, 
  handleNavigate, 
  handleLogout,
  setCurrentUser
}: {
  currentUser: typeof mockAdminUser | null;
  currentPath: string;
  handleNavigate: (path: string) => void;
  handleLogout: () => void;
  setCurrentUser: (user: typeof mockAdminUser | null) => void;
}) {
  return (
    <ProtectedAdminRoute>
      <DashboardLayout
        userType="admin"
        userName={currentUser?.name || ""}
        userAvatar={currentUser?.avatar}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <AdminDashboard />
      </DashboardLayout>
    </ProtectedAdminRoute>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<typeof mockAdminUser | null>(null)
  const [currentPath, setCurrentPath] = useState(() => localStorage.getItem('currentPath') || "/")
  const location = useLocation();
  const navigate = useNavigate();

  // Enhanced page state persistence
  useEffect(() => {
    if (location.pathname !== currentPath) {
      setCurrentPath(location.pathname);
    }
    pageStateManager.saveState(location.pathname);
  }, [location.pathname]);

  // Enhanced route restoration with admin auth check
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    const savedState = pageStateManager.getState();
    
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        if (parsedAuth.type === 'admin') {
          setCurrentUser(mockAdminUser);
          
          if (savedState && window.location.pathname === "/") {
            navigate(savedState.route, { replace: true });
            if (savedState.scrollPosition) {
              pageStateManager.restoreScrollPosition(savedState.scrollPosition);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem('adminAuth');
      }
    }
  }, []);

  // Listen for localStorage changes to update currentUser state
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminAuth') {
        if (e.newValue) {
          try {
            const parsedAuth = JSON.parse(e.newValue);
            if (parsedAuth.type === 'admin') {
              setCurrentUser(mockAdminUser);
            }
          } catch (error) {
            console.error('Error parsing adminAuth from storage event:', error);
          }
        } else {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check admin auth state periodically
  useEffect(() => {
    const checkAuthState = () => {
      const savedAuth = localStorage.getItem('adminAuth');
      if (savedAuth) {
        try {
          const parsedAuth = JSON.parse(savedAuth);
          if (parsedAuth.type === 'admin' && !currentUser) {
            setCurrentUser(mockAdminUser);
          }
        } catch (error) {
          console.error('Error parsing adminAuth:', error);
        }
      } else if (currentUser) {
        setCurrentUser(null);
      }
    };

    const interval = setInterval(checkAuthState, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    navigate(path)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPath("/")
    localStorage.removeItem('adminAuth');
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* OAuth Callback Route - Must be public */}
        <Route path="/oauth/callback" element={<AdminOAuthCallback />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/dashboard" element={
          <AdminDashboardWithOAuth 
            currentUser={currentUser} 
            currentPath={currentPath} 
            handleNavigate={handleNavigate} 
            handleLogout={handleLogout} 
            setCurrentUser={setCurrentUser}
          />
        } />
        
        <Route path="/admin/messages" element={
          <ProtectedAdminRoute>
            <DashboardLayout
              userType="admin"
              userName={currentUser?.name || ""}
              userAvatar={currentUser?.avatar}
              currentPath={currentPath}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            >
              <AdminMessages />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/notifications" element={
          <ProtectedAdminRoute>
            <DashboardLayout
              userType="admin"
              userName={currentUser?.name || ""}
              userAvatar={currentUser?.avatar}
              currentPath={currentPath}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            >
              <AdminNotifications />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/students" element={
          <ProtectedAdminRoute>
            <Navigate to="/admin/students/all" replace />
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/students/all" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AdminStudents initialTab="all" />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/students/applied" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AdminStudents initialTab="applied" />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/students/approved" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AdminStudents initialTab="approved" />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/students/active" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/colleges" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AdminColleges />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/colleges/registered" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <RegisteredColleges />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/colleges/pending" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <PendingColleges />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/colleges/scholarship-account" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <ScholarshipAccount />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/colleges/receipt-management" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <ReceiptManagement />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/colleges/inspection" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <CollegeInspection />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/colleges/add" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AddCollege />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/colleges/edit/:id" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <EditCollege />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/donors" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AdminDonors />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/donors/all" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AllDonors />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/donors/mapping" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <DonorMapping />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/donors/reports" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <DonationReports />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/donors/messaging" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AutoMessaging />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/donors/form" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <DonorForm onSubmit={(donor) => console.log('Donor submitted:', donor)} mode="add" />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/payment-allotment" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AdminPaymentAllotment />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/oauth-test" element={
          <ProtectedAdminRoute>
            <DashboardLayout userType="admin" userName={currentUser?.name || ""} userAvatar={currentUser?.avatar} currentPath={currentPath} onNavigate={handleNavigate} onLogout={handleLogout}>
              <AdminOAuthTest />
            </DashboardLayout>
          </ProtectedAdminRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster />
    </div>
  )
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper