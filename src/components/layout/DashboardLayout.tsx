import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  userType: 'admin'
  userName: string
  userAvatar?: string
  currentPath: string
  onNavigate: (path: string) => void
  onLogout?: () => void
}

export function DashboardLayout({ 
  children, 
  userType, 
  userName, 
  userAvatar, 
  currentPath,
  onNavigate,
  onLogout 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleNavigate = (path: string) => {
    onNavigate(path)
    setSidebarOpen(false) // Close sidebar on mobile after navigation
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        userType={userType}
        userName={userName}
        userAvatar={userAvatar}
        onMenuToggle={toggleSidebar}
        onLogout={onLogout}
      />

      <div className="flex">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block md:w-64 lg:w-72">
          <Sidebar
            userType={userType}
            className="h-[calc(100vh-4rem)] sticky top-16"
          />
        </div>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={toggleSidebar}
              />
              
              {/* Sidebar */}
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ 
                  type: "spring", 
                  damping: 30, 
                  stiffness: 300,
                  duration: 0.4 
                }}
                className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white border-r z-50 md:hidden"
              >
                <Sidebar
                  userType={userType}
                  className="h-full"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] flex justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPath}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full max-w-[98vw] md:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw] p-4 md:p-6 lg:p-8 mx-auto flex-1"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}