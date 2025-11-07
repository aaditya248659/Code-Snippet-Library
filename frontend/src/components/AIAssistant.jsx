import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import { toast } from 'react-toastify';

const AIAssistant = ({ code, language }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('explain');
  const [explanation, setExplanation] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.explainCode(code, language);
      setExplanation(response.data.explanation);
      setActiveTab('explain');
    } catch (error) {
      toast.error('Failed to get explanation');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.optimizeCode(code, language);
      setSuggestions(response.data.suggestions);
      setActiveTab('optimize');
    } catch (error) {
      toast.error('Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <button
        className="btn btn-primary ai-trigger"
        onClick={() => setShowPanel(!showPanel)}
      >
        🤖 AI Assistant
      </button>

      {showPanel && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <h3>AI Code Assistant</h3>
            <button onClick={() => setShowPanel(false)} className="close-btn">×</button>
          </div>

          <div className="ai-panel-tabs">
            <button
              className={`tab-btn ${activeTab === 'explain' ? 'active' : ''}`}
              onClick={handleExplain}
              disabled={loading}
            >
              💡 Explain Code
            </button>
            <button
              className={`tab-btn ${activeTab === 'optimize' ? 'active' : ''}`}
              onClick={handleOptimize}
              disabled={loading}
            >
              ⚡ Optimize
            </button>
          </div>

          <div className="ai-panel-content">
            {loading ? (
              <div className="ai-loading">
                <div className="spinner"></div>
                <p>AI is analyzing your code...</p>
              </div>
            ) : activeTab === 'explain' && explanation ? (
              <div className="ai-explanation">
                <div className="explanation-section">
                  <h4>Summary</h4>
                  <p>{explanation.summary}</p>
                </div>
                
                <div className="explanation-section">
                  <h4>Code Breakdown</h4>
                  <ul>
                    {explanation.breakdown.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="explanation-section">
                  <h4>Complexity</h4>
                  <p className="complexity-badge">{explanation.complexity}</p>
                </div>
                
                <div className="explanation-section">
                  <h4>Recommendations</h4>
                  <ul>
                    {explanation.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : activeTab === 'optimize' && suggestions ? (
              <div className="ai-suggestions">
                <h4>Optimization Suggestions</h4>
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className={`suggestion-item ${suggestion.severity}`}>
                    <div className="suggestion-header">
                      <span className="suggestion-type">{suggestion.type}</span>
                      <span className={`severity-badge ${suggestion.severity}`}>
                        {suggestion.severity}
                      </span>
                    </div>
                    <p className="suggestion-message">{suggestion.message}</p>
                    {suggestion.line && (
                      <span className="suggestion-line">Line {suggestion.line}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ai-empty">
                <p>Click a tab above to analyze your code with AI</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;