import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, ArrowLeft } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { GoogleMeetEmbed } from '../../components/common';
import { StatusBadge, LoadingSpinner, Button } from '../../components/common';
import { bookingService } from '../../services/api';
import toast from 'react-hot-toast';

const NurseConsultationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await bookingService.getById(bookingId);
      setBooking(response.data);
    } catch (error) {
      toast.error('Failed to load booking details');
      navigate('/nurse/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      const response = await bookingService.generateMeetingLink(bookingId);
      setBooking({ ...booking, meeting_link: response.data.meeting_link });
      toast.success('Meeting link generated');
    } catch (error) {
      toast.error('Failed to generate link');
    } finally {
      setGeneratingLink(false);
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
      <MainLayout sidebar={NurseSidebar}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!booking) return null;

  const isVirtual = booking.booking_type === 'virtual';

  return (
    <MainLayout sidebar={NurseSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/nurse/appointments')}
          className="flex items-center gap-2 text-gray-600 hover:text-kidney-green mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
                Consultation with {booking.patient?.user?.first_name} {booking.patient?.user?.last_name}
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
              booking.meeting_link ? (
                <GoogleMeetEmbed
                  meetingLink={booking.meeting_link}
                  title="Virtual Consultation"
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-kidney-charcoal mb-2">
                      Meeting Link Not Generated
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Generate a Google Meet link to start the virtual consultation
                    </p>
                    <Button
                      onClick={handleGenerateLink}
                      loading={generatingLink}
                      icon={Video}
                    >
                      Generate Meeting Link
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-kidney-green" />
                  <h3 className="text-lg font-montserrat font-semibold text-kidney-charcoal">
                    In-Person Consultation
                  </h3>
                </div>
                <p className="text-gray-600">
                  This is an in-person consultation. Meet the patient at the scheduled time 
                  and location.
                </p>
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

            {/* Patient Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-4">
                Patient Information
              </h3>
              <div className="flex items-center gap-3 mb-4">
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
                    {booking.patient?.user?.email}
                  </p>
                </div>
              </div>
              {booking.patient?.sa_id_number && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">SA ID</p>
                  <p className="text-sm font-medium">{booking.patient.sa_id_number}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NurseConsultationPage;
