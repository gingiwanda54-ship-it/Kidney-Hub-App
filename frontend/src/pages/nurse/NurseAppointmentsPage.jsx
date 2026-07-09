import { useState, useEffect } from 'react';
import { Calendar, Filter, Video, Check, X } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { BookingCard } from '../../components/booking';
import { LoadingSpinner, TableSkeleton, StatusBadge } from '../../components/common';
import { bookingService } from '../../services/api';
import toast from 'react-hot-toast';

const NurseAppointmentsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAll();
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await bookingService.updateStatus(bookingId, status);
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status } : b
      ));
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error('Failed to update booking');
    } finally {
      setUpdating(null);
    }
  };

  const handleGenerateLink = async (bookingId) => {
    setUpdating(bookingId);
    try {
      const response = await bookingService.generateMeetingLink(bookingId);
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, meeting_link: response.data.meeting_link } : b
      ));
      toast.success('Meeting link generated');
    } catch (error) {
      toast.error('Failed to generate link');
    } finally {
      setUpdating(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return booking.availability?.available_date === today;
    }
    if (filter === 'upcoming') {
      return ['pending', 'confirmed'].includes(booking.status);
    }
    if (filter === 'completed') {
      return booking.status === 'completed';
    }
    return true;
  });

  return (
    <MainLayout sidebar={NurseSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            My Appointments
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your patient bookings
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { value: 'all', label: 'All' },
              { value: 'today', label: 'Today' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
                  ${filter === value
                    ? 'bg-kidney-green text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            <TableSkeleton rows={5} />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {booking.patient?.user?.profile_photo_url ? (
                      <img
                        src={booking.patient.user.profile_photo_url}
                        alt={booking.patient.user.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-kidney-cream flex items-center justify-center">
                        <span className="text-lg font-semibold text-kidney-green">
                          {booking.patient?.user?.first_name?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-kidney-charcoal">
                        {booking.patient?.user?.first_name} {booking.patient?.user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.availability?.available_date).toLocaleDateString('en-ZA')} at {booking.availability?.start_time}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${booking.booking_type === 'virtual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
                  `}>
                    {booking.booking_type === 'virtual' ? (
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Virtual
                      </span>
                    ) : 'In-Person'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        disabled={updating === booking.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        disabled={updating === booking.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && booking.booking_type === 'virtual' && !booking.meeting_link && (
                    <button
                      onClick={() => handleGenerateLink(booking.id)}
                      disabled={updating === booking.id}
                      className="flex items-center gap-2 px-4 py-2 bg-kidney-green text-white rounded-lg hover:bg-kidney-teal transition-colors disabled:opacity-50"
                    >
                      <Video className="w-4 h-4" />
                      Generate Meeting Link
                    </button>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'completed')}
                      disabled={updating === booking.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}

                  <a
                    href={`/nurse/consultation/${booking.id}`}
                    className="flex items-center gap-2 px-4 py-2 border border-kidney-green text-kidney-green rounded-lg hover:bg-kidney-cream transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-kidney-charcoal mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500">
              {filter === 'all' ? "You don't have any bookings yet" : `No ${filter} bookings`}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NurseAppointmentsPage;
