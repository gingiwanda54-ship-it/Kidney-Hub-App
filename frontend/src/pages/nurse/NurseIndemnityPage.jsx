import { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { Button, LoadingSpinner } from '../../components/common';
import SignaturePad from '../../components/common/SignaturePad';
import { indemnityService } from '../../services/api';
import toast from 'react-hot-toast';

const NurseIndemnityPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signature, setSignature] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statusRes = await indemnityService.getStatus();
      setSigned(statusRes.data.signed);
    } catch (error) {
      toast.error('Failed to load indemnity status');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signature) {
      toast.error('Please sign the form');
      return;
    }

    setSubmitting(true);
    try {
      await indemnityService.sign({
        signature_data: signature,
        form_type: 'nurse',
      });
      setSigned(true);
      toast.success('Indemnity form signed successfully');
    } catch (error) {
      toast.error('Failed to sign form');
    } finally {
      setSubmitting(false);
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
            Professional Indemnity Form
          </h1>
          <p className="text-gray-600 mt-1">
            Please read and sign the nurse professional indemnity form
          </p>
        </div>

        {signed ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-montserrat font-bold text-kidney-charcoal mb-2">
              Form Already Signed
            </h2>
            <p className="text-gray-600">
              You have already signed the professional indemnity form.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Form Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-kidney-green" />
                <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal">
                  Professional Indemnity and Scope of Practice Agreement
                </h2>
              </div>
              
              <div className="prose max-w-none text-gray-600">
                <h3 className="text-kidney-charcoal">1. Professional Liability Acknowledgment</h3>
                <p>
                  I acknowledge that I am a qualified healthcare professional registered with the 
                  South African Nursing Council (SANC) and that I am solely responsible for my 
                  professional actions and decisions during consultations conducted through the 
                  Kidney Hub platform.
                </p>

                <h3 className="text-kidney-charcoal">2. Scope of Practice Agreement</h3>
                <p>
                  I agree to practice within my scope of competence and qualifications as defined 
                  by SANC regulations. I will not provide services beyond my scope of practice 
                  and will refer patients to appropriate specialists when necessary.
                </p>

                <h3 className="text-kidney-charcoal">3. Infection Control Compliance</h3>
                <p>
                  I agree to comply with all infection control protocols and standards, including 
                  proper hand hygiene, use of personal protective equipment, and adherence to 
                  waste disposal regulations.
                </p>

                <h3 className="text-kidney-charcoal">4. Patient Confidentiality Agreement</h3>
                <p>
                  I agree to maintain strict confidentiality of all patient information accessed 
                  through the Kidney Hub platform. I will not disclose any patient data to third 
                  parties without explicit consent, except as required by law.
                </p>

                <h3 className="text-kidney-charcoal">5. Incident Reporting Commitment</h3>
                <p>
                  I agree to promptly report any adverse events, incidents, or near-misses 
                  that occur during consultations through the platform's incident reporting system.
                </p>

                <h3 className="text-kidney-charcoal">6. Continuous Professional Development</h3>
                <p>
                  I commit to maintaining my professional competence through ongoing education 
                  and training in kidney care and related areas.
                </p>
              </div>
            </div>

            {/* Signature Pad */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Digital Signature
              </h3>
              
              <SignaturePad onSignatureChange={setSignature} />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSign}
              loading={submitting}
              disabled={!signature}
              className="w-full"
              size="lg"
            >
              Sign Professional Indemnity Form
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NurseIndemnityPage;
