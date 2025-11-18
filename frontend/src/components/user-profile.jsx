import { LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'

const UserProfile = ({ name, email, role, onLogout }) => {
  const navigate = useNavigate()

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:block text-right">
        <div className="text-sm font-bold text-white">{name || email}</div>
      </div>
      <button
        onClick={handleDashboard}
        className="w-10 h-10 bg-xbox-green/20 border border-xbox-green rounded-sm flex items-center justify-center hover:bg-xbox-green/30 transition cursor-pointer"
      >
        <div className="w-6 h-6 bg-xbox-green/50 rounded-full" />
      </button>
      <Button
        onClick={onLogout}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white hover:bg-xbox-green/10"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default UserProfile