import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Heart, 
  FileText, 
  MessageSquare,
  Bell,
  Settings,
  GraduationCap,
  Shield,
  CreditCard,
  Receipt,
  BarChart3,
  Calendar,
  BookOpen,
  Award,
  UserCheck,
  FileCheck,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
// Removed StudentStatusProvider import for admin-only setup

interface NavigationProps {
  userType: 'admin'
  className?: string
  closeSidebar?: () => void
}

interface NavItem {
  title: string
  path: string
  icon: React.ReactNode
  badge?: string | number
  children?: NavItem[]
}

export function Navigation({ userType, className, closeSidebar }: NavigationProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const getNavItems = (): NavItem[] => {
    return [
      {
        title: "Dashboard",
        path: "/admin/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />
      },
      {
        title: "Students",
        path: "/admin/students",
        icon: <GraduationCap className="h-4 w-4" />
      },
      {
        title: "Colleges",
        path: "/admin/colleges",
        icon: <Building2 className="h-4 w-4" />
      },
      {
        title: "Donors",
        path: "/admin/donors",
        icon: <Heart className="h-4 w-4" />
      },
      {
        title: "Payment Allotment",
        path: "/admin/payments",
        icon: <CreditCard className="h-4 w-4" />
      },
      {
        title: "Messages",
        path: "/admin/messages",
        icon: <MessageSquare className="h-4 w-4" />
      },
      {
        title: "Notifications",
        path: "/admin/notifications",
        icon: <Bell className="h-4 w-4" />
      }
    ]
  }

  const navItems = getNavItems()

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isActive = location.pathname === item.path;
    const isExpanded = item.children && (expandedItems.includes(item.title) || item.children!.some(child => location.pathname === child.path));
    const hasChildren = item.children && item.children.length > 0

  return (
      <div key={item.title}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            level > 0 ? "nav-item-child" : "nav-item",
            isActive && "bg-primary text-primary-foreground"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.title)
            } else {
              navigate(item.path)
              if (closeSidebar) closeSidebar();
            }
          }}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <Badge 
              variant={typeof item.badge === 'number' ? "secondary" : "default"}
              className="ml-auto"
            >
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <span className={cn("transition-transform", isExpanded ? "rotate-90" : "")}>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
        {hasChildren && (
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="submenu"
                initial={{ opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
                aria-expanded={isExpanded}
              >
                <div className="space-y-1">
                  {item.children!.map(child => renderNavItem(child, level + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    )
  }

  return (
    <nav className={cn("space-y-2", className)}>
      {navItems.map(item => renderNavItem(item))}
    </nav>
  )
}