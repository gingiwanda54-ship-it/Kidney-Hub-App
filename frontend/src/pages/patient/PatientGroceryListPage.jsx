import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Printer, Share2, Trash2 } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { mealPlanService } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = {
  produce: 'Produce',
  protein: 'Protein',
  dairy: 'Dairy',
  grains: 'Grains',
  other: 'Other',
};

const PatientGroceryListPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    fetchGroceryList();
  }, [planId]);

  const fetchGroceryList = async () => {
    try {
      const response = await mealPlanService.getGroceryList(planId);
      setGroceryList(response.data);
    } catch (error) {
      toast.error('Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Grocery List',
          text: 'My kidney-friendly grocery list',
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      toast.success('Link copied to clipboard!');
    }
  };

  const groupedItems = groceryList.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = groceryList.length;

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/patient/meal-plans/${planId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
                Grocery List
              </h1>
              <p className="text-gray-600 mt-1">
                {checkedCount} of {totalCount} items checked
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="btn-outline flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button
              onClick={handlePrint}
              className="btn-outline flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Shopping Progress</span>
            <span className="text-sm font-medium text-kidney-charcoal">
              {Math.round((checkedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-kidney-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Grocery List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h2 className="font-montserrat font-semibold text-kidney-charcoal">
                  {CATEGORIES[category] || category}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        checkedItems[item.id]
                          ? 'bg-kidney-green border-kidney-green'
                          : 'border-gray-300'
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      {checkedItems[item.id] && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        checkedItems[item.id] ? 'line-through text-gray-400' : 'text-kidney-charcoal'
                      }`}>
                        {item.name}
                      </p>
                      {item.quantity && (
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      )}
                    </div>
                    {item.notes && (
                      <span className="text-xs text-gray-400">{item.notes}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {groceryList.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No items in your grocery list</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PatientGroceryListPage;
