import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Search, Filter, ChevronRight, Users, Star } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { mealPlanService } from '../../services/api';
import toast from 'react-hot-toast';

const STAGE_FILTERS = [
  { id: 'all', label: 'All Plans' },
  { id: 'early', label: 'Early Stage (1-2)' },
  { id: 'late', label: 'Late Stage (3-5)' },
  { id: 'dialysis', label: 'Dialysis' },
];

const PatientMealPlansPage = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    fetchMealPlans();
  }, [stageFilter]);

  const fetchMealPlans = async () => {
    try {
      const response = await mealPlanService.getAll({ stage: stageFilter });
      setMealPlans(response.data);
    } catch (error) {
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const filteredMealPlans = mealPlans.filter(plan =>
    plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageColor = (stage) => {
    switch (stage) {
      case 'early':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-amber-100 text-amber-800';
      case 'dialysis':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            Meal Plans
          </h1>
          <p className="text-gray-600 mt-1">
            Browse kidney-friendly meal plans tailored to your stage
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meal plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              {STAGE_FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setStageFilter(id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    stageFilter === id
                      ? 'bg-kidney-green text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMealPlans.length > 0 ? (
            filteredMealPlans.map((plan) => (
              <Link
                key={plan.id}
                to={`/patient/meal-plans/${plan.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-kidney-green to-kidney-teal flex items-center justify-center">
                  <ChefHat className="w-16 h-16 text-white/80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-montserrat font-semibold text-kidney-charcoal">
                      {plan.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(plan.stage)}`}>
                      {plan.stage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {plan.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {plan.servings || 1} servings
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {plan.rating || '4.5'}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No meal plans found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientMealPlansPage;
