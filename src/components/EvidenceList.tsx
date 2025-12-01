import type { EvidenceItem } from "@/lib/types";

interface EvidenceListProps {
  evidence: EvidenceItem[];
}

export default function EvidenceList({ evidence }: EvidenceListProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-lg sm:rounded-2xl sm:p-8">
      <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
        AI가 참조한 근거 문장
      </h2>
      <div className="space-y-4 sm:space-y-6">
        {evidence.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-5"
          >
            <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="w-fit rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 sm:px-3 sm:text-sm">
                {item.field}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">신뢰도</span>
                <span className="text-xs font-bold text-indigo-600 sm:text-sm">
                  {Math.round(item.confidence * 100)}%
                </span>
                {item.page && (
                  <span className="text-xs text-gray-400">
                    ({item.page}페이지)
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
