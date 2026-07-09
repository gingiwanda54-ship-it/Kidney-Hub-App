import { useState, useEffect } from 'react';
import { Save, Shield, Award, Check } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { InputField, Button, Select, LoadingSpinner, CredentialBadge } from '../../components/common';
import ProfilePhotoUpload from '../../components/common/ProfilePhotoUpload';
import { useAuth } from '../../contexts/AuthContext';
import { nurseService, mockService } from '../../services/api';
import { validateSANC, validateBHF } from '../../utils/validation';
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

const NurseProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    years_experience: '',
    languages_spoken: [],
    consultation_fee: '',
    bio: '',
    qualifications: '',
    location_city: '',
    location_province: '',
    sanc_registration_number: '',
    bhf_provider_number: '',
  });
  const [errors, setErrors] = useState({});
  const [sancVerified, setSancVerified] = useState(false);
  const [bhfVerified, setBhfVerified] = useState(false);
  const [verifyingSANC, setVerifyingSANC] = useState(false);
  const [verifyingBHF, setVerifyingBHF] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await nurseService.getById(user?.nurse_id);
      const profile = response.data;
      setFormData({
        specialization: profile.specialization || '',
        years_experience: profile.years_experience || '',
        languages_spoken: profile.languages_spoken ? JSON.parse(profile.languages_spoken) : [],
        consultation_fee: profile.consultation_fee || '',
        bio: profile.bio || '',
        qualifications: profile.qualifications || '',
        location_city: profile.location_city || '',
        location_province: profile.location_province || '',
        sanc_registration_number: profile.sanc_registration_number || '',
        bhf_provider_number: profile.bhf_provider_number || '',
      });
      setSancVerified(profile.sanc_verified);
      setBhfVerified(profile.bhf_verified);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('photo', file);
      const response = await nurseService.uploadPhoto(formDataUpload);
      updateUser({ ...user, profile_photo_url: response.data.url });
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await nurseService.updateProfile({
        ...formData,
        languages_spoken: JSON.stringify(formData.languages_spoken),
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            My Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your professional profile
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Photo */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Profile Photo
            </h2>
            <ProfilePhotoUpload
              currentPhoto={user?.profile_photo_url}
              onUpload={handlePhotoUpload}
              loading={uploadingPhoto}
            />
          </div>

          {/* Credentials */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-kidney-green" />
              Professional Credentials
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputField
                  label="SANC Registration Number"
                  name="sanc_registration_number"
                  value={formData.sanc_registration_number}
                  onChange={handleChange}
                  placeholder="SANC-123456"
                  error={errors.sanc_registration_number}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifySANC}
                  loading={verifyingSANC}
                  disabled={sancVerified || !formData.sanc_registration_number}
                >
                  {sancVerified ? (
                    <>
                      <Check className="w-4 h-4" />
                      Verified
                    </>
                  ) : (
                    'Verify SANC'
                  )}
                </Button>
              </div>
              
              <div>
                <InputField
                  label="BHF Provider Number"
                  name="bhf_provider_number"
                  value={formData.bhf_provider_number}
                  onChange={handleChange}
                  placeholder="BHF-789012"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyBHF}
                  loading={verifyingBHF}
                  disabled={bhfVerified || !formData.bhf_provider_number}
                >
                  {bhfVerified ? (
                    <>
                      <Check className="w-4 h-4" />
                      Verified
                    </>
                  ) : (
                    'Verify BHF'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Professional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                options={SPECIALIZATIONS}
                required
              />
              <InputField
                label="Years of Experience"
                name="years_experience"
                type="number"
                value={formData.years_experience}
                onChange={handleChange}
                placeholder="5"
                required
              />
              <InputField
                label="Consultation Fee (ZAR)"
                name="consultation_fee"
                type="number"
                value={formData.consultation_fee}
                onChange={handleChange}
                placeholder="450"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City"
                  name="location_city"
                  value={formData.location_city}
                  onChange={handleChange}
                  placeholder="Cape Town"
                />
                <InputField
                  label="Province"
                  name="location_province"
                  value={formData.location_province}
                  onChange={handleChange}
                  placeholder="Western Cape"
                />
              </div>
            </div>

            {/* Languages */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
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
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              About Me
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell patients about your experience and approach to kidney care..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List your certifications and qualifications..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" loading={saving} icon={Save} className="w-full" size="lg">
            Save Changes
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default NurseProfilePage;
