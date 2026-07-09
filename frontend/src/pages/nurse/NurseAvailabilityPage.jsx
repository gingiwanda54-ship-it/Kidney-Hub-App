import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { AvailabilityEditor } from '../../components/nurse';
import { LoadingSpinner } from '../../components/common';
import { availabilityService } from '../../services/api';
import toast from 'react-hot-toast';

const NurseAvailabilityPage = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await availabilityService.get();
      setAvailability(response.data);
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slot) => {
    setSaving(true);
    try {
      const response = await availabilityService.create(slot);
      setAvailability([...availability, response.data]);
      toast.success('Availability slot added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      await availabilityService.delete(id);
      setAvailability(availability.filter(s => s.id !== id));
      toast.success('Slot removed');
    } catch (error) {
      toast.error('Failed to remove slot');
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            Manage Availability
          </h1>
          <p className="text-gray-600 mt-1">
            Set your available dates and time slots for consultations
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Tip</p>
            <p className="text-sm text-blue-700">
              Set your availability at least 2 weeks in advance. Patients can only book 
              slots you make available. You can remove slots that haven't been booked.
            </p>
          </div>
        </div>

        {/* Availability Editor */}
        <AvailabilityEditor
          availability={availability}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={saving}
        />
      </div>
    </MainLayout>
  );
};

export default NurseAvailabilityPage;
