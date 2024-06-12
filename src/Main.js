import React, {useState} from 'react';
import { HashRouter, Route, Routes, Link  } from 'react-router-dom';
import Overview from './Overview';
import ThemeSwitcher from './ThemeSwitcher';
import { ThemeProvider, useTheme } from './ThemeContext';
import './Main.css';

const Main = () => {
  const [tabData, setTabData] = useState([])
  const [groupedData, setGroupedData] = useState({})
  return (
    <ThemeProvider>
      <HashRouter>
        <div className="app-container">
          <Navigation />
          <Routes>
            <Route exact path="/" element={<Overview setTabData={setTabData} setGroupedData={setGroupedData}/>} />
            <Route exact path="/breakdown" element={<ThemeSwitcher tabData={tabData} setTabData={setTabData} groupedData={groupedData}/>} />
          </Routes>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
};

const Navigation = () => {
  const { theme } = useTheme();

  return (
    <nav className={`navbar navbar-expand-lg ${theme}`}>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
        <li className="nav-item active">
            <Link className="nav-link" to="/">Overview</Link>
          </li>
        <li className="nav-item">
            <Link className="nav-link" to="/breakdown">Breakdown</Link>
          </li>
          
          
        </ul>
      </div>
      {/* <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="themeToggle"
          onChange={toggleTheme}
          checked={theme === 'dark'}
        />
        <label className="form-check-label" htmlFor="themeToggle"></label>
      </div> */}
    </nav>
  );
};

export default Main;
