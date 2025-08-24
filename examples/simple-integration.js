/**
 * Simple Integration Example
 * 
 * This example demonstrates the three main ways to integrate the Interactive
 * Coding Engine into your existing application. Choose the approach that best
 * fits your technology stack and requirements.
 */

import React, { useState } from 'react';
import { EmbeddableCodeEditor, CodeEditorPresets } from '../src/components/embeddable/EmbeddableCodeEditor';
import InteractiveCodingEngine from '../src/engines/InteractiveCodingEngine';

/**
 * Example 1: React Component Integration
 * 
 * The easiest way to add interactive coding to a React application.
 * Simply drop in the component and configure it for your needs.
 */
export function ReactComponentExample() {
  const [userCode, setUserCode] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const handleAnalysisComplete = (analysis) => {
    setAnalysisHistory(prev => [...prev, {
      timestamp: new Date(),
      type: analysis.changeType,
      confidence: analysis.confidence
    }]);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Interactive Coding Environment</h2>
      
      <EmbeddableCodeEditor
        initialCode="function Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}"
        onCodeChange={setUserCode}
        onAnalysisComplete={handleAnalysisComplete}
        {...CodeEditorPresets.educational}
        height="400px"
      />
      
      {analysisHistory.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5' }}>
          <h3>Learning Progress</h3>
          {analysisHistory.slice(-3).map((item, i) => (
            <div key={i}>
              {item.type.replace('_', ' ')} - Confidence: {Math.round(item.confidence * 100)}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Standalone Engine Usage
 * 
 * Use the core engine directly for maximum control and framework flexibility.
 * Works with any JavaScript framework or vanilla JavaScript.
 */
export function StandaloneEngineExample() {
  const [analysis, setAnalysis] = useState(null);
  const [code, setCode] = useState('');

  React.useEffect(() => {
    const engine = InteractiveCodingEngine.create({
      onAnalysisComplete: (result) => {
        setAnalysis(result);
        console.log('Code analyzed:', result.changeType);
      },
      onVideoGenerated: (video) => {
        console.log('Video generated:', video.title);
      },
      onError: (error) => {
        console.error('Analysis error:', error);
      }
    });

    return () => engine.destroy();
  }, []);

  const handleCodeChange = async (newCode) => {
    setCode(newCode);
    if (newCode.trim()) {
      const engine = InteractiveCodingEngine.create({
        onAnalysisComplete: setAnalysis
      });
      await engine.analyzeCode(newCode);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      <div style={{ flex: 1 }}>
        <h3>Code Editor</h3>
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="Write your React code here..."
          style={{
            width: '100%',
            height: '300px',
            fontFamily: 'monospace',
            padding: '1rem'
          }}
        />
      </div>
      
      <div style={{ flex: 1 }}>
        <h3>Analysis Results</h3>
        {analysis ? (
          <div style={{ padding: '1rem', background: '#f0f9ff' }}>
            <p><strong>Type:</strong> {analysis.changeType}</p>
            <p><strong>Confidence:</strong> {Math.round(analysis.confidence * 100)}%</p>
            <p><strong>Explanation:</strong> {analysis.explanation}</p>
          </div>
        ) : (
          <p>Start typing to see analysis...</p>
        )}
      </div>
    </div>
  );
}

/**
 * Example 3: API Integration
 * 
 * Integrate with your existing backend using the REST API endpoints.
 * Works with any frontend framework and backend technology.
 */
export function APIIntegrationExample() {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/coding/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: 'javascript',
          user_id: 'demo-user',
          context: {
            example: 'api-integration'
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);
      } else {
        console.error('Analysis failed:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!analysis) return;

    try {
      const response = await fetch('/api/coding/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_id: analysis.analysis_id,
          change_type: analysis.change_type,
          code_snippet: code,
          explanation: analysis.explanation,
          affected_elements: analysis.affected_elements
        }),
      });

      if (response.ok) {
        const videoJob = await response.json();
        console.log('Video generation started:', videoJob.video_id);
        
        // Poll for completion (in a real app, use WebSockets or server-sent events)
        const checkStatus = async () => {
          const statusResponse = await fetch(`/api/coding/video-status/${videoJob.video_id}`);
          const status = await statusResponse.json();
          
          if (status.status === 'completed') {
            console.log('Video ready:', status.video_url);
          } else if (status.status === 'failed') {
            console.error('Video generation failed');
          } else {
            setTimeout(checkStatus, 2000);
          }
        };
        
        checkStatus();
      }
    } catch (error) {
      console.error('Video generation error:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>API Integration Example</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your code here..."
          style={{
            width: '100%',
            height: '200px',
            fontFamily: 'monospace',
            padding: '0.5rem'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={analyzeCode} 
          disabled={loading || !code.trim()}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '0.5rem',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Code'}
        </button>
        
        {analysis && (
          <button 
            onClick={generateVideo}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer'
            }}
          >
            Generate Video
          </button>
        )}
      </div>
      
      {analysis && (
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Analysis Results</h3>
          <p><strong>Change Type:</strong> {analysis.change_type}</p>
          <p><strong>Confidence:</strong> {Math.round(analysis.confidence * 100)}%</p>
          <p><strong>Components:</strong> {analysis.components.join(', ') || 'None'}</p>
          <p><strong>Hooks:</strong> {analysis.hooks.join(', ') || 'None'}</p>
          <p><strong>Explanation:</strong> {analysis.explanation}</p>
          
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <strong>Suggestions:</strong>
              <ul>
                {analysis.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Usage Instructions:
 * 
 * 1. Copy the relevant files to your project
 * 2. Install dependencies: npm install framer-motion
 * 3. For backend API: pip install fastapi uvicorn pydantic
 * 4. Choose your integration approach above
 * 5. Customize configuration and styling as needed
 * 
 * For detailed documentation, see README.md and docs/INTEGRATION_GUIDE.md
 */
