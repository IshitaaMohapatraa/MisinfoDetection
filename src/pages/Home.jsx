import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import './Home.css';

// ============================================================================
// Hero Section Component
// ============================================================================
const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <motion.section
      className="home-hero-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="home-hero-content">
        <motion.h1
          className="home-hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <span className="home-hero-line">An app that</span>
          <span className="home-hero-line home-hero-accent">adapts to you,</span>
          <span className="home-hero-line">not the other way around</span>
        </motion.h1>

        <motion.p
          className="home-hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Verify claims, detect manipulated content, and fight misinformation with AI-powered analysis.
          Protect yourself and others from false information across images, text, and URLs.
        </motion.p>

        <motion.div
          className="home-hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Button
            size="large"
            variant="primary"
            onClick={() => navigate('/analyze')}
          >
            Start Fact Checking
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ============================================================================
// Feature Pills / Tabs Component
// ============================================================================
const FeatureTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'accuracy',
      label: 'Accuracy',
      description: 'Cross-check claims across multiple sources in seconds.',
    },
    {
      id: 'speed',
      label: 'Speed',
      description: 'Get instant analysis results with our optimized AI models.',
    },
    {
      id: 'trust',
      label: 'Trust',
      description: 'Transparent verification process you can rely on.',
    },
  ];

  return (
    <section className="home-feature-tabs">
      <div className="home-tabs-container">
        <div className="home-tabs-pills">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`home-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Description */}
        <motion.div
          className="home-tab-description"
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tabs.find((t) => t.id === activeTab)?.description}
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// Feature Card Component
// ============================================================================
const FeatureCard = ({ number, total, title, description, color, icon }) => {
  return (
    <motion.div
      className={`home-feature-card home-feature-card-${color}`}
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="home-feature-card-label">{number}/{total}</div>
      <div className="home-feature-card-content">
        <h3 className="home-feature-card-title">{title}</h3>
        <p className="home-feature-card-description">{description}</p>
      </div>
      <div className="home-feature-card-icon">{icon}</div>
    </motion.div>
  );
};

// ============================================================================
// Feature Cards Section
// ============================================================================
const FeatureCards = () => {
  const cards = [
    {
      number: 1,
      title: 'Check any image for manipulations',
      description: 'Upload images to detect deepfakes, edited photos, and AI-generated content with precision.',
      color: 'teal',
      icon: '🖼️',
    },
    {
      number: 2,
      title: 'Analyze text for claims and misinformation',
      description: 'Fact-check claims, detect bias, and verify quoted statements from your text.',
      color: 'orange',
      icon: '📝',
    },
    {
      number: 3,
      title: 'Combined image and text analysis',
      description: 'Cross-reference captions with images to catch mismatched or misleading combinations.',
      color: 'purple',
      icon: '🔍',
    },
    {
      number: 4,
      title: 'Verify URLs and web content',
      description: 'Check website credibility, detect suspicious links, and analyze web page authenticity.',
      color: 'blue',
      icon: '🔗',
    },
  ];

  return (
    <section className="home-feature-cards-section" aria-label="Feature cards">
      <div className="home-feature-cards-row">
        {cards.map((card, index) => (
          <div className="home-feature-card-wrap" key={index}>
            <FeatureCard
              number={card.number}
              total={cards.length}
              title={card.title}
              description={card.description}
              color={card.color}
              icon={card.icon}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// Gamified Header / Play Panel
// ============================================================================
const GamePanel = () => {
  const navigate = useNavigate();
  const handlePlay = () => navigate('/challenge');
  return (
    <section className="home-game-panel">
      <div className="home-game-panel-inner">
        <div className="home-game-info">
          <h3 className="home-game-title">Daily Challenges</h3>
          <p className="home-game-desc">Test your fact-checking skills and earn rewards.</p>
        </div>
        <div className="home-game-cta">
          <Button size="large" variant="primary" onClick={handlePlay}>
            Play Now
          </Button>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// Fact or Fake Game Panel
// ============================================================================
const FactOrFakeGamePanel = () => {
  const navigate = useNavigate();
  const handlePlay = () => navigate('/game');
  return (
    <section className="home-game-panel home-fact-or-fake-panel">
      <div className="home-game-panel-inner">
        <div className="home-game-info">
          <h3 className="home-game-title">Fact or Fake? – The Game</h3>
          <p className="home-game-desc">Swipe through viral posts, decide if they're facts or fakes, and earn XP for every right call.</p>
        </div>
        <div className="home-game-cta">
          <Button size="large" variant="primary" onClick={handlePlay}>
            Play Fact or Fake
          </Button>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// Main Home Component
// ============================================================================
const Home = () => {
  const [activeTab, setActiveTab] = useState('accuracy');

  return (
    <div className="home">
      {/* Hero Section */}
      <HeroSection />

      {/* Feature Tabs */}
      <FeatureTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Feature Cards */}
      <FeatureCards />

      {/* Gamified Game Panel */}
      <GamePanel />

      {/* Fact or Fake Game Panel */}
      <FactOrFakeGamePanel />
    </div>
  );
};

export default Home;


