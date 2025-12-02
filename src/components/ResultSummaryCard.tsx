"use client";

import { useState } from "react";
import type { DocAction, ExtractedFields } from "@/lib/types";

interface ResultSummaryCardProps {
  summary: string;
  actions: DocAction[];
  extracted: ExtractedFields;
}

export default function ResultSummaryCard({
  summary,
  actions,
  extracted,
}: ResultSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const getActionButtonStyle = (type: string) => {
    switch (type) {
      case "apply":
        return "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200";
      case "pay":
        return "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200";
      case "check":
        return "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200";
      default:
        return "bg-gray-600 hover:bg-gray-700 text-white shadow-lg";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "apply":
        return "📝";
      case "pay":
        return "💳";
      case "check":
        return "✓";
      default:
        return "📋";
    }
  };

  // 핵심 행동 메시지 생성 (summary의 첫 문장 사용)
  const getMainAction = () => {
    // 문장 끝 (마침표/물음표/느낌표 + 공백 또는 문자열 끝)을 찾음
    // URL의 점은 뒤에 공백이 없으므로 제외됨
    const match = summary.match(/^.+?[.?!](?=\s|$)/);
    if (match) {
      return match[0].trim();
    }
    // 매칭 실패 시 줄바꿈 기준으로 첫 줄 또는 전체
    return summary.split("\n")[0].trim() || summary;
  };

  return (
    <div className="space-y-6">
      {/* 해야 할 일 카드 */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            해야 할 일
          </h2>
        </div>

        {/* 구분선 */}
        <div className="mb-5 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>

        {/* 핵심 행동 */}
        <div className="mb-5 py-1">
          <p className="text-center text-lg font-bold leading-relaxed text-gray-900 sm:text-xl">
            {getMainAction()}
          </p>
        </div>

        {/* 구분선 */}
        <div className="mb-5 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>

        {/* 체크리스트 */}
        <div className="space-y-2.5">
          {extracted.applicantType && (
            <div className="flex items-start gap-2.5">
              <span className="text-base font-bold text-indigo-600">✓</span>
              <span className="text-sm leading-relaxed text-gray-700">
                {extracted.applicantType}
              </span>
            </div>
          )}
          {actions.length > 0 && actions[0].label && (
            <div className="flex items-start gap-2.5">
              <span className="text-base font-bold text-indigo-600">✓</span>
              <span className="text-sm leading-relaxed text-gray-700">
                {actions[0].label}
              </span>
            </div>
          )}
        </div>

        {/* 자세히 보기 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-white/50 px-4 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-white/80"
        >
          <span>자세히 보기</span>
          <span
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {/* 펼쳤을 때 전체 요약 */}
        {isExpanded && (
          <div className="mt-4 rounded-lg bg-white/70 p-4">
            <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
          </div>
        )}

        {/* 액션 버튼들 */}
        {actions.filter((action) => action.link).length > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {actions
              .filter((action) => action.link)
              .map((action, index) => (
                <a
                  key={index}
                  href={action.link!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 rounded-xl px-6 py-4 text-left transition-all ${getActionButtonStyle(
                    action.type
                  )}`}
                >
                  <span className="text-2xl">{getActionIcon(action.type)}</span>
                  <div className="flex-1">
                    <div className="text-base font-bold sm:text-lg">
                      {action.label}
                    </div>
                    {action.deadline && (
                      <div className="mt-1 flex items-center gap-1 text-sm opacity-90">
                        <span>⏰</span>
                        <span>마감: {action.deadline}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xl opacity-75 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              ))}
          </div>
        )}

        {/* 링크가 있는 버튼이 없을 때 안내 메시지 */}
        {actions.filter((action) => action.link).length === 0 && (
          <div className="mt-6 rounded-lg bg-white/50 px-4 py-3 text-center text-sm text-gray-600">
            💬 신청 방법이 궁금하시면 AI에게 물어보세요!
          </div>
        )}
      </div>

      {/* 핵심 정보 카드 */}
      <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xl">📄</span>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
            문서 핵심 정보
          </h3>
        </div>

        <div className="space-y-5">
          {/* 공고명/제목 */}
          {extracted.title && (
            <div>
              <div className="mb-2 text-sm font-medium text-gray-500">
                공고명
              </div>
              <div className="text-lg font-bold text-gray-900 sm:text-xl">
                {extracted.title}
              </div>
            </div>
          )}

          <div className="h-px bg-gray-200"></div>

          {/* 2열 그리드 - 중요 정보만 */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* 마감일 */}
            {extracted.deadline && (
              <div>
                <div className="mb-2 text-sm font-medium text-gray-500">
                  신청/납부 기한
                </div>
                <div className="flex items-center gap-2 text-xl font-bold text-red-600 sm:text-2xl">
                  <span>⏰</span>
                  <span>{extracted.deadline}</span>
                </div>
              </div>
            )}

            {/* 금액 */}
            {extracted.amount && (
              <div>
                <div className="mb-2 text-sm font-medium text-gray-500">
                  금액
                </div>
                <div className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
                  <span>💰</span>
                  <span>{extracted.amount.toLocaleString()}원</span>
                </div>
              </div>
            )}
          </div>

          {/* 대상자 (전체 너비) */}
          {extracted.applicantType && (
            <>
              <div className="h-px bg-gray-200"></div>
              <div>
                <div className="mb-2 text-sm font-medium text-gray-500">
                  대상
                </div>
                <div className="text-base leading-relaxed text-gray-700 sm:text-lg">
                  {extracted.applicantType}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
