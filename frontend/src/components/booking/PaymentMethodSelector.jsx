import { useState } from 'react';
import { CreditCard, Shield, Building } from 'lucide-react';
import { InputField } from '../common';

const PaymentMethodSelector = ({ selected, onSelect, onMedicalAidVerify }) => {
  const [medicalAidNumber, setMedicalAidNumber] = useState('');
  const [medicalAidScheme, setMedicalAidScheme] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyMedicalAid = async () => {
    if (!medicalAidNumber || !medicalAidScheme) {
      setError('Please enter both medical aid number and scheme');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      await onMedicalAidVerify({
        medical_aid_number: medicalAidNumber,
        medical_aid_scheme: medicalAidScheme,
      });
      setVerified(true);
    } catch (err) {
      setError('Medical aid verification failed. Please try cash payment.');
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-montserrat font-semibold text-kidney-charcoal">Payment Method</h4>
      
      {/* Cash Option */}
      <label
        className={`
          flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
          ${selected === 'cash' ? 'border-kidney-green bg-kidney-cream' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="cash"
          checked={selected === 'cash'}
          onChange={() => onSelect('cash')}
          className="mt-1 text-kidney-green focus:ring-kidney-green"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-kidney-green" />
            <span className="font-medium text-kidney-charcoal">Pay with Card (Cash)</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Pay securely via Yoco payment gateway
          </p>
        </div>
      </label>

      {/* Medical Aid Option */}
      <label
        className={`
          flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
          ${selected === 'medical_aid' ? 'border-kidney-green bg-kidney-cream' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="medical_aid"
          checked={selected === 'medical_aid'}
          onChange={() => onSelect('medical_aid')}
          className="mt-1 text-kidney-green focus:ring-kidney-green"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-kidney-green" />
            <span className="font-medium text-kidney-charcoal">Medical Aid</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Use your medical aid coverage
          </p>

          {selected === 'medical_aid' && (
            <div className="mt-4 space-y-4">
              <InputField
                label="Medical Aid Number"
                value={medicalAidNumber}
                onChange={(e) => {
                  setMedicalAidNumber(e.target.value);
                  setVerified(false);
                }}
                placeholder="Enter your medical aid number"
              />
              
              <InputField
                label="Medical Aid Scheme"
                value={medicalAidScheme}
                onChange={(e) => {
                  setMedicalAidScheme(e.target.value);
                  setVerified(false);
                }}
                placeholder="e.g., Discovery Health, Bonitas"
              />

              {error && (
                <p className="text-sm text-kidney-red">{error}</p>
              )}

              {verified ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Medical aid verified</span>
                </div>
              ) : (
                <button
                  onClick={handleVerifyMedicalAid}
                  disabled={verifying || !medicalAidNumber || !medicalAidScheme}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${verifying || !medicalAidNumber || !medicalAidScheme
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-kidney-green text-white hover:bg-kidney-teal'
                    }
                  `}
                >
                  {verifying ? 'Verifying...' : 'Verify Medical Aid'}
                </button>
              )}
            </div>
          )}
        </div>
      </label>
    </div>
  );
};

export default PaymentMethodSelector;
