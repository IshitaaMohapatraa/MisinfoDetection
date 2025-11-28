import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Button from '../components/Button';
import './AnalysisResultsPage.css';

interface FactCheckResult {
  id: string;
  verdict: 'true' | 'false' | 'mostly_true' | 'mostly_false' | 'mixed' | 'unverified';
  credibility: number; // 0–100
  summary: string;
  explanation: string;
  sources: Array<{ title: string; url: string; snippet: string }>;
  detectionMethods?: string[];
}

const AnalysisResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<FactCheckResult | null>(
    location.state?.result || null
  );

  // Animated score value
  const score = useMotionValue(0);
  const springScore = useSpring(score, {
    damping: 20,
    stiffness: 100,
  });
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (result?.credibility !== undefined) {
      score.set(result.credibility);
      
      // Update display score as spring animates
      const unsubscribe = springScore.on('change', (latest) => {
        setDisplayScore(Math.round(latest));
      });
      
      return () => unsubscribe();
    }
  }, [result, score, springScore]);

  // If no result, redirect or show error
  if (!result) {
    return (
      <div className="analysis-results">
        <div className="analysis-results-container">
          <div className="analysis-results-error">
            <h2>No Analysis Result Found</h2>
            <p>Please perform a fact-check analysis first.</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'true':
        return {
          label: 'True',
          icon: '✓',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
          textColor: 'text-green-400',
        };
      case 'mostly_true':
        return {
          label: 'Mostly True',
          icon: '✓',
          bgColor: 'bg-green-400/20',
          borderColor: 'border-green-400',
          textColor: 'text-green-300',
        };
      case 'mixed':
        return {
          label: 'Mixed',
          icon: '≈',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-400',
        };
      case 'unverified':
        return {
          label: 'Unverified',
          icon: '?',
          bgColor: 'bg-yellow-600/20',
          borderColor: 'border-yellow-600',
          textColor: 'text-yellow-500',
        };
      case 'mostly_false':
        return {
          label: 'Mostly Fake',
          icon: '✗',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-400',
        };
      case 'false':
        return {
          label: 'Fake',
          icon: '✗',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
          textColor: 'text-red-400',
        };
      default:
        return {
          label: 'Unknown',
          icon: '?',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-400',
        };
    }
  };

  const verdictConfig = getVerdictConfig(result.verdict);

  return (
    <div className="analysis-results">
      {/* Top Bar */}
      <div className="analysis-results-header">
        <div className="analysis-results-header-content">
          <button
            className="analysis-results-logo"
            onClick={() => navigate('/')}
          >
            <span className="analysis-results-logo-icon">🛡️</span>
            <span className="analysis-results-logo-text">TruthGuard</span>
          </button>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="analysis-results-new-check-btn"
          >
            New Check
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="analysis-results-container">
        <motion.div
          className="analysis-results-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <h1 className="analysis-results-title">Analysis Results</h1>

          {/* Result Card */}
          <motion.div
            className="analysis-results-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Verdict Badge */}
            <div className="analysis-results-verdict-badge">
              <div
                className={`analysis-results-verdict-pill ${verdictConfig.bgColor} ${verdictConfig.borderColor} ${verdictConfig.textColor}`}
              >
                <span className="analysis-results-verdict-icon">
                  {verdictConfig.icon}
                </span>
                <span className="analysis-results-verdict-label">
                  {verdictConfig.label}
                </span>
              </div>
            </div>

            {/* Credibility Score */}
            <div className="analysis-results-score-section">
              <motion.div
                className="analysis-results-score"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {displayScore}
              </motion.div>
              <div className="analysis-results-score-label">Credibility Score</div>
            </div>

            {/* Summary Section */}
            <div className="analysis-results-summary-section">
              <h2 className="analysis-results-summary-title">Summary</h2>
              <div className="analysis-results-summary-content">
                <p className="analysis-results-summary-text">{result.summary}</p>
                
                {result.explanation && result.explanation !== result.summary && (
                  <div className="analysis-results-explanation">
                    <h3 className="analysis-results-explanation-title">Detailed Explanation</h3>
                    <p className="analysis-results-explanation-text">{result.explanation}</p>
                  </div>
                )}

                {/* Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div className="analysis-results-sources">
                    <h3 className="analysis-results-sources-title">Evidence Sources</h3>
                    <ul className="analysis-results-sources-list">
                      {result.sources.map((source, idx) => (
                        <li key={idx} className="analysis-results-source-item">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="analysis-results-source-link"
                          >
                            <span className="analysis-results-source-title">
                              {source.title}
                            </span>
                            <span className="analysis-results-source-snippet">
                              {source.snippet}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detection Methods */}
                {result.detectionMethods && result.detectionMethods.length > 0 && (
                  <div className="analysis-results-methods">
                    <h3 className="analysis-results-methods-title">Detection Methods</h3>
                    <div className="analysis-results-methods-list">
                      {result.detectionMethods.map((method, idx) => (
                        <span key={idx} className="analysis-results-method-tag">
                          {method.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisResultsPage;

