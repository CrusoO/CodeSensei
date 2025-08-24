/**
 * Interactive Coding Engine - Standalone Module
 * 
 * A comprehensive real-time code analysis and educational content generation engine
 * that can be integrated into any existing application. Provides intelligent code 
 * analysis, pattern recognition, and dynamic video generation for enhanced learning experiences.
 * 
 * Features:
 * - Real-time code analysis with debounced processing
 * - React/JavaScript pattern detection (hooks, components, events, styling)
 * - Dynamic educational video generation
 * - Configurable analysis rules and explanations
 * - Event-driven architecture for seamless integration
 * 
 * @author Interactive Coding Team
 * @version 1.0.0
 * @license MIT
 */

import CodingVideoGenerator from '../services/CodingVideoGenerator';

class InteractiveCodingEngine {
  /**
   * Initialize the Interactive Coding Engine
   * 
   * @param {Object} config - Configuration options
   * @param {number} config.debounceDelay - Delay before analysis (default: 1500ms)
   * @param {boolean} config.enableVideoGeneration - Enable video generation (default: true)
   * @param {string} config.apiEndpoint - Backend API endpoint for analysis
   * @param {Function} config.onCodeChange - Callback for code changes
   * @param {Function} config.onAnalysisComplete - Callback for analysis completion
   * @param {Function} config.onVideoGenerated - Callback for video generation
   * @param {Function} config.onError - Error handling callback
   */
  constructor(config = {}) {
    this.config = {
      debounceDelay: config.debounceDelay || 1500,
      enableVideoGeneration: config.enableVideoGeneration !== false,
      apiEndpoint: config.apiEndpoint || '/api/coding-analysis',
      onCodeChange: config.onCodeChange || (() => {}),
      onAnalysisComplete: config.onAnalysisComplete || (() => {}),
      onVideoGenerated: config.onVideoGenerated || (() => {}),
      onError: config.onError || ((error) => console.error('Coding Engine Error:', error))
    };

    this.videoGenerator = new CodingVideoGenerator();
    this.debounceTimer = null;
    this.isGenerating = false;
    this.currentAnalysis = null;
  }

  /**
   * Analyze code changes with debounced processing
   * 
   * This is the main entry point for code analysis. It automatically debounces
   * rapid code changes to prevent excessive processing and provides detailed
   * analysis results through configured callbacks.
   * 
   * @param {string} code - The code to analyze
   * @param {Object} options - Additional analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeCode(code, options = {}) {
    try {
      console.log('Interactive Coding Engine: Analyzing code...');
      
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      return new Promise((resolve) => {
        this.debounceTimer = setTimeout(async () => {
          const analysis = await this.performAnalysis(code, options);
          resolve(analysis);
        }, this.config.debounceDelay);
      });
    } catch (error) {
      this.config.onError(error);
      throw error;
    }
  }

  /**
   * Perform comprehensive code analysis
   * 
   * Analyzes the provided code to extract components, hooks, events, styling patterns,
   * and other meaningful programming constructs. Determines the type of changes made
   * and their potential impact on the application.
   * 
   * @param {string} code - Code to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Detailed analysis results
   */
  async performAnalysis(code, options = {}) {
    if (!code.trim()) {
      return { isEmpty: true, significantChange: false };
    }

    const analysis = {
      timestamp: Date.now(),
      code: code,
      components: this.extractComponents(code),
      hooks: this.extractHooks(code),
      props: this.extractProps(code),
      events: this.extractEventHandlers(code),
      styling: this.extractStyling(code),
      imports: this.extractImports(code),
      functions: this.extractFunctions(code),
      jsx: this.extractJSXElements(code),
      significantChange: true,
      changeType: 'component_added',
      affectedElements: [],
      explanation: '',
      confidence: 0.8
    };

    /* 
     * Determine the primary type of change and its implications
     * This drives the educational content generation and UI feedback
     */
    analysis.changeType = this.determineChangeType(analysis);
    analysis.affectedElements = this.getAffectedElements(analysis.changeType);
    analysis.explanation = this.generateExplanation(analysis);
    analysis.confidence = this.calculateConfidence(analysis);

    console.log('Analysis complete:', {
      changeType: analysis.changeType,
      elements: analysis.affectedElements.length,
      confidence: analysis.confidence
    });

    this.currentAnalysis = analysis;
    this.config.onAnalysisComplete(analysis);

    /*
     * Trigger video generation for significant changes when enabled
     * Video generation runs asynchronously to avoid blocking the analysis
     */
    if (this.config.enableVideoGeneration && analysis.significantChange) {
      this.generateVideoExplanation(analysis);
    }

    return analysis;
  }

