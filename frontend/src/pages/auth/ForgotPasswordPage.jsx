import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Heart, ArrowRight, Check } from 'lucide-react';
import { InputField, Button } from '../../components/common';
import { authService } from '../../services/api';
import { validateEmail } from '../../utils/validation';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email format' });
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep('code');
      toast.success('Reset code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setErrors({ code: 'Please enter a 6-digit code' });
      return;
    }

    setStep('reset');
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        code,
        newPassword,
      });
      toast.success('Password reset successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
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
            {step === 'email' && 'Reset Password'}
            {step === 'code' && 'Enter Code'}
            {step === 'reset' && 'New Password'}
          </h2>
          <p className="text-center text-gray-500 mb-6">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'code' && 'Enter the 6-digit code sent to your email'}
            {step === 'reset' && 'Create a new password for your account'}
          </p>

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit}>
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email}
                required
              />
              <Button type="submit" className="w-full" loading={loading} icon={ArrowRight}>
                Send Reset Code
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeSubmit}>
              <div className="mb-6">
                <p className="text-center text-sm text-gray-500 mb-4">
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
                <div className="flex justify-center">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-32 h-14 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-kidney-green focus:ring-2 focus:ring-kidney-green outline-none"
                  />
                </div>
                {errors.code && (
                  <p className="text-center text-sm text-kidney-red mt-2">{errors.code}</p>
                )}
              </div>
              <Button type="submit" className="w-full" icon={ArrowRight}>
                Verify Code
              </Button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm text-gray-500 hover:text-kidney-green"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <InputField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                error={errors.newPassword}
                required
              />
              <InputField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                error={errors.confirmPassword}
                required
              />
              <Button type="submit" className="w-full" loading={loading} icon={Check}>
                Reset Password
              </Button>
            </form>
          )}
        </div>

        {/* Back to Login */}
        <p className="text-center mt-6 text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-kidney-green font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
