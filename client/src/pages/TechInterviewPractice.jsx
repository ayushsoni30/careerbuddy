import React, { useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const TECHNOLOGIES = [
  'Python',
  'JavaScript',
  'MERN Full Stack',
  'DevOps',
  'Java',
  'React',
  'Node.js',
  'SQL',
  'Docker',
  'AWS',
  'Data Structures & Algorithms'
];

export default function TechInterviewPractice() {
  const { toast } = useToast();
  const [selectedTech, setSelectedTech] = useState('');
  const [stage, setStage] = useState('select'); // select | quiz | results
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // idx -> userAnswer
  const [result, setResult] = useState(null);

  const startInterview = async () => {
    if (!selectedTech) {
      toast({
        title: 'Selection Required',
        description: 'Please pick a technology to begin your mock interview.'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/interview/generate', { technology: selectedTech });
      console.log("ayush soni")
      if (response.data.success) {
        setQuestions(response.data.questions);
        setAnswers({});
        setCurrentIdx(0);
        setStage('quiz');
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error starting tech interview:', error);
      toast({
        title: 'Load Failure',
        description: error.response?.data?.error || 'Failed to load interview questions.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (e) => {
    setAnswers({
      ...answers,
      [currentIdx]: e.target.value
    });
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const submitInterview = async () => {
    // Collect all answers
    const formattedAnswers = questions.map((q, idx) => ({
      question: q,
      userAnswer: answers[idx] || ''
    }));

    // Simple validation: make sure they answered at least one question
    const unansweredCount = formattedAnswers.filter(a => !a.userAnswer.trim()).length;
    if (unansweredCount === questions.length) {
      toast({
        title: 'Empty Answers',
        description: 'Please answer at least one question before submitting.'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/interview/evaluate', {
        technology: selectedTech,
        answers: formattedAnswers
      });

      if (response.data.success) {
        setResult(response.data.data);
        setStage('results');
        window.scrollTo(0, 0);
        toast({
          title: 'Evaluation Successful',
          description: 'Your answers have been graded by the senior interviewer model.'
        });
      }
    } catch (error) {
      console.error('Error submitting interview:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.error || 'Failed to evaluate your answers.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setStage('select');
    setQuestions([]);
    setAnswers({});
    setCurrentIdx(0);
    setResult(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Tech Interview Practice</h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete a 12-question technical assessment to evaluate your knowledge depth.</p>
      </div>

      {/* STAGE 1: Tech Selection Grid */}
      {stage === 'select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {TECHNOLOGIES.map((tech) => (
              <div 
                key={tech} 
                className="card"
                onClick={() => setSelectedTech(tech)}
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderColor: selectedTech === tech ? 'var(--accent)' : 'var(--border-color)',
                  backgroundColor: selectedTech === tech ? 'var(--active-bg)' : 'var(--bg-card)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: selectedTech === tech ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {tech}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={startInterview}
            className="button"
            disabled={loading || !selectedTech}
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ marginRight: '8px' }} />
                Generating Questions...
              </>
            ) : (
              'Start Interview'
            )}
          </button>
        </div>
      )}

      {/* STAGE 2: Active Mock Assessment */}
      {stage === 'quiz' && questions.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {/* Header & Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Category: <strong>{selectedTech}</strong></span>
              <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            
            {/* Custom Progress Bar */}
            <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  backgroundColor: 'var(--accent)', 
                  width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>
          </div>

          {/* Question Display */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: '1.6' }}>
              {questions[currentIdx]}
            </h2>
          </div>

          {/* Answer Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Your Answer</label>
            <textarea
              className="textarea"
              rows="6"
              placeholder="Type your technical answer here (be as descriptive as possible)..."
              value={answers[currentIdx] || ''}
              onChange={handleAnswerChange}
              disabled={loading}
            />
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button 
              onClick={prevQuestion} 
              className="button button-secondary"
              disabled={currentIdx === 0 || loading}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentIdx < questions.length - 1 ? (
              <button 
                onClick={nextQuestion} 
                className="button"
                disabled={loading}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={submitInterview} 
                className="button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ marginRight: '8px' }} />
                    Evaluating...
                  </>
                ) : (
                  <>
                    Submit Quiz <Check size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 3: Interview Feedback & Results */}
      {stage === 'results' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {/* Score Header Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Interview Evaluation</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall scoring for your {selectedTech} mock session.</p>
            </div>

            <div className="score-container">
              <CircularProgressbar 
                value={result.score} 
                text={`${result.score}%`}
                styles={buildStyles({
                  textColor: 'var(--text-primary)',
                  pathColor: 'var(--accent)',
                  trailColor: 'var(--border-color)'
                })}
              />
            </div>

            <button onClick={resetInterview} className="button">
              Practice Another Technology
            </button>
          </div>

          {/* Strengths and Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Key Strengths</h3>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.pros.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
                {result.pros.length === 0 && <span style={{ fontStyle: 'italic' }}>None highlighted</span>}
              </ul>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Areas to Improve</h3>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.cons.map((weakness, i) => (
                  <li key={i}>{weakness}</li>
                ))}
                {result.cons.length === 0 && <span style={{ fontStyle: 'italic' }}>None highlighted</span>}
              </ul>
            </div>
          </div>

          {/* Granular Feedback */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Question by Question Review</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {result.feedback.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    padding: '20px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.5' }}>
                      Q{idx + 1}: {item.question}
                    </h4>
                    <span 
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 8px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        color: item.verdict === 'correct' ? 'var(--text-primary)' : 'var(--text-error)',
                        opacity: item.verdict === 'correct' ? 1 : 0.7
                      }}
                    >
                      {item.verdict}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}><strong>Your Answer:</strong></div>
                    <p style={{ fontStyle: 'italic' }}>{item.userAnswer || '[No Answer Provided]'}</p>
                  </div>

                  <div style={{ fontSize: '0.85rem', lineHeight: '1.5', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                    <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}><strong>Critique & Suggestion:</strong></div>
                    <p style={{ color: 'var(--text-muted)' }}>{item.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
