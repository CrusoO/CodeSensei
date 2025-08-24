/**
 * Framework Integration Examples
 * 
 * Shows how the Interactive Coding Engine works with different frameworks
 * without needing React components.
 * 
 * The core engine is pure JavaScript and works everywhere.
 */

console.log('Interactive Coding Engine - Framework Examples\n');

// ============================================================================
// CORE ENGINE DEMO (Works with any framework)
// ============================================================================

/**
 * This is what actually does all the work:
 * - Code analysis and pattern detection
 * - AI-generated video creation  
 * - Educational content generation
 * 
 * NO REACT REQUIRED!
 */
async function coreEngineDemo() {
  console.log('1. CORE ENGINE DEMO (Pure JavaScript)');
  console.log('=====================================');
  
  // Simulate importing the core engine
  // In real usage: import InteractiveCodingEngine from './InteractiveCodingEngine';
  const InteractiveCodingEngine = {
    create: (config) => ({
      analyzeCode: async (code) => {
        console.log(`   Analyzing: ${code.substring(0, 30)}...`);
        
        // Simulate real analysis
        const analysis = {
          changeType: 'state_management',
          explanation: 'This code uses React useState hook for state management',
          confidence: 0.95,
          suggestions: ['Consider using useReducer for complex state']
        };
        
        if (config.onAnalysisComplete) {
          config.onAnalysisComplete(analysis);
        }
        
        // Simulate video generation
        setTimeout(() => {
          const video = {
            url: 'blob:http://localhost:3000/video-123',
            duration: 8.5,
            blob: new Blob(),
            metadata: { topic: 'State Management', difficulty: 'beginner' }
          };
          
          if (config.onVideoGenerated) {
            config.onVideoGenerated(video);
          }
        }, 1000);
        
        return analysis;
      }
    })
  };
  
  const engine = InteractiveCodingEngine.create({
    onAnalysisComplete: (analysis) => {
      console.log('   ✅ Analysis Complete:', analysis.changeType);
      console.log('   📝 Explanation:', analysis.explanation);
      console.log('   🎯 Confidence:', Math.round(analysis.confidence * 100) + '%');
    },
    onVideoGenerated: (video) => {
      console.log('   🎥 Video Generated:', video.url);
      console.log('   ⏱️ Duration:', video.duration + 's');
      console.log('   📊 Topic:', video.metadata.topic);
    }
  });
  
  await engine.analyzeCode('const [count, setCount] = useState(0);');
  
  console.log('   💡 This works in ANY JavaScript environment!\n');
}

// ============================================================================
// VUE.JS INTEGRATION EXAMPLE
// ============================================================================

function vueIntegrationExample() {
  console.log('2. VUE.JS INTEGRATION EXAMPLE');
  console.log('=============================');
  
  const vueComponent = {
    name: 'CodingLesson',
    template: `
      <div>
        <h3>{{ lesson.title }}</h3>
        <textarea v-model="userCode" @input="onCodeChange"></textarea>
        <div v-if="analysis">
          <p>Detected: {{ analysis.changeType }}</p>
          <p>{{ analysis.explanation }}</p>
        </div>
        <video v-if="videoUrl" :src="videoUrl" controls></video>
      </div>
    `,
    data() {
      return {
        userCode: 'const [name, setName] = useState("");',
        analysis: null,
        videoUrl: null,
        engine: null
      };
    },
    async mounted() {
      // Initialize the core engine (same as any framework)
      this.engine = InteractiveCodingEngine.create({
        onAnalysisComplete: (analysis) => {
          this.analysis = analysis; // Vue reactivity automatically updates UI
        },
        onVideoGenerated: (video) => {
          this.videoUrl = video.url; // Video appears in template
        }
      });
      
      // Analyze initial code
      await this.engine.analyzeCode(this.userCode);
    },
    methods: {
      async onCodeChange() {
        if (this.engine) {
          await this.engine.analyzeCode(this.userCode);
        }
      }
    }
  };
  
  console.log('   Vue Component Structure:');
  console.log('   - Uses same core engine');
  console.log('   - Vue reactivity handles UI updates');
  console.log('   - No React components needed');
  console.log('   - Same analysis and video generation\n');
}

// ============================================================================
// ANGULAR INTEGRATION EXAMPLE  
// ============================================================================

function angularIntegrationExample() {
  console.log('3. ANGULAR INTEGRATION EXAMPLE');
  console.log('===============================');
  
  const angularComponent = `
    @Component({
      selector: 'app-coding-lesson',
      template: \`
        <div>
          <h3>{{ lesson.title }}</h3>
          <textarea [(ngModel)]="userCode" (input)="onCodeChange()"></textarea>
          <div *ngIf="analysis">
            <p>Detected: {{ analysis.changeType }}</p>
            <p>{{ analysis.explanation }}</p>
          </div>
          <video *ngIf="videoUrl" [src]="videoUrl" controls></video>
        </div>
      \`
    })
    export class CodingLessonComponent implements OnInit {
      userCode = 'useEffect(() => { fetchData(); }, []);';
      analysis: any = null;
      videoUrl: string | null = null;
      private engine: any;
      
      async ngOnInit() {
        // Same core engine as Vue, React, vanilla JS
        this.engine = InteractiveCodingEngine.create({
          onAnalysisComplete: (analysis) => {
            this.analysis = analysis; // Angular change detection
          },
          onVideoGenerated: (video) => {
            this.videoUrl = video.url; // Video ready for template
          }
        });
        
        await this.engine.analyzeCode(this.userCode);
      }
      
      async onCodeChange() {
        if (this.engine) {
          await this.engine.analyzeCode(this.userCode);
        }
      }
    }
  `;
  
  console.log('   Angular Component Features:');
  console.log('   - Same core engine as other frameworks');
  console.log('   - Angular change detection handles updates');
  console.log('   - TypeScript support out of the box');
  console.log('   - Same video generation capabilities\n');
}

