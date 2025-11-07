import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { playgroundAPI } from '../services/api';

// Language templates with boilerplate code
const CODE_TEMPLATES = {
  // Web Languages
  javascript: `// JavaScript Code
console.log("Hello, World!");

// Try your code here
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Coder"));`,

  typescript: `// TypeScript Code
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("TypeScript Developer"));`,

  python: `# Python Code
print("Hello, World!")

# Try your code here
def greet(name):
    return f"Hello, {name}!"

print(greet("Pythonista"))`,

  java: `// Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Try your code here
        String greeting = greet("Java Developer");
        System.out.println(greeting);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,

  cpp: `// C++ Code
#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Try your code here
    string name = "C++ Developer";
    cout << "Hello, " << name << "!" << endl;
    
    return 0;
}`,

  c: `// C Code
#include <stdio.h>
#include <string.h>

int main() {
    printf("Hello, World!\\n");
    
    // Try your code here
    char name[] = "C Developer";
    printf("Hello, %s!\\n", name);
    
    return 0;
}`,

  // Modern Languages
  go: `// Go Code
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    
    // Try your code here
    name := "Gopher"
    fmt.Printf("Hello, %s!\\n", name)
}`,

  rust: `// Rust Code
fn main() {
    println!("Hello, World!");
    
    // Try your code here
    let name = "Rustacean";
    println!("Hello, {}!", name);
}`,

  kotlin: `// Kotlin Code
fun main() {
    println("Hello, World!")
    
    // Try your code here
    val name = "Kotlin Developer"
    println("Hello, $name!")
}`,

  swift: `// Swift Code
import Foundation

print("Hello, World!")

// Try your code here
func greet(name: String) -> String {
    return "Hello, \\(name)!"
}

print(greet(name: "Swift Developer"))`,

  // Scripting Languages
  ruby: `# Ruby Code
puts "Hello, World!"

# Try your code here
def greet(name)
  "Hello, #{name}!"
end

puts greet("Rubyist")`,

  php: `<?php
// PHP Code
echo "Hello, World!\\n";

// Try your code here
function greet($name) {
    return "Hello, $name!";
}

echo greet("PHP Developer");
?>`,

  perl: `# Perl Code
print "Hello, World!\\n";

# Try your code here
sub greet {
    my $name = shift;
    return "Hello, $name!";
}

print greet("Perl Developer") . "\\n";`,

  lua: `-- Lua Code
print("Hello, World!")

-- Try your code here
function greet(name)
    return "Hello, " .. name .. "!"
end

print(greet("Lua Developer"))`,

  // Functional Languages
  haskell: `-- Haskell Code
main :: IO ()
main = do
    putStrLn "Hello, World!"
    
    -- Try your code here
    let name = "Haskeller"
    putStrLn $ "Hello, " ++ name ++ "!"`,

  scala: `// Scala Code
object Main extends App {
  println("Hello, World!")
  
  // Try your code here
  def greet(name: String): String = {
    s"Hello, $name!"
  }
  
  println(greet("Scala Developer"))
}`,

  // Shell
  bash: `#!/bin/bash
# Bash Script
echo "Hello, World!"

# Try your code here
name="Shell Scripter"
echo "Hello, $name!"`,

  // Other
  r: `# R Code
print("Hello, World!")

# Try your code here
greet <- function(name) {
  paste("Hello,", name, "!")
}

