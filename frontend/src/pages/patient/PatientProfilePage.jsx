import { useState, useEffect } from 'react';
import { User, Save, Camera, Shield, Check } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { InputField, Button, Select, LoadingSpinner } from '../../components/common';
import ProfilePhotoUpload from '../../components/common/ProfilePhotoUpload';
import { useAuth } from '../../contexts/AuthContext';
import { patientService, mockService } from '../../services/api';
import { validateSAID, extractBirthDate, validateMedicalAidNumber } from '../../utils/validation';
import toast from 'react-hot-toast';

const PatientProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    sa_id_number: '',
    medical_aid_number: '',
    medical_aid_scheme: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    gender: '',
    preferred_language: '',
    address_line1: '',
    city: '',
    province: '',
    postal_code: '',
  });
  const [errors, setErrors] = useState({});
  const [idVerified, setIdVerified] = useState(false);
  const [medicalAidVerified, setMedicalAidVerified] = useState(false);
  const [extractedDOB, setExtractedDOB] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await patientService.getProfile();
      const profile = response.data;
      setFormData({
        first_name: profile.user?.first_name || user?.first_name || '',
        last_name: profile.user?.last_name || user?.last_name || '',
        email: profile.user?.email || user?.email || '',
        phone: profile.user?.phone || '',
        sa_id_number: profile.sa_id_number || '',
        medical_aid_number: profile.medical_aid_number || '',
        medical_aid_scheme: profile.medical_aid_scheme || '',
        emergency_contact_name: profile.emergency_contact_name || '',
        emergency_contact_phone: profile.emergency_contact_phone || '',
        gender: profile.gender || '',
        preferred_language: profile.preferred_language || 'English',
        address_line1: profile.address_line1 || '',
        city: profile.city || '',
        province: profile.province || '',
        postal_code: profile.postal_code || '',
      });
      setIdVerified(!!profile.sa_id_number);
      setMedicalAidVerified(!!profile.medical_aid_number);
      if (profile.sa_id_number) {
        setExtractedDOB(extractBirthDate(profile.sa_id_number));
      }
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

    // Auto-extract DOB from SA ID
    if (name === 'sa_id_number' && value.length === 13) {
      const dob = extractBirthDate(value);
      setExtractedDOB(dob);
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('photo', file);
      const response = await patientService.uploadPhoto(formDataUpload);
      updateUser({ ...user, profile_photo_url: response.data.url });
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const verifySAID = async () => {
    const validation = validateSAID(formData.sa_id_number);
    if (!validation.valid) {
      setErrors({ ...errors, sa_id_number: validation.error });
      return;
    }

    try {
      const response = await mockService.validateSAID(formData.sa_id_number);
      if (response.data.valid) {
        setIdVerified(true);
        setExtractedDOB(response.data.dateOfBirth);
        toast.success('SA ID verified successfully');
      } else {
        setErrors({ ...errors, sa_id_number: 'Invalid SA ID number' });
      }
    } catch (error) {
      setErrors({ ...errors, sa_id_number: 'SA ID verification failed' });
    }
  };

  const verifyMedicalAid = async () => {
    const validation = validateMedicalAidNumber(formData.medical_aid_number);
    if (!validation.valid) {
      setErrors({ ...errors, medical_aid_number: validation.error });
      return;
    }

    try {
      const response = await mockService.lookupMedicalAid(formData.sa_id_number);
      if (response.data.found) {
        setMedicalAidVerified(true);
        toast.success('Medical aid verified successfully');
      } else {
        setErrors({ ...errors, medical_aid_number: 'Medical aid not found' });
      }
    } catch (error) {
      setErrors({ ...errors, medical_aid_number: 'Medical aid verification failed' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patientService.updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            My Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information
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

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />
              <InputField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <InputField
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Select
                label="Preferred Language"
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleChange}
                options={[
                  { value: 'English', label: 'English' },
                  { value: 'Afrikaans', label: 'Afrikaans' },
                  { value: 'Zulu', label: 'Zulu' },
                  { value: 'Xhosa', label: 'Xhosa' },
                  { value: 'Sotho', label: 'Sotho' },
                ]}
              />
            </div>
          </div>

          {/* SA ID */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-kidney-green" />
              SA ID Verification
            </h2>
            <div className="space-y-4">
              <div>
                <InputField
                  label="SA ID Number"
                  name="sa_id_number"
                  value={formData.sa_id_number}
                  onChange={handleChange}
                  placeholder="9901015009089"
                  error={errors.sa_id_number}
                  required
                />
                {extractedDOB && (
                  <p className="text-sm text-gray-500 mt-1">
                    Extracted DOB: {new Date(extractedDOB).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={verifySAID}
                disabled={idVerified || !formData.sa_id_number}
              >
                {idVerified ? (
                  <>
                    <Check className="w-4 h-4" />
                    Verified
                  </>
                ) : (
                  'Verify SA ID'
                )}
              </Button>
            </div>
          </div>

          {/* Medical Aid */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Medical Aid Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Medical Aid Number"
                name="medical_aid_number"
                value={formData.medical_aid_number}
                onChange={handleChange}
                placeholder="DH123456789"
                error={errors.medical_aid_number}
              />
              <InputField
                label="Medical Aid Scheme"
                name="medical_aid_scheme"
                value={formData.medical_aid_scheme}
                onChange={handleChange}
                placeholder="Discovery Health"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={verifyMedicalAid}
              disabled={medicalAidVerified || !formData.medical_aid_number}
              className="mt-2"
            >
              {medicalAidVerified ? (
                <>
                  <Check className="w-4 h-4" />
                  Verified
                </>
              ) : (
                'Verify Medical Aid'
              )}
            </Button>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Contact Name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
              <InputField
                label="Contact Phone"
                name="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                placeholder="0821234567"
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Street Address"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              </div>
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Cape Town"
              />
              <InputField
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Western Cape"
              />
              <InputField
                label="Postal Code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="8001"
              />
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

export default PatientProfilePage;
