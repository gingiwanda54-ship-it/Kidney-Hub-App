import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Building, Check, AlertCircle } from 'lucide-react';
import { Button, InputField, LoadingSpinner } from '../../components/common';
import { paymentService } from '../../services/api';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [medicalAidNumber, setMedicalAidNumber] = useState('');
  const [medicalAidScheme, setMedicalAidScheme] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!bookingId) {
      toast.error('Invalid booking');
      navigate('/');
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const handleCardPayment = async () => {
    setProcessing(true);
    try {
      // In production, this would integrate with Yoco SDK
      const response = await paymentService.initiate(bookingId, {
        method: 'card',
        card_details: cardDetails,
      });
      
      if (response.data.success) {
        toast.success('Payment successful!');
        navigate(`/patient/consultation/${bookingId}`);
      } else {
        toast.error('Payment failed');
      }
    } catch (error) {
      toast.error('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleMedicalAidPayment = async () => {
    if (!medicalAidNumber || !medicalAidScheme) {
      toast.error('Please enter medical aid details');
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentService.verifyMedicalAid({
        booking_id: bookingId,
        medical_aid_number: medicalAidNumber,
        medical_aid_scheme: medicalAidScheme,
      });

      if (response.data.verified) {
        toast.success('Medical aid verified!');
        navigate(`/patient/consultation/${bookingId}`);
      } else {
        toast.error('Medical aid verification failed');
      }
    } catch (error) {
      toast.error('Medical aid verification failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
            Payment
          </h1>
          <p className="text-gray-600 mt-1">
            Complete your payment to confirm booking
          </p>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`
                flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                ${paymentMethod === 'card'
                  ? 'bg-kidney-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <CreditCard className="w-5 h-5" />
              Card Payment
            </button>
            <button
              onClick={() => setPaymentMethod('medical_aid')}
              className={`
                flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                ${paymentMethod === 'medical_aid'
                  ? 'bg-kidney-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Building className="w-5 h-5" />
              Medical Aid
            </button>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <InputField
                label="Card Number"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                placeholder="4242 4242 4242 4242"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Expiry"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  placeholder="MM/YY"
                />
                <InputField
                  label="CVC"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                  placeholder="123"
                />
              </div>
              <InputField
                label="Cardholder Name"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                placeholder="John Doe"
              />

              <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <p className="text-sm text-blue-700">
                  This is a demo environment. No real payment will be processed.
                </p>
              </div>

              <Button
                onClick={handleCardPayment}
                loading={processing}
                className="w-full"
                size="lg"
              >
                Pay Now
              </Button>
            </div>
          )}

          {/* Medical Aid Form */}
          {paymentMethod === 'medical_aid' && (
            <div className="space-y-4">
              <InputField
                label="Medical Aid Number"
                value={medicalAidNumber}
                onChange={(e) => setMedicalAidNumber(e.target.value)}
                placeholder="DH123456789"
              />
              <InputField
                label="Medical Aid Scheme"
                value={medicalAidScheme}
                onChange={(e) => setMedicalAidScheme(e.target.value)}
                placeholder="Discovery Health"
              />

              <Button
                onClick={handleMedicalAidPayment}
                loading={processing}
                className="w-full"
                size="lg"
              >
                Verify & Pay with Medical Aid
              </Button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Payments are secured by Yoco
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