// ============================================================================
// VANILLA JAVASCRIPT EXAMPLE
// ============================================================================

function vanillaJSExample() {
  console.log('4. VANILLA JAVASCRIPT EXAMPLE');
  console.log('==============================');
  
  const vanillaImplementation = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Interactive Coding Engine</title>
    </head>
    <body>
        <div id="app">
            <h3>Code Editor</h3>
            <textarea id="codeEditor">function App() { return <div>Hello</div>; }</textarea>
            <div id="analysis"></div>
            <video id="generatedVideo" controls style="display:none;"></video>
        </div>
        
        <script type="module">
            import InteractiveCodingEngine from './InteractiveCodingEngine.js';
            
            const codeEditor = document.getElementById('codeEditor');
            const analysisDiv = document.getElementById('analysis');
            const videoElement = document.getElementById('generatedVideo');
            
            const engine = InteractiveCodingEngine.create({
                onAnalysisComplete: (analysis) => {
                    analysisDiv.innerHTML = \`
                        <h4>Analysis Results:</h4>
                        <p><strong>Type:</strong> \${analysis.changeType}</p>
                        <p><strong>Explanation:</strong> \${analysis.explanation}</p>
                        <p><strong>Confidence:</strong> \${Math.round(analysis.confidence * 100)}%</p>
                    \`;
                },
                onVideoGenerated: (video) => {
                    videoElement.src = video.url;
                    videoElement.style.display = 'block';
                }
            });
            
            codeEditor.addEventListener('input', async (e) => {
                await engine.analyzeCode(e.target.value);
            });
            
            // Initial analysis
            await engine.analyzeCode(codeEditor.value);
        </script>
    </body>
    </html>
  `;
  
  console.log('   Vanilla JS Features:');
  console.log('   - No framework dependencies');
  console.log('   - Direct DOM manipulation');
  console.log('   - Same engine functionality');
  console.log('   - Works in any HTML page\n');
}

// ============================================================================
// REACT COMPONENT COMPARISON
// ============================================================================

function reactComponentComparison() {
  console.log('5. REACT COMPONENT VS CORE ENGINE');
  console.log('==================================');
  
  console.log('   Option A: Using React Component (Convenience)');
  console.log('   ```jsx');
  console.log('   import { EmbeddableCodeEditor } from "./EmbeddableCodeEditor";');
  console.log('   ');
  console.log('   <EmbeddableCodeEditor');
  console.log('     onAnalysisComplete={(analysis) => console.log(analysis)}');
  console.log('     onVideoGenerated={(video) => playVideo(video.url)}');
  console.log('   />');
  console.log('   ```');
  console.log('   - Pre-built UI with CodeMirror editor');
  console.log('   - React-specific styling and components');
  console.log('   - Good for rapid prototyping');
  console.log('');
  
  console.log('   Option B: Using Core Engine (Maximum Control)');
  console.log('   ```jsx');
  console.log('   import InteractiveCodingEngine from "./InteractiveCodingEngine";');
  console.log('   ');
  console.log('   const engine = InteractiveCodingEngine.create({');
  console.log('     onAnalysisComplete: (analysis) => setAnalysis(analysis),');
  console.log('     onVideoGenerated: (video) => setVideoUrl(video.url)');
  console.log('   });');
  console.log('   ');
  console.log('   // Build your own UI exactly how you want it');
  console.log('   <YourCustomEditor onChange={(code) => engine.analyzeCode(code)} />');
  console.log('   ```');
  console.log('   - Complete control over UI/UX');
  console.log('   - Use your own editor (Monaco, CodeMirror, etc.)');
  console.log('   - Custom styling and branding');
  console.log('   - Same analysis and video capabilities\n');
}

// ============================================================================
// SUMMARY
// ============================================================================

function summary() {
  console.log('KEY TAKEAWAYS');
  console.log('=============');
  console.log('✅ Core engine works with ANY JavaScript framework');
  console.log('✅ React components are OPTIONAL UI convenience wrappers');
  console.log('✅ Video generation happens in core engine, not React');
  console.log('✅ Analysis happens in core engine, not React');
  console.log('✅ You can build your own UI in any framework');
  console.log('✅ Same functionality regardless of integration method');
  console.log('');
  console.log('WHAT YOU NEED:');
  console.log('- Core engine files (100KB) - Works everywhere');
  console.log('- Optional React component (+25KB) - Only if you want pre-built React UI');
  console.log('- Optional API backend (15KB) - If you want server-side integration');
  console.log('');
  console.log('BOTTOM LINE:');
  console.log('The engine is framework-agnostic. React components are just UI sugar!');
}

// Run all examples
async function runAllExamples() {
  await coreEngineDemo();
  vueIntegrationExample();
  angularIntegrationExample(); 
  vanillaJSExample();
  reactComponentComparison();
  summary();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllExamples,
    coreEngineDemo,
    vueIntegrationExample,
    angularIntegrationExample,
    vanillaJSExample,
    reactComponentComparison
  };
}

// Run if called directly
if (typeof window === 'undefined' && require.main === module) {
  runAllExamples();
}
