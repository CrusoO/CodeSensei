"""
Interactive Coding Engine API Endpoints

FastAPI-based REST API endpoints that provide code analysis and educational content
generation services. Designed to be easily integrated into any existing backend
infrastructure while maintaining compatibility with multiple frontend frameworks.

Features:
- Real-time code analysis with pattern detection
- Educational content generation and explanations
- Video generation for visual learning
- User progress tracking and analytics
- RESTful API design for universal compatibility
- Comprehensive error handling and validation

Author: Interactive Coding Team
Version: 1.0.0
License: MIT
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import asyncio
import json
import re
import time
from datetime import datetime

router = APIRouter(prefix="/api/coding", tags=["interactive-coding"])

# Request/Response Models
class CodeAnalysisRequest(BaseModel):
    """
    Request model for code analysis endpoint
    
    Contains the code to be analyzed along with context information
    that helps improve analysis accuracy and personalization.
    """
    code: str = Field(..., description="The code to analyze")
    language: str = Field(default="javascript", description="Programming language")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")
    user_id: Optional[str] = Field(default=None, description="User identifier for tracking")
    session_id: Optional[str] = Field(default=None, description="Session identifier")

class CodeAnalysisResponse(BaseModel):
    """
    Response model containing comprehensive code analysis results
    
    Provides detailed information about code patterns, change types,
    educational explanations, and improvement suggestions.
    """
    analysis_id: str
    timestamp: str
    change_type: str
    affected_elements: List[str]
    components: List[str]
    hooks: List[str]
    events: List[str]
    styling: List[str]
    explanation: str
    confidence: float
    suggestions: List[str]
    significant_change: bool

class VideoGenerationRequest(BaseModel):
    """Request model for educational video generation"""
    analysis_id: str
    change_type: str
    code_snippet: str
    explanation: str
    affected_elements: List[str]
    title: Optional[str] = Field(default=None)

class VideoGenerationResponse(BaseModel):
    """Response model for video generation status and results"""
    video_id: str
    status: str  # "pending", "generating", "completed", "failed"
    progress: int
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    generated_at: Optional[str] = None

# In-memory storage (replace with persistent database in production)
analysis_storage = {}
video_generation_status = {}

class InteractiveCodingAnalyzer:
    """
    Core analyzer for code pattern detection and educational content generation
    
    This class provides the main analysis engine that can be used independently
    of the API endpoints for direct integration into applications.
    """
    
    def __init__(self):
        self.supported_languages = ["javascript", "typescript", "python", "java"]
    
    def extract_components(self, code: str, language: str = "javascript") -> List[str]:
        """
        Extract component definitions from code
        
        Identifies React components, Python classes, or other language-specific
        component patterns based on the specified language.
        
        Args:
            code: Source code to analyze
            language: Programming language for pattern matching
            
        Returns:
            List of component names found in the code
        """
        if language in ["javascript", "typescript"]:
            component_patterns = [
                r'function\s+([A-Z]\w*)',
                r'const\s+([A-Z]\w*)\s*=.*=>'
            ]
        elif language == "python":
            component_patterns = [r'class\s+([A-Z]\w*)']
        else:
            return []
        
        components = []
        for pattern in component_patterns:
            matches = re.finditer(pattern, code)
            components.extend([match.group(1) for match in matches])
        
        return list(set(components))
    
    def extract_hooks(self, code: str, language: str = "javascript") -> List[str]:
        """
        Extract React hooks or similar patterns from code
        
        Identifies useState, useEffect, and other React hooks in JavaScript/TypeScript
        code to understand state management and side effect patterns.
        
        Args:
            code: Source code to analyze
            language: Programming language
            
        Returns:
            List of unique hook names found
        """
        if language in ["javascript", "typescript"]:
            hook_pattern = r'use([A-Z]\w*)'
            matches = re.finditer(hook_pattern, code)
            return list(set([match.group(0) for match in matches]))
        return []
    
    def extract_event_handlers(self, code: str, language: str = "javascript") -> List[str]:
        """
        Extract event handler patterns from code
        
        Identifies event handlers like onClick, onChange, onSubmit that indicate
        interactive functionality and user interface responsiveness.
        
        Args:
            code: Source code to analyze
            language: Programming language
            
        Returns:
            List of unique event handler names
        """
        if language in ["javascript", "typescript"]:
            event_pattern = r'on[A-Z]\w*\s*='
            matches = re.finditer(event_pattern, code)
            return list(set([match.group(0).replace('=', '') for match in matches]))
        return []
    
    def extract_styling(self, code: str, language: str = "javascript") -> List[str]:
        """
        Extract styling patterns from code
        
        Identifies CSS classes, inline styles, and other styling approaches
        used in component code to understand visual design patterns.
        
        Args:
            code: Source code to analyze
            language: Programming language
            
        Returns:
            List of styling patterns found
        """
        if language in ["javascript", "typescript"]:
            style_patterns = [
                r'className=["\']([\w\s\-]+)["\']',
                r'style=\{([^}]+)\}'
            ]
        elif language == "python":
            style_patterns = [r'class_name=["\']([\w\s\-]+)["\']']
        else:
            return []
        
        styles = []
        for pattern in style_patterns:
            matches = re.finditer(pattern, code)
            styles.extend([match.group(1) for match in matches])
        
        return list(set(styles))
    
    def determine_change_type(self, analysis_data: Dict) -> str:
        """
        Determine the primary type of code change
        
        Analyzes extracted patterns to classify the main type of change
        being made, which drives educational content generation.
        
        Args:
            analysis_data: Dictionary containing extracted code patterns
            
        Returns:
            String identifier for the change type
        """
        if analysis_data.get("hooks") and any("useState" in h or "useReducer" in h for h in analysis_data["hooks"]):
            return "state_management"
        elif analysis_data.get("hooks") and any("useEffect" in h for h in analysis_data["hooks"]):
            return "side_effects"
        elif analysis_data.get("events"):
            return "event_handling"
        elif analysis_data.get("styling"):
            return "styling"
        elif analysis_data.get("components"):
            return "component_structure"
        else:
            return "general_coding"
    
    def get_affected_elements(self, change_type: str) -> List[str]:
        """
        Get UI elements and concepts affected by the code change
        
        Maps change types to specific UI elements and programming concepts
        that are impacted, used for educational explanations and visual feedback.
        
        Args:
            change_type: Type of change detected
            
        Returns:
            List of affected elements and concepts
        """
        element_map = {
            "state_management": ["component-tree", "data-flow", "render-cycle", "state-updates"],
            "side_effects": ["lifecycle", "api-calls", "subscriptions", "cleanup"],
            "event_handling": ["user-interaction", "state-updates", "ui-changes", "event-flow"],
            "styling": ["visual-layout", "css-rendering", "responsive-design", "style-cascade"],
            "component_structure": ["component-hierarchy", "props-flow", "composition-pattern"],
            "general_coding": ["code-structure", "javascript-execution", "logic-flow"]
        }
        return element_map.get(change_type, ["general-concepts"])
    
    def generate_explanation(self, change_type: str, analysis_data: Dict) -> str:
        """
        Generate human-readable explanations for code changes
        
        Creates educational explanations that help users understand the impact
        and concepts behind their code changes in clear, accessible language.
        
        Args:
            change_type: Type of change detected
            analysis_data: Analysis results containing code patterns
            
        Returns:
            Human-readable explanation text
        """
        explanations = {
            "state_management": "State management creates reactive data that automatically triggers UI updates. Your component now manages dynamic data that flows through the render cycle.",
            "side_effects": "Side effects handle interactions with external systems like APIs, timers, or subscriptions. This controls when your component interacts with the outside world.",
            "event_handling": "Event handlers create interactive user experiences by responding to user actions like clicks, input changes, and form submissions.",
            "styling": "Styling controls the visual presentation of your components. CSS classes and styles are applied during rendering to create the final appearance.",
            "component_structure": "Components are the building blocks of React applications. They encapsulate logic, state, and presentation into reusable pieces.",
            "general_coding": "This code affects how your application behaves and renders. Understanding these patterns helps build more effective software."
        }
        return explanations.get(change_type, explanations["general_coding"])
    
    def calculate_confidence(self, analysis_data: Dict) -> float:
        """
        Calculate confidence level of the analysis
        
        Determines how confident the analyzer is in its results based on
        the number and quality of detected patterns.
        
        Args:
            analysis_data: Analysis results
            
        Returns:
            Confidence score between 0.0 and 1.0
        """
        confidence = 0.5
        if analysis_data.get("components"): confidence += 0.2
        if analysis_data.get("hooks"): confidence += 0.2
        if analysis_data.get("events"): confidence += 0.15
        if analysis_data.get("styling"): confidence += 0.15
        return min(1.0, confidence)
    
    def get_suggestions(self, change_type: str, analysis_data: Dict) -> List[str]:
        """
        Get educational suggestions and best practices
        
        Provides specific, actionable advice based on the type of code change
        detected to help users improve their coding practices.
        
        Args:
            change_type: Type of change detected
            analysis_data: Analysis results
            
        Returns:
            List of educational suggestions
        """
        suggestions_map = {
            "state_management": [
                "Use functional updates for state: setState(prev => prev + 1)",
                "Keep state minimal and flat",
                "Consider useReducer for complex state logic"
            ],
            "side_effects": [
                "Always include dependencies in useEffect array",
                "Clean up subscriptions in the return function",
                "Use async/await carefully in useEffect"
            ],
            "event_handling": [
                "Use useCallback to optimize event handlers",
                "Handle errors gracefully in event handlers",
                "Prevent default behavior when necessary"
            ],
            "styling": [
                "Use CSS modules or styled-components for better maintainability",
                "Follow consistent naming conventions",
                "Consider responsive design patterns"
            ],
            "component_structure": [
                "Keep components small and focused",
                "Extract reusable logic to custom hooks",
                "Use proper prop validation"
            ],
            "general_coding": [
                "Write clean, readable code",
                "Add meaningful comments",
                "Follow established coding standards"
            ]
        }
        return suggestions_map.get(change_type, suggestions_map["general_coding"])

# Initialize the analyzer
analyzer = InteractiveCodingAnalyzer()

@router.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(request: CodeAnalysisRequest):
    """
    Analyze code and provide educational insights
    
    Performs comprehensive analysis of submitted code to detect patterns,
    classify changes, and generate educational content. Returns detailed
    analysis results including explanations and suggestions.
    
    Args:
        request: Code analysis request with code and context
        
    Returns:
        Detailed analysis results with educational content
        
    Raises:
        HTTPException: If analysis fails due to processing errors
    """
    try:
        analysis_id = f"analysis_{int(time.time() * 1000)}"
        
        # Extract patterns from code
        components = analyzer.extract_components(request.code, request.language)
        hooks = analyzer.extract_hooks(request.code, request.language)
        events = analyzer.extract_event_handlers(request.code, request.language)
        styling = analyzer.extract_styling(request.code, request.language)
        
        # Create analysis data structure
        analysis_data = {
            "components": components,
            "hooks": hooks,
            "events": events,
            "styling": styling
        }
        
        # Generate insights and educational content
        change_type = analyzer.determine_change_type(analysis_data)
        affected_elements = analyzer.get_affected_elements(change_type)
        explanation = analyzer.generate_explanation(change_type, analysis_data)
        confidence = analyzer.calculate_confidence(analysis_data)
        suggestions = analyzer.get_suggestions(change_type, analysis_data)
        
        # Determine significance of changes
        significant_change = bool(components or hooks or events or styling)
        
        # Store analysis results
        analysis_result = {
            "analysis_id": analysis_id,
            "timestamp": datetime.now().isoformat(),
            "code": request.code,
            "language": request.language,
            "change_type": change_type,
            "affected_elements": affected_elements,
            "components": components,
            "hooks": hooks,
            "events": events,
            "styling": styling,
            "explanation": explanation,
            "confidence": confidence,
            "suggestions": suggestions,
            "significant_change": significant_change,
            "context": request.context,
            "user_id": request.user_id,
            "session_id": request.session_id
        }
        
        analysis_storage[analysis_id] = analysis_result
        
        return CodeAnalysisResponse(**analysis_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/generate-video", response_model=VideoGenerationResponse)
async def generate_video(request: VideoGenerationRequest, background_tasks: BackgroundTasks):
    """
    Generate educational video for code explanation
    
    Creates personalized educational videos that explain code concepts and
    changes visually. Video generation runs asynchronously in the background.
    
    Args:
        request: Video generation request with analysis data
        background_tasks: FastAPI background task handler
        
    Returns:
        Video generation status and tracking information
        
    Raises:
        HTTPException: If video generation setup fails
    """
    try:
        video_id = f"video_{int(time.time() * 1000)}"
        
        # Initialize video generation status
        video_status = {
            "video_id": video_id,
            "status": "pending",
            "progress": 0,
            "video_url": None,
            "thumbnail_url": None,
            "duration": None,
            "generated_at": None,
            "analysis_id": request.analysis_id,
            "title": request.title or f"Understanding: {request.change_type.replace('_', ' ')}"
        }
        
        video_generation_status[video_id] = video_status
        
        # Start background video generation
        background_tasks.add_task(
            generate_video_background, 
            video_id, 
            request.change_type,
            request.code_snippet,
            request.explanation,
            request.affected_elements
        )
        
        return VideoGenerationResponse(**video_status)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")

@router.get("/video-status/{video_id}", response_model=VideoGenerationResponse)
async def get_video_status(video_id: str):
    """
    Get video generation status and results
    
    Retrieves the current status of video generation including progress,
    completion status, and final video URLs when available.
    
    Args:
        video_id: Unique identifier for the video generation job
        
    Returns:
        Current video generation status and results
        
    Raises:
        HTTPException: If video ID is not found
    """
    if video_id not in video_generation_status:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return VideoGenerationResponse(**video_generation_status[video_id])

@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """
    Retrieve stored analysis results by ID
    
    Args:
        analysis_id: Unique identifier for the analysis
        
    Returns:
        Complete analysis results and metadata
        
    Raises:
        HTTPException: If analysis ID is not found
    """
    if analysis_id not in analysis_storage:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis_storage[analysis_id]

@router.get("/user-history/{user_id}")
async def get_user_history(user_id: str, limit: int = 10):
    """
    Get user's analysis history for progress tracking
    
    Retrieves recent analysis history for a specific user to enable
    progress tracking and personalized learning recommendations.
    
    Args:
        user_id: User identifier
        limit: Maximum number of analyses to return
        
    Returns:
        User's analysis history and statistics
    """
    user_analyses = [
        analysis for analysis in analysis_storage.values()
        if analysis.get("user_id") == user_id
    ]
    
    # Sort by timestamp (most recent first)
    user_analyses.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "user_id": user_id,
        "total_analyses": len(user_analyses),
        "analyses": user_analyses[:limit]
    }

async def generate_video_background(video_id: str, change_type: str, code_snippet: str, explanation: str, affected_elements: List[str]):
    """
    Background task for video generation
    
    Handles the actual video generation process asynchronously. In a production
    environment, this would integrate with video generation services or
    processing pipelines.
    
    Args:
        video_id: Unique identifier for the video
        change_type: Type of code change for content generation
        code_snippet: Relevant code snippet for the video
        explanation: Educational explanation text
        affected_elements: UI elements affected by changes
    """
    try:
        # Update status to generating
        video_generation_status[video_id]["status"] = "generating"
        video_generation_status[video_id]["progress"] = 10
        
        # Simulate video generation process with progress updates
        for progress in range(20, 100, 20):
            await asyncio.sleep(1)
            video_generation_status[video_id]["progress"] = progress
        
        # Mark as completed with final video information
        video_generation_status[video_id].update({
            "status": "completed",
            "progress": 100,
            "video_url": f"/videos/{video_id}.webm",
            "thumbnail_url": f"/thumbnails/{video_id}.jpg",
            "duration": 8,  # 8 seconds
            "generated_at": datetime.now().isoformat()
        })
        
    except Exception as e:
        video_generation_status[video_id].update({
            "status": "failed",
            "error": str(e)
        })

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and diagnostics
    
    Returns:
        System health status and operational metrics
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "supported_languages": analyzer.supported_languages,
        "active_analyses": len(analysis_storage),
        "active_videos": len(video_generation_status)
    }