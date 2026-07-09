import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Trophy, RotateCcw, ChevronRight } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { educationService } from '../../services/api';
import toast from 'react-hot-toast';

const PatientEducationQuizPage = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [contentId]);

  const fetchQuiz = async () => {
    try {
      const response = await educationService.getQuiz(contentId);
      setQuiz(response.data);
    } catch (error) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    if (!quiz || !quiz.questions) return;
    
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    setScore(correct);
    setSubmitted(true);
    
    // Save progress
    educationService.saveQuizProgress(contentId, {
      score: correct,
      total: quiz.questions.length,
    }).catch(() => {});
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setCurrentQuestion(0);
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

  if (!quiz) {
    return (
      <MainLayout sidebar={PatientSidebar}>
        <div className="text-center py-12">
          <p className="text-gray-500">Quiz not found</p>
          <Link to="/patient/education" className="text-kidney-green hover:underline mt-4 inline-block">
            Back to education hub
          </Link>
        </div>
      </MainLayout>
    );
  }

  const percentage = Math.round((score / quiz.questions.length) * 100);
  const passed = percentage >= 70;

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/patient/education/${contentId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
              {quiz.title || 'Knowledge Quiz'}
            </h1>
            <p className="text-gray-600 mt-1">
              {quiz.questions?.length || 0} questions
            </p>
          </div>
        </div>

        {/* Results */}
        {submitted ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
              passed ? 'bg-green-100' : 'bg-amber-100'
            }`}>
              <Trophy className={`w-10 h-10 ${passed ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-2xl font-montserrat font-bold text-kidney-charcoal mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            <p className="text-gray-600 mb-6">
              You scored {score} out of {quiz.questions.length} ({percentage}%)
            </p>
            
            {/* Score Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  passed ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Answer Review */}
            <div className="text-left space-y-4 mb-6">
              <h3 className="font-semibold text-kidney-charcoal">Review Answers:</h3>
              {quiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    {answers[qIndex] === question.correctAnswer ? (
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-kidney-charcoal">{question.question}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Your answer: {question.options[answers[qIndex]]}
                      </p>
                      {answers[qIndex] !== question.correctAnswer && (
                        <p className="text-sm text-green-600 mt-1">
                          Correct: {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={handleRetry} className="btn-outline flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              <Link to="/patient/education" className="btn-primary flex items-center gap-2">
                Continue Learning
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm text-gray-600">
                  {Object.keys(answers).length} answered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-kidney-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-6">
                {quiz.questions[currentQuestion].question}
              </h2>
              
              <div className="space-y-3">
                {quiz.questions[currentQuestion].options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswer(currentQuestion, oIndex)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      answers[currentQuestion] === oIndex
                        ? 'border-kidney-green bg-kidney-cream'
                        : 'border-gray-200 hover:border-kidney-green'
                    }`}
                  >
                    <span className="font-medium text-kidney-charcoal">
                      {String.fromCharCode(65 + oIndex)}.
                    </span>{' '}
                    {option}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="btn-outline disabled:opacity-50"
                >
                  Previous
                </button>
                {currentQuestion < quiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="btn-primary"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default PatientEducationQuizPage;
