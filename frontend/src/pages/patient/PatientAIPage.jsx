import { useState, useEffect } from 'react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { AIChatInterface } from '../../components/ai/AIChatInterface';
import { LoadingSpinner } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/api';
import toast from 'react-hot-toast';

const PatientAIPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [healthContextEnabled, setHealthContextEnabled] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      // Fetch patient's health records for context sharing
      const response = await patientService.getRecords();
      if (response.data) {
        setHealthData(response.data);
      }
    } catch (error) {
      // Silently fail - health data is optional
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build context if enabled
      let context = {};
      if (healthContextEnabled && healthData) {
        context = {
          latestVitals: healthData.vitals?.[0],
          latestLabResults: healthData.labResults?.[0],
          kidneyStage: healthData.kidneyStage,
        };
      }

      // Simulate AI response (replace with actual API call)
      const response = await simulateAIResponse(text, context);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (question, context) => {
    // Simulated AI responses - replace with actual API integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('food') || lowerQuestion.includes('diet')) {
      return `**Kidney-Friendly Diet Tips**

Based on your health context${context.latestVitals ? ` (eGFR: ${context.latestVitals.egfr})` : ''}:

1. **Limit Sodium** - Aim for <2,000mg daily
2. **Choose Lean Proteins** - Fish, chicken breast, eggs
3. **Avoid Processed Foods** - High phosphorus additives
4. **Watch Potassium** - Limit bananas, oranges, potatoes
5. **Stay Hydrated** - Drink 6-8 glasses of water daily

*Note: These are general guidelines. Consult your nurse for personalized advice.*`;
    }
    
    if (lowerQuestion.includes('creatinine')) {
      return `**Understanding Creatinine Levels**

Creatinine is a waste product filtered by your kidneys.

**Normal Ranges:**
- Men: 0.7-1.3 mg/dL
- Women: 0.6-1.1 mg/dL

**Tips to Lower Creatinine:**
1. Reduce protein intake
2. Stay well hydrated
3. Avoid nephrotoxic medications (ibuprofen, etc.)
4. Control blood pressure
5. Regular exercise

*High creatinine may indicate kidney stress. Discuss with your healthcare provider.*`;
    }
    
    if (lowerQuestion.includes('symptom')) {
      return `**Kidney Disease Warning Signs**

Early stages often have NO symptoms. Watch for:

⚠️ **When to see a doctor:**
- Foamy urine (protein leakage)
- Swelling in feet/ankles
- Fatigue unexplained by activity
- Persistent back pain
- Changes in urination frequency
- Blood in urine

*Regular monitoring is essential if you're at risk.*`;
    }
    
    if (lowerQuestion.includes('water') || lowerQuestion.includes('fluid')) {
      return `**Hydration for Kidney Health**

General guideline: **6-8 glasses (1.5-2L) daily**

⚠️ **Important:** Your fluid needs depend on:
- Kidney disease stage
- Whether you're on dialysis
- Climate and activity level
- Heart conditions

*Too much or too little fluid can be harmful. Ask your nurse what's right for you.*`;
    }
    
    if (lowerQuestion.includes('blood pressure') || lowerQuestion.includes('bp')) {
      return `**Managing Blood Pressure for Kidney Health**

**Target:** <130/80 mmHg (most kidney patients)

**Lifestyle Tips:**
1. **DASH Diet** - Low sodium, rich in fruits/vegetables
2. **Exercise** - 30 minutes most days
3. **Limit Alcohol** - Max 1 drink/day for women, 2 for men
4. **Manage Stress** - Meditation, deep breathing
5. **Take Medications** - As prescribed

*High BP damages kidneys over time. Control it early.*`;
    }
    
    if (lowerQuestion.includes('lab result') || lowerQuestion.includes('egfr')) {
      return `**Understanding Your Lab Results**

**eGFR (Estimated Glomerular Filtration Rate)**
- 90+: Normal kidney function
- 60-89: Mild decrease
- 30-59: Moderate decrease (Stage 3)
- 15-29: Severe decrease (Stage 4)
- <15: Kidney failure (Stage 5)

**Key Markers to Track:**
- Creatinine
- BUN (Blood Urea Nitrogen)
- Electrolytes
- Protein in urine

*Your nurse can explain your specific results at your next consultation.*`;
    }
    
    return `Thank you for your question about kidney health!

I can help with:
- Diet and nutrition tips
- Understanding symptoms
- Medication information
- Lifestyle recommendations
- Lab result explanations

**Please note:** I'm an AI assistant and cannot replace professional medical advice. For specific concerns, please book a consultation with your nurse.

Is there anything specific about kidney care you'd like to know more about?`;
  };

  const handleQuickReply = (question) => {
    handleSendMessage(question);
  };

  const handleToggleHealthContext = () => {
    setHealthContextEnabled(prev => !prev);
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
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            AI Health Assistant
          </h1>
          <p className="text-gray-600 mt-1">
            Get answers to your kidney health questions
          </p>
        </div>

        <div className="h-full">
          <AIChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onQuickReply={handleQuickReply}
            onToggleHealthContext={handleToggleHealthContext}
            healthContextEnabled={healthContextEnabled}
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientAIPage;