  /**
   * Generate interactive video explanation for code changes
   * 
   * Creates educational videos that explain the impact and concepts behind
   * code changes. Uses AI-powered content generation to create personalized
   * learning experiences.
   * 
   * @param {Object} analysis - Analysis results to base video on
   * @returns {Promise<Object>} Video generation results
   */
  async generateVideoExplanation(analysis) {
    if (this.isGenerating) {
      console.log('Video generation already in progress, skipping...');
      return;
    }

    try {
      this.isGenerating = true;
      console.log('Generating interactive explanation video...');

      const title = `Understanding: ${analysis.changeType.replace('_', ' ')}`;
      const codeSnippet = this.extractRelevantCodeSnippet(analysis.code);

      const result = await this.videoGenerator.generateCodingExplanation(
        analysis.changeType,
        codeSnippet,
        analysis.explanation,
        analysis.affectedElements,
        (progress) => {
          console.log(`Video progress: ${Math.round(progress)}%`);
        }
      );

      const videoData = {
        url: result.url,
        blob: result.blob,
        title: title,
        analysis: analysis,
        generatedAt: Date.now()
      };

      console.log('Video explanation generated successfully!');
      this.config.onVideoGenerated(videoData);
      
      this.isGenerating = false;
      return videoData;
    } catch (error) {
      this.isGenerating = false;
      console.error('Video generation failed:', error);
      this.config.onError(error);
      throw error;
    }
  }

  /**
   * Extract React component definitions from code
   * 
   * Identifies functional and class components using pattern matching.
   * Supports modern React patterns including arrow functions and
   * traditional function declarations.
   * 
   * @param {string} code - Code to analyze
   * @returns {Array<string>} Component names found
   */
  extractComponents(code) {
    const componentRegex = /function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*=.*=>/g;
    const matches = [...code.matchAll(componentRegex)];
    return matches.map(match => match[1] || match[2]).filter(Boolean);
  }

  /**
   * Extract React hooks usage from code
   * 
   * Detects all React hooks including built-in hooks (useState, useEffect, etc.)
   * and custom hooks following the naming convention.
   * 
   * @param {string} code - Code to analyze
   * @returns {Array<string>} Unique hook names found
   */
  extractHooks(code) {
    const hookRegex = /use([A-Z]\w*)/g;
    const matches = [...code.matchAll(hookRegex)];
    return [...new Set(matches.map(match => match[0]))];
  }

