/**
 * Coding-Specific Video Generator
 * 
 * Specialized video generation engine for creating educational content about
 * programming concepts and code changes. Extends the base VideoGenerator with
 * coding-specific scenes, animations, and explanations.
 * 
 * Features:
 * - Code syntax highlighting in video content
 * - Visual concept explanations and diagrams
 * - Best practices and coding suggestions
 * - Interactive element highlighting and connections
 * - Customizable educational content generation
 * 
 * @author Interactive Coding Team
 * @version 1.0.0
 * @license MIT
 */

import VideoGenerator from './VideoGenerator';

class CodingVideoGenerator extends VideoGenerator {
  constructor() {
    super();
    this.codeHighlightColor = '#3b82f6';
    this.componentHighlightColor = '#10b981';
    this.dataFlowColor = '#f59e0b';
  }

  // Create coding-specific educational scenes
  createCodingScenes(changeType, codeSnippet, explanation, affectedElements) {
    this.scenes = [
      // Scene 1: Code Change Highlight
      {
        type: 'code_intro',
        duration: 2500,
        changeType,
        codeSnippet,
        animate: (progress) => this.renderCodeIntroScene(progress, changeType, codeSnippet)
      },
      
      // Scene 2: Concept Explanation
      {
        type: 'concept_explanation',
        duration: 4000,
        explanation,
        animate: (progress) => this.renderConceptExplanationScene(progress, explanation)
      },
      
      // Scene 3: Visual Connection
      {
        type: 'visual_connection',
        duration: 3000,
        affectedElements,
        animate: (progress) => this.renderVisualConnectionScene(progress, affectedElements)
      },
      
      // Scene 4: Best Practices
      {
        type: 'best_practices',
        duration: 2000,
        changeType,
        animate: (progress) => this.renderBestPracticesScene(progress, changeType)
      }
    ];
  }

