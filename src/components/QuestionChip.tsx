import { useState } from 'react';

interface QuestionChipProps {
  text: string;
  onClick: () => void;
}

export default function QuestionChip({ text, onClick }: QuestionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm bg-slate-700 hover:bg-slate-600 text-indigo-100 rounded-full px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      {text}
    </button>
  );
}
