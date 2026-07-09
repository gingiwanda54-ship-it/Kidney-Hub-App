import { Calendar, Clock, Video, MapPin, Star } from 'lucide-react';
import { StatusBadge } from '../common';

const BookingCard = ({ booking, onClick, showActions = true }) => {
  const {
    nurse,
    availability,
    booking_type,
    status,
    consultation_fee,
    payment_status,
    created_at,
  } = booking;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {nurse?.user?.profile_photo_url ? (
            <img
              src={nurse.user.profile_photo_url}
              alt={nurse.user.first_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-kidney-cream flex items-center justify-center">
              <span className="text-lg font-semibold text-kidney-green">
                {nurse?.user?.first_name?.[0]}{nurse?.user?.last_name?.[0]}
              </span>
            </div>
          )}
          <div>
            <h4 className="font-montserrat font-semibold text-kidney-charcoal">
              {nurse?.user?.first_name} {nurse?.user?.last_name}
            </h4>
            <p className="text-sm text-gray-600">{nurse?.specialization || 'Nursing'}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-kidney-teal" />
          <span>{formatDate(availability?.available_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-kidney-teal" />
          <span>{formatTime(availability?.start_time)} - {formatTime(availability?.end_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {booking_type === 'virtual' ? (
            <>
              <Video className="w-4 h-4 text-kidney-teal" />
              <span>Virtual Consultation</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-kidney-teal" />
              <span>In-Person Consultation</span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <span className="text-lg font-semibold text-kidney-green">
            R{consultation_fee}
          </span>
          <StatusBadge status={payment_status} />
        </div>
        <p className="text-xs text-gray-500">
          Booked {new Date(created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default BookingCard;
