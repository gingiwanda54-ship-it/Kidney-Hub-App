import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, ArrowLeft, AlertCircle } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { GoogleMeetEmbed } from '../../components/common';
import { StatusBadge, LoadingSpinner } from '../../components/common';
import { bookingService } from '../../services/api';
import toast from 'react-hot-toast';

const PatientConsultationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await bookingService.getById(bookingId);
      setBooking(response.data);
    } catch (error) {
      toast.error('Failed to load booking details');
      navigate('/patient/appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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

  if (!booking) return null;

  const isVirtual = booking.booking_type === 'virtual';
  const isUpcoming = new Date(booking.availability?.available_date) >= new Date();
  const isConfirmed = booking.status === 'confirmed';

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/patient/appointments')}
          className="flex items-center gap-2 text-gray-600 hover:text-kidney-green mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
                Consultation Details
              </h1>
              <p className="text-gray-500 mt-1">
                Booking #{booking.id}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isVirtual ? (
              <GoogleMeetEmbed
                meetingLink={booking.meeting_link}
                title="Virtual Consultation"
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-kidney-green" />
                  <h3 className="text-lg font-montserrat font-semibold text-kidney-charcoal">
                    In-Person Consultation
                  </h3>
                </div>
                <p className="text-gray-600">
                  Your consultation is scheduled for an in-person visit. 
                  Please arrive at the clinic location at the scheduled time.
                </p>
                <div className="mt-4 p-4 bg-kidney-cream rounded-lg">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-kidney-charcoal">
                    {booking.nurse?.location_city || 'To be confirmed'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Appointment Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-4">
                Appointment Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-kidney-teal" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {formatDate(booking.availability?.available_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-kidney-teal" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {formatTime(booking.availability?.start_time)} - {formatTime(booking.availability?.end_time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isVirtual ? (
                    <Video className="w-5 h-5 text-kidney-teal" />
                  ) : (
                    <MapPin className="w-5 h-5 text-kidney-teal" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium capitalize">
                      {booking.booking_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nurse Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-4">
                Your Nurse
              </h3>
              <div className="flex items-center gap-3">
                {booking.nurse?.user?.profile_photo_url ? (
                  <img
                    src={booking.nurse.user.profile_photo_url}
                    alt={booking.nurse.user.first_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-kidney-cream flex items-center justify-center">
                    <span className="text-lg font-semibold text-kidney-green">
                      {booking.nurse?.user?.first_name?.[0]}{booking.nurse?.user?.last_name?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-kidney-charcoal">
                    {booking.nurse?.user?.first_name} {booking.nurse?.user?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.nurse?.specialization || 'Nursing'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-4">
                Payment
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="text-xl font-bold text-kidney-green">
                  R{booking.consultation_fee}
                </span>
              </div>
              <div className="mt-2">
                <StatusBadge status={booking.payment_status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientConsultationPage;
