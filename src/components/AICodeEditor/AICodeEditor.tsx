'use client';
import { useRef, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { MonacoCompletionProvider } from './CompletionProvider';

export interface AICodeEditorProps {
  language?: string;
  theme?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  height?: string | number;
  width?: string | number;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  className?: string;
  openAIKey: string;
}

const statusStyles = {
  processing: 'bg-gray-800 text-gray-300',
  success: 'bg-green-900 text-green-400',
  warning: 'bg-yellow-900 text-yellow-400',
  error: 'bg-red-900 text-red-400',
};

export const AICodeEditor: React.FC<AICodeEditorProps> = ({
  language = 'javascript',
  theme = 'vs-dark',
  value = '',
  onChange,
  height = '100%',
  width = '100%',
  options = {},
  className = '',
  openAIKey,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const completionProviderRef = useRef<MonacoCompletionProvider | null>(null);
  const disposableRef = useRef<monaco.IDisposable | null>(null);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    // Initialize completion provider
    completionProviderRef.current = new MonacoCompletionProvider(
      openAIKey,
      setStatus,
      setStatusMessage
    );

    // Configure editor for inline suggestions
    editor.updateOptions({
      inlineSuggest: { enabled: true },
      quickSuggestions: { other: false, comments: false, strings: false },
      suggestOnTriggerCharacters: false,
      parameterHints: { enabled: false },
      suggest: {
        showInlineDetails: false,
        showStatusBar: false,
        preview: false,
        snippetsPreventQuickSuggestions: false,
      }
    });

    // Register completion provider
    disposableRef.current = monacoInstance.languages.registerInlineCompletionsProvider(
      language,
      {
        provideInlineCompletions: (model, position, _context, _token) => {
          return completionProviderRef.current?.provideInlineCompletions(
            model,
            position,
            // We are not passing the token here, as CompletionProvider.ts does not expect it directly
          ) ?? { items: [] };
        },
        freeInlineCompletions: () => {
          // Cleanup if needed
        }
      }
    );

    // Register command for accepting completions
    editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        const inlineCompletionController = (editor as any)
          ._inlineCompletionController;
        if (inlineCompletionController?.active) {
          const { completionId } = inlineCompletionController.widget.currentSuggestion?.item?.command?.arguments?.[0] ?? {};
          if (completionId) {
            completionProviderRef.current?.acceptedLastCompletion(completionId);
          }
        }
      },
      'inlineSuggest.accept'
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposableRef.current?.dispose();
    };
  }, []);

  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    inlineSuggest: {
      enabled: true,
      mode: 'subword'
    },
    ...options,
  };

  return (
    <div className={className} style={{ width, height }}>
      <Editor
        height="70vh"
        width="100%"
        language={language}
        theme={theme}
        value={value}
        options={defaultOptions}
        onChange={onChange}
        onMount={handleEditorDidMount}
      />
      {status !== 'idle' && (
        <div 
          className={`absolute bottom-0 left-0 right-0 px-4 py-2 text-xs font-sans transition-all duration-200 ${statusStyles[status as keyof typeof statusStyles]}`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}; 