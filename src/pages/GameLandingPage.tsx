import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import './GameLandingPage.css';

const GameLandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePlayNow = () => {
    navigate('/game/play');
  };

  const featureCards = [
    {
      title: 'Play & Earn Vouchers',
      description: 'Answer correctly and earn XP that you can redeem for exciting vouchers and rewards.',
      icon: '🎁',
      gradient: 'gradient-teal',
    },
    {
      title: 'Climb the Leaderboard and Unlock Fun Facts',
      description: 'Compete with others, rise through the ranks, and unlock interesting facts as you progress.',
      icon: '🏆',
      gradient: 'gradient-orange',
    },
    {
      title: 'Sharpen Your Misinformation Radar',
      description: 'Train your intuition and develop skills to spot fake news and misinformation in real life.',
      icon: '🎯',
      gradient: 'gradient-purple',
    },
  ];

  return (
    <div className="game-landing">
      {/* Hero Section */}
      <motion.section
        className="game-landing-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="game-landing-hero-content">
          <motion.h1
            className="game-landing-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Fact or Fake? – Turn Every Scroll into a Challenge
          </motion.h1>

          <motion.div
            className="game-landing-hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <p>
              Swipe through viral posts, decide if they're facts or fakes, and earn XP for every right call.
            </p>
            <p>
              Climb leagues, unlock rewards, and train your intuition against misinformation.
            </p>
          </motion.div>

          <motion.div
            className="game-landing-hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button size="large" variant="primary" onClick={handlePlayNow}>
              Play Now
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Flashcards Section */}
      <section className="game-landing-features">
        <div className="game-landing-features-container">
          <div className="game-landing-features-scroll">
            {featureCards.map((card, index) => (
              <motion.div
                key={index}
                className={`game-landing-feature-card game-landing-feature-card-${card.gradient}`}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="game-landing-feature-icon">{card.icon}</div>
                <h3 className="game-landing-feature-title">{card.title}</h3>
                <p className="game-landing-feature-description">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Play & Earn Explanation Section */}
      <section className="game-landing-explanation">
        <div className="game-landing-explanation-container">
          <div className="game-landing-explanation-image">
            <div className="game-landing-explanation-image-placeholder">
              <span className="game-landing-explanation-icon">💎</span>
            </div>
          </div>
          <div className="game-landing-explanation-content">
            <motion.h2
              className="game-landing-explanation-title"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Play & Earn Rewards
            </motion.h2>
            <motion.p
              className="game-landing-explanation-text"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Every correct answer earns you Experience Points (XP). The more you play, the more XP you accumulate.
            </motion.p>
            <motion.p
              className="game-landing-explanation-text"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Your XP can be redeemed for vouchers, discounts, and exclusive rewards. Build your collection and unlock special perks as you progress through the levels.
            </motion.p>
            <motion.p
              className="game-landing-explanation-text"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Climb through different leagues - from Bronze to Diamond - and showcase your fact-checking expertise. Each league unlocks new challenges and greater rewards.
            </motion.p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GameLandingPage;

