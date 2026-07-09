import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Book, ChevronRight, TrendingUp, Clock, FileText, Play, Image as ImageIcon } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { educationService } from '../../services/api';
import toast from 'react-hot-toast';

const CONTENT_TYPES = {
  article: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  video: { icon: Play, color: 'text-red-600', bg: 'bg-red-100' },
  infographic: { icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
};

const PatientEducationFeaturedPage = () => {
  const [featured, setFeatured] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredRes, personalizedRes, recentRes] = await Promise.all([
        educationService.getFeatured(),
        educationService.getPersonalized(),
        educationService.getRecentlyViewed(),
      ]);
      setFeatured(featuredRes.data);
      setPersonalized(personalizedRes.data);
      setRecentlyViewed(recentRes.data);
    } catch (error) {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const renderContentCard = (item) => {
    const TypeIcon = CONTENT_TYPES[item.type]?.icon || FileText;
    const iconColor = CONTENT_TYPES[item.type]?.color || 'text-gray-600';
    const iconBg = CONTENT_TYPES[item.type]?.bg || 'bg-gray-100';

    return (
      <Link
        key={item.id}
        to={`/patient/education/${item.id}`}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className={`h-32 ${iconBg} flex items-center justify-center`}>
          <TypeIcon className={`w-12 h-12 ${iconColor}`} />
        </div>
        <div className="p-4">
          <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-1 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {item.readTime || '5 min'}
          </div>
        </div>
      </Link>
    );
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
            Recommended for You
          </h1>
          <p className="text-gray-600 mt-1">
            Personalized content based on your health profile
          </p>
        </div>

        {/* Featured Section */}
        {featured.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-montserrat font-semibold text-kidney-charcoal">
                Featured
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(renderContentCard)}
            </div>
          </div>
        )}

        {/* Personalized Section */}
        {personalized.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-kidney-green" />
              <h2 className="text-xl font-montserrat font-semibold text-kidney-charcoal">
                Based on Your Progress
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {personalized.map(renderContentCard)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-montserrat font-semibold text-kidney-charcoal">
                Continue Learning
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map(renderContentCard)}
            </div>
          </div>
        )}

        {/* View All Link */}
        <div className="text-center">
          <Link
            to="/patient/education"
            className="inline-flex items-center gap-2 text-kidney-green hover:underline"
          >
            Browse All Content
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientEducationFeaturedPage;
