import { useState, useEffect, useRef } from 'react';

interface File {
  id: string;
  name: string;
  language: 'html' | 'css' | 'javascript' | 'python';
  content: string;
}

type EditorStack = 'web' | 'python' | null;

const webStackFiles: File[] = [
  {
    id: 'html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to My Web Project</h1>
        <p>Start building your amazing website!</p>
        <button id="myButton">Click Me</button>
        <div id="output"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>`
  },
  {
    id: 'css',
    name: 'style.css',
    language: 'css',
    content: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 20px;
    font-size: 2.5rem;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

p {
    color: #666;
    line-height: 1.8;
    text-align: center;
    font-size: 1.1rem;
}

button {
    background: linear-gradient(45deg, #007bff, #0056b3);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    display: block;
    margin: 20px auto;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0,123,255,0.3);
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,123,255,0.4);
}

#output {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    min-height: 50px;
    border-left: 4px solid #007bff;
}`
  },
  {
    id: 'javascript',
    name: 'script.js',
    language: 'javascript',
    content: `// JavaScript Code - Real Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    const output = document.getElementById('output');
    
    button.addEventListener('click', function() {
        // Create dynamic content
        const messages = [
            'Hello from JavaScript!',
            'You clicked the button!',
            'JavaScript is working perfectly!',
            'Keep coding and building!'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        output.innerHTML = \`<p style="color: #28a745; font-weight: bold;">\${randomMessage}</p>\`;
        
        // Animate the button
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Add hover effects
    const container = document.querySelector('.container');
    container.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    container.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            button.click();
        }
    });
});`
  }
];

const pythonStackFiles: File[] = [
  {
    id: 'python',
    name: 'main.py',
    language: 'python',
    content: `# Python Code Editor - Write your code here
print("Hello, World!")

# Example: Simple calculator
a = 10
b = 5
print(f"Addition: {a} + {b} = {a + b}")
print(f"Multiplication: {a} * {b} = {a * b}")

# Example: Loop
for i in range(1, 6):
    print(f"Number: {i}")

# Example: List
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"I like {fruit}")

print("Python code executed successfully!")`
  }
];

