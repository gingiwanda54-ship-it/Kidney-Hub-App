import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { LoadingSpinner } from '../../components/common';
import SignaturePad from '../../components/common/SignaturePad';
import { indemnityService } from '../../services/api';
import toast from 'react-hot-toast';

const IndemnityFormPage = () => {
  const [loading, setLoading] = useState(true);
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const response = await indemnityService.getForm();
      setFormContent(response.data.content);
    } catch (error) {
      toast.error('Failed to load indemnity form');
    } finally {
      setLoading(false);
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <FileText className="w-8 h-8 text-kidney-green" />
            <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
              Indemnity Form
            </h1>
          </div>
          <p className="text-gray-600">
            Please read and sign the indemnity form
          </p>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: formContent }}
          />
        </div>
      </div>
    </div>
  );
};

export default IndemnityFormPage;
