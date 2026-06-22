import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Code, UserCheck, MessageSquare } from 'lucide-react';

export default function Sidebar({ open, setOpen }) {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/resume-analyzer', label: 'Resume Analyzer', icon: FileText },
    { path: '/tech-interview', label: 'Tech Interview', icon: Code },
    { path: '/resume-interview', label: 'Resume Interview', icon: UserCheck },
    { path: '/tech-buddy', label: 'Tech Buddy', icon: MessageSquare }
  ];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)} // Auto-collapse on mobile select
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
