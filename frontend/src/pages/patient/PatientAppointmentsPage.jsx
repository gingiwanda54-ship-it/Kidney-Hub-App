import { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { BookingCard } from '../../components/booking';
import { LoadingSpinner, TableSkeleton } from '../../components/common';
import { bookingService } from '../../services/api';
import toast from 'react-hot-toast';

const PatientAppointmentsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

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

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.availability?.available_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      return bookingDate >= today && ['pending', 'confirmed'].includes(booking.status);
    }
    if (filter === 'past') {
      return bookingDate < today || ['completed', 'cancelled'].includes(booking.status);
    }
    return true;
  });

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            My Bookings
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage your appointments
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            {[
              { value: 'all', label: 'All Bookings' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
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
            <TableSkeleton rows={3} />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => window.location.href = `/patient/consultation/${booking.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-kidney-charcoal mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? "You haven't made any bookings yet"
                : filter === 'upcoming'
                  ? 'No upcoming appointments'
                  : 'No past appointments'
              }
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PatientAppointmentsPage;
