import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Plus, Search, ChevronRight, Users, Edit, Trash2 } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { mealPlanService } from '../../services/api';
import toast from 'react-hot-toast';

const NurseMealPlansPage = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const response = await mealPlanService.getAllAdmin();
      setMealPlans(response.data);
    } catch (error) {
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }
    try {
      await mealPlanService.delete(planId);
      toast.success('Meal plan deleted');
      fetchMealPlans();
    } catch (error) {
      toast.error('Failed to delete meal plan');
    }
  };

  const filteredMealPlans = mealPlans.filter(plan =>
    plan.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
              Manage Meal Plans
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage kidney-friendly meal plans
            </p>
          </div>
          <Link
            to="/nurse/meal-plans/create"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Meal Plan
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search meal plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Meal Plans List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredMealPlans.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredMealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-kidney-cream rounded-full flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-kidney-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-kidney-charcoal truncate">
                      {plan.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {plan.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {plan.assignedCount || 0} assigned
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                      {plan.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/nurse/meal-plans/${plan.id}/edit`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-gray-600" />
                    </Link>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                    <Link
                      to={`/nurse/meal-plans/${plan.id}/assign`}
                      className="btn-primary"
                    >
                      Assign
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No meal plans found</p>
              <Link
                to="/nurse/meal-plans/create"
                className="text-kidney-green hover:underline mt-4 inline-block"
              >
                Create your first meal plan
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NurseMealPlansPage;
