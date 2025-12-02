/**
 * API Base URL 헬퍼
 *
 * - 기본값: http://localhost:8000
 * - 배포 환경에서는 NEXT_PUBLIC_API_BASE_URL 환경변수로 설정
 */

const DEFAULT_API_BASE_URL = "http://localhost:8000";

export function getApiBaseUrl(): string {
  // Next.js 클라이언트 환경에서 접근 가능한 공개 환경변수
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = (
    envUrl && envUrl.trim().length > 0 ? envUrl : DEFAULT_API_BASE_URL
  ).trim();

  // 끝의 슬래시는 제거 (일관된 조합을 위해)
  return baseUrl.replace(/\/+$/, "");
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
