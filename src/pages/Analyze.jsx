import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import FileUploadBox from '../components/FileUploadBox';
import Loader from '../components/Loader';
import { factCheckAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Analyze.css';

const Analyze = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('text');
  const [imageFile, setImageFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { showError } = useToast();

  const handleImageSelect = (file) => {
    setImageFile(file);
  };

  const handleAnalyze = async () => {
    // Validate input
    if (activeTab === 'image' && !imageFile) {
      showError('Please upload an image');
      return;
    }
    if (activeTab === 'text' && !textInput.trim()) {
      showError('Please enter text to analyze');
      return;
    }
    if (activeTab === 'url' && !urlInput.trim()) {
      showError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Prepare payload based on active tab
      let payload = {};
      
      if (activeTab === 'image' && imageFile) {
        // Convert image to base64 data URL
        const reader = new FileReader();
        const imageDataUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        payload.inputImageUrl = imageDataUrl;
      } else if (activeTab === 'text') {
        payload.inputText = textInput.trim();
      } else if (activeTab === 'url') {
        payload.inputUrl = urlInput.trim();
      }

      // Call fact-check API
      const result = await factCheckAPI.analyze(payload);
      
      // Navigate to results page with result data
      navigate('/analyze/results', { state: { result } });
    } catch (error) {
      showError(error.message || 'Analysis failed. Please try again.');
      console.error('Fact-check error:', error);
      setIsAnalyzing(false);
    }
  };


  return (
    <div className="analyze">
      <div className="analyze-header">
        <h1 className="analyze-title">Analyze Content</h1>
        <p className="analyze-subtitle">
          Upload images, paste text, or enter URLs to verify credibility
        </p>
      </div>

      {/* Tabs */}
      <div className="analyze-tabs">
        <button
          className={`analyze-tab ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('image');
            setAnalysisResult(null);
          }}
        >
          🖼️ Image
        </button>
        <button
          className={`analyze-tab ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('text');
            setAnalysisResult(null);
          }}
        >
          📝 Text
        </button>
        <button
          className={`analyze-tab ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('url');
            setAnalysisResult(null);
          }}
        >
          🔗 URL
        </button>
      </div>

      {/* Upload Section */}
      <Card className="analyze-upload-card">
        {activeTab === 'image' && (
          <div className="analyze-upload-content">
            <FileUploadBox
              onFileSelect={handleImageSelect}
              accept="image/*"
            />
            {imageFile && (
              <div className="analyze-file-preview">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="analyze-preview-image"
                />
                <p className="analyze-file-name">{imageFile.name}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'text' && (
          <div className="analyze-upload-content">
            <textarea
              className="analyze-text-input"
              placeholder="Paste or type the text content you want to verify..."
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setAnalysisResult(null);
              }}
              rows={8}
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div className="analyze-upload-content">
            <input
              type="url"
              className="analyze-url-input"
              placeholder="Enter URL to verify (e.g., https://example.com/article)"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setAnalysisResult(null);
              }}
            />
          </div>
        )}

        <div className="analyze-actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleAnalyze}
            disabled={isAnalyzing || (activeTab === 'image' && !imageFile) || 
                     (activeTab === 'text' && !textInput.trim()) || 
                     (activeTab === 'url' && !urlInput.trim())}
            fullWidth
          >
            {isAnalyzing ? 'Analyzing...' : 'Scan Now'}
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="analyze-loading-card">
          <Loader size="large" message="Analyzing your content..." />
        </Card>
      )}
    </div>
  );
};

export default Analyze;

