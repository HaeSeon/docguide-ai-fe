"use client";

import { useState } from "react";
import type {
  DocAnalysisResult,
  JobSupportUserProfile,
  JobSupportEligibilityResult,
} from "@/lib/types";

interface JobSupportEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  docResult: DocAnalysisResult;
}

export default function JobSupportEligibilityModal({
  isOpen,
  onClose,
  docResult,
}: JobSupportEligibilityModalProps) {
  const [formData, setFormData] = useState<JobSupportUserProfile>({
    age: 25,
    household_size: 1,
    household_monthly_income: null,
    household_total_assets: null,
    work_experience_days: null,
    work_experience_hours: null,
    is_receiving_unemployment: false,
    is_youth: null,
    is_senior: null,
    special_category: "none",
  });

  const [result, setResult] = useState<JobSupportEligibilityResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/analyze/job-support-eligibility",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doc: docResult,
            profile: formData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("자격 평가에 실패했습니다.");
      }

      const data: JobSupportEligibilityResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              💼 내 조건 확인하기
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              조건을 입력하시면 신청 자격을 평가해드립니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 결과가 없을 때: 입력 폼 */}
        {!result && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <section>
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                📋 기본 정보
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    나이 *
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="69"
                    required
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    가구원 수 *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.household_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        household_size: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </section>

            {/* 소득/재산 정보 */}
            <section>
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                💰 소득/재산 정보
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    가구 월 소득 (만원)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="예: 300"
                    value={formData.household_monthly_income ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        household_monthly_income: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    가구 총 재산 (만원)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="예: 10000"
                    value={formData.household_total_assets ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        household_total_assets: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </section>

            {/* 취업 경험 */}
            <section>
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                💼 최근 2년 취업 경험
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    근무 일수
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="예: 150"
                    value={formData.work_experience_days ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        work_experience_days: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    근무 시간
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="예: 1200"
                    value={formData.work_experience_hours ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        work_experience_hours: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </section>

            {/* 특별 조건 */}
            <section>
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                ⭐ 특별 조건
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_receiving_unemployment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_receiving_unemployment: e.target.checked,
                      })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-sm text-gray-700">
                    실업급여 수급 중
                  </span>
                </label>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    특수 계층 해당 여부
                  </label>
                  <select
                    value={formData.special_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        special_category: e.target
                          .value as JobSupportUserProfile["special_category"],
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="none">해당 없음</option>
                    <option value="career_break_woman">경력단절여성</option>
                    <option value="special_worker">특수형태근로자</option>
                    <option value="homeless">노숙인 등</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "분석 중..." : "자격 확인하기"}
              </button>
            </div>
          </form>
        )}

        {/* 결과가 있을 때: 결과 표시 */}
        {result && (
          <div className="space-y-6">
            {/* 자격 판정 */}
            <section
              className={`rounded-xl p-6 ${
                result.eligible_type === "type_1"
                  ? "bg-green-50 border-2 border-green-200"
                  : result.eligible_type === "type_2"
                  ? "bg-blue-50 border-2 border-blue-200"
                  : "bg-red-50 border-2 border-red-200"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">
                  {result.eligible_type === "type_1"
                    ? "✅"
                    : result.eligible_type === "type_2"
                    ? "✔️"
                    : "❌"}
                </span>
                <h3
                  className={`text-lg font-bold ${
                    result.eligible_type === "type_1"
                      ? "text-green-800"
                      : result.eligible_type === "type_2"
                      ? "text-blue-800"
                      : "text-red-800"
                  }`}
                >
                  {result.eligible_type === "type_1"
                    ? "I유형 (요건심사형) 신청 가능"
                    : result.eligible_type === "type_2"
                    ? "II유형 (선발형) 신청 가능"
                    : "신청 요건 미충족"}
                </h3>
              </div>
              <p
                className={`text-sm leading-relaxed ${
                  result.eligible_type === "type_1"
                    ? "text-green-700"
                    : result.eligible_type === "type_2"
                    ? "text-blue-700"
                    : "text-red-700"
                }`}
              >
                {result.status_message}
              </p>
            </section>

            {/* 예상 지원 내용 */}
            {result.expected_benefit && (
              <section className="rounded-xl bg-yellow-50 p-6">
                <h3 className="mb-2 text-base font-bold text-yellow-900">
                  💰 예상 지원 내용
                </h3>
                <p className="text-sm leading-relaxed text-yellow-800">
                  {result.expected_benefit}
                </p>
              </section>
            )}

            {/* 준비 사항 */}
            {result.checklist.length > 0 && (
              <section className="rounded-xl bg-gray-50 p-6">
                <h3 className="mb-3 text-base font-bold text-gray-900">
                  📝 준비 사항
                </h3>
                <ul className="space-y-2">
                  {result.checklist.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="mt-0.5 text-indigo-500">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 주의사항 */}
            {result.warnings.length > 0 && (
              <section className="rounded-xl bg-orange-50 p-6">
                <h3 className="mb-3 text-base font-bold text-orange-900">
                  ⚠️ 주의사항
                </h3>
                <ul className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-orange-800"
                    >
                      <span className="mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                다시 확인하기
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-700"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
