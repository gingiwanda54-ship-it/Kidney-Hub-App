import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Plus, Search, ChevronRight, Edit, Trash2, Eye, FileText, Play, Image as ImageIcon } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { educationService } from '../../services/api';
import toast from 'react-hot-toast';

const CONTENT_TYPES = {
  article: { icon: FileText, label: 'Article' },
  video: { icon: Play, label: 'Video' },
  infographic: { icon: ImageIcon, label: 'Infographic' },
};

const CATEGORIES = ['basics', 'diet', 'medications', 'lifestyle', 'complications'];

const NurseEducationPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await educationService.getAllAdmin();
      setContent(response.data);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }
    try {
      await educationService.delete(contentId);
      toast.success('Content deleted');
      fetchContent();
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

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
              Education Library
            </h1>
            <p className="text-gray-600 mt-1">
              Manage educational content for patients
            </p>
          </div>
          <Link
            to="/nurse/education/create"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Content
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterType === 'all'
                    ? 'bg-kidney-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {Object.entries(CONTENT_TYPES).map(([type, { label }]) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === type
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

        {/* Content List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredContent.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredContent.map((item) => {
                const TypeIcon = CONTENT_TYPES[item.type]?.icon || FileText;
                
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-kidney-cream rounded-full flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-kidney-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-kidney-charcoal truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">
                          {item.type}
                        </span>
                        <span className="px-2 py-0.5 bg-kidney-cream text-kidney-green rounded-full text-xs">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {item.views || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/nurse/education/${item.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5 text-gray-600" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No content found</p>
              <Link
                to="/nurse/education/create"
                className="text-kidney-green hover:underline mt-4 inline-block"
              >
                Create your first content
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NurseEducationPage;
