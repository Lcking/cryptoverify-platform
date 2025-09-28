import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import NewsPage from './components/pages/NewsPage';
import PlatformsPage from './components/pages/PlatformsPage';
import InsightsPage from './components/pages/InsightsPage';
import ExposurePage from './components/pages/ExposurePage';
import PlatformDetailPage from './components/pages/PlatformDetailPage';
import NewsDetailPage from './components/pages/NewsDetailPage';
import VerificationsPage from './components/pages/VerificationsPage';
import VerificationDetailPage from './components/pages/VerificationDetailPage';
import InsightsDetailPage from './components/pages/InsightsDetailPage';
import ExposureDetailPage from './components/pages/ExposureDetailPage';
import SubmitPage from './components/pages/SubmitPage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetailPage />} />
          <Route path="/platforms" element={<PlatformsPage />} />
          <Route path="/platforms/:slug" element={<PlatformDetailPage />} />
          <Route path="/verifications" element={<VerificationsPage />} />
          <Route path="/verifications/:slug" element={<VerificationDetailPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/insights/:slug" element={<InsightsDetailPage />} />
            <Route path="/exposure" element={<ExposurePage />} />
            <Route path="/exposure/:slug" element={<ExposureDetailPage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;