import type { SuggestedQuestion } from "@/lib/types";

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({
  questions,
  onSelect,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  const categoryIcons: Record<string, string> = {
    deadline: "⏰",
    amount: "💰",
    method: "📋",
    general: "💡",
  };

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs text-gray-500">추천 질문:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q.text)}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            <span>{categoryIcons[q.category]}</span>
            <span>{q.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

