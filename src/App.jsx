import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Challenge from './pages/Challenge';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import GameLandingPage from './pages/GameLandingPage';
import GamePlayPage from './pages/GamePlayPage';
import AnalysisResultsPage from './pages/AnalysisResultsPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="analyze" element={<Analyze />} />
              <Route path="analyze/results" element={<AnalysisResultsPage />} />
              <Route path="challenge" element={<Challenge />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="history" element={<History />} />
              <Route path="game" element={<GameLandingPage />} />
              <Route path="game/play" element={<GamePlayPage />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

