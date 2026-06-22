import React from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          style={{ marginRight: '12px' }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="navbar-logo">
          <span>Career</span>Launch
        </div>
      </div>
      <div className="navbar-actions">
        <ThemeToggle />
      </div>
    </nav>
  );
}
