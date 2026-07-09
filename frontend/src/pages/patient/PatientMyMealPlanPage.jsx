import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Calendar, Clock, ShoppingCart, ChevronRight, AlertTriangle } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { patientService } from '../../services/api';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const PatientMyMealPlanPage = () => {
  const [myMealPlan, setMyMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMeal, setActiveMeal] = useState('breakfast');

  useEffect(() => {
    fetchMyMealPlan();
  }, []);

  const fetchMyMealPlan = async () => {
    try {
      const response = await patientService.getMyMealPlan();
      setMyMealPlan(response.data);
    } catch (error) {
      toast.error('Failed to load your meal plan');
    } finally {
      setLoading(false);
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

  if (!myMealPlan) {
    return (
      <MainLayout sidebar={PatientSidebar}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-montserrat font-semibold text-kidney-charcoal mb-2">
              No Meal Plan Assigned
            </h2>
            <p className="text-gray-500 mb-6">
              You don't have a personalized meal plan yet. Browse our library to find one that suits you.
            </p>
            <Link to="/patient/meal-plans" className="btn-primary">
              Browse Meal Plans
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
              My Meal Plan
            </h1>
            <p className="text-gray-600 mt-1">
              {myMealPlan.name} • Assigned by your nurse
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/patient/meal-plans/${myMealPlan.id}/grocery-list`}
              className="btn-outline flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Grocery List
            </Link>
          </div>
        </div>

        {/* Warnings */}
        {myMealPlan.warnings && myMealPlan.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Dietary Considerations</p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                {myMealPlan.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Today's Meals
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
              {myMealPlan.meals?.[activeMeal] ? (
                <div className="space-y-4">
                  {myMealPlan.meals[activeMeal].map((meal, index) => (
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
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Daily Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-kidney-cream rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-kidney-green" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meals Today</p>
                    <p className="font-medium text-kidney-charcoal">
                      {Object.values(myMealPlan.meals || {}).flat().length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plan Duration</p>
                    <p className="font-medium text-kidney-charcoal">
                      {myMealPlan.duration || '7 days'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Daily Nutrition
              </h2>
              <div className="space-y-4">
                {myMealPlan.nutrition && Object.entries(myMealPlan.nutrition).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{key}</span>
                    <span className="font-medium text-kidney-charcoal">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browse More */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Looking for More?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Explore our full library of kidney-friendly meal plans.
              </p>
              <Link
                to="/patient/meal-plans"
                className="text-kidney-green hover:underline flex items-center gap-1"
              >
                Browse All Plans
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientMyMealPlanPage;
