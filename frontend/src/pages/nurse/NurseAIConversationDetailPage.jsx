import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, User, Flag, MessageSquare } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { aiService } from '../../services/api';
import toast from 'react-hot-toast';

const NurseAIConversationDetailPage = () => {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await aiService.getConversationById(conversationId);
      setConversation(response.data);
    } catch (error) {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagConversation = async () => {
    try {
      await aiService.flagConversation(conversationId);
      setConversation(prev => ({ ...prev, flagged: true }));
      toast.success('Conversation flagged for follow-up');
    } catch (error) {
      toast.error('Failed to flag conversation');
    }
  };

  const handleUnflagConversation = async () => {
    try {
      await aiService.unflagConversation(conversationId);
      setConversation(prev => ({ ...prev, flagged: false }));
      toast.success('Flag removed');
    } catch (error) {
      toast.error('Failed to remove flag');
    }
  };

  if (loading) {
    return (
      <MainLayout sidebar={NurseSidebar}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!conversation) {
    return (
      <MainLayout sidebar={NurseSidebar}>
        <div className="text-center py-12">
          <p className="text-gray-500">Conversation not found</p>
          <Link to="/nurse/ai/conversations" className="text-kidney-green hover:underline mt-4 inline-block">
            Back to conversations
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar={NurseSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/nurse/ai/conversations"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
                {conversation.patientName}
              </h1>
              <p className="text-sm text-gray-500">
                AI Conversation • {new Date(conversation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {conversation.flagged ? (
              <button
                onClick={handleUnflagConversation}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Unflag
              </button>
            ) : (
              <button
                onClick={handleFlagConversation}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Flag for Follow-up
              </button>
            )}
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-kidney-cream rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-kidney-green" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-kidney-charcoal">{conversation.patientName}</p>
              <p className="text-sm text-gray-500">
                {conversation.patientEmail}
              </p>
            </div>
            {conversation.flagged && (
              <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                <AlertTriangle className="w-4 h-4" />
                Flagged
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation History
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {conversation.messages?.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-kidney-green text-white rounded-br-md'
                      : 'bg-gray-100 text-kidney-charcoal rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NurseAIConversationDetailPage;