  // Render code introduction with syntax highlighting
  renderCodeIntroScene(progress, changeType, codeSnippet) {
    const { canvas, ctx } = this;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title animation
    const titleOpacity = Math.min(1, progress * 2);
    const titleY = 80 + (1 - progress) * 30;
    
    ctx.globalAlpha = titleOpacity;
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Understanding: ${this.formatChangeType(changeType)}`, canvas.width / 2, titleY);

    // Code block background
    if (progress > 0.3) {
      const codeBlockOpacity = Math.min(1, (progress - 0.3) * 2);
      ctx.globalAlpha = codeBlockOpacity;
      
      // Code background
      ctx.fillStyle = '#1f2937';
      const codeBlockY = 140;
      const codeBlockHeight = 200;
      ctx.fillRect(50, codeBlockY, canvas.width - 100, codeBlockHeight);
      
      // Code border
      ctx.strokeStyle = this.codeHighlightColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(50, codeBlockY, canvas.width - 100, codeBlockHeight);
      
      // Code text
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '18px Courier New, monospace';
      ctx.textAlign = 'left';
      
      const codeLines = codeSnippet.split('\n').slice(0, 8); // Max 8 lines
      codeLines.forEach((line, index) => {
        const lineY = codeBlockY + 30 + (index * 22);
        
        // Highlight key parts based on change type
        if (this.isImportantLine(line, changeType)) {
          ctx.fillStyle = this.codeHighlightColor;
          ctx.fillRect(60, lineY - 18, canvas.width - 120, 20);
        }
        
        ctx.fillStyle = '#e5e7eb';
        ctx.fillText(line.substring(0, 60), 70, lineY); // Truncate long lines
      });
    }

    // Progress indicator
    if (progress > 0.7) {
      ctx.globalAlpha = Math.min(1, (progress - 0.7) * 3);
      ctx.fillStyle = '#10b981';
      ctx.font = '16px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Analyzing your code...', canvas.width / 2, canvas.height - 40);
    }

    ctx.globalAlpha = 1;
  }

  // Render concept explanation with visual aids
  renderConceptExplanationScene(progress, explanation) {
    const { canvas, ctx } = this;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(1, '#3730a3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated concept bubbles
    this.drawConceptBubbles(progress);

    // Main explanation text
    const textOpacity = Math.min(1, progress * 1.5);
    ctx.globalAlpha = textOpacity;
    
    ctx.fillStyle = 'white';
    ctx.font = '28px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    
    // Split explanation into multiple lines
    const words = explanation.split(' ');
    const wordsToShow = Math.floor(words.length * progress);
    const visibleText = words.slice(0, wordsToShow).join(' ');
    
    const wrappedLines = this.wrapText(ctx, visibleText, canvas.width - 100);
    const startY = (canvas.height - (wrappedLines.length * 40)) / 2;
    
    wrappedLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + (index * 40));
    });

    ctx.globalAlpha = 1;
  }

  // Render visual connections between code and UI
  renderVisualConnectionScene(progress, affectedElements) {
    const { canvas, ctx } = this;
    
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connection network
    this.drawConnectionNetwork(progress, affectedElements);

    // Element labels
    if (progress > 0.4) {
      const labelOpacity = Math.min(1, (progress - 0.4) * 2);
      ctx.globalAlpha = labelOpacity;
      
      affectedElements.forEach((element, index) => {
        const angle = (index / affectedElements.length) * Math.PI * 2;
        const radius = 120;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        
        // Element bubble
        ctx.fillStyle = this.componentHighlightColor;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Element text
        ctx.fillStyle = 'white';
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(element.replace('-', ' '), x, y + 5);
      });
      
      // Center concept
      ctx.fillStyle = this.codeHighlightColor;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Your Code', canvas.width / 2, canvas.height / 2);
    }

    ctx.globalAlpha = 1;
  }

  // Render best practices and tips
  renderBestPracticesScene(progress, changeType) {
    const { canvas, ctx } = this;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#059669');
    gradient.addColorStop(1, '#047857');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Success checkmark animation
    const checkScale = Math.min(1, progress * 1.5);
    ctx.save();
    ctx.translate(canvas.width / 2, 120);
    ctx.scale(checkScale, checkScale);
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-5, 15);
    ctx.lineTo(20, -15);
    ctx.stroke();
    ctx.restore();

    // Best practice tips
    if (progress > 0.5) {
      const tipsOpacity = Math.min(1, (progress - 0.5) * 2);
      ctx.globalAlpha = tipsOpacity;
      
      const tips = this.getBestPractices(changeType);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💡 Pro Tips:', canvas.width / 2, 220);
      
      ctx.font = '18px Inter, Arial, sans-serif';
      tips.forEach((tip, index) => {
        ctx.fillText(`• ${tip}`, canvas.width / 2, 260 + (index * 30));
      });
    }

    ctx.globalAlpha = 1;
  }

  // Helper methods
  formatChangeType(changeType) {
    return changeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  isImportantLine(line, changeType) {
    const keywords = {
      state_management: ['useState', 'setState'],
      side_effects: ['useEffect', 'useLayoutEffect'],
      event_handling: ['onClick', 'onChange', 'onSubmit'],
      styling: ['className', 'style', 'css'],
      component_structure: ['function', 'const', 'return']
    };

    const relevantKeywords = keywords[changeType] || [];
    return relevantKeywords.some(keyword => line.includes(keyword));
  }

  drawConceptBubbles(progress) {
    const { canvas, ctx } = this;
    
    for (let i = 0; i < 5; i++) {
      const bubbleProgress = Math.max(0, Math.min(1, (progress - i * 0.1) * 2));
      if (bubbleProgress <= 0) continue;
      
      const angle = (i / 5) * Math.PI * 2 + progress * Math.PI * 0.5;
      const radius = 80 + Math.sin(progress * Math.PI * 3 + i) * 20;
      const x = canvas.width / 2 + Math.cos(angle) * radius;
      const y = canvas.height / 2 + Math.sin(angle) * radius;
      const size = 15 + bubbleProgress * 10;
      
      ctx.globalAlpha = bubbleProgress * 0.6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }

  drawConnectionNetwork(progress, elements) {
    const { canvas, ctx } = this;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    elements.forEach((element, index) => {
      const connectionProgress = Math.max(0, Math.min(1, (progress - index * 0.2) * 2));
      if (connectionProgress <= 0) return;
      
      const angle = (index / elements.length) * Math.PI * 2;
      const radius = 120;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Animated connection line
      ctx.globalAlpha = connectionProgress;
      ctx.strokeStyle = this.dataFlowColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -progress * 20; // Animated dash
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius * connectionProgress,
        centerY + Math.sin(angle) * radius * connectionProgress
      );
      ctx.stroke();
      
      ctx.setLineDash([]); // Reset line dash
    });
    
    ctx.globalAlpha = 1;
  }

  getBestPractices(changeType) {
    const practices = {
      state_management: [
        'Use functional updates for state',
        'Keep state minimal and flat',
        'Consider useReducer for complex state'
      ],
      side_effects: [
        'Always include dependencies array',
        'Clean up subscriptions in return function',
        'Avoid infinite loops with proper deps'
      ],
      event_handling: [
        'Use arrow functions or useCallback',
        'Prevent default when needed',
        'Handle errors gracefully'
      ],
      styling: [
        'Use CSS modules or styled-components',
        'Follow consistent naming conventions',
        'Consider responsive design patterns'
      ],
      component_structure: [
        'Keep components small and focused',
        'Extract reusable logic to hooks',
        'Use proper prop validation'
      ]
    };

    return practices[changeType] || [
      'Follow React best practices',
      'Keep code readable and maintainable',
      'Test your components thoroughly'
    ];
  }

  // Generate coding-specific video
  async generateCodingExplanation(changeType, codeSnippet, explanation, affectedElements, onProgress = () => {}) {
    try {
      console.log('🎬 Generating coding explanation video...');
      
      // Initialize canvas
      this.initializeCanvas(800, 600); // Smaller for faster generation
      
      // Create coding-specific scenes
      this.createCodingScenes(changeType, codeSnippet, explanation, affectedElements);

      onProgress(10);
      console.log('📋 Coding scenes created, starting recording...');

      // Start recording
      const result = await this.startRecording((progress) => {
        onProgress(10 + (progress * 0.85)); // 10-95% for recording
      });
      
      onProgress(100);
      console.log('✅ Coding explanation video generated successfully!');
      return result;
    } catch (error) {
      console.error('❌ Coding video generation error:', error);
      throw error;
    }
  }
}

export default CodingVideoGenerator;
