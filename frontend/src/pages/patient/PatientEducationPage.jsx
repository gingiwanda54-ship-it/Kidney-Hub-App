import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Search, ChevronRight, Play, FileText, Image as ImageIcon, Star } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { educationService } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'basics', label: 'Kidney Basics' },
  { id: 'diet', label: 'Diet & Nutrition' },
  { id: 'medications', label: 'Medications' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'complications', label: 'Complications' },
];

const CONTENT_TYPES = {
  article: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  video: { icon: Play, color: 'text-red-600', bg: 'bg-red-100' },
  infographic: { icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
};

const PatientEducationPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchContent();
  }, [activeCategory]);

  const fetchContent = async () => {
    try {
      const response = await educationService.getContent({ category: activeCategory });
      setContent(response.data);
    } catch (error) {
      toast.error('Failed to load education content');
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Education Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Learn about kidney health and management
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, videos, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto">
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeCategory === id
                    ? 'border-kidney-green text-kidney-green'
                    : 'border-transparent text-gray-500 hover:text-kidney-green'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => {
              const TypeIcon = CONTENT_TYPES[item.type]?.icon || FileText;
              const iconColor = CONTENT_TYPES[item.type]?.color || 'text-gray-600';
              const iconBg = CONTENT_TYPES[item.type]?.bg || 'bg-gray-100';
              
              return (
                <Link
                  key={item.id}
                  to={`/patient/education/${item.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`h-40 ${iconBg} flex items-center justify-center`}>
                    <TypeIcon className={`w-16 h-16 ${iconColor}`} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">
                        {item.type}
                      </span>
                      <span className="px-2 py-0.5 bg-kidney-cream text-kidney-green rounded-full text-xs">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {item.readTime || '5 min read'}
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No content found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientEducationPage;
