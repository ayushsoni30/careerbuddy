import React, { useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FileText, ArrowUp, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function SmartResumeAnalyzer() {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Incorrect File Format',
          description: 'Please upload a PDF document.'
        });
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: 'Missing File',
        description: 'Please select a resume PDF file before running analysis.'
      });
      return;
    }

    if (!jd.trim()) {
      toast({
        title: 'Missing Job Description',
        description: 'Please enter a job description to evaluate your resume against.'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jd);

    try {
      const response = await api.post('/resume-analyzer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setResult(response.data.data);
        toast({
          title: 'Analysis Succeeded',
          description: 'Your resume comparison has completed successfully.'
        });
      }
    } catch (error) {
      console.error('Resume analyzer error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.response?.data?.error || 'Failed to analyze the resume.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Smart Resume Analyzer</h1>
        <p style={{ color: 'var(--text-muted)' }}>Validate your resume match against a specific job role to optimize your technical application.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Upload Form Card */}
        <div className="card">
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Resume PDF</label>
              <div 
                style={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '24px 16px',
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <ArrowUp size={24} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.85rem', color: file ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {file ? file.name : 'Select or drop resume PDF'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Job Description</label>
              <textarea 
                className="textarea"
                rows="8"
                placeholder="Paste the target job description details here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="button"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ marginRight: '8px' }} />
                  Analyzing...
                </>
              ) : (
                'Run Analysis'
              )}
            </button>
          </form>
        </div>

        {/* Results Card */}
        {result && (
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Analysis Results</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI-generated matching report based on your resume contents.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
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
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>JD Match Rating</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '0.95rem' }}>Strengths (Pros)</h3>
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--text-error)' }} />
                  <h3 style={{ fontSize: '0.95rem' }}>Gaps (Cons)</h3>
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