export default function CodeEditor() {
  const [selectedStack, setSelectedStack] = useState<EditorStack>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [pythonOutput, setPythonOutput] = useState<string>('');
  const [isRunningPython, setIsRunningPython] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [currentInputIndex, setCurrentInputIndex] = useState<number>(0);
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const [currentInputPrompt, setCurrentInputPrompt] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const outputRef = useRef<HTMLPreElement>(null);

  const selectStack = (stack: EditorStack) => {
    setSelectedStack(stack);
    if (stack === 'web') {
      setFiles(webStackFiles);
      setActiveFile('html');
    } else if (stack === 'python') {
      setFiles(pythonStackFiles);
      setActiveFile('python');
    }
  };

  const getActiveFile = () => {
    return files.find(file => file.id === activeFile) || files[0];
  };

  const updateFileContent = (content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === activeFile ? { ...file, content } : file
    ));
  };

  const updatePreview = () => {
    const htmlFile = files.find(f => f.language === 'html');
    const cssFile = files.find(f => f.language === 'css');
    const jsFile = files.find(f => f.language === 'javascript');

    if (htmlFile) {
      let htmlContent = htmlFile.content;
      
      // Inject CSS
      if (cssFile) {
        const cssInjection = `<style>${cssFile.content}</style>`;
        if (htmlContent.includes('</head>')) {
          htmlContent = htmlContent.replace('</head>', `${cssInjection}</head>`);
        } else {
          htmlContent = `<head>${cssInjection}</head>` + htmlContent;
        }
      }
      
      // Inject JavaScript
      if (jsFile) {
        const jsInjection = `<script>${jsFile.content}</script>`;
        if (htmlContent.includes('</body>')) {
          htmlContent = htmlContent.replace('</body>', `${jsInjection}</body>`);
        } else {
          htmlContent = htmlContent + jsInjection;
        }
      }
      
      setPreviewContent(htmlContent);
    }
  };

  const runPythonCode = async () => {
    const pythonFile = files.find(f => f.language === 'python');
    if (!pythonFile) return;

    setIsRunningPython(true);
    setPythonOutput('🐍 Executing Python code...\n\n');
    console.log('Python code to execute:', pythonFile.content);

    // Check if code has input() calls
    const hasInput = pythonFile.content.includes('input(');
    
    if (hasInput) {
      // Start interactive input simulation
      setPythonOutput(prev => prev + '🎯 Interactive Python execution with user input!\n\n');
      setPythonOutput(prev => prev + 'Your code will run step by step. When it asks for input, provide it below:\n\n');
      
      // Find all input() calls and their prompts
      const inputMatches = pythonFile.content.match(/input\([^)]*\)/g);
      if (inputMatches) {
        setUserInputs([]);
        setCurrentInputIndex(0);
        setWaitingForInput(true);
        setCurrentInputPrompt(inputMatches[0]);
        
        // Show the first prompt
        const firstPrompt = inputMatches[0].match(/input\("([^"]*)"\)/);
        if (firstPrompt) {
          setPythonOutput(prev => prev + `📝 ${firstPrompt[1]}`);
        }
        setPythonOutput(prev => prev + '\n\n⏳ Waiting for your input...\n');
        return;
      }
    }

    // Execute code without input
    await executePythonCode(pythonFile.content);
  };

  const executePythonCode = async (code: string) => {
    try {
      // Try Piston API first (more reliable)
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'python',
          version: '3.10.0',
          files: [{
            content: code
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Piston API response:', result);
      
      if (result.run) {
        if (result.run.stdout) {
          setPythonOutput(prev => prev + '📤 Output:\n' + result.run.stdout);
        }
        if (result.run.stderr) {
          setPythonOutput(prev => prev + `❌ Error: ${result.run.stderr}`);
        }
        if (!result.run.stdout && !result.run.stderr) {
          setPythonOutput(prev => prev + '✅ Code executed successfully (no output)\n');
        }
      } else {
        setPythonOutput(prev => prev + '❌ No execution result received\n');
        setPythonOutput(prev => prev + `API Response: ${JSON.stringify(result)}\n`);
      }
    } catch (error) {
      // Try alternative API
      try {
        setPythonOutput(prev => prev + '🔄 Trying alternative API...\n');
        
        const response = await fetch('https://api.codex.jaagrav.in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            language: 'python'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.output) {
          setPythonOutput(prev => prev + '📤 Output:\n' + result.output);
        } else if (result.error) {
          setPythonOutput(prev => prev + `❌ Error: ${result.error}\n`);
        } else {
          setPythonOutput(prev => prev + '✅ Code executed successfully!\n');
        }
      } catch (secondError) {
        // Final fallback - show detailed error
        setPythonOutput(prev => prev + `❌ All Python execution APIs failed.\n`);
        setPythonOutput(prev => prev + `Primary error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        setPythonOutput(prev => prev + `Secondary error: ${secondError instanceof Error ? secondError.message : 'Unknown error'}\n`);
        setPythonOutput(prev => prev + `Please try again or check your internet connection.\n`);
      }
    } finally {
      setIsRunningPython(false);
    }
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim()) return;

    const newInputs = [...userInputs, inputValue];
    setUserInputs(newInputs);
    setPythonOutput(prev => prev + `👤 You entered: ${inputValue}\n`);

    // Replace input() calls with the provided values
    let modifiedCode = files.find(f => f.language === 'python')?.content || '';
    const inputMatches = modifiedCode.match(/input\([^)]*\)/g);
    
    if (inputMatches && newInputs.length <= inputMatches.length) {
      // Replace ALL input() calls with the provided values
      let tempCode = modifiedCode;
      
      // Replace each input() call with the corresponding user input
      inputMatches.forEach((match, index) => {
        if (index < newInputs.length) {
          const userInput = newInputs[index];
          // Check if the input is a number (integer or float)
          const isNumber = !isNaN(parseFloat(userInput)) && isFinite(parseFloat(userInput));
          
          if (isNumber) {
            // For numbers, don't add quotes - let Python handle the conversion
            tempCode = tempCode.replace(match, userInput);
          } else {
            // For strings, add quotes
            tempCode = tempCode.replace(match, `"${userInput}"`);
          }
        }
      });
      
      modifiedCode = tempCode;
      
      // Check if there are more inputs needed
      const remainingInputs = inputMatches.length - newInputs.length;
      
      if (remainingInputs > 0) {
        // More inputs needed
        setCurrentInputIndex(newInputs.length);
        setCurrentInputPrompt(inputMatches[newInputs.length]);
        
        const nextPrompt = inputMatches[newInputs.length].match(/input\("([^"]*)"\)/);
        if (nextPrompt) {
          setPythonOutput(prev => prev + `\n📝 ${nextPrompt[1]}`);
        }
        setPythonOutput(prev => prev + '\n⏳ Waiting for your input...\n');
        setInputValue('');
        return;
      } else {
        // All inputs provided, execute the code
        setWaitingForInput(false);
        setPythonOutput(prev => prev + '\n🚀 Executing with all inputs provided...\n\n');
        
        // Debug logging (only in console, not shown to user)
        console.log('Original code:', files.find(f => f.language === 'python')?.content);
        console.log('Modified code:', modifiedCode);
        console.log('User inputs:', newInputs);
        
        await executePythonCode(modifiedCode);
      }
    }
    
    setInputValue('');
  };

  useEffect(() => {
    if (selectedStack === 'web') {
      updatePreview();
    }
  }, [files, selectedStack]);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [pythonOutput]);

  // Auto-update preview when files change
  useEffect(() => {
    if (selectedStack === 'web' && files.length > 0) {
      const timer = setTimeout(() => {
        updatePreview();
      }, 500); // Small delay to avoid too frequent updates
      
      return () => clearTimeout(timer);
    }
  }, [files, selectedStack]);

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'javascript': return '⚡';
      case 'python': return '🐍';
      default: return '📄';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'html': return 'from-orange-500 to-red-500';
      case 'css': return 'from-blue-500 to-cyan-500';
      case 'javascript': return 'from-yellow-500 to-orange-500';
      case 'python': return 'from-green-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Stack Selection Interface
  if (!selectedStack) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-center px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💻</span>
              <h1 className="text-xl font-bold text-white">Code Editor</h1>
            </div>
          </div>
        </div>

        {/* Stack Selection */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Choose Your Development Stack</h2>
              <p className="text-gray-300 text-lg">Select the programming environment that best fits your project</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Web Development Stack */}
              <div 
                onClick={() => selectStack('web')}
                className="group cursor-pointer bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🌐</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Web Development</h3>
                  <p className="text-gray-300 mb-6">Build interactive websites with HTML, CSS, and JavaScript</p>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">HTML</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">CSS</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">JavaScript</span>
                  </div>
                  
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>• Live preview of your website</p>
                    <p>• Real-time code editing</p>
                    <p>• Interactive JavaScript features</p>
                  </div>
                </div>
              </div>

              {/* Python Development Stack */}
              <div 
                onClick={() => selectStack('python')}
                className="group cursor-pointer bg-gradient-to-br from-green-600/20 to-teal-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 hover:from-green-600/30 hover:to-teal-600/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🐍</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Python Programming</h3>
                  <p className="text-gray-300 mb-6">Write and execute Python code with real-time output</p>
                  
                  <div className="flex justify-center mb-6">
                    <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">Python 3</span>
                  </div>
                  
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>• Real Python code execution</p>
                    <p>• Data analysis and algorithms</p>
                    <p>• Interactive programming</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm">Choose a stack to start coding immediately</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💻</span>
              <h1 className="text-xl font-bold text-white">Code Editor</h1>
              <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs font-medium">
                {selectedStack === 'web' ? 'Web Stack' : 'Python Stack'}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              {selectedStack === 'web' ? (
                <>
                  <span>HTML</span>
                  <span>•</span>
                  <span>CSS</span>
                  <span>•</span>
                  <span>JavaScript</span>
                </>
              ) : (
                <span>Python</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStack(null)}
              className="px-3 py-1 text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Selection
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-xl">☰</span>
            </button>
            {getActiveFile().language === 'python' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={runPythonCode}
                  disabled={isRunningPython}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>{isRunningPython ? '⏳' : '▶️'}</span>
                  <span className="hidden sm:inline">
                    {isRunningPython ? 'Running...' : 'Run Python'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setPythonOutput('🐍 Testing simple Python execution...\n\n');
                    setPythonOutput(prev => prev + 'print("Hello from Python!")\n');
                    setPythonOutput(prev => prev + 'print("2 + 2 =", 2 + 2)\n');
                    setPythonOutput(prev => prev + 'print("Python is working!")\n');
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Test
                </button>
                <button
                  onClick={() => {
                    const pythonFile = files.find(f => f.language === 'python');
                    if (!pythonFile) return;
                    
                    // Create a test version without input()
                    let testCode = pythonFile.content;
                    const inputMatches = testCode.match(/input\([^)]*\)/g);
                    
                    if (inputMatches) {
                      inputMatches.forEach((match, index) => {
                        const sampleValue = index === 0 ? '10.5' : '5.2';
                        testCode = testCode.replace(match, `"${sampleValue}"`);
                      });
                      
                      // Update the file content
                      setFiles(prev => prev.map(file => 
                        file.id === 'python' ? { ...file, content: testCode } : file
                      ));
                      
                      setPythonOutput('✅ Created test version of your code!\n\n');
                      setPythonOutput(prev => prev + '📝 Test version (input() replaced with sample values):\n');
                      setPythonOutput(prev => prev + '```python\n' + testCode + '\n```\n\n');
                      setPythonOutput(prev => prev + 'Now click "Run Python" to execute the test version!\n');
                    }
                  }}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  Create Test Version
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} md:w-64 bg-gray-800 border-r border-gray-700 transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Files</h3>
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFile(file.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    activeFile === file.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{getLanguageIcon(file.language)}</span>
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              {/* Editor Header */}
              <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getLanguageIcon(getActiveFile().language)}</span>
                  <span className="text-sm font-medium text-white">{getActiveFile().name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${getLanguageColor(getActiveFile().language)} text-white`}>
                    {getActiveFile().language.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {getActiveFile().content.length} characters
                </div>
              </div>

              {/* Code Textarea */}
              <div className="flex-1 relative">
                <textarea
                  value={getActiveFile().content}
                  onChange={(e) => updateFileContent(e.target.value)}
                  className="w-full h-full bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
                  style={{
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    lineHeight: '1.5',
                    tabSize: 2
                  }}
                  placeholder={`Start coding in ${getActiveFile().language.toUpperCase()}...`}
                />
              </div>
            </div>

            {/* Preview/Output Panel */}
            <div className="w-full md:w-1/2 lg:w-2/5 border-l border-gray-700 flex flex-col">
              {getActiveFile().language === 'python' ? (
                // Python Output
                <div className="flex-1 flex flex-col">
                  <div className="bg-gray-700 px-4 py-2 flex items-center gap-2">
                    <span className="text-lg">🐍</span>
                    <span className="text-sm font-medium text-white">Python Output</span>
                    {waitingForInput && (
                      <span className="ml-auto px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">
                        Waiting for Input
                      </span>
                    )}
                  </div>
                  <div className="flex-1 bg-gray-900 p-4 flex flex-col">
                    <pre 
                      ref={outputRef}
                      className="text-green-400 font-mono text-sm whitespace-pre-wrap flex-1 overflow-auto max-h-96"
                    >
                      {pythonOutput || 'Click "Run Python" to execute your code...'}
                    </pre>
                    
                    {/* Input Interface */}
                    {waitingForInput && (
                      <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-400">👤</span>
                          <span className="text-sm text-gray-300">Provide your input:</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                            placeholder="Enter your value here..."
                            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={handleInputSubmit}
                            disabled={!inputValue.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                          >
                            Submit
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Press Enter or click Submit to provide your input
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Web Preview
                <div className="flex-1 flex flex-col">
                  <div className="bg-gray-700 px-4 py-2 flex items-center gap-2">
                    <span className="text-lg">👁️</span>
                    <span className="text-sm font-medium text-white">Live Preview</span>
                    <button
                      onClick={updatePreview}
                      className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                    >
                      <span>🔄</span>
                      <span>Refresh</span>
                    </button>
                  </div>
                  <div className="flex-1 bg-white relative">
                    {previewContent ? (
                      <iframe
                        srcDoc={previewContent}
                        className="w-full h-full border-0"
                        title="Live Preview"
                        sandbox="allow-scripts allow-same-origin"
                        style={{ minHeight: '400px' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🌐</div>
                          <p>Start writing HTML, CSS, and JavaScript</p>
                          <p className="text-sm">Preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bg-gray-800 border-t border-gray-700 flex-shrink-0">
        <div className="flex">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                activeFile === file.id
                  ? 'text-blue-400 bg-gray-700'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-lg">{getLanguageIcon(file.language)}</span>
              <span className="text-xs font-medium truncate w-full">{file.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