  /**
   * Extract props usage patterns from code
   * 
   * Identifies how props are being used within components, including
   * destructuring patterns and direct prop access.
   * 
   * @param {string} code - Code to analyze
   * @returns {Array<string>} Props usage patterns
   */
  extractProps(code) {
    const propsRegex = /props\.(\w+)|\{([^}]*)\}\s*\)/g;
    const matches = [...code.matchAll(propsRegex)];
    return matches.map(match => match[1] || match[2]).filter(Boolean);
  }

  /**
   * Extract event handler patterns from code
   * 
   * Identifies event handlers following React conventions (onClick, onChange, etc.)
   * which are crucial for understanding component interactivity.
   * 
   * @param {string} code - Code to analyze
   * @returns {Array<string>} Event handler names
   */
  extractEventHandlers(code) {
    const eventRegex = /on[A-Z]\w*\s*=/g;
    const matches = [...code.matchAll(eventRegex)];
    return [...new Set(matches.map(match => match[0].replace('=', '')))];
  }

  /**
   * Extract styling patterns from code
   * 
   * Identifies CSS classes, inline styles, and other styling approaches
   * used in the component code.
   * 
   * @param {string} code - Code to analyze
   * @returns {Array<string>} Styling patterns found
   */
  extractStyling(code) {
    const styleRegex = /className=["']([^"']+)["']|style=\{([^}]+)\}/g;
    const matches = [...code.matchAll(styleRegex)];
    return matches.map(match => match[1] || match[2]).filter(Boolean);
  }

  /**
   * Extract import statements from code
   * 
   * Analyzes import patterns to understand dependencies and module usage.
   * Supports named imports, default imports, and namespace imports.
   * 
   * @param {string} code - Code to analyze
   * @returns {Array<Object>} Import statement details
   */
  extractImports(code) {
    const importRegex = /import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    const matches = [...code.matchAll(importRegex)];
    return matches.map(match => ({
      named: match[1] ? match[1].split(',').map(s => s.trim()) : [],
      namespace: match[2],
      default: match[3],
      source: match[4]
    }));
  }

  /**
   * Extract function definitions from code
   * 
   * Identifies function declarations and arrow function assignments
   * to understand the code structure and organization.
   * 
   * @param {string} code - Code to analyze
   * @returns {Array<string>} Function names found
   */
  extractFunctions(code) {
    const funcRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g;
    const matches = [...code.matchAll(funcRegex)];
    return matches.map(match => match[1] || match[2]).filter(Boolean);
  }

  /**
   * Extract JSX elements from code
   * 
   * Identifies JSX elements and components used in the render output
   * to understand the UI structure being created.
   * 
   * @param {string} code - Code to analyze
   * @returns {Array<string>} JSX element names
   */
  extractJSXElements(code) {
    const jsxRegex = /<(\w+)(?:\s[^>]*)?>|<(\w+)\s*\/>/g;
    const matches = [...code.matchAll(jsxRegex)];
    return [...new Set(matches.map(match => match[1] || match[2]))];
  }

  /**
   * Determine the primary type of code change
   * 
   * Analyzes extracted patterns to classify the type of change being made.
   * This classification drives educational content generation and UI feedback.
   * 
   * @param {Object} analysis - Analysis results containing extracted patterns
   * @returns {string} Change type classification
   */
  determineChangeType(analysis) {
    const { hooks, events, styling, components, jsx } = analysis;

    if (hooks.includes('useState') || hooks.includes('useReducer')) {
      return 'state_management';
    } else if (hooks.includes('useEffect') || hooks.includes('useLayoutEffect')) {
      return 'side_effects';
    } else if (events.length > 0) {
      return 'event_handling';
    } else if (styling.length > 0) {
      return 'styling';
    } else if (jsx.length > 0) {
      return 'jsx_structure';
    } else if (components.length > 0) {
      return 'component_structure';
    }

    return 'general_coding';
  }

  /**
   * Get UI elements affected by code changes
   * 
   * Maps change types to specific UI elements and concepts that are
   * impacted by the changes, used for visual feedback and education.
   * 
   * @param {string} changeType - Type of change detected
   * @returns {Array<string>} Affected UI elements
   */
  getAffectedElements(changeType) {
    const elementMap = {
      state_management: ['component-tree', 'data-flow', 'render-cycle', 'state-updates'],
      side_effects: ['lifecycle', 'api-calls', 'subscriptions', 'cleanup'],
      event_handling: ['user-interaction', 'state-updates', 'ui-changes', 'event-flow'],
      styling: ['visual-layout', 'css-rendering', 'responsive-design', 'style-cascade'],
      jsx_structure: ['component-hierarchy', 'virtual-dom', 'render-tree', 'element-structure'],
      component_structure: ['component-hierarchy', 'props-flow', 'composition-pattern'],
      general_coding: ['code-structure', 'javascript-execution', 'logic-flow']
    };

    return elementMap[changeType] || ['general-concepts'];
  }

  /**
   * Generate human-readable explanations for code changes
   * 
   * Creates educational explanations that help users understand
   * the impact and concepts behind their code changes.
   * 
   * @param {Object} analysis - Analysis results
   * @returns {string} Human-readable explanation
   */
  generateExplanation(analysis) {
    const explanations = {
      state_management: `State management creates reactive data that automatically triggers UI updates when changed. Your component now has dynamic data that flows through the render cycle.`,
      
      side_effects: `Side effects handle interactions with external systems like APIs, timers, or subscriptions. This controls when and how your component interacts with the outside world.`,
      
      event_handling: `Event handlers create interactive user experiences by responding to user actions like clicks, input changes, and form submissions.`,
      
      styling: `Styling controls the visual presentation of your components. CSS classes and styles are applied during the render process to create the final appearance.`,
      
      jsx_structure: `JSX creates the structure of your user interface. Each element becomes part of the virtual DOM that React uses to efficiently update the real DOM.`,
      
      component_structure: `Components are the building blocks of React applications. They encapsulate logic, state, and presentation into reusable pieces.`,
      
      general_coding: `This code affects how your React application behaves and renders. Understanding these patterns helps build more effective applications.`
    };

    return explanations[analysis.changeType] || explanations.general_coding;
  }

  /**
   * Calculate confidence level for analysis results
   * 
   * Determines how confident the engine is in its analysis based on
   * the number and quality of detected patterns.
   * 
   * @param {Object} analysis - Analysis results
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(analysis) {
    let confidence = 0.5; // Base confidence

    if (analysis.components.length > 0) confidence += 0.2;
    if (analysis.hooks.length > 0) confidence += 0.2;
    if (analysis.events.length > 0) confidence += 0.15;
    if (analysis.jsx.length > 0) confidence += 0.15;

    return Math.min(1.0, confidence);
  }

  /**
   * Extract relevant code snippet for video generation
   * 
   * Selects the most relevant portion of code for video explanation,
   * focusing on recent changes and important patterns.
   * 
   * @param {string} code - Full code content
   * @returns {string} Relevant code snippet
   */
  extractRelevantCodeSnippet(code) {
    const lines = code.split('\n');
    const relevantLines = lines.slice(-Math.min(12, lines.length));
    return relevantLines.join('\n');
  }

  /**
   * Get current analysis results
   * 
   * @returns {Object|null} Current analysis data
   */
  getCurrentAnalysis() {
    return this.currentAnalysis;
  }

  /**
   * Check if video generation is currently in progress
   * 
   * @returns {boolean} Video generation status
   */
  isGeneratingVideo() {
    return this.isGenerating;
  }

  /**
   * Clean up resources and stop all timers
   * 
   * Call this method when the engine is no longer needed to
   * prevent memory leaks and clean up resources.
   */
  destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.videoGenerator = null;
    this.currentAnalysis = null;
  }

  /**
   * Create a new Interactive Coding Engine instance
   * 
   * Factory method for creating engine instances with default configuration.
   * 
   * @param {Object} config - Configuration options
   * @returns {InteractiveCodingEngine} New engine instance
   */
  static create(config = {}) {
    return new InteractiveCodingEngine(config);
  }
}

export default InteractiveCodingEngine;