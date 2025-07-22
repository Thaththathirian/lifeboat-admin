import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Scholarship Connect</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Administrative Portal for Managing Scholarship Programs
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Admin Portal</h2>
          <p className="text-gray-600 mb-6">Manage the entire scholarship platform</p>
          
          <div className="space-y-2 mb-8 text-left">
            {[
              'User Management',
              'Payment Allotment', 
              'Reports & Analytics',
              'Global Messaging',
              'Platform Configuration'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-gray-700">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {feature}
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/admin/login')}
          >
            <Shield className="mr-2 h-4 w-4" />
            Access Admin Portal
          </Button>
        </div>
      </div>
    </div>
  )
}