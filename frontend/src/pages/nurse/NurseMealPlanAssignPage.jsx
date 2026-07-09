import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, User, Check, Calendar } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { mealPlanService, patientService } from '../../services/api';
import toast from 'react-hot-toast';

const NurseMealPlanAssignPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [planId]);

  const fetchData = async () => {
    try {
      const [planRes, patientsRes] = await Promise.all([
        mealPlanService.getById(planId),
        patientService.getAll(),
      ]);
      setMealPlan(planRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const togglePatient = (patientId) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleAssign = async () => {
    if (selectedPatients.length === 0) {
      toast.error('Please select at least one patient');
      return;
    }

    setAssigning(true);
    try {
      await mealPlanService.assignToPatients(planId, { patientIds: selectedPatients });
      toast.success(`Meal plan assigned to ${selectedPatients.length} patient(s)`);
      navigate('/nurse/meal-plans');
    } catch (error) {
      toast.error('Failed to assign meal plan');
    } finally {
      setAssigning(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.user?.first_name} ${patient.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/nurse/meal-plans"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
              Assign Meal Plan
            </h1>
            <p className="text-gray-600 mt-1">
              {mealPlan?.name}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Selected Count */}
        {selectedPatients.length > 0 && (
          <div className="bg-kidney-green text-white rounded-lg p-4 mb-6 flex items-center justify-between">
            <span>{selectedPatients.length} patient(s) selected</span>
            <button
              onClick={() => setSelectedPatients([])}
              className="text-white/80 hover:text-white"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {filteredPatients.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <label
                  key={patient.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedPatients.includes(patient.id)
                        ? 'bg-kidney-green border-kidney-green'
                        : 'border-gray-300'
                    }`}
                    onClick={() => togglePatient(patient.id)}
                  >
                    {selectedPatients.includes(patient.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="w-10 h-10 bg-kidney-cream rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-kidney-green" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-kidney-charcoal">
                      {patient.user?.first_name} {patient.user?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {patient.user?.email}
                    </p>
                  </div>
                  {patient.assignedMealPlan && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      Has existing plan
                    </span>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No patients found</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/nurse/meal-plans')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedPatients.length === 0 || assigning}
            className="btn-primary flex items-center gap-2"
          >
            {assigning ? <LoadingSpinner size="sm" /> : <Check className="w-5 h-5" />}
            Assign to {selectedPatients.length || 0} Patient(s)
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NurseMealPlanAssignPage;
