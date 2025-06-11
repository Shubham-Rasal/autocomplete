# @shubhamrasal/autocomplete

A React-based AI-powered code editor component with intelligent code suggestions.

This component is heavily inspired by [codeium-react-code-editor](https://github.com/Exafunction/codeium-react-code-editor) but with option to use openai as provider.


## Installation

```bash
npm install @shubhamrasal/autocomplete
```

or

```bash
yarn add @shubhamrasal/autocomplete
```

## Features

- AI-powered code suggestions using OpenAI
- Monaco editor integration
- TypeScript support
- Customizable styling
- React 18+ compatible

## Usage

```tsx
import { AICodeEditor } from '@shubhamrasal/autocomplete';

function App() {
  return (
    <AICodeEditor
      language="javascript"
      value={initialCode}
      onChange={(value) => console.log(value)}
      openAIKey="your-openai-api-key"
      options={{
        fontSize: 16,
        lineHeight: 1.6,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
}
```

## Configuration

The AICodeEditor component accepts the following props:

| Prop | Type | Description |
|------|------|-------------|
| language | string | The programming language for syntax highlighting (e.g. 'javascript', 'typescript', 'python') |
| value | string | The initial value of the editor |
| onChange | (value: string \| undefined) => void | Callback function called when the editor content changes |
| openAIKey | string | Your OpenAI API key for AI-powered suggestions |
| options | object | Monaco editor options (see Monaco Editor documentation) |
| className | string | Additional CSS classes to apply to the editor |

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (runs the demo):
   ```bash
   npm run dev
   ```

The demo app in the `demo` directory shows a complete example of how to use the component.

## Building

To build the library:
```bash
npm run build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
