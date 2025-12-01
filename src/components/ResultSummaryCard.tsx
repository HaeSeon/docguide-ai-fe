import type { DocAction } from "@/lib/types";

interface ResultSummaryCardProps {
  summary: string;
  actions: DocAction[];
}

export default function ResultSummaryCard({
  summary,
  actions,
}: ResultSummaryCardProps) {
  const getActionButtonStyle = (type: string) => {
    switch (type) {
      case "apply":
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
      case "pay":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "check":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      default:
        return "bg-gray-600 hover:bg-gray-700 text-white";
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-lg sm:rounded-2xl sm:p-8">
      <h2 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl">
        AI 행동 안내
      </h2>
      <p className="mb-4 text-base font-semibold leading-relaxed text-gray-800 sm:mb-6 sm:text-lg md:text-xl">
        {summary}
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {actions.map((action, index) => {
          const buttonContent = (
            <div className="flex flex-col items-start gap-0.5 sm:gap-1">
              <span className="text-sm font-semibold sm:text-base">
                {action.label}
              </span>
              {action.deadline && (
                <span className="text-xs opacity-90">
                  마감: {action.deadline}
                </span>
              )}
            </div>
          );

          if (action.link) {
            return (
              <a
                key={index}
                href={action.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all sm:px-6 sm:py-3 sm:text-base ${getActionButtonStyle(
                  action.type
                )}`}
              >
                {buttonContent}
              </a>
            );
          }

          return (
            <button
              key={index}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all sm:px-6 sm:py-3 sm:text-base ${getActionButtonStyle(
                action.type
              )}`}
            >
              {buttonContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
