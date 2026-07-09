import { Clock, Video, Users } from 'lucide-react';

const TimeSlotPicker = ({ slots = [], selectedSlot, onSlotSelect, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-montserrat font-semibold text-kidney-charcoal mb-4">Available Slots</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-montserrat font-semibold text-kidney-charcoal mb-4">Available Slots</h4>
        <p className="text-gray-500 text-center py-8">No available slots for this date</p>
      </div>
    );
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="font-montserrat font-semibold text-kidney-charcoal mb-4">Available Slots</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id;
          const isVirtual = slot.consultation_type === 'virtual' || slot.consultation_type === 'both';
          const isInPerson = slot.consultation_type === 'in_person' || slot.consultation_type === 'both';

          return (
            <button
              key={slot.id}
              onClick={() => onSlotSelect(slot)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-kidney-green bg-kidney-cream'
                  : 'border-gray-200 hover:border-kidney-light'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-kidney-green" />
                <span className="font-medium text-kidney-charcoal">
                  {formatTime(slot.start_time)}
                </span>
              </div>
              <div className="flex gap-1">
                {isVirtual && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                    <Video className="w-3 h-3" />
                  </span>
                )}
                {isInPerson && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                    <Users className="w-3 h-3" />
                  </span>
                )}
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-kidney-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
