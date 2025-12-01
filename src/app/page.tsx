"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { DocAnalysisResult } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null); // 파일 선택 시 에러 초기화
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // FormData 생성 및 파일 추가
      const formData = new FormData();
      formData.append("file", file);

      // FastAPI 서버로 요청 전송
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `서버 오류가 발생했습니다. (${response.status})`
        );
      }

      // 응답 JSON 파싱
      const data: DocAnalysisResult = await response.json();

      // sessionStorage에 저장
      sessionStorage.setItem("doc-result", JSON.stringify(data));

      // 결과 페이지로 이동
      router.push("/result");
    } catch (err) {
      console.error("문서 분석 중 오류 발생:", err);
      setError(
        err instanceof Error
          ? err.message
          : "문서 분석 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 sm:py-12">
      <main className="w-full max-w-2xl">
        {/* 제목 섹션 */}
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-3 sm:text-4xl md:text-5xl">
            공공문서 요약 & 행동 안내
          </h1>
          <p className="text-base text-gray-600 sm:text-lg md:text-xl">
            어려운 공고문, AI가 대신 읽어드립니다.
          </p>
        </div>

        {/* 파일 업로드 박스 */}
        <div className="mb-6 sm:mb-8">
          <div
            onClick={handleFileInputClick}
            className="group relative cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50 sm:rounded-2xl sm:p-12"
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 sm:h-16 sm:w-16">
                  <svg
                    className="h-6 w-6 text-indigo-600 sm:h-8 sm:w-8"
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
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:px-4 sm:py-2 sm:text-sm"
                >
                  파일 제거
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-indigo-100 sm:h-16 sm:w-16">
                  <svg
                    className="h-6 w-6 text-gray-400 transition-colors group-hover:text-indigo-600 sm:h-8 sm:w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <p className="text-base font-medium text-gray-700 sm:text-lg">
                    파일을 클릭하거나 드래그하여 업로드
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    주택청약 공고문, 지원금 공고, 고지서 파일을 업로드해 주세요
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF / HWP / 이미지 (최대 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 버튼 및 에러 메시지 */}
        <div className="text-center">
          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 enabled:hover:bg-indigo-700 enabled:active:scale-95 sm:w-auto sm:rounded-xl sm:px-8 sm:py-4 sm:text-lg md:px-12"
          >
            {isLoading ? "AI가 문서를 읽는 중..." : "AI에게 해석 맡기기"}
          </button>
          {error && (
            <p className="mt-4 text-sm font-medium text-red-600 sm:text-base">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
