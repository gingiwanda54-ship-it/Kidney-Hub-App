import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Activity, TestTube, Scan, ArrowLeft, Check } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { patientService } from '../../services/api';
import toast from 'react-hot-toast';

const RECORD_TYPES = [
  { id: 'vitals', label: 'Vitals', icon: Activity, description: 'Blood pressure, weight, eGFR, creatinine' },
  { id: 'lab_results', label: 'Lab Results', icon: TestTube, description: 'Blood tests, urine analysis' },
  { id: 'scans', label: 'Scans & Imaging', icon: Scan, description: 'Ultrasound, CT, MRI reports' },
  { id: 'document', label: 'Other Document', icon: FileText, description: 'Referral letters, prescriptions' },
];

const VITAL_FIELDS = [
  { name: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', type: 'number' },
  { name: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', type: 'number' },
  { name: 'weight', label: 'Weight', unit: 'kg', type: 'number' },
  { name: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²', type: 'number' },
  { name: 'creatinine', label: 'Creatinine', unit: 'mg/dL', type: 'number' },
  { name: 'potassium', label: 'Potassium', unit: 'mEq/L', type: 'number' },
  { name: 'sodium', label: 'Sodium', unit: 'mEq/L', type: 'number' },
  { name: 'urea', label: 'Urea/BUN', unit: 'mg/dL', type: 'number' },
];

const PatientRecordUploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recordType, setRecordType] = useState('vitals');
  const [vitals, setVitals] = useState({});
  const [document, setDocument] = useState(null);
  const [notes, setNotes] = useState('');

  const handleVitalsChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setDocument(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (recordType === 'vitals') {
        const response = await patientService.uploadVitals({
          ...vitals,
          date: new Date().toISOString(),
          notes,
        });
        toast.success('Vitals recorded successfully');
      } else if (recordType === 'lab_results' || recordType === 'scans' || recordType === 'document') {
        const formData = new FormData();
        formData.append('file', document);
        formData.append('type', recordType);
        formData.append('notes', notes);
        formData.append('date', new Date().toISOString());
        
        const response = await patientService.uploadRecord(formData);
        toast.success('Document uploaded successfully');
      }
      navigate('/patient/records');
    } catch (error) {
      toast.error('Failed to upload record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/patient/records')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
              Upload Health Record
            </h1>
            <p className="text-gray-600 mt-1">
              Add new vitals or documents to your health history
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Record Type Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Record Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RECORD_TYPES.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRecordType(id)}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors text-left ${
                    recordType === id
                      ? 'border-kidney-green bg-kidney-cream'
                      : 'border-gray-200 hover:border-kidney-green'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    recordType === id ? 'bg-kidney-green text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-kidney-charcoal">{label}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Vitals Form */}
          {recordType === 'vitals' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Vital Signs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VITAL_FIELDS.map(({ name, label, unit, type }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type={type}
                        value={vitals[name] || ''}
                        onChange={(e) => handleVitalsChange(name, e.target.value)}
                        className="input-field"
                        placeholder="--"
                      />
                      <span className="text-sm text-gray-500">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Upload */}
          {(recordType === 'lab_results' || recordType === 'scans' || recordType === 'document') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Upload Document
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-kidney-green transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {document ? (
                    <div>
                      <p className="font-medium text-kidney-charcoal">{document.name}</p>
                      <p className="text-sm text-gray-500">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-kidney-charcoal">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PDF, JPG, PNG, DOC up to 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Notes (Optional)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="Add any notes about this record..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/patient/records')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Check className="w-5 h-5" />}
              Save Record
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default PatientRecordUploadPage;