print(greet("R Programmer"))`,
};

// Language tips for better coding
const LANGUAGE_TIPS = {
  java: "💡 Tip: Class name must be 'Main' and must have main method",
  c: "💡 Tip: Include stdio.h for printf/scanf functions",
  cpp: "💡 Tip: Include iostream for cin/cout operations",
  python: "💡 Tip: Use print() for output, input() for user input",
  javascript: "💡 Tip: Use console.log() for output",
  typescript: "💡 Tip: Add type annotations for better code safety",
  go: "💡 Tip: Package main with func main() is required",
  rust: "💡 Tip: Use println! macro for output",
  ruby: "💡 Tip: Use puts or print for output",
  php: "💡 Tip: Start with <?php tag",
  kotlin: "💡 Tip: fun main() is the entry point",
  swift: "💡 Tip: import Foundation for basic functionality",
  bash: "💡 Tip: Use echo for output, read for input",
  scala: "💡 Tip: Object with main method or extends App",
  haskell: "💡 Tip: main function has type IO ()",
};

// Popular challenges/problems for practice
const CODE_CHALLENGES = [
  {
    id: 1,
    title: "Hello World",
    difficulty: "Easy",
    description: "Print 'Hello, World!' to the console",
  },
  {
    id: 2,
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    description: "Write a function that returns the sum of two numbers",
  },
  {
    id: 3,
    title: "FizzBuzz",
    difficulty: "Easy",
    description: "Print numbers 1-100, but print 'Fizz' for multiples of 3, 'Buzz' for 5, and 'FizzBuzz' for both",
  },
  {
    id: 4,
    title: "Palindrome Checker",
    difficulty: "Medium",
    description: "Check if a given string is a palindrome",
  },
  {
    id: 5,
    title: "Fibonacci Sequence",
    difficulty: "Medium",
    description: "Generate first N Fibonacci numbers",
  },
  {
    id: 6,
    title: "Array Reversal",
    difficulty: "Easy",
    description: "Reverse an array without using built-in reverse function",
  },
  {
    id: 7,
    title: "Prime Number Checker",
    difficulty: "Medium",
    description: "Check if a number is prime",
  },
  {
    id: 8,
    title: "Binary Search",
    difficulty: "Hard",
    description: "Implement binary search algorithm",
  },
];

const CodeEditor = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [showChallenges, setShowChallenges] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(`code_${selectedLanguage}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(CODE_TEMPLATES[selectedLanguage] || '// Start coding here...');
    }
  }, [selectedLanguage]);

  // Save code to localStorage when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`code_${selectedLanguage}`, code);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    setOutput('');
    setError('');
    setExecutionTime(null);
  };

  const handleExecute = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsExecuting(true);
    setOutput('');
    setError('');
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      const response = await playgroundAPI.executeCode(code, selectedLanguage, input);

      const endTime = Date.now();
      setExecutionTime(((endTime - startTime) / 1000).toFixed(2));

      if (response.data.error) {
        setError(response.data.error);
        toast.error('Execution failed! Check the output.');
      } else {
        setOutput(response.data.output || 'Program executed successfully (no output)');
        toast.success('Code executed successfully!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to execute code. Please try again.';
      setError(errorMessage);
      toast.error('Execution failed!');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setCode(CODE_TEMPLATES[selectedLanguage] || '// Start coding here...');
    setInput('');
    setOutput('');
    setError('');
    setExecutionTime(null);
    localStorage.removeItem(`code_${selectedLanguage}`);
    toast.info('Code reset to template');
  };

  const handleClear = () => {
    setCode('');
    setInput('');
    setOutput('');
    setError('');
    setExecutionTime(null);
    toast.info('Editor cleared');
  };

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setShowChallenges(false);
    toast.info(`Challenge: ${challenge.title}`);
  };

  const handleDownloadCode = () => {
    const extensions = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
      kotlin: 'kt',
      swift: 'swift',
      bash: 'sh',
      scala: 'scala',
      haskell: 'hs',
      perl: 'pl',
      lua: 'lua',
      r: 'r',
    };

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[selectedLanguage] || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  return (
    <div className={`code-editor-container ${theme}`}>
      {/* Header */}
      <div className="editor-header">
        <div className="editor-title">
          <h1>🚀 Code Playground</h1>
          <p>Write, run, and test your code in 40+ languages</p>
        </div>
        
        <div className="editor-actions">
          <button 
            className="btn-challenges"
            onClick={() => setShowChallenges(!showChallenges)}
          >
            🎯 Challenges
          </button>
          <button 
            className="btn-theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Challenges Panel */}
      {showChallenges && (
        <div className="challenges-panel">
          <h3>📚 Practice Challenges</h3>
          <div className="challenges-grid">
            {CODE_CHALLENGES.map((challenge) => (
              <div 
                key={challenge.id} 
                className="challenge-card"
                onClick={() => handleChallengeSelect(challenge)}
              >
                <div className="challenge-header">
                  <span className="challenge-title">{challenge.title}</span>
                  <span className={`challenge-difficulty ${challenge.difficulty.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="challenge-description">{challenge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Challenge Banner */}
      {selectedChallenge && (
        <div className="current-challenge">
          <div className="challenge-info">
            <span className="challenge-label">Current Challenge:</span>
            <strong>{selectedChallenge.title}</strong>
            <span className={`badge ${selectedChallenge.difficulty.toLowerCase()}`}>
              {selectedChallenge.difficulty}
            </span>
          </div>
          <p>{selectedChallenge.description}</p>
          <button 
            className="btn-close-challenge"
            onClick={() => setSelectedChallenge(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor Controls */}
      <div className="editor-controls">
        <div className="control-group">
          <label htmlFor="language-select">Language:</label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="language-selector"
          >
            <optgroup label="Popular">
              <option value="python">Python</option>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </optgroup>
            <optgroup label="Web & Modern">
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="kotlin">Kotlin</option>
              <option value="swift">Swift</option>
            </optgroup>
            <optgroup label="Scripting">
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="perl">Perl</option>
              <option value="lua">Lua</option>
              <option value="bash">Bash</option>
            </optgroup>
            <optgroup label="Functional & Others">
              <option value="scala">Scala</option>
              <option value="haskell">Haskell</option>
              <option value="r">R</option>
            </optgroup>
          </select>

          {LANGUAGE_TIPS[selectedLanguage] && (
            <span className="language-tip">{LANGUAGE_TIPS[selectedLanguage]}</span>
          )}
        </div>

        <div className="control-buttons">
          <button 
            className="btn-run"
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <span className="spinner"></span> Running...
              </>
            ) : (
              <>▶️ Run Code</>
            )}
          </button>
          <button className="btn-reset" onClick={handleReset}>
            🔄 Reset
          </button>
          <button className="btn-clear" onClick={handleClear}>
            🗑️ Clear
          </button>
          <button className="btn-download" onClick={handleDownloadCode}>
            💾 Download
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="editor-workspace">
        {/* Code Editor */}
        <div className="code-section">
          <div className="section-header">
            <span>📝 Code Editor</span>
            <span className="char-count">{code.length} characters</span>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            spellCheck="false"
          />
        </div>

        {/* Input/Output Section */}
        <div className="terminal-section">
          {/* Input */}
          <div className="input-box">
            <div className="section-header">
              <span>⌨️ Input (stdin)</span>
            </div>
            <textarea
              className="input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here (one value per line)..."
            />
          </div>

          {/* Output */}
          <div className="output-box">
            <div className="section-header">
              <span>📤 Output</span>
              {executionTime && (
                <span className="execution-time">⏱️ {executionTime}s</span>
              )}
            </div>
            <div className="output-content">
              {isExecuting ? (
                <div className="executing-state">
                  <div className="loading-spinner"></div>
                  <p>Executing your code...</p>
                </div>
              ) : error ? (
                <pre className="error-output">{error}</pre>
              ) : output ? (
                <pre className="success-output">{output}</pre>
              ) : (
                <div className="placeholder-state">
                  <p>👆 Click "Run Code" to see output here</p>
                  <p className="placeholder-hint">Your program's output will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="editor-footer">
        <div className="stats">
          <span>Language: <strong>{selectedLanguage.toUpperCase()}</strong></span>
          <span>Lines: <strong>{code.split('\n').length}</strong></span>
          <span>Theme: <strong>{theme}</strong></span>
        </div>
        <div className="footer-info">
          <span>💡 Tip: Your code is auto-saved locally</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
