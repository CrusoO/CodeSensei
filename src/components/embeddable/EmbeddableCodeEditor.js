/**
 * Embeddable Code Editor Component
 * 
 * A comprehensive, embeddable React component that provides real-time code analysis,
 * live preview, and educational feedback. Designed to be easily integrated into any
 * existing React application with minimal configuration.
 * 
 * Features:
 * - Real-time code editing with syntax highlighting
 * - Live preview with iframe sandboxing
 * - Intelligent code analysis and pattern detection
 * - Educational video generation for code explanations
 * - Customizable themes and layouts
 * - Configurable feature sets via presets
 * - Event-driven architecture for integration
 * 
 * @author Interactive Coding Team
 * @version 1.0.0
 * @license MIT
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveCodingEngine from '../../engines/InteractiveCodingEngine';

const EmbeddableCodeEditor = ({
  /* Required props */
  onCodeChange,
  
  /* Optional props with defaults */
  initialCode = '',
  language = 'javascript',
  theme = 'dark',
  enableVideoGeneration = true,
  enableLivePreview = true,
  enableAnalysis = true,
  height = '400px',
  width = '100%',
  
  /* Styling props */
  className = '',
  style = {},
  
  /* API configuration */
  apiEndpoint = '/api/coding',
  
  /* Event callbacks */
  onAnalysisComplete = () => {},
  onVideoGenerated = () => {},
  onError = () => {},
  
  /* UI configuration */
  showAnalysisPanel = true,
  showVideoPanel = true,
  showSuggestions = true,
  debounceDelay = 1500,
  
  /* Custom styling */
  editorStyle = {},
  panelStyle = {}
}) => {
  /* Component state management */
  const [code, setCode] = useState(initialCode);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedElements, setHighlightedElements] = useState([]);
  
  /* Component refs for DOM access */
  const editorRef = useRef(null);
  const engineRef = useRef(null);
  const previewRef = useRef(null);

  /**
   * Initialize the Interactive Coding Engine
   * 
   * Sets up the engine with configuration and event handlers for analysis,
   * video generation, and error handling. The engine is destroyed on cleanup
   * to prevent memory leaks.
   */
  useEffect(() => {
    engineRef.current = InteractiveCodingEngine.create({
      debounceDelay,
      enableVideoGeneration,
      apiEndpoint,
      onAnalysisComplete: (analysisResult) => {
        setAnalysis(analysisResult);
        setSuggestions(analysisResult.suggestions || []);
        setHighlightedElements(analysisResult.affectedElements || []);
        setIsAnalyzing(false);
        onAnalysisComplete(analysisResult);
      },
      onVideoGenerated: (videoData) => {
        setCurrentVideo(videoData);
        setIsGeneratingVideo(false);
        onVideoGenerated(videoData);
      },
      onError: (error) => {
        setIsAnalyzing(false);
        setIsGeneratingVideo(false);
        onError(error);
      }
    });

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [debounceDelay, enableVideoGeneration, apiEndpoint, onAnalysisComplete, onVideoGenerated, onError]);

  /**
   * Handle code changes with analysis trigger
   * 
   * Updates the code state and triggers analysis if enabled. Uses debouncing
   * through the engine to prevent excessive analysis calls during rapid typing.
   * 
   * @param {string} newCode - Updated code content
   */
  const handleCodeChange = useCallback(async (newCode) => {
    setCode(newCode);
    onCodeChange(newCode);

    if (enableAnalysis && engineRef.current && newCode.trim()) {
      setIsAnalyzing(true);
      try {
        await engineRef.current.analyzeCode(newCode, { language });
      } catch (error) {
        console.error('Analysis failed:', error);
        setIsAnalyzing(false);
      }
    }
  }, [onCodeChange, enableAnalysis, language]);

  /**
   * Generate live preview HTML for iframe
   * 
   * Creates a complete HTML document with the user's code embedded for live
   * preview. Includes React and Babel for JavaScript/TypeScript support.
   * 
   * @param {string} codeContent - Code to preview
   * @returns {string} Complete HTML document
   */
  const generatePreviewHTML = useCallback((codeContent) => {
    if (language !== 'javascript' && language !== 'typescript') {
      return `<pre>${codeContent}</pre>`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Live Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { 
      font-family: 'Inter', Arial, sans-serif; 
      margin: 20px;
      background: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
      color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
    }
    .highlight { 
      animation: highlight 2s ease-in-out;
      border: 2px solid #3b82f6;
      border-radius: 4px;
    }
    @keyframes highlight {
      0%, 100% { background: transparent; }
      50% { background: rgba(59, 130, 246, 0.1); }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${codeContent}
    
    if (typeof App !== 'undefined') {
      ReactDOM.render(<App />, document.getElementById('root'));
    }
  </script>
</body>
</html>`;
  }, [language, theme]);

  /**
   * Update live preview when code changes
   * 
   * Regenerates the preview HTML and updates the iframe source
   * when code content changes, providing real-time visual feedback.
   */
  useEffect(() => {
    if (enableLivePreview && previewRef.current) {
      try {
        const previewHTML = generatePreviewHTML(code);
        previewRef.current.srcdoc = previewHTML;
      } catch (error) {
        console.error('Preview update failed:', error);
      }
    }
  }, [code, enableLivePreview, generatePreviewHTML]);

  /**
   * Auto-clear highlighted elements after delay
   * 
   * Removes visual highlights after a brief display period to avoid
   * cluttering the interface while still providing immediate feedback.
   */
  useEffect(() => {
    if (highlightedElements.length > 0) {
      const timer = setTimeout(() => {
        setHighlightedElements([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedElements]);

  /* Theme configuration objects */
  const editorTheme = {
    dark: {
      background: '#1f2937',
      color: '#e5e7eb',
      border: '1px solid #374151'
    },
    light: {
      background: '#ffffff',
      color: '#374151',
      border: '1px solid #d1d5db'
    }
  };

  const panelTheme = {
    dark: {
      background: '#111827',
      color: '#e5e7eb',
      border: '1px solid #374151'
    },
    light: {
      background: '#f9fafb',
      color: '#374151',
      border: '1px solid #d1d5db'
    }
  };

  return (
    <div 
      className={`embeddable-code-editor ${className}`} 
      style={{ display: 'flex', gap: '1rem', height, width, ...style }}
    >
      {/* Code Editor Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          padding: '0.5rem 1rem', 
          background: '#3b82f6', 
          color: 'white', 
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Code Editor</span>
          {isAnalyzing && (
            <span style={{ fontSize: '0.875rem' }}>
              Analyzing...
            </span>
          )}
        </div>
        
        <textarea
          ref={editorRef}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={`Write your ${language} code here...`}
          style={{
            flex: 1,
            border: 'none',
            padding: '1rem',
            fontFamily: '"Courier New", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'none',
            outline: 'none',
            borderRadius: '0 0 8px 8px',
            ...editorTheme[theme],
            ...editorStyle
          }}
          spellCheck="false"
        />
        
        {/* Analysis Information Panel */}
        {showAnalysisPanel && analysis && (
          <div style={{ 
            padding: '1rem', 
            ...panelTheme[theme],
            borderRadius: '8px',
            marginTop: '0.5rem',
            ...panelStyle
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6' }}>
              Code Analysis
            </h4>
            <div style={{ fontSize: '0.875rem' }}>
              <div><strong>Type:</strong> {analysis.changeType.replace('_', ' ')}</div>
              <div><strong>Confidence:</strong> {Math.round(analysis.confidence * 100)}%</div>
              {analysis.components.length > 0 && (
                <div><strong>Components:</strong> {analysis.components.join(', ')}</div>
              )}
              {analysis.hooks.length > 0 && (
                <div><strong>Hooks:</strong> {analysis.hooks.join(', ')}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Panel */}
      {enableLivePreview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: '#10b981', 
            color: 'white', 
            borderRadius: '8px 8px 0 0' 
          }}>
            Live Preview
          </div>
          
          <iframe
            ref={previewRef}
            title="Live Preview"
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '0 0 8px 8px',
              background: 'white'
            }}
            sandbox="allow-scripts"
          />
          
          {/* Visual feedback overlay for affected elements */}
          <AnimatePresence>
            {highlightedElements.map((element, index) => (
              <motion.div
                key={element}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  position: 'absolute',
                  top: `${60 + index * 30}px`,
                  right: '10px',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  zIndex: 10
                }}
              >
                {element.replace('-', ' ')}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Educational Video/Explanation Panel */}
      {showVideoPanel && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: '#f59e0b', 
            color: 'white', 
            borderRadius: '8px 8px 0 0' 
          }}>
            Explanation
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '1rem', 
            ...panelTheme[theme],
            borderRadius: '0 0 8px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {isGeneratingVideo ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                <div>Generating explanation...</div>
              </div>
            ) : currentVideo ? (
              <div style={{ width: '100%' }}>
                <video 
                  controls 
                  autoPlay 
                  muted
                  style={{ width: '100%', borderRadius: '8px' }}
                  key={currentVideo.url}
                >
                  <source src={currentVideo.url} type="video/webm" />
                </video>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <strong>{currentVideo.title}</strong>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
                <div>Start coding to see explanations!</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational suggestions overlay */}
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            ...panelTheme[theme],
            borderRadius: '8px',
            padding: '1rem',
            zIndex: 20
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>Suggestions</h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Predefined configuration presets for common use cases
 * 
 * These presets provide quick setup options for different integration scenarios:
 * - minimal: Basic code editing without advanced features
 * - full: Complete feature set including analysis and video generation
 * - educational: Optimized for learning with faster feedback
 * - preview: Focus on live preview with minimal distractions
 */
export const CodeEditorPresets = {
  minimal: {
    showAnalysisPanel: false,
    showVideoPanel: false,
    showSuggestions: false,
    enableLivePreview: false,
    height: '300px'
  },
  
  full: {
    showAnalysisPanel: true,
    showVideoPanel: true,
    showSuggestions: true,
    enableLivePreview: true,
    enableVideoGeneration: true,
    height: '600px'
  },
  
  educational: {
    showAnalysisPanel: true,
    showVideoPanel: true,
    showSuggestions: true,
    enableLivePreview: true,
    enableVideoGeneration: true,
    debounceDelay: 1000,
    height: '500px'
  },
  
  preview: {
    showAnalysisPanel: false,
    showVideoPanel: false,
    showSuggestions: false,
    enableLivePreview: true,
    enableVideoGeneration: false,
    height: '400px'
  }
};

export default EmbeddableCodeEditor;