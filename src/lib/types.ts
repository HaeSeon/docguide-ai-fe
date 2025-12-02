/**
 * 공공문서 분석 서비스에서 사용하는 공통 타입 정의
 */

/**
 * 행동 유형
 */
export type ActionType = "pay" | "apply" | "check" | "none";

/**
 * 문서에서 추출된 행동 항목
 */
export interface DocAction {
  type: ActionType;
  label: string;
  deadline?: string | null;
  link?: string | null;
}

/**
 * 문서에서 추출된 주요 필드
 */
export interface ExtractedFields {
  docType: string;
  title?: string;
  amount?: number | null;
  deadline?: string | null;
  authority?: string | null;
  applicantType?: string | null; // 청약/지원 대상
}

/**
 * 추출된 정보의 근거/증거 항목
 */
export interface EvidenceItem {
  field: string;
  text: string;
  page?: number;
  confidence: number;
}

/**
 * 불확실한 정보 항목
 */
export interface UncertaintyItem {
  field: string;
  reason: string;
  confidence: number;
}

/**
 * 문서 분석 결과
 */
export interface DocAnalysisResult {
  id: string;
  summary: string;
  actions: DocAction[];
  extracted: ExtractedFields;
  evidence: EvidenceItem[];
  uncertainty: UncertaintyItem[];
}

/**
 * 내 조건 입력 폼 타입
 */
export type HouseholdType = "single" | "two" | "three_plus";

export type IncomeLevel =
  | "under_30m"
  | "between_30m_50m"
  | "over_50m"
  | "unknown";

export type SpecialQualification =
  | "basic_support"
  | "disabled"
  | "single_parent"
  | "national_merit"
  | "north_korean_defector"
  | "elderly_parent_support"
  | "none";

export interface EligibilityUserProfile {
  is_seoul_resident: boolean;
  household_type: HouseholdType;
  household_size?: number | null;
  age?: number | null;
  is_head_of_household?: boolean | null;
  income_level: IncomeLevel;
  has_high_price_car?: boolean | null;
  special_qualifications: SpecialQualification[];
  is_current_public_rental?: boolean | null;
  is_other_waiting_list?: boolean | null;
}

export type EligibilityStatus =
  | "eligible"
  | "likely"
  | "ineligible"
  | "unknown";

export interface EligibilityResult {
  status: EligibilityStatus;
  status_message: string;
  estimated_score?: number | null;
  score_reference?: string | null;
  checklist: string[];
}

/**
 * ============================================================
 * 대화형 질의응답 (Chat) 타입
 * ============================================================
 */

/**
 * 채팅 메시지
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

/**
 * 채팅 요청
 */
export interface ChatRequest {
  doc_id: string;
  doc_context: DocAnalysisResult;
  messages: ChatMessage[];
}

/**
 * 추천 질문
 */
export interface SuggestedQuestion {
  text: string;
  category: "deadline" | "amount" | "method" | "general";
}

/**
 * 채팅 응답
 */
export interface ChatResponse {
  message: string;
  suggestions: SuggestedQuestion[];
  confidence: number;
}

/**
 * 채팅 응답 근거 (문서 내 출처 정보)
 */
export interface AnswerSource {
  text: string;
  page?: number | null;
  field?: string | null;
}

/**
 * 채팅 응답 + 근거를 함께 다루기 위한 헬퍼 타입
 */
export interface ChatAnswerWithSources {
  response: ChatResponse;
  sources: AnswerSource[];
}

// ============================================================
// 취업지원금 자격 확인 관련 타입
// ============================================================

/**
 * 취업지원금 사용자 프로필 (입력 정보)
 */
export interface JobSupportUserProfile {
  // 기본 정보
  age: number;

  // 가구 정보
  household_size: number;

  // 소득 정보
  household_monthly_income: number | null;

  // 재산 정보
  household_total_assets: number | null;

  // 취업 경험
  work_experience_days: number | null;
  work_experience_hours: number | null;

  // 특별 조건
  is_receiving_unemployment: boolean;
  is_youth: boolean | null;
  is_senior: boolean | null;
  special_category:
    | "none"
    | "career_break_woman"
    | "special_worker"
    | "homeless";
}

/**
 * 취업지원금 자격 평가 결과
 */
export interface JobSupportEligibilityResult {
  eligible_type: "type_1" | "type_2" | "ineligible";
  status_message: string;
  expected_benefit: string | null;
  checklist: string[];
  warnings: string[];
}
