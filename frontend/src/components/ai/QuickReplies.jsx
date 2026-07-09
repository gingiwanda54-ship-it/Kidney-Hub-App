import { MessageCircle } from 'lucide-react';

const PRESET_QUESTIONS = [
  'What foods are good for kidney health?',
  'How can I lower my creatinine levels?',
  'What are the symptoms of kidney disease?',
  'How much water should I drink daily?',
  'What do my lab results mean?',
  'Tips for managing blood pressure',
];

export const QuickReplies = ({ onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs text-gray-500 flex items-center gap-1 self-center">
        <MessageCircle className="w-3 h-3" />
        Quick:
      </span>
      {PRESET_QUESTIONS.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelect(question)}
          className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-kidney-cream hover:text-kidney-green hover:border-kidney-green transition-colors"
        >
          {question}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
