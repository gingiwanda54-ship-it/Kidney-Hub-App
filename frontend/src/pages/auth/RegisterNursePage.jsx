import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Heart, ArrowRight, Check, X, Shield, Award } from 'lucide-react';
import { InputField, Button, Select } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePassword, validatePhone, validateSANC, validateBHF } from '../../utils/validation';
import { mockService } from '../../services/api';
import toast from 'react-hot-toast';

const LANGUAGES = [
  'English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho', 'Tswana', 'Sepedi', 'Ndebele', 'Swazi', 'Venda', 'Tsonga'
];

const SPECIALIZATIONS = [
  { value: 'General', label: 'General Nursing' },
  { value: 'Dialysis', label: 'Dialysis' },
  { value: 'Transplant', label: 'Transplant' },
  { value: 'Pediatric', label: 'Pediatric' },
  { value: 'ICU', label: 'ICU' },
  { value: 'Emergency Care', label: 'Emergency Care' },
];

const RegisterNursePage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    sanc_registration_number: '',
    bhf_provider_number: '',
    specialization: '',
    years_experience: '',
    languages_spoken: [],
    consultation_fee: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifyingSANC, setVerifyingSANC] = useState(false);
  const [verifyingBHF, setVerifyingBHF] = useState(false);
  const [sancVerified, setSancVerified] = useState(false);
  const [bhfVerified, setBhfVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleLanguageToggle = (lang) => {
    const current = formData.languages_spoken;
    const updated = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    setFormData({ ...formData, languages_spoken: updated });
  };

  const verifySANC = async () => {
    const validation = validateSANC(formData.sanc_registration_number);
    if (!validation.valid) {
      setErrors({ ...errors, sanc_registration_number: validation.error });
      return;
    }

    setVerifyingSANC(true);
    try {
      const response = await mockService.verifySANC(formData.sanc_registration_number);
      if (response.data.valid) {
        setSancVerified(true);
        toast.success('SANC registration verified');
      } else {
        setErrors({ ...errors, sanc_registration_number: 'Invalid SANC registration' });
      }
    } catch (error) {
      setErrors({ ...errors, sanc_registration_number: 'SANC verification failed' });
    } finally {
      setVerifyingSANC(false);
    }
  };

  const verifyBHF = async () => {
    const validation = validateBHF(formData.bhf_provider_number);
    if (!validation.valid) {
      setErrors({ ...errors, bhf_provider_number: validation.error });
      return;
    }

    setVerifyingBHF(true);
    try {
      const response = await mockService.verifyBHF(formData.bhf_provider_number);
      if (response.data.valid) {
        setBhfVerified(true);
        toast.success('BHF provider number verified');
      } else {
        setErrors({ ...errors, bhf_provider_number: 'Invalid BHF provider number' });
      }
    } catch (error) {
      setErrors({ ...errors, bhf_provider_number: 'BHF verification failed' });
    } finally {
      setVerifyingBHF(false);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid SA phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.sanc_registration_number) {
      newErrors.sanc_registration_number = 'SANC registration is required';
    }
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.years_experience) {
      newErrors.years_experience = 'Years of experience is required';
    }
    if (formData.languages_spoken.length === 0) {
      newErrors.languages_spoken = 'Select at least one language';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      await register({
        ...formData,
        role: 'nurse',
      });
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { test: (p) => p.length >= 8, label: 'At least 8 characters' },
    { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
    { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
    { test: (p) => /[0-9]/.test(p), label: 'One number' },
    { test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), label: 'One special character' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidney-cream to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
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
            Nurse Registration
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Step {step} of 3
          </p>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-kidney-green' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-kidney-green' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded ${step >= 3 ? 'bg-kidney-green' : 'bg-gray-200'}`} />
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Sarah"
                  icon={User}
                  error={errors.first_name}
                  required
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="van der Berg"
                  error={errors.last_name}
                  required
                />
              </div>
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@example.com"
                icon={Mail}
                error={errors.email}
                required
              />
              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0812345678"
                icon={Phone}
                error={errors.phone}
                required
              />
              <Button onClick={handleNext} className="w-full" icon={ArrowRight}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* SANC Registration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Shield className="w-4 h-4 inline mr-1" />
                  SANC Registration Number
                  <span className="text-kidney-red ml-1">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="sanc_registration_number"
                    value={formData.sanc_registration_number}
                    onChange={handleChange}
                    placeholder="SANC-123456"
                    className={`
                      flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-kidney-green 
                      focus:border-transparent outline-none
                      ${errors.sanc_registration_number ? 'border-kidney-red' : 'border-gray-300'}
                    `}
                  />
                  <Button
                    variant="outline"
                    onClick={verifySANC}
                    loading={verifyingSANC}
                    disabled={sancVerified}
                  >
                    {sancVerified ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
                {sancVerified && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    SANC registration verified
                  </p>
                )}
                {errors.sanc_registration_number && (
                  <p className="text-sm text-kidney-red mt-1">{errors.sanc_registration_number}</p>
                )}
              </div>

              {/* BHF Provider Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Award className="w-4 h-4 inline mr-1" />
                  BHF Provider Number (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="bhf_provider_number"
                    value={formData.bhf_provider_number}
                    onChange={handleChange}
                    placeholder="BHF-789012"
                    className={`
                      flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-kidney-green 
                      focus:border-transparent outline-none
                      ${errors.bhf_provider_number ? 'border-kidney-red' : 'border-gray-300'}
                    `}
                  />
                  <Button
                    variant="outline"
                    onClick={verifyBHF}
                    loading={verifyingBHF}
                    disabled={bhfVerified || !formData.bhf_provider_number}
                  >
                    {bhfVerified ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
                {bhfVerified && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    BHF provider number verified
                  </p>
                )}
              </div>

              <Select
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                options={SPECIALIZATIONS}
                error={errors.specialization}
                required
              />

              <InputField
                label="Years of Experience"
                name="years_experience"
                type="number"
                value={formData.years_experience}
                onChange={handleChange}
                placeholder="5"
                error={errors.years_experience}
                required
              />

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                  <span className="text-kidney-red ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.languages_spoken.includes(lang)
                          ? 'bg-kidney-green text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                {errors.languages_spoken && (
                  <p className="text-sm text-kidney-red mt-1">{errors.languages_spoken}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1" icon={ArrowRight}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Consultation Fee (ZAR)"
                name="consultation_fee"
                type="number"
                value={formData.consultation_fee}
                onChange={handleChange}
                placeholder="450"
                required
              />

              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                icon={Lock}
                error={errors.password}
                required
              />
              
              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <p className="text-xs font-medium text-gray-500 mb-2">Password requirements:</p>
                {passwordRequirements.map(({ test, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    {test(formData.password) ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-gray-300" />
                    )}
                    <span className={test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                icon={Lock}
                error={errors.confirmPassword}
                required
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={loading}
                  icon={ArrowRight}
                >
                  Register
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-kidney-green font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterNursePage;
