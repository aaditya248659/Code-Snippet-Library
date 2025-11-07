import React, { useState } from 'react';
import { playgroundAPI } from '../services/api';
import { toast } from 'react-toastify';

// Code templates for different languages
const CODE_TEMPLATES = {
  javascript: `// JavaScript Example
function greet(name) {
  console.log("Hello, " + name + "!");
  return "Welcome!";
}

greet("World");`,

  python: `# Python Example
def greet(name):
    print(f"Hello, {name}!")
    return "Welcome!"

greet("World")`,

  java: `// Java - Always use "Main" class for online execution
class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

  cpp: `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,

  'c++': `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,

  c: `// C Example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,

  python3: `# Python Example
def greet(name):
    print(f"Hello, {name}!")
    return "Welcome!"

greet("World")`,

  csharp: `// C# Example
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,

  go: `// Go Example
package main
import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,

  ruby: `# Ruby Example
def greet(name)
  puts "Hello, #{name}!"
end

greet("World")`,

  php: `<?php
// PHP Example
echo "Hello, World!";
?>`,

  swift: `// Swift Example
import Foundation

print("Hello, World!")`,

  kotlin: `// Kotlin Example
fun main() {
    println("Hello, World!")
}`,

  rust: `// Rust Example
fn main() {
    println!("Hello, World!");
}`,

  typescript: `// TypeScript Example
function greet(name: string): void {
    console.log(\`Hello, \${name}!\`);
}

greet("World");`,

  r: `# R Example
message <- "Hello, World!"
print(message)`,

  perl: `# Perl Example
print "Hello, World!\\n";`,

  scala: `// Scala Example
object Main extends App {
    println("Hello, World!")
}`,

  bash: `# Bash Example
echo "Hello, World!"`,

  sql: `-- SQL Example
SELECT 'Hello, World!' as message;`
};

// Language-specific tips
const LANGUAGE_TIPS = {
  java: '💡 For online execution, always use "class Main" (not public class)',
  c: '💡 Remember to include headers like #include <stdio.h>',
  cpp: '💡 Include necessary headers like #include <iostream>',
  'c++': '💡 Include necessary headers like #include <iostream>',
  python: '💡 Python is indentation-sensitive, use 4 spaces',
  python3: '💡 Python is indentation-sensitive, use 4 spaces',
  csharp: '💡 C# requires "using System;" at the top',
  go: '💡 Go requires "package main" and imported packages',
  rust: '💡 Rust requires explicit return types and semicolons',
};

