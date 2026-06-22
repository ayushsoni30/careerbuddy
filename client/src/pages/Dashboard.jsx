import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Code, UserCheck, MessageSquare, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    lastResumeAnalysisScore: null,
    lastResumeInterviewScore: null,
    lastTechInterviewScore: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: 'Statistics Load Failure',
          description: 'Failed to retrieve your previous performance metrics from the server.'
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [toast]);

  const modules = [
    {
      title: 'Smart Resume Analyzer',
      description: 'Upload your resume PDF form and match it against any Job Description to get an match score with strengths and gaps.',
      icon: FileText,
      path: '/resume-analyzer'
    },
    {
      title: 'Tech Interview Practice',
      description: 'Select a programming language or framework stack and complete a 12-question quiz to receive personalized grading.',
      icon: Code,
      path: '/tech-interview'
    },
    {
      title: 'Resume-Based Interview',
      description: 'Simulate a live interviewer asking custom questions directly targetted at your projects, tech stack, and background.',
      icon: UserCheck,
      path: '/resume-interview'
    },
    {
      title: 'Tech Buddy',
      description: 'Converse with an AI assistant focused exclusively on tech roadmaps, concept breakdowns, and code explanations.',
      icon: MessageSquare,
      path: '/tech-buddy'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Select an assistant container below to accelerate your IT career preparations.</p>
      </div>

      {/* Recent Activity Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Recent Performance</h2>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="spinner" />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Retrieving activity history...</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Last Resume Analysis Match</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent)' }}>
                {stats.lastResumeAnalysisScore !== null ? `${stats.lastResumeAnalysisScore}%` : 'No attempts'}
              </div>
            </div>
            <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Last Tech Interview Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent)' }}>
                {stats.lastTechInterviewScore !== null ? `${stats.lastTechInterviewScore}%` : 'No attempts'}
              </div>
            </div>
            <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Last Resume Interview Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent)' }}>
                {stats.lastResumeInterviewScore !== null ? `${stats.lastResumeInterviewScore}%` : 'No attempts'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ color: 'var(--accent)', display: 'flex', padding: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem' }}>{mod.title}</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
                  {mod.description}
                </p>
              </div>
              <button
                onClick={() => navigate(mod.path)}
                className="button"
                style={{ width: '100%' }}
              >
                Open Container <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
