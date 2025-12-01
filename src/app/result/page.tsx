"use client";

import { useState, useEffect } from "react";
import type {
  DocAnalysisResult,
  EligibilityResult,
  EligibilityUserProfile,
  HouseholdType,
  IncomeLevel,
  SpecialQualification,
} from "@/lib/types";
import ResultSummaryCard from "@/components/ResultSummaryCard";
import ChatInterface from "@/components/ChatInterface";

export default function ResultPage() {
  const [data, setData] = useState<DocAnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState<EligibilityUserProfile>({
    is_seoul_resident: true,
    household_type: "single",
    income_level: "unknown",
    special_qualifications: ["none"],
  });
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("doc-result");
    if (storedData) {
      try {
        const parsedData: DocAnalysisResult = JSON.parse(storedData);
        setData(parsedData);
      } catch (error) {
        console.error("분석 결과 파싱 중 오류 발생:", error);
      }
    }
  }, []);

  // sessionStorage에 데이터가 없는 경우
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 sm:py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="rounded-xl bg-white p-8 shadow-lg sm:rounded-2xl sm:p-12">
            <div className="mb-4 flex justify-center">
              <svg
                className="h-16 w-16 text-gray-400 sm:h-20 sm:w-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
              분석 결과를 찾을 수 없습니다
            </h2>
            <p className="text-base text-gray-600 sm:text-lg">
              처음 화면에서 문서를 다시 업로드해 주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:py-12">
        {/* 왼쪽 패널: 문서 요약 */}
        <div className="flex-1 space-y-6 overflow-y-auto sm:space-y-8">
          {/* 문서 분석 결과 */}
          <section className="space-y-4 sm:space-y-6">

          <ResultSummaryCard 
            summary={data.summary} 
            actions={data.actions}
            extracted={data.extracted}
          />
        </section>

        {/* ② 내 조건 적용하기 블록 (주택청약 문서일 때만 표시) */}
        {data.extracted.docType === "housing_application_notice" && (
          <section className="rounded-xl bg-white p-4 shadow-lg sm:rounded-2xl sm:p-8">
            <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  내 조건 적용하기
                </h2>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  내 거주지·가구 정보·소득 수준을 넣고 신청 가능성을 간단히
                  확인해보세요.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 sm:text-sm">
                선택 입력 · 약 30초 소요
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setEligibilityError(null);
                setIsModalOpen(true);
              }}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
            >
              내 조건으로 신청 가능 여부 확인하기
            </button>

            <p className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm">
              버튼을 누르면 간단한 질문(거주지, 가구 구성, 소득 수준 등)에 답한
              뒤, AI가 신청 가능 여부와 예상 배점, 지금 해야 할 체크리스트를
              정리해 드립니다.
            </p>
          </section>
        )}

        {/* 모바일: 채팅 섹션 (하단) */}
        <section className="lg:hidden">
          <ChatInterface docResult={data} />
        </section>
        </div>

        {/* 데스크톱: 오른쪽 패널 채팅 고정 */}
        <div className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[420px] lg:block">
          <ChatInterface docResult={data} />
        </div>
      </div>

      {/* 내 조건 입력 모달 (주택청약 문서일 때만) */}
      {isModalOpen && data.extracted.docType === "housing_application_notice" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <div className="mb-4 flex items-start justify-between sm:mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    내 조건으로 신청 가능 여부 확인
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    너무 디테일하게 묻지 않고, 판정에 꼭 필요한 정보만 간단히
                    입력해요.
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-2 text-sm text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                >
                  ✕
                </button>
              </div>

              <form
                className="space-y-5 sm:space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!data) return;
                  setIsChecking(true);
                  setEligibilityError(null);
                  setEligibilityResult(null);

                  try {
                    const response = await fetch(
                      "http://localhost:8000/api/analyze/eligibility",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          profile,
                          doc: data,
                        }),
                      }
                    );

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}));
                      throw new Error(
                        errorData.detail ||
                          `서버 오류가 발생했습니다. (${response.status})`
                      );
                    }

                    const result: EligibilityResult = await response.json();
                    setEligibilityResult(result);
                  } catch (error) {
                    console.error("신청 가능 여부 확인 중 오류:", error);
                    setEligibilityError(
                      error instanceof Error
                        ? error.message
                        : "신청 가능 여부 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
                    );
                  } finally {
                    setIsChecking(false);
                  }
                }}
              >
                {/* 거주지 */}
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-gray-500 sm:text-sm">
                    거주지
                  </h3>
                  <div className="inline-flex gap-2 rounded-full bg-gray-100 p-1">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm ${
                        profile.is_seoul_resident
                          ? "bg-indigo-600 text-white"
                          : "text-gray-600"
                      }`}
                      onClick={() =>
                        setProfile((prev) => ({
                          ...prev,
                          is_seoul_resident: true,
                        }))
                      }
                    >
                      서울 거주
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm ${
                        !profile.is_seoul_resident
                          ? "bg-indigo-600 text-white"
                          : "text-gray-600"
                      }`}
                      onClick={() =>
                        setProfile((prev) => ({
                          ...prev,
                          is_seoul_resident: false,
                        }))
                      }
                    >
                      서울 외 거주
                    </button>
                  </div>
                </div>

                {/* 가구 정보 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-gray-900 sm:text-sm">
                      세대 구성
                    </h3>
                    <div className="space-y-1.5">
                      {[
                        { value: "single", label: "1인가구" },
                        { value: "two", label: "2인가구" },
                        { value: "three_plus", label: "3인 이상" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:text-sm text-gray-900 ${
                            profile.household_type === option.value
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="household_type"
                            className="h-3 w-3 sm:h-4 sm:w-4"
                            checked={
                              profile.household_type ===
                              (option.value as HouseholdType)
                            }
                            onChange={() =>
                              setProfile((prev) => ({
                                ...prev,
                                household_type: option.value as HouseholdType,
                              }))
                            }
                          />
                          <span className="text-gray-900">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-gray-500 sm:text-sm">
                      세대원 수 (선택)
                    </h3>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="예: 3"
                      value={profile.household_size ?? ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          household_size: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* 나이 / 세대주 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-gray-500 sm:text-sm">
                      신청자 나이 (선택)
                    </h3>
                    <input
                      type="number"
                      min={18}
                      max={120}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="예: 35"
                      value={profile.age ?? ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          age: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700 sm:text-sm">
                      <input
                        type="checkbox"
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        checked={profile.is_head_of_household ?? false}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            is_head_of_household: e.target.checked,
                          }))
                        }
                      />
                      <span>신청자가 세대주이다</span>
                    </label>
                  </div>
                </div>

                {/* 소득/자산 */}
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-gray-900 sm:text-sm">
                    소득 수준 (가구 연 소득 기준, 대략적인 범위)
                  </h3>
                  <div className="space-y-1.5">
                    {[
                      {
                        value: "under_30m",
                        label: "연 3,000만 원 미만",
                      },
                      {
                        value: "between_30m_50m",
                        label: "연 3,000만 ~ 5,000만 원",
                      },
                      {
                        value: "over_50m",
                        label: "연 5,000만 원 이상",
                      },
                      {
                        value: "unknown",
                        label: "잘 모르겠음",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:text-sm text-gray-900 ${
                          profile.income_level === option.value
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="income_level"
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          checked={
                            profile.income_level ===
                            (option.value as IncomeLevel)
                          }
                          onChange={() =>
                            setProfile((prev) => ({
                              ...prev,
                              income_level: option.value as IncomeLevel,
                            }))
                          }
                        />
                        <span className="text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700 sm:text-sm">
                      <input
                        type="checkbox"
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        checked={profile.has_high_price_car ?? false}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            has_high_price_car: e.target.checked,
                          }))
                        }
                      />
                      <span>4천만 원 이상 차량을 보유하고 있다</span>
                    </label>
                  </div>
                </div>

                {/* 특별 자격 */}
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-gray-500 sm:text-sm">
                    특별 자격 (해당되는 것만 선택)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "basic_support", label: "기초수급자" },
                      { value: "disabled", label: "장애인" },
                      { value: "single_parent", label: "한부모" },
                      { value: "national_merit", label: "국가유공자/유족" },
                      {
                        value: "north_korean_defector",
                        label: "북한이탈주민",
                      },
                      {
                        value: "elderly_parent_support",
                        label: "65세 이상 직계존속 부양",
                      },
                      { value: "none", label: "해당 없음" },
                    ].map((option) => {
                      const selected = profile.special_qualifications.includes(
                        option.value as SpecialQualification
                      );
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm ${
                            selected
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                          onClick={() =>
                            setProfile((prev) => {
                              let next: SpecialQualification[] =
                                prev.special_qualifications || [];

                              // "해당 없음" 선택 시 다른 태그 제거
                              if (option.value === "none") {
                                return {
                                  ...prev,
                                  special_qualifications: ["none"],
                                };
                              }

                              // 다른 태그 선택 시 "none" 제거
                              next = next.filter((q) => q !== "none");

                              if (
                                next.includes(
                                  option.value as SpecialQualification
                                )
                              ) {
                                next = next.filter(
                                  (q) =>
                                    q !== (option.value as SpecialQualification)
                                );
                              } else {
                                next = [
                                  ...next,
                                  option.value as SpecialQualification,
                                ];
                              }

                              if (next.length === 0) {
                                next = ["none"];
                              }

                              return {
                                ...prev,
                                special_qualifications: next,
                              };
                            })
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 공공임대 중복 여부 */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-gray-500 sm:text-sm">
                      현재 공공임대 거주 여부
                    </h3>
                    <div className="inline-flex gap-2 rounded-full bg-gray-100 p-1">
                      {[
                        { value: true, label: "거주 중" },
                        { value: false, label: "거주 안 함" },
                      ].map((option) => (
                        <button
                          key={String(option.value)}
                          type="button"
                          className={`rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm ${
                            profile.is_current_public_rental === option.value
                              ? "bg-indigo-600 text-white"
                              : "text-gray-600"
                          }`}
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              is_current_public_rental: option.value,
                            }))
                          }
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-gray-500 sm:text-sm">
                      다른 공공임대 예비입주자 여부
                    </h3>
                    <div className="inline-flex gap-2 rounded-full bg-gray-100 p-1">
                      {[
                        { value: true, label: "예비입주자임" },
                        { value: false, label: "해당 없음" },
                      ].map((option) => (
                        <button
                          key={String(option.value)}
                          type="button"
                          className={`rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm ${
                            profile.is_other_waiting_list === option.value
                              ? "bg-indigo-600 text-white"
                              : "text-gray-600"
                          }`}
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              is_other_waiting_list: option.value,
                            }))
                          }
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 결과 / 에러 */}
                {eligibilityError && (
                  <p className="text-xs font-medium text-red-600 sm:text-sm">
                    {eligibilityError}
                  </p>
                )}

                {eligibilityResult && (
                  <div className="space-y-3 rounded-xl bg-indigo-50 p-3 sm:p-4">
                    <div>
                      <span className="mb-1 inline-flex rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white sm:text-sm">
                        {eligibilityResult.status === "eligible"
                          ? "신청 가능"
                          : eligibilityResult.status === "likely"
                          ? "가능성 높음"
                          : eligibilityResult.status === "ineligible"
                          ? "조건 미충족"
                          : "판단 유보"}
                      </span>
                      <p className="mt-2 text-sm font-medium text-gray-900 sm:text-base">
                        {eligibilityResult.status_message}
                      </p>
                    </div>

                    {(eligibilityResult.estimated_score != null ||
                      eligibilityResult.score_reference) && (
                      <div className="rounded-lg bg-white/70 p-3 text-xs text-gray-700 sm:text-sm">
                        {eligibilityResult.estimated_score != null && (
                          <p>
                            예상 배점:{" "}
                            <span className="font-semibold">
                              {eligibilityResult.estimated_score}점
                            </span>
                          </p>
                        )}
                        {eligibilityResult.score_reference && (
                          <p className="mt-1">
                            {eligibilityResult.score_reference}
                          </p>
                        )}
                      </div>
                    )}

                    {eligibilityResult.checklist.length > 0 && (
                      <div className="rounded-lg bg-white/70 p-3 text-xs text-gray-700 sm:text-sm">
                        <p className="mb-2 font-semibold">
                          지금 하면 좋을 행동 체크리스트
                        </p>
                        <ul className="space-y-1.5">
                          {eligibilityResult.checklist.map((item, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="mt-0.5 text-indigo-500">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="mt-4 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 sm:px-5 sm:text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    disabled={isChecking}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-5 sm:text-sm"
                  >
                    {isChecking
                      ? "AI가 신청 가능 여부 확인 중..."
                      : "AI에게 신청 가능 여부 물어보기"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
