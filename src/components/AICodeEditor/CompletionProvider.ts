import * as monaco from 'monaco-editor';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

// interface CompletionMetadata {
//   sessionId: string;
//   timestamp: number;
//   language: string;
// }

class MonacoInlineCompletion implements monaco.languages.InlineCompletion {
  readonly insertText: string;
  readonly text: string;
  readonly range: monaco.IRange;
  readonly command: {
    id: string;
    title: string;
    arguments: string[];
  };

  constructor(insertText: string, range: monaco.IRange, completionId: string) {
    this.insertText = insertText;
    this.text = insertText;
    this.range = range;
    this.command = {
      id: 'openai.acceptCompletion',
      title: 'Accept Completion',
      arguments: [completionId, insertText],
    };
  }
}

export class MonacoCompletionProvider {
  private openai: OpenAI;
  private sessionId: string;
  // private lastCompletionId: string | null = null;
  private completionCache: Map<string, string> = new Map();

  constructor(
    apiKey: string,
    private readonly setStatus: (status: string) => void,
    private readonly setMessage: (message: string) => void,
  ) {
    this.sessionId = `openai-session-${uuidv4()}`;
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Generate inline completions using OpenAI.
   */
  public async provideInlineCompletions(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    // token: monaco.CancellationToken,
  ): Promise<monaco.languages.InlineCompletions<monaco.languages.InlineCompletion> | undefined> {
    // Set status to processing
    this.setStatus('processing');
    this.setMessage('Generating completions...');

    try {
      // Get text until cursor
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Create completion ID
      const completionId = uuidv4();

      // Get completion from OpenAI
      const completion = await this.getCompletion(
        textUntilPosition,
        model.getLanguageId(),
        completionId,
        // token
      );

      if (!completion) {
        this.setStatus('warning');
        this.setMessage('No completions generated');
        return undefined;
      }

      // Create inline completion item
      const inlineCompletion = new MonacoInlineCompletion(
        completion,
        {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column,
        },
        completionId
      );

      this.setStatus('success');
      this.setMessage('Generated 1 completion');

      return {
        items: [inlineCompletion],
      };

    } catch (error) {
      console.error('Error getting completion:', error);
      this.setStatus('error');
      this.setMessage('Something went wrong; please try again.');
      return undefined;
    }
  }

  /**
   * Get completion from OpenAI
   */
  private async getCompletion(
    code: string,
    language: string,
    completionId: string,
    // token: monaco.CancellationToken,
  ): Promise<string | undefined> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer. Provide concise, idiomatic code completions. Only respond with the code completion, no explanations.`
          },
          {
            role: "user", 
            content: `Complete the following ${language} code:\n${code}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
        presence_penalty: 0,
        frequency_penalty: 0,
      });

      const completion = response.choices[0]?.message?.content;
      if (!completion) return undefined;

      // Cache the completion
      this.completionCache.set(completionId, completion);
      // this.lastCompletionId = completionId;

      return completion.replace(/```[a-z]*\n?|\n```/g, '').trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return undefined;
    }
  }

  /**
   * Record that the last completion was accepted
   */
  public acceptedLastCompletion(completionId: string) {
    // Get the accepted completion from cache
    const completion = this.completionCache.get(completionId);
    if (!completion) return;

    // Clear the cache entry
    this.completionCache.delete(completionId);

    // Here you could send analytics or track accepted completions
    console.log('Completion accepted:', {
      completionId,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }
} 