import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Trophy, Clock, ChevronRight, Star, Award, TrendingUp } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { educationService } from '../../services/api';
import toast from 'react-hot-toast';

const BADGES = [
  { id: 'first_article', name: 'Curious Mind', description: 'Read your first article', icon: Book },
  { id: 'five_articles', name: 'Knowledge Seeker', description: 'Read 5 articles', icon: Star },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Pass 3 quizzes with 90%+', icon: Trophy },
  { id: 'consistency', name: 'Consistent Learner', description: 'Learn for 7 days in a row', icon: TrendingUp },
  { id: 'diet_expert', name: 'Diet Expert', description: 'Complete all diet articles', icon: Award },
];

const PatientEducationProgressPage = () => {
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const [progressRes, historyRes, badgesRes] = await Promise.all([
        educationService.getProgress(),
        educationService.getHistory(),
        educationService.getBadges(),
      ]);
      setProgress(progressRes.data);
      setHistory(historyRes.data);
      setBadges(badgesRes.data);
    } catch (error) {
      toast.error('Failed to load progress');
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

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            My Learning Progress
          </h1>
          <p className="text-gray-600 mt-1">
            Track your education journey and achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Book className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">
                  {progress?.articlesRead || 0}
                </p>
                <p className="text-sm text-gray-500">Articles Read</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">
                  {progress?.quizzesPassed || 0}
                </p>
                <p className="text-sm text-gray-500">Quizzes Passed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">
                  {progress?.badgesEarned || 0}
                </p>
                <p className="text-sm text-gray-500">Badges Earned</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kidney-charcoal">
                  {progress?.learningStreak || 0}
                </p>
                <p className="text-sm text-gray-500">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Badges */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Achievements
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BADGES.map((badge) => {
                  const earned = badges.some(b => b.id === badge.id);
                  const Icon = badge.icon;
                  
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                        earned
                          ? 'border-kidney-green bg-kidney-cream'
                          : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        earned ? 'bg-kidney-green text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={`font-medium ${earned ? 'text-kidney-charcoal' : 'text-gray-500'}`}>
                          {badge.name}
                        </p>
                        <p className="text-xs text-gray-500">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reading History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
                Recent Activity
              </h2>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <Link
                      key={item.id}
                      to={`/patient/education/${item.contentId}`}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 bg-kidney-cream rounded-full flex items-center justify-center flex-shrink-0">
                        <Book className="w-4 h-4 text-kidney-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kidney-charcoal group-hover:text-kidney-green line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.viewedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Book className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No activity yet</p>
                  <Link
                    to="/patient/education"
                    className="text-kidney-green hover:underline text-sm mt-2 inline-block"
                  >
                    Start learning
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientEducationProgressPage;
