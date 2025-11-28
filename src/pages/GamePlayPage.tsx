import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import Button from '../components/Button';
import { getLevelQuestions, submitGameAnswer } from '../services/api';
import { useToast } from '../context/ToastContext';
import './GamePlayPage.css';

interface Question {
  id: string;
  text: string;
}

const GamePlayPage: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentXp, setCurrentXp] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [explanation, setExplanation] = useState('');

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await getLevelQuestions();
      if (response && response.data) {
        setQuestions(response.data.questions || []);
        setCurrentLevel(response.data.level || 1);
        
        // Get user's current XP from localStorage or API response if available
        // For now, we'll track it locally and update from backend responses
      }
    } catch (error: any) {
      console.error('Failed to load questions:', error);
      showError('Failed to load questions. Please try again.');
      // Fallback: navigate back to game landing
      setTimeout(() => navigate('/game'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (hasSwiped || isSubmitting) return;

    const swipeThreshold = 100;
    const velocity = info.velocity.x;

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(velocity) > 500) {
      const direction = info.offset.x > 0 || velocity > 0 ? 'right' : 'left';
      handleSwipeDecision(direction);
    } else {
      // Snap back to center
      x.set(0);
    }
  };

  const handleSwipeDecision = async (direction: 'left' | 'right') => {
    if (hasSwiped || isSubmitting || !currentQuestion) return;
    
    setHasSwiped(true);
    setIsSubmitting(true);

    const userAnswer = direction === 'right' ? 'fact' : 'fake';

    try {
      const response = await submitGameAnswer(currentQuestion.id, userAnswer);
      
      if (response && response.data) {
        const { correct, xpEarned, newXp, levelCompleted: levelComplete, newLevel, reward: rewardData } = response.data;

        setFeedbackCorrect(correct);
        setCurrentXp(newXp || currentXp);
        
        if (levelComplete) {
          setLevelCompleted(true);
          setCurrentLevel(newLevel || currentLevel);
          if (rewardData) {
            setReward(rewardData);
          }
        }

        if (correct) {
          setFeedbackMessage(`Correct! +${xpEarned} XP earned`);
          setExplanation('');
        } else {
          setFeedbackMessage(`Oops, that was wrong. No XP earned.`);
          setExplanation('');
        }

        setShowFeedback(true);
      }
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      showError('Failed to submit answer. Please try again.');
      setHasSwiped(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (levelCompleted && reward) {
      // Show level completion - for now just reset
      setLevelCompleted(false);
      setReward(null);
      // Reload questions for next level
      loadQuestions();
      setCurrentIndex(0);
    } else if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowFeedback(false);
      setHasSwiped(false);
      x.set(0);
    } else {
      // All questions answered - reload for next batch or show completion
      loadQuestions();
      setCurrentIndex(0);
      setShowFeedback(false);
      setHasSwiped(false);
      x.set(0);
    }
  };

  const handleExit = () => {
    navigate('/game');
  };

  const getCardStyle = () => {
    if (!isDragging && !hasSwiped) return {};
    
    const xValue = x.get();
    if (xValue > 50) {
      return { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' };
    } else if (xValue < -50) {
      return { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' };
    }
    return {};
  };

  if (loading) {
    return (
      <div className="game-play">
        <div className="game-play-loading">
          <div className="game-play-loading-spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion && questions.length === 0) {
    return (
      <div className="game-play">
        <div className="game-play-empty">
          <p>No questions available. Please try again later.</p>
          <Button onClick={handleExit}>Back to Game</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-play">
      {/* Game Status Bar */}
      <div className="game-play-status-bar">
        <div className="game-play-status-item">
          <span className="game-play-status-label">XP:</span>
          <span className="game-play-status-value">{currentXp} XP</span>
        </div>
        <div className="game-play-status-item">
          <span className="game-play-status-label">Level:</span>
          <span className="game-play-status-value">Lv {currentLevel}</span>
        </div>
        <button className="game-play-exit-btn" onClick={handleExit}>
          Exit
        </button>
      </div>

      {/* Main Game Area */}
      <div className="game-play-container">
        <div className="game-play-card-area">
          {/* Swipeable Card */}
          {currentQuestion && (
            <motion.div
              className="game-play-card"
              style={{
                x,
                rotate,
                opacity,
                ...getCardStyle(),
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
              animate={hasSwiped ? {
                x: x.get() > 0 ? 500 : -500,
                opacity: 0,
                rotate: x.get() > 0 ? 30 : -30,
              } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="game-play-card-content">
                <p className="game-play-card-text">{currentQuestion.text}</p>
              </div>
              {isDragging && !hasSwiped && (
                <div className="game-play-card-overlay">
                  {x.get() > 50 && (
                    <div className="game-play-overlay-fact">✓ FACT</div>
                  )}
                  {x.get() < -50 && (
                    <div className="game-play-overlay-fake">✗ FAKE</div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Hint Labels */}
          <div className="game-play-hints">
            <div className="game-play-hint game-play-hint-left">
              ← Swipe left for FAKE
            </div>
            <div className="game-play-hint game-play-hint-right">
              Swipe right for FACT →
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Overlay */}
      {showFeedback && (
        <motion.div
          className="game-play-feedback-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleNextQuestion();
            }
          }}
        >
          <motion.div
            className={`game-play-feedback-popup ${feedbackCorrect ? 'correct' : 'incorrect'} ${levelCompleted ? 'level-completed' : ''}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {levelCompleted && reward && (
              <div className="game-play-reward-banner">
                <h3>🎉 Level {currentLevel - 1} Completed! 🎉</h3>
                <div className="game-play-reward-info">
                  <h4>{reward.name}</h4>
                  <p>{reward.description}</p>
                </div>
              </div>
            )}
            
            <div className="game-play-feedback-icon">
              {feedbackCorrect ? '✓' : '✗'}
            </div>
            <p className="game-play-feedback-message">{feedbackMessage}</p>
            {explanation && (
              <p className="game-play-feedback-explanation">{explanation}</p>
            )}
            <Button
              size="large"
              variant="primary"
              onClick={handleNextQuestion}
              className="game-play-feedback-button"
            >
              {levelCompleted ? 'Continue' : 'Next Question'}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GamePlayPage;
