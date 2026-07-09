import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { BookingCard } from '../../components/booking';
import { LoadingSpinner, CredentialBadge } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService, nurseService } from '../../services/api';
import toast from 'react-hot-toast';

const NurseDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [profileComplete, setProfileComplete] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        bookingService.getAll(),
        nurseService.getById(user?.nurse_id),
      ]);
      
      const allBookings = bookingsRes.data;
      const today = new Date().toISOString().split('T')[0];
      
      setTodayBookings(allBookings.filter(b => 
        b.availability?.available_date === today &&
        ['pending', 'confirmed'].includes(b.status)
      ));
      
      setUpcomingBookings(allBookings.filter(b =>
        b.availability?.available_date > today &&
        ['pending', 'confirmed'].includes(b.status)
      ).slice(0, 3));
      
      setProfileComplete(profileRes.data.profile_completion || 0);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout sidebar={NurseSidebar}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar={NurseSidebar}>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your consultations and availability
          </p>
        </div>

        {/* Profile Completion Alert */}
        {profileComplete < 70 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Complete your profile</p>
              <p className="text-sm text-amber-700">
                Your profile is {profileComplete}% complete. Complete SANC verification 
                and add your availability to start receiving bookings.
              </p>
              <Link
                to="/nurse/profile"
                className="text-sm text-amber-800 font-medium hover:underline mt-1 inline-block"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-kidney-cream rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-kidney-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">
                  {todayBookings.length}
                </p>
                <p className="text-sm text-gray-500">Today's Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">
                  {upcomingBookings.length}
                </p>
                <p className="text-sm text-gray-500">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">12</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">4.8</p>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat font-semibold text-kidney-charcoal">
                  Today's Schedule
                </h2>
                <Link
                  to="/nurse/appointments"
                  className="text-sm text-kidney-green hover:underline flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {todayBookings.length > 0 ? (
                <div className="space-y-4">
                  {todayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-4 bg-kidney-cream rounded-lg"
                    >
                      <div className="text-center">
                        <p className="text-lg font-bold text-kidney-green">
                          {booking.availability?.start_time?.split(':')[0]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.availability?.start_time?.split(':')[1]}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-kidney-charcoal">
                          {booking.patient?.user?.first_name} {booking.patient?.user?.last_name}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {booking.booking_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Link
                        to={`/nurse/consultation/${booking.id}`}
                        className="px-4 py-2 bg-kidney-green text-white rounded-lg hover:bg-kidney-teal transition-colors"
                      >
                        Start
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
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
                  to="/nurse/availability"
                  className="flex items-center gap-4 p-4 bg-kidney-cream rounded-lg hover:bg-kidney-light hover:text-white transition-colors group"
                >
                  <Clock className="w-5 h-5 text-kidney-green group-hover:text-white" />
                  <span className="font-medium text-kidney-charcoal group-hover:text-white">
                    Set Availability
                  </span>
                </Link>

                <Link
                  to="/nurse/appointments"
                  className="flex items-center gap-4 p-4 bg-kidney-cream rounded-lg hover:bg-kidney-light hover:text-white transition-colors group"
                >
                  <Calendar className="w-5 h-5 text-kidney-green group-hover:text-white" />
                  <span className="font-medium text-kidney-charcoal group-hover:text-white">
                    View Appointments
                  </span>
                </Link>

                <Link
                  to="/nurse/profile"
                  className="flex items-center gap-4 p-4 bg-kidney-cream rounded-lg hover:bg-kidney-light hover:text-white transition-colors group"
                >
                  <Users className="w-5 h-5 text-kidney-green group-hover:text-white" />
                  <span className="font-medium text-kidney-charcoal group-hover:text-white">
                    Edit Profile
                  </span>
                </Link>
              </div>
            </div>

            {/* Credentials Status */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-4">
                Credentials
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SANC Registration</span>
                  <CredentialBadge type="sanc" verified={true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">BHF Registration</span>
                  <CredentialBadge type="bhf" verified={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NurseDashboardPage;