const CodePlayground = ({ initialCode, language, snippetId, snippetOwner, currentUser }) => {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language?.toLowerCase() || 'javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showForkModal, setShowForkModal] = useState(false);
  const [forkData, setForkData] = useState({
    changes: '',
    description: ''
  });

  const normalizedLanguage = selectedLanguage?.toLowerCase();
  
  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    if (CODE_TEMPLATES[newLanguage]) {
      const loadTemplate = window.confirm(
        `Switch to ${newLanguage.toUpperCase()} and load a starter template?\n\nClick OK to load template, or Cancel to keep current code.`
      );
      if (loadTemplate) {
        setCode(CODE_TEMPLATES[newLanguage]);
        setOutput('');
        setError('');
        toast.info(`Switched to ${newLanguage.toUpperCase()} with starter template`);
      }
    }
  };

  const handleExecute = async () => {
    if (!currentUser) {
      toast.error('Please login to run code');
      return;
    }

    setIsExecuting(true);
    setOutput('');
    setError('');

    try {
      const response = await playgroundAPI.executeCode(code, normalizedLanguage, input);
      
      if (response.data.success) {
        if (response.data.error) {
          setError(response.data.error);
          toast.error('Code execution failed');
        } else {
          setOutput(response.data.output);
          toast.success(`✅ Executed in ${response.data.executionTime}`);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.status === 401 ? 'Please login to execute code' :
                       err.response?.data?.message || 'Execution failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setError('');
    setInput('');
  };

  const handleForkSubmit = async () => {
    if (!forkData.changes.trim()) {
      toast.error('Please describe your changes');
      return;
    }

    try {
      const response = await playgroundAPI.forkSnippet({
        snippetId,
        modifiedCode: code,
        changes: forkData.changes,
        description: forkData.description,
        testResults: output ? {
          success: !error,
          output: output || error,
          executionTime: 0
        } : null
      });

      if (response.data.success) {
        toast.success('Fork submitted! The owner will be notified.');
        setShowForkModal(false);
        setForkData({ changes: '', description: '' });
      }
    } catch (err) {
      toast.error('Failed to submit fork');
    }
  };

  const isOwner = currentUser?._id === snippetOwner;

  return (
    <div className="code-playground">
      <div className="playground-header">
        <h3>🎮 Code Playground</h3>
        <div className="playground-actions">
          <button 
            onClick={handleExecute} 
            className="btn btn-primary" 
            disabled={isExecuting}
          >
            {isExecuting ? '⏳ Running...' : '▶️ Run Code'}
          </button>
          <button onClick={handleReset} className="btn btn-outline">
            🔄 Reset
          </button>
          {!isOwner && currentUser && (
            <button onClick={() => setShowForkModal(true)} className="btn btn-success">
              🍴 Fork & Submit
            </button>
          )}
        </div>
      </div>

      {/* Language Selector and Tips */}
      <div className="language-selector-section">
        <div className="language-selector-wrapper">
          <label htmlFor="language-select">🔧 Language:</label>
          <select 
            id="language-select"
            value={selectedLanguage} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-dropdown"
          >
            <optgroup label="Popular Languages">
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </optgroup>
            <optgroup label="Modern Languages">
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="kotlin">Kotlin</option>
              <option value="swift">Swift</option>
            </optgroup>
            <optgroup label="Other Languages">
              <option value="csharp">C#</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="r">R</option>
              <option value="perl">Perl</option>
              <option value="scala">Scala</option>
              <option value="bash">Bash/Shell</option>
              <option value="sql">SQL</option>
            </optgroup>
          </select>
        </div>
        
        {LANGUAGE_TIPS[normalizedLanguage] && (
          <div className="language-tip">
            {LANGUAGE_TIPS[normalizedLanguage]}
          </div>
        )}
      </div>

      <div className="playground-layout">
        <div className="editor-section">
          <div className="section-header">
            <span>📝 Code Editor</span>
            <span className="language-tag">{selectedLanguage}</span>
          </div>
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Write your code here..."
          />
        </div>

        <div className="io-section">
          <div className="interactive-terminal">
            <div className="terminal-header">
              <span className="terminal-title">💻 Terminal</span>
              <div className="terminal-controls">
                {(output || error) && (
                  <button 
                    onClick={handleReset} 
                    className="terminal-clear-btn"
                    title="Clear terminal"
                  >
                    🗑️ Clear
                  </button>
                )}
              </div>
            </div>
            
            <div className="terminal-body">
              {/* Input Section - Always visible */}
              <div className="terminal-input-section">
                <label className="terminal-label">📥 Input (enter values your program needs):</label>
                <textarea
                  className="terminal-input-box"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input data here (if your program needs it)&#10;Example: For cin/scanf/input(), enter values here&#10;&#10;Hello World&#10;25&#10;3.14"
                  rows={4}
                  disabled={isExecuting}
                />
                <div className="input-note">
                  💡 Enter all input values before clicking "Run Code"
                </div>
              </div>

              {/* Output Section */}
              <div className="terminal-output-section">
                <label className="terminal-label">
                  {isExecuting ? '⚡ Executing...' : error ? '❌ Error Output:' : output ? '✅ Program Output:' : '📤 Output:'}
                </label>
                
                {isExecuting ? (
                  <div className="terminal-executing">
                    <div className="executing-spinner"></div>
                    <span>Running your code...</span>
                  </div>
                ) : error ? (
                  <pre className="terminal-output error">{error}</pre>
                ) : output ? (
                  <pre className="terminal-output success">{output}</pre>
                ) : (
                  <div className="terminal-placeholder">
                    <div className="placeholder-icon">💻</div>
                    <p>Click "Run Code" to see output here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fork Modal */}
      {showForkModal && (
        <div className="modal-overlay" onClick={() => setShowForkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🍴 Submit Your Improvement</h2>
              <button onClick={() => setShowForkModal(false)} className="close-btn">×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Describe Your Changes *</label>
                <textarea
                  value={forkData.changes}
                  onChange={(e) => setForkData({ ...forkData, changes: e.target.value })}
                  placeholder="What did you improve? (e.g., Fixed bug, Optimized performance, Added error handling)"
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={forkData.description}
                  onChange={(e) => setForkData({ ...forkData, description: e.target.value })}
                  placeholder="Any additional context about your changes"
                  rows={3}
                />
              </div>

              <div className="test-results-preview">
                <h4>Test Results</h4>
                {output ? (
                  <div className="result-box success">
                    <span className="result-icon">✅</span>
                    <span>Code executed successfully</span>
                  </div>
                ) : error ? (
                  <div className="result-box error">
                    <span className="result-icon">❌</span>
                    <span>Code has errors - fix before submitting</span>
                  </div>
                ) : (
                  <div className="result-box warning">
                    <span className="result-icon">⚠️</span>
                    <span>Run code first to test your changes</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowForkModal(false)} className="btn btn-outline">
                Cancel
              </button>
              <button 
                onClick={handleForkSubmit} 
                className="btn btn-primary"
                disabled={!forkData.changes.trim()}
              >
                Submit Fork
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePlayground;