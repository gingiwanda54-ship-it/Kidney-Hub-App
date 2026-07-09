import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChefHat, Clock, Users, AlertTriangle, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { mealPlanService } from '../../services/api';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const PatientMealPlanDetailPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMeal, setActiveMeal] = useState('breakfast');

  useEffect(() => {
    fetchMealPlan();
  }, [planId]);

  const fetchMealPlan = async () => {
    try {
      const response = await mealPlanService.getById(planId);
      setMealPlan(response.data);
    } catch (error) {
      toast.error('Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      await mealPlanService.assignToPatient(planId);
      toast.success('Meal plan assigned to you!');
    } catch (error) {
      toast.error('Failed to assign meal plan');
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

  if (!mealPlan) {
    return (
      <MainLayout sidebar={PatientSidebar}>
        <div className="text-center py-12">
          <p className="text-gray-500">Meal plan not found</p>
          <Link to="/patient/meal-plans" className="text-kidney-green hover:underline mt-4 inline-block">
            Back to meal plans
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/patient/meal-plans')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
                {mealPlan.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {mealPlan.rating || '4.5'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {mealPlan.servings || 1} servings
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/patient/meal-plans/${planId}/grocery-list`}
              className="btn-outline flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Grocery List
            </Link>
            <button
              onClick={handleAssignToMe}
              className="btn-primary"
            >
              Assign to Me
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                About This Plan
              </h2>
              <p className="text-gray-600 mb-4">{mealPlan.description}</p>
              
              {/* Dietary Warnings */}
              {mealPlan.warnings && mealPlan.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Dietary Considerations</p>
                      <ul className="text-sm text-amber-700 mt-1 space-y-1">
                        {mealPlan.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Meals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Daily Meals
              </h2>
              
              {/* Meal Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {MEAL_TYPES.map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setActiveMeal(meal)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors whitespace-nowrap ${
                      activeMeal === meal
                        ? 'bg-kidney-green text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>

              {/* Meal Content */}
              {mealPlan.meals?.[activeMeal] ? (
                <div className="space-y-4">
                  {mealPlan.meals[activeMeal].map((meal, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-kidney-charcoal mb-2">{meal.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Ingredients:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {meal.ingredients?.map((ing, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-kidney-green rounded-full"></span>
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {meal.instructions && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Instructions:</p>
                          <p className="text-sm text-gray-600">{meal.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No meals scheduled for {activeMeal}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Nutrition Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Nutrition Breakdown
              </h2>
              <div className="space-y-4">
                {mealPlan.nutrition && Object.entries(mealPlan.nutrition).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{key}</span>
                    <span className="font-medium text-kidney-charcoal">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Recommended For
              </h2>
              <p className="text-sm text-gray-600">
                {mealPlan.stage === 'early' && 'Early stage kidney disease (Stages 1-2)'}
                {mealPlan.stage === 'late' && 'Late stage kidney disease (Stages 3-5)'}
                {mealPlan.stage === 'dialysis' && 'Patients on dialysis'}
                {!mealPlan.stage && 'All kidney patients'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientMealPlanDetailPage;
