import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Search, User, ChevronRight, Activity, Heart } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { NurseCardSkeleton } from '../../components/common';
import { BookingCard } from '../../components/booking';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService, patientService } from '../../services/api';
import { LoadingSpinner } from '../../components/common';
import toast from 'react-hot-toast';

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [profileComplete, setProfileComplete] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        bookingService.getAll(),
        patientService.getProfile(),
      ]);
      setUpcomingBookings(bookingsRes.data.slice(0, 3));
      setProfileComplete(profileRes.data.profile_completion || 0);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout sidebar={PatientSidebar}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your kidney care journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-kidney-cream rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-kidney-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">
                  {upcomingBookings.length}
                </p>
                <p className="text-sm text-gray-500">Upcoming Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">
                  {profileComplete}%
                </p>
                <p className="text-sm text-gray-500">Profile Complete</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-kidney-green h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profileComplete}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">3</p>
                <p className="text-sm text-gray-500">Consultations Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-semibold text-kidney-charcoal">
                  Upcoming Appointments
                </h2>
                <Link
                  to="/patient/appointments"
                  className="text-sm text-kidney-green hover:underline flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onClick={() => window.location.href = `/patient/consultation/${booking.id}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <Link
                    to="/patient/book"
                    className="inline-flex items-center gap-2 text-kidney-green hover:underline"
                  >
                    <Search className="w-4 h-4" />
                    Find a nurse
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-montserrat font-semibold text-kidney-charcoal mb-6">
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <Link
                  to="/patient/book"
                  className="flex items-center gap-4 p-4 bg-kidney-cream rounded-lg hover:bg-kidney-light hover:text-white transition-colors group"
                >
                  <Search className="w-5 h-5 text-kidney-green group-hover:text-white" />
                  <span className="font-medium text-kidney-charcoal group-hover:text-white">
                    Find a Nurse
                  </span>
                </Link>

                <Link
                  to="/patient/profile"
                  className="flex items-center gap-4 p-4 bg-kidney-cream rounded-lg hover:bg-kidney-light hover:text-white transition-colors group"
                >
                  <User className="w-5 h-5 text-kidney-green group-hover:text-white" />
                  <span className="font-medium text-kidney-charcoal group-hover:text-white">
                    Update Profile
                  </span>
                </Link>

                <Link
                  to="/patient/indemnity"
                  className="flex items-center gap-4 p-4 bg-kidney-cream rounded-lg hover:bg-kidney-light hover:text-white transition-colors group"
                >
                  <Clock className="w-5 h-5 text-kidney-green group-hover:text-white" />
                  <span className="font-medium text-kidney-charcoal group-hover:text-white">
                    Sign Indemnity Form
                  </span>
                </Link>

                <Link
                  to="/patient/appointments"
                  className="flex items-center gap-4 p-4 bg-kidney-cream rounded-lg hover:bg-kidney-light hover:text-white transition-colors group"
                >
                  <Calendar className="w-5 h-5 text-kidney-green group-hover:text-white" />
                  <span className="font-medium text-kidney-charcoal group-hover:text-white">
                    My Bookings
                  </span>
                </Link>
              </div>
            </div>

            {/* Profile Completion Card */}
            {profileComplete < 100 && (
              <div className="bg-gradient-to-br from-kidney-green to-kidney-teal rounded-lg shadow-md p-6 mt-6 text-white">
                <h3 className="font-montserrat font-semibold mb-2">Complete Your Profile</h3>
                <p className="text-sm text-white/80 mb-4">
                  Fill in your medical aid details and SA ID to book consultations
                </p>
                <Link
                  to="/patient/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-kidney-green rounded-lg hover:bg-kidney-cream transition-colors"
                >
                  Complete Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientDashboardPage;
