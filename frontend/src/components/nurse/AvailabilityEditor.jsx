import { useState } from 'react';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { Button, Select } from '../common';

const TIME_SLOTS = [];
for (let hour = 6; hour <= 20; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    TIME_SLOTS.push({ value: time, label: time });
  }
}

const AvailabilityEditor = ({ availability = [], onSave, onDelete, loading }) => {
  const [newSlot, setNewSlot] = useState({
    available_date: '',
    start_time: '09:00',
    end_time: '17:00',
    consultation_type: 'both',
  });

  const handleAddSlot = () => {
    if (!newSlot.available_date) {
      alert('Please select a date');
      return;
    }
    onSave(newSlot);
    setNewSlot({
      available_date: '',
      start_time: '09:00',
      end_time: '17:00',
      consultation_type: 'both',
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTypeLabel = (type) => {
    const types = {
      virtual: 'Virtual',
      in_person: 'In-Person',
      both: 'Both',
    };
    return types[type] || type;
  };

  // Group availability by date
  const groupedAvailability = availability.reduce((acc, slot) => {
    const date = slot.available_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Add New Slot */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-montserrat font-semibold text-kidney-charcoal mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Availability Slot
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={newSlot.available_date}
              onChange={(e) => setNewSlot({ ...newSlot, available_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
            />
          </div>
          
          <Select
            label="Start Time"
            value={newSlot.start_time}
            onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
            options={TIME_SLOTS}
            icon={Clock}
          />
          
          <Select
            label="End Time"
            value={newSlot.end_time}
            onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
            options={TIME_SLOTS}
            icon={Clock}
          />
          
          <Select
            label="Consultation Type"
            value={newSlot.consultation_type}
            onChange={(e) => setNewSlot({ ...newSlot, consultation_type: e.target.value })}
            options={[
              { value: 'both', label: 'Both' },
              { value: 'virtual', label: 'Virtual Only' },
              { value: 'in_person', label: 'In-Person Only' },
            ]}
          />
        </div>
        
        <div className="mt-4">
          <Button onClick={handleAddSlot} loading={loading} icon={Plus}>
            Add Slot
          </Button>
        </div>
      </div>

      {/* Existing Availability */}
      <div className="space-y-4">
        <h4 className="font-montserrat font-semibold text-kidney-charcoal">Current Availability</h4>
        
        {Object.keys(groupedAvailability).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No availability slots set. Add your first slot above.</p>
          </div>
        ) : (
          Object.entries(groupedAvailability).map(([date, slots]) => (
            <div key={date} className="bg-white rounded-lg shadow-md p-4">
              <h5 className="font-semibold text-kidney-charcoal mb-3">
                {formatDate(date)}
              </h5>
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-kidney-cream rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-kidney-teal" />
                        <span className="font-medium">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${slot.consultation_type === 'virtual' ? 'bg-blue-100 text-blue-800' : ''}
                        ${slot.consultation_type === 'in_person' ? 'bg-purple-100 text-purple-800' : ''}
                        ${slot.consultation_type === 'both' ? 'bg-green-100 text-green-800' : ''}
                      `}>
                        {getTypeLabel(slot.consultation_type)}
                      </span>
                      {slot.is_booked && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          Booked
                        </span>
                      )}
                    </div>
                    {!slot.is_booked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => onDelete(slot.id)}
                        loading={loading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AvailabilityEditor;
