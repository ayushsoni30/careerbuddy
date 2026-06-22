import React, { useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Upload, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function ResumeBasedInterview() {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('upload'); // upload | quiz | results
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // idx -> userAnswer
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid File',
          description: 'Please upload a PDF document.'
        });
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const startInterview = async (e) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'File Required',
        description: 'Please upload your resume PDF to generate custom questions.'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/resume-interview/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setQuestions(response.data.questions);
        setAnswers({});
        setCurrentIdx(0);
        setStage('quiz');
        window.scrollTo(0, 0);
        toast({
          title: 'Questions Ready',
          description: '12 custom interview questions generated based on your resume.'
        });
      }
    } catch (error) {
      console.error('Error generating resume questions:', error);
      toast({
        title: 'Generation Failed',
        description: error.response?.data?.error || 'Failed to parse resume and generate questions.'
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
    const formattedAnswers = questions.map((q, idx) => ({
      question: q,
      userAnswer: answers[idx] || ''
    }));

    const unansweredCount = formattedAnswers.filter(a => !a.userAnswer.trim()).length;
    if (unansweredCount === questions.length) {
      toast({
        title: 'Submission Warning',
        description: 'Please answer at least one question before submitting.'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/resume-interview/evaluate', {
        answers: formattedAnswers
      });

      if (response.data.success) {
        setResult(response.data.data);
        setStage('results');
        window.scrollTo(0, 0);
        toast({
          title: 'Evaluation Complete',
          description: 'Your resume mock interview grading is ready.'
        });
      }
    } catch (error) {
      console.error('Error submitting resume interview:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.error || 'Failed to evaluate interview answers.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setStage('upload');
    setFile(null);
    setQuestions([]);
    setAnswers({});
    setCurrentIdx(0);
    setResult(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Resume-Based Interview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate 12 tailor-made interview questions checking your personal projects, experiences, and tools.</p>
      </div>

      {/* STAGE 1: Upload Resume */}
      {stage === 'upload' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <form onSubmit={startInterview} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Upload Resume (PDF)</label>
              <div 
                style={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: 'var(--bg-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.9rem', color: file ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {file ? file.name : 'Upload your resume PDF'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    AI will analyze your skills and projects to build customized technical questions.
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="button"
              disabled={loading || !file}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ marginRight: '8px' }} />
                  Reading Resume & Building Quiz...
                </>
              ) : (
                'Start Interview'
              )}
            </button>
          </form>
        </div>
      )}

      {/* STAGE 2: Assessment Session */}
      {stage === 'quiz' && questions.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Category: <strong>ResumeMock</strong></span>
              <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            
            {/* Progress Bar */}
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

          {/* Question text */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: '1.6' }}>
              {questions[currentIdx]}
            </h2>
          </div>

          {/* Answer text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Your Answer</label>
            <textarea
              className="textarea"
              rows="6"
              placeholder="Explain how you did this or specify your engineering approach..."
              value={answers[currentIdx] || ''}
              onChange={handleAnswerChange}
              disabled={loading}
            />
          </div>

          {/* Nav buttons */}
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
                    Submitting...
                  </>
                ) : (
                  <>
                    Finish Interview <Check size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 3: Feedback Page */}
      {stage === 'results' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {/* Main Score Board */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Mock Interview Feedback</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Evaluation rating mapping your answers back to your resume context.</p>
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
              Start New Mock Session
            </button>
          </div>

          {/* Pros and Cons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Strong Points (Pros)</h3>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
                {result.pros.length === 0 && <span style={{ fontStyle: 'italic' }}>None highlighted</span>}
              </ul>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Improvement Areas (Cons)</h3>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
                {result.cons.length === 0 && <span style={{ fontStyle: 'italic' }}>None highlighted</span>}
              </ul>
            </div>
          </div>

          {/* Detailed Question Review */}
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
                    <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}><strong>Interviewer Feedback:</strong></div>
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
