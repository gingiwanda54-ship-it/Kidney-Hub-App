import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone } from 'lucide-react';
import { Button } from '../../components/common';
import OTPInput from '../../components/auth/OTPInput';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

const VerifyPhonePage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOTP({ otp });
      toast.success('Phone verified successfully');
      navigate('/patient/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.resendOTP();
      toast.success('New OTP sent to your phone');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidney-cream to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <Heart className="w-10 h-10 text-kidney-green" />
            <span className="font-montserrat font-bold text-2xl text-kidney-green">
              Kidney Hub
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-kidney-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-kidney-green" />
            </div>
            <h2 className="text-2xl font-montserrat font-bold text-kidney-charcoal mb-2">
              Verify Your Phone
            </h2>
            <p className="text-gray-500">
              Enter the 6-digit code sent to your phone number
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <OTPInput value={otp} onChange={setOtp} />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Verify
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
            <Button
              variant="ghost"
              onClick={handleResend}
              loading={resendLoading}
            >
              Resend OTP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhonePage;
