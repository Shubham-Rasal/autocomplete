import { AICodeEditor } from '@shubhamrasal/autocomplete'
import './App.css'

function App() {
  const initialCode = `// Start typing and see AI-powered suggestions
// Try writing function declarations, loops, or any code pattern

`;

  const handleEditorChange = (value: string | undefined) => {
    console.log('Editor content:', value);
  };

  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div className="w-full max-w-3xl h-[500px] relative">
        <AICodeEditor 
          language="javascript" 
          className="w-full h-full"
          value={initialCode}
          onChange={handleEditorChange}
          openAIKey={import.meta.env.VITE_OPENAI_API_KEY || ""}
          options={{
            fontSize: 16,
            lineHeight: 1.6,
            padding: { top: 16, bottom: 16 },
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  )
}

export default App
