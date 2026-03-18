import React from 'react';

interface FieldSuggestionProps {
  fieldKey: string;
  isLoading: boolean;
  suggestion: any;
  onAccept: (value: any) => void;
  onReject: () => void;
}

export const FieldSuggestion: React.FC<FieldSuggestionProps> = ({
  isLoading,
  suggestion,
  onAccept,
  onReject,
}) => {
  if (!isLoading && !suggestion) return null;

  if (isLoading) {
    return (
      <div className="my-3 px-4 py-3 bg-[#fafafa] border border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#999999] border-t-transparent rounded-full animate-spin" />
          <div className="text-xs text-[#999999]">Generating AI suggestion...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-3 px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] space-y-3">
      <div className="text-[10px] text-[#999999] uppercase tracking-wide font-medium">
        AI Suggestion
      </div>
      <div className="text-sm text-[#666666]">
        {Array.isArray(suggestion) ? (
          <ul className="list-disc ml-4 space-y-1">
            {suggestion.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>{suggestion}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(suggestion)}
          className="px-4 py-1.5 bg-[#000000] text-white text-xs uppercase tracking-wide hover:opacity-90 transition-opacity focus:outline-none"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="px-4 py-1.5 text-[#666666] text-xs uppercase tracking-wide hover:text-[#000000] transition-colors focus:outline-none"
        >
          Reject
        </button>
      </div>
    </div>
  );
};
