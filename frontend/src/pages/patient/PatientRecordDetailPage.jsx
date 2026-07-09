import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, FileText, Activity, TestTube, Scan } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { patientService } from '../../services/api';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  vitals: Activity,
  lab_results: TestTube,
  scans: Scan,
  document: FileText,
};

const PatientRecordDetailPage = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecord();
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      const response = await patientService.getRecordById(recordId);
      setRecord(response.data);
    } catch (error) {
      toast.error('Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (record?.fileUrl) {
      try {
        const link = document.createElement('a');
        link.href = record.fileUrl;
        link.download = record.title || 'record';
        link.click();
      } catch (error) {
        toast.error('Failed to download file');
      }
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

  if (!record) {
    return (
      <MainLayout sidebar={PatientSidebar}>
        <div className="text-center py-12">
          <p className="text-gray-500">Record not found</p>
          <Link to="/patient/records" className="text-kidney-green hover:underline mt-4 inline-block">
            Back to records
          </Link>
        </div>
      </MainLayout>
    );
  }

  const Icon = TYPE_ICONS[record.type] || FileText;

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/patient/records')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
                {record.title}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(record.date).toLocaleDateString('en-ZA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
          {record.fileUrl && (
            <button
              onClick={handleDownload}
              className="btn-outline flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          )}
        </div>

        {/* Record Type Badge */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-kidney-cream rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-kidney-green" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Record Type</p>
              <p className="font-medium text-kidney-charcoal capitalize">
                {record.type?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Vitals Display */}
        {record.type === 'vitals' && record.vitals && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Vital Signs
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {record.vitals.bloodPressureSystolic && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Blood Pressure</p>
                  <p className="text-2xl font-bold text-kidney-charcoal">
                    {record.vitals.bloodPressureSystolic}/{record.vitals.bloodPressureDiastolic}
                  </p>
                  <p className="text-xs text-gray-400">mmHg</p>
                </div>
              )}
              {record.vitals.weight && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Weight</p>
                  <p className="text-2xl font-bold text-kidney-charcoal">
                    {record.vitals.weight}
                  </p>
                  <p className="text-xs text-gray-400">kg</p>
                </div>
              )}
              {record.vitals.egfr && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">eGFR</p>
                  <p className="text-2xl font-bold text-kidney-charcoal">
                    {record.vitals.egfr}
                  </p>
                  <p className="text-xs text-gray-400">mL/min/1.73m²</p>
                </div>
              )}
              {record.vitals.creatinine && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Creatinine</p>
                  <p className="text-2xl font-bold text-kidney-charcoal">
                    {record.vitals.creatinine}
                  </p>
                  <p className="text-xs text-gray-400">mg/dL</p>
                </div>
              )}
              {record.vitals.potassium && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Potassium</p>
                  <p className="text-2xl font-bold text-kidney-charcoal">
                    {record.vitals.potassium}
                  </p>
                  <p className="text-xs text-gray-400">mEq/L</p>
                </div>
              )}
              {record.vitals.sodium && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Sodium</p>
                  <p className="text-2xl font-bold text-kidney-charcoal">
                    {record.vitals.sodium}
                  </p>
                  <p className="text-xs text-gray-400">mEq/L</p>
                </div>
              )}
              {record.vitals.urea && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Urea/BUN</p>
                  <p className="text-2xl font-bold text-kidney-charcoal">
                    {record.vitals.urea}
                  </p>
                  <p className="text-xs text-gray-400">mg/dL</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Notes
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">{record.notes}</p>
          </div>
        )}

        {/* Document Preview */}
        {record.fileUrl && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Document
            </h2>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {record.fileName || 'Document attached'}
              </p>
              <button
                onClick={handleDownload}
                className="mt-4 text-kidney-green hover:underline"
              >
                Download to view
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PatientRecordDetailPage;
