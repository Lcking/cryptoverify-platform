import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import NewsPage from './components/pages/NewsPage';
import PlatformsPage from './components/pages/PlatformsPage';
import InsightsPage from './components/pages/InsightsPage';
import ExposurePage from './components/pages/ExposurePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/platforms" element={<PlatformsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/exposure" element={<ExposurePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;