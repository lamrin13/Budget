import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Overview from './Overview';
import ThemeSwitcher from './ThemeSwitcher';
import { ThemeProvider, useTheme } from './ThemeContext';
import './Main.css';

const Main = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Navigation />
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/theme-switcher" element={<ThemeSwitcher />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={`navbar navbar-expand-lg ${theme}`}>
      {/* <a className="navbar-brand" href="#">App Name</a> */}
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/">Overview</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/theme-switcher">Breakdown</Link>
          </li>
        </ul>
      </div>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="themeToggle"
          onChange={toggleTheme}
          checked={theme === 'dark'}
        />
        <label className="form-check-label" htmlFor="themeToggle">
          Dark Mode
        </label>
      </div>
    </nav>
  );
};

export default Main;
