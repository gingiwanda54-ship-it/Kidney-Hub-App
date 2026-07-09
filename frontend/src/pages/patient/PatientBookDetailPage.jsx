import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Video, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { CalendarPicker, TimeSlotPicker, PaymentMethodSelector } from '../../components/booking';
import { Button, LoadingSpinner, CredentialBadge } from '../../components/common';
import { nurseService, availabilityService, bookingService, paymentService } from '../../services/api';
import toast from 'react-hot-toast';

const PatientBookDetailPage = () => {
  const { nurseId } = useParams();
  const navigate = useNavigate();
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingType, setBookingType] = useState('virtual');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [availableDates, setAvailableDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select slot, 2: Payment, 3: Confirm

  useEffect(() => {
    fetchNurse();
  }, [nurseId]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchNurse = async () => {
    setLoading(true);
    try {
      const response = await nurseService.getById(nurseId);
      setNurse(response.data);
      
      // Get available dates
      const availabilityRes = await nurseService.getAvailability(nurseId);
      const dates = availabilityRes.data
        .filter(slot => !slot.is_booked)
        .map(slot => slot.available_date);
      setAvailableDates([...new Set(dates)]);
    } catch (error) {
      toast.error('Failed to load nurse details');
      navigate('/patient/book');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await availabilityService.getSlots({
        nurse_id: nurseId,
        date: selectedDate,
      });
      setSlots(response.data);
    } catch (error) {
      toast.error('Failed to load available slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleVerifyMedicalAid = async (data) => {
    // Mock verification - in production, call actual API
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    try {
      // Create booking
      const bookingRes = await bookingService.create({
        nurse_id: nurseId,
        availability_id: selectedSlot.id,
        booking_type: bookingType,
        payment_method: paymentMethod,
      });

      // If cash payment, initiate payment
      if (paymentMethod === 'cash') {
        await paymentService.initiate(bookingRes.data.id, {
          amount: nurse.consultation_fee,
          method: 'card',
        });
      }

      toast.success('Booking created successfully!');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
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

  if (!nurse) return null;

  const languages = nurse.languages_spoken ? JSON.parse(nurse.languages_spoken) : [];
  const consultationTypes = nurse.consultation_types ? JSON.parse(nurse.consultation_types) : [];

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/patient/book')}
          className="flex items-center gap-2 text-gray-600 hover:text-kidney-green mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        {/* Nurse Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            {nurse.user?.profile_photo_url ? (
              <img
                src={nurse.user.profile_photo_url}
                alt={nurse.user.first_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-kidney-cream flex items-center justify-center">
                <span className="text-2xl font-semibold text-kidney-green">
                  {nurse.user?.first_name?.[0]}{nurse.user?.last_name?.[0]}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
                {nurse.user?.first_name} {nurse.user?.last_name}
              </h1>
              <p className="text-gray-600">{nurse.specialization || 'General Nursing'}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <CredentialBadge type="sanc" verified={nurse.sanc_verified} />
                <CredentialBadge type="bhf" verified={nurse.bhf_verified} />
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {nurse.years_experience || 0} years experience
                </div>
                {nurse.location_city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {nurse.location_city}
                  </div>
                )}
                {nurse.rating && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    {nurse.rating.toFixed(1)} ({nurse.review_count || 0} reviews)
                  </div>
                )}
              </div>

              <p className="mt-3 text-sm text-gray-500">
                Languages: {languages.join(', ') || 'English'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-kidney-green">
                R{nurse.consultation_fee}
              </p>
              <p className="text-sm text-gray-500">per consultation</p>
            </div>
          </div>
        </div>

        {step === 1 && (
          <>
            {/* Date Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <CalendarPicker
                availableDates={availableDates}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
              
              <TimeSlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
                loading={slotsLoading}
              />
            </div>

            {/* Consultation Type */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-4">
                Consultation Type
              </h3>
              <div className="flex gap-4">
                {consultationTypes.includes('virtual') && (
                  <label
                    className={`
                      flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${bookingType === 'virtual'
                        ? 'border-kidney-green bg-kidney-cream'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="bookingType"
                      value="virtual"
                      checked={bookingType === 'virtual'}
                      onChange={() => setBookingType('virtual')}
                      className="hidden"
                    />
                    <Video className="w-5 h-5 text-kidney-green" />
                    <span className="font-medium">Virtual</span>
                  </label>
                )}
                {consultationTypes.includes('in_person') && (
                  <label
                    className={`
                      flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${bookingType === 'in_person'
                        ? 'border-kidney-green bg-kidney-cream'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="bookingType"
                      value="in_person"
                      checked={bookingType === 'in_person'}
                      onChange={() => setBookingType('in_person')}
                      className="hidden"
                    />
                    <Users className="w-5 h-5 text-kidney-green" />
                    <span className="font-medium">In-Person</span>
                  </label>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={() => selectedSlot && setStep(2)}
              disabled={!selectedSlot}
              className="w-full"
              size="lg"
            >
              Continue to Payment
            </Button>
          </>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-4">
              Payment Method
            </h3>
            
            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              onMedicalAidVerify={handleVerifyMedicalAid}
            />

            {/* Booking Summary */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-kidney-charcoal mb-3">Booking Summary</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nurse:</span>
                  <span className="font-medium">{nurse.user?.first_name} {nurse.user?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('en-ZA')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedSlot?.start_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{bookingType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-kidney-green">R{nurse.consultation_fee}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleBook} loading={bookingLoading} className="flex-1">
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-montserrat font-bold text-kidney-charcoal mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your consultation has been booked successfully.
              {paymentMethod === 'cash' && ' You will receive payment instructions via email.'}
            </p>
            <Button onClick={() => navigate('/patient/appointments')}>
              View My Bookings
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PatientBookDetailPage;
