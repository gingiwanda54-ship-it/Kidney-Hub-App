import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Search,
  Calendar,
  User,
  FileText,
  Clock,
  Settings,
  LogOut,
  Heart,
  FileHeart,
  ChefHat,
  BookOpen,
  MessageSquare,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const PatientSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/patient/book', icon: Search, label: 'Find Nurses' },
    { path: '/patient/appointments', icon: Calendar, label: 'My Bookings' },
    { path: '/patient/records', icon: FileHeart, label: 'Health Records' },
    { path: '/patient/records/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/patient/meal-plans', icon: ChefHat, label: 'Meal Plans' },
    { path: '/patient/meal-plans/my', icon: ChefHat, label: 'My Meal Plan' },
    { path: '/patient/education', icon: BookOpen, label: 'Education Hub' },
    { path: '/patient/education/featured', icon: BookOpen, label: 'Recommended' },
    { path: '/patient/education/progress', icon: Activity, label: 'My Progress' },
    { path: '/patient/ai', icon: MessageSquare, label: 'AI Assistant' },
    { path: '/patient/profile', icon: User, label: 'Profile' },
    { path: '/patient/indemnity', icon: FileText, label: 'Indemnity Form' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/patient/dashboard" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-kidney-green" />
          <span className="font-montserrat font-bold text-xl text-kidney-green">
            Kidney Hub
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-kidney-cream text-kidney-green font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-kidney-green'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 hover:text-kidney-red rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export const NurseSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/nurse/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/nurse/availability', icon: Clock, label: 'Availability' },
    { path: '/nurse/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/nurse/meal-plans', icon: ChefHat, label: 'Meal Plans' },
    { path: '/nurse/education', icon: BookOpen, label: 'Education Library' },
    { path: '/nurse/ai/conversations', icon: MessageSquare, label: 'AI Conversations' },
    { path: '/nurse/profile', icon: User, label: 'Profile' },
    { path: '/nurse/indemnity', icon: FileText, label: 'Indemnity Form' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/nurse/dashboard" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-kidney-green" />
          <span className="font-montserrat font-bold text-xl text-kidney-green">
            Kidney Hub
          </span>
        </Link>
      </div>

      {/* Profile Summary */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {user?.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-kidney-cream flex items-center justify-center">
              <span className="text-sm font-semibold text-kidney-green">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-kidney-charcoal">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500">Nurse</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-kidney-cream text-kidney-green font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-kidney-green'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 hover:text-kidney-red rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export const MobileHeader = ({ onMenuClick }) => {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-kidney-green" />
          <span className="font-montserrat font-bold text-lg text-kidney-green">
            Kidney Hub
          </span>
        </Link>
        <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export const MainLayout = ({ children, sidebar: Sidebar }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
