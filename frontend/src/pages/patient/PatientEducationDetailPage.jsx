import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Book, Clock, Star, Share2, Bookmark, Play, FileText, Image as ImageIcon } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { educationService } from '../../services/api';
import toast from 'react-hot-toast';

const CONTENT_TYPES = {
  article: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  video: { icon: Play, color: 'text-red-600', bg: 'bg-red-100' },
  infographic: { icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
};

const PatientEducationDetailPage = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [contentId]);

  const fetchContent = async () => {
    try {
      const response = await educationService.getContentById(contentId);
      setContent(response.data);
      setBookmarked(response.data.bookmarked || false);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await educationService.removeBookmark(contentId);
      } else {
        await educationService.addBookmark(contentId);
      }
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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

  if (!content) {
    return (
      <MainLayout sidebar={PatientSidebar}>
        <div className="text-center py-12">
          <p className="text-gray-500">Content not found</p>
          <Link to="/patient/education" className="text-kidney-green hover:underline mt-4 inline-block">
            Back to education hub
          </Link>
        </div>
      </MainLayout>
    );
  }

  const TypeIcon = CONTENT_TYPES[content.type]?.icon || FileText;
  const iconColor = CONTENT_TYPES[content.type]?.color || 'text-gray-600';
  const iconBg = CONTENT_TYPES[content.type]?.bg || 'bg-gray-100';

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/patient/education')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 ${iconBg} ${iconColor} rounded-full text-xs capitalize`}>
                  {content.type}
                </span>
                <span className="px-2 py-0.5 bg-kidney-cream text-kidney-green rounded-full text-xs">
                  {content.category}
                </span>
              </div>
              <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
                {content.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                bookmarked ? 'bg-kidney-cream text-kidney-green' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className={`h-64 ${iconBg} rounded-lg flex items-center justify-center mb-6`}>
          <TypeIcon className={`w-20 h-20 ${iconColor}`} />
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {content.readTime || '5 min read'}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {content.views || 0} views
            </span>
          </div>

          <div className="prose max-w-none">
            {content.body ? (
              <div dangerouslySetInnerHTML={{ __html: content.body }} />
            ) : (
              <p className="text-gray-600 whitespace-pre-wrap">{content.description}</p>
            )}
          </div>

          {/* Related Content */}
          {content.related && content.related.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Related Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.related.map((item) => (
                  <Link
                    key={item.id}
                    to={`/patient/education/${item.id}`}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-kidney-green transition-colors"
                  >
                    <Book className="w-5 h-5 text-kidney-green" />
                    <span className="text-sm text-kidney-charcoal">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Take Quiz Button */}
          {content.quizId && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link
                to={`/patient/education/${contentId}/quiz`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Book className="w-5 h-5" />
                Take Quiz
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientEducationDetailPage;
