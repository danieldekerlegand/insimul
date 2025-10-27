import { useEffect, useRef } from 'react';
import { useEditorState } from "@/hooks/use-editor-state";
import { Button } from "@/components/ui/button";

interface ConsoleProps {
  editorState: ReturnType<typeof useEditorState>;
}

export default function Console({ editorState }: ConsoleProps) {
  const { consoleMessages, clearConsole } = editorState;
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '→';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col font-mono text-sm bg-gray-900 text-green-400">
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Console Output</span>
          <span className="text-xs text-gray-500">({consoleMessages.length} messages)</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConsole}
          className="text-gray-400 hover:text-gray-200 p-1 h-auto"
        >
          <i className="fas fa-trash text-xs"></i>
        </Button>
      </div>
      
      <div ref={consoleRef} className="flex-1 p-4 overflow-auto">
        {consoleMessages.length === 0 ? (
          <div className="text-gray-500 italic">Console is empty. System messages will appear here.</div>
        ) : (
          <div className="space-y-1">
            {consoleMessages.map((message) => (
              <div key={message.id} className="flex items-start space-x-2">
                <span className="text-gray-500 text-xs">
                  [{formatTime(message.timestamp)}]
                </span>
                <span className={`${getMessageColor(message.type)}`}>
                  {getMessageIcon(message.type)} {message.message}
                </span>
              </div>
            ))}
            <div className="text-blue-400 opacity-75 mt-2">
              user@narrative-fusion:~/projects/medieval-kingdom$ _
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
