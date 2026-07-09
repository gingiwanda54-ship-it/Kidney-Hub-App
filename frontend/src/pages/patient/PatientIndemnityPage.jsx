import { useState, useEffect } from 'react';
import { FileText, Check, AlertCircle } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { Button, LoadingSpinner } from '../../components/common';
import SignaturePad from '../../components/common/SignaturePad';
import { indemnityService } from '../../services/api';
import toast from 'react-hot-toast';

const PatientIndemnityPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signature, setSignature] = useState('');
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [formRes, statusRes] = await Promise.all([
        indemnityService.getForm(),
        indemnityService.getStatus(),
      ]);
      setFormContent(formRes.data.content);
      setSigned(statusRes.data.signed);
    } catch (error) {
      toast.error('Failed to load indemnity form');
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
        form_type: 'patient',
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
            Indemnity Form
          </h1>
          <p className="text-gray-600 mt-1">
            Please read and sign the patient indemnity form
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
              You have already signed the indemnity form.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Form Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-kidney-green" />
                <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal">
                  Patient Indemnity and Consent Form
                </h2>
              </div>
              
              <div className="prose max-w-none text-gray-600">
                <h3 className="text-kidney-charcoal">1. Acknowledgment of Risks</h3>
                <p>
                  I acknowledge that I have been informed about the nature and risks associated 
                  with kidney care consultations and any procedures that may be performed. I understand 
                  that there are risks inherent in any medical treatment and that I have had the 
                  opportunity to ask questions about these risks.
                </p>

                <h3 className="text-kidney-charcoal">2. Consent to Treatment</h3>
                <p>
                  I hereby consent to receive kidney care consultation services from the verified 
                  nurses on the Kidney Hub platform. I understand that I can withdraw this consent 
                  at any time by notifying the healthcare provider.
                </p>

                <h3 className="text-kidney-charcoal">3. Data Protection Consent</h3>
                <p>
                  I consent to the collection, storage, and processing of my personal and medical 
                  information by Kidney Hub for the purpose of providing healthcare services. I 
                  understand that my data will be handled in accordance with applicable data protection 
                  laws and that I have the right to access and rectify my information.
                </p>

                <h3 className="text-kidney-charcoal">4. Emergency Contact</h3>
                <p>
                  I have provided accurate emergency contact information in my profile, and I 
                  authorize Kidney Hub to contact this person in case of an emergency.
                </p>

                <h3 className="text-kidney-charcoal">5. Medical History Disclosure</h3>
                <p>
                  I confirm that I have provided accurate and complete information about my medical 
                  history, current medications, and any allergies. I understand that providing false 
                  information may affect the quality of care I receive.
                </p>

                <h3 className="text-kidney-charcoal">6. Indemnity</h3>
                <p>
                  I agree to indemnify and hold harmless Kidney Hub, its affiliates, and the 
                  healthcare providers on the platform from any claims arising from my use of the 
                  services, except in cases of gross negligence or willful misconduct.
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

            {/* Agreement Checkbox */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signature ? true : false}
                  readOnly
                  className="mt-1 w-5 h-5 text-kidney-green focus:ring-kidney-green rounded"
                />
                <div>
                  <p className="font-medium text-kidney-charcoal">
                    I have read and understood the above terms
                  </p>
                  <p className="text-sm text-gray-500">
                    By signing above, I agree to the terms and conditions outlined in this 
                    indemnity form.
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSign}
              loading={submitting}
              disabled={!signature}
              className="w-full"
              size="lg"
            >
              Sign Indemnity Form
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PatientIndemnityPage;
