interface CodeEditorProps {
  code: string;
}

export function CodeEditor({ code }: CodeEditorProps) {
  return (
    <div className="relative">
      <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto border border-zinc-700">
        <code className="text-sm text-zinc-100 font-mono">
          {code}
        </code>
      </pre>
    </div>
  );
}
