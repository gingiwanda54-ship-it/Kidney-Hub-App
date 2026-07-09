import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Heart, ArrowRight } from 'lucide-react';
import { InputField, Button } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validation';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.requiresOTP) {
        setStep('otp');
        toast.success('OTP sent to your phone');
      } else {
        navigate(result.user.role === 'nurse' ? '/nurse/dashboard' : '/patient/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { verifyOTP } = useAuth();
      const user = await verifyOTP(otp);
      navigate(user.role === 'nurse' ? '/nurse/dashboard' : '/patient/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidney-cream to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Heart className="w-10 h-10 text-kidney-green" />
            <span className="font-montserrat font-bold text-2xl text-kidney-green">
              Kidney Hub
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-montserrat font-bold text-center text-kidney-charcoal mb-2">
            {step === 'credentials' ? 'Welcome Back' : 'Enter OTP'}
          </h2>
          <p className="text-center text-gray-500 mb-6">
            {step === 'credentials'
              ? 'Sign in to your account'
              : 'We sent a code to your phone'
            }
          </p>

          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit}>
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email}
                required
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                icon={Lock}
                error={errors.password}
                required
              />
              <div className="text-right mb-6">
                <Link
                  to="/forgot-password"
                  className="text-sm text-kidney-green hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                icon={ArrowRight}
              >
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit}>
              <div className="mb-6">
                <p className="text-center text-sm text-gray-500 mb-4">
                  Enter the 6-digit code sent to your registered phone number
                </p>
                <div className="flex justify-center">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-32 h-14 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-kidney-green focus:ring-2 focus:ring-kidney-green outline-none"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                Verify OTP
              </Button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-sm text-gray-500 hover:text-kidney-green"
                >
                  Use different account
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Register Link */}
        {step === 'credentials' && (
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/register/patient" className="text-kidney-green font-semibold hover:underline">
              Register as Patient
            </Link>
            {' or '}
            <Link to="/register/nurse" className="text-kidney-green font-semibold hover:underline">
              Register as Nurse
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
