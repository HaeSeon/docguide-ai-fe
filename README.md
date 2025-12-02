## DocGuide AI – 공공문서 행동 가이드 & AI 질의응답 서비스

이 프로젝트는 **복잡한 공공문서(청약 공고, 세금·보험 고지서, 지원금 안내문 등)** 를 업로드하면,
사용자가 곧바로 **“언제까지 어디서 무엇을 해야 하는지”** 를 이해하고 행동할 수 있도록 돕는 서비스를 구현합니다.

프론트엔드(`docguide-ai-frontend`)와 백엔드 API(`docguide-ai-api`)로 구성된 풀스택 프로젝트입니다.

---

## 1. 해결하려는 문제

- 공공문서는 길고, 행정·법률 용어가 많아 일반 사용자가 **핵심 행동(납부/신청/문의)을 빠르게 이해하기 어렵다.**
- 특히 다음과 같은 Pain Point가 존재합니다.
  - **“언제까지, 어디서, 무엇을 해야 하는지”** 를 놓쳐 가산세·신청 기회 상실 등 경제적 손실 발생
  - 자신이 **신청 대상/자격이 되는지** 스스로 판단하기 어려움
  - 궁금한 점이 있어도 어디를 봐야 할지 몰라 전체 문서를 반복해서 읽게 됨

DocGuide AI는 이 문제를 다음과 같이 해결합니다.

- 문서 업로드 → **행동 중심 요약 + 해야 할 일(To‑Do) 카드** 생성
- 주택청약, 취업지원금 등은 **사용자 조건 입력 → 자격/가능성 평가**
- 문서에 대해 자연어로 질문하면 **AI가 답변 + “이 답변의 근거” + 원문 보기** 까지 제공

---

## 2. 전체 아키텍처

- **프론트엔드**: Next.js 14(App Router) + TypeScript + Tailwind CSS
  - 경로: `docguide-ai-frontend/`
- **백엔드 API**: FastAPI + Pydantic + OpenAI API
  - 경로: `docguide-ai-api/`
- **모델**
  - 문서 분석: `gpt-4.1-mini` (JSON 구조화 추출)
  - 질의응답: `gpt-4o-mini`
- **상태 저장**
  - 브라우저 `sessionStorage` (분석 결과, 업로드 파일 blob URL 등)

### 데이터 플로우

1. 사용자가 메인 페이지에서 **PDF/TXT 등 문서 업로드 (Next.js)**
2. 프론트엔드가 `FormData` 로 `docguide-ai-api /api/analyze` 호출
3. FastAPI가 파일 포맷에 따라 텍스트를 추출하고, LLM에 전달해 **구조화된 JSON 결과** 생성
4. 프론트엔드가 이 결과를 `sessionStorage` 에 저장하고 `/result` 페이지로 이동
5. 결과 페이지에서
   - **🎯 해야 할 일 카드** (행동 중심 요약)
   - 문서 유형별 핵심 정보 카드
   - 문서 유형에 따라 **“내 조건 적용/확인하기” 모달** 노출
   - 우측 패널에서 **문서 기반 AI 질의응답 + 근거 문장 + 원문 보기 뷰어** 제공

---

## 3. 백엔드(API) – 문서 분석 & 질의응답

경로: `docguide-ai-api/`

### 3.1 문서 분석 `/api/analyze`

#### 기능

- 업로드된 문서를 분석해서 다음 정보를 포함하는 **`DocAnalysisResult` JSON** 반환
  - `summary`:
    - 한 문장, **“YYYY-MM-DD까지 어디서 무엇을 하세요”** 형식의 행동 중심 요약
  - `actions[]`: 행동 항목
    - `type`: `pay | apply | check | none`
    - `label`, `deadline`, `link`
  - `extracted`: 문서 유형별 핵심 필드
    - `docType`: `housing_application_notice`, `income_tax`, `local_tax`, `year_end_tax`, `health_insurance`, `subsidy_notice` …
    - `title`, `amount`, `deadline`, `authority`, `applicantType`
  - `evidence[]`: 각 필드의 근거 문장 (텍스트, 페이지, confidence)
  - `uncertainty[]`: 확실하지 않은 값과 이유

#### 주요 기술 포인트

- **LLM을 구조화 정보추출 엔진으로 사용**
  - `app/models/schemas.py` 의 Pydantic 스키마(`DocAnalysisResult`)를 기준으로
  - `SYSTEM_PROMPT` 에 **정확한 JSON 스키마 + 다양한 예시** 를 명시
  - OpenAI `chat.completions` 에 `response_format={"type": "json_object"}` 를 사용해 JSON 강제
- **문서 유형 자동 감지**
  - LLM이 `extracted.docType` 을 문맥 기반으로 선택
  - 이후 프론트/채팅/추천질문에서 `docType` 에 따라 분기
- **PDF 텍스트 추출**
  - `pdfplumber` 로 페이지별 텍스트 추출 후 전체 텍스트 생성
  - TXT는 UTF‑8 기준 디코딩

### 3.2 문서 기반 질의응답 `/api/chat`

#### 기능

- 분석된 문서(`DocAnalysisResult`)와 대화 히스토리를 바탕으로 자연어 질문에 답변
- 문서 유형에 맞는 **추천 질문** 과, **이 답변의 근거(sources[])** 를 함께 반환

#### 요청/응답 스키마

- `ChatRequest`
  - `doc_id`: 문서 ID
  - `doc_context`: `DocAnalysisResult`
  - `messages[]`: 과거 대화 (`role=user|assistant|system`)
- `ChatResponse`
  - `message`: AI 답변
  - `suggestions[]`: 다음에 물어보기 좋은 추천 질문
  - `confidence`: 답변 신뢰도(현재 0.9)
  - `sources[]` (`AnswerSource`)
    - `text`: 답변의 근거가 된 문장/문단
    - `page?`: 해당 내용이 포함된 페이지 번호(알려진 경우)
    - `field?`: 연관된 필드명(ex. `deadline`, `amount`)

#### 기술 포인트

- **문서 컨텍스트 + 대화 히스토리 기반 프롬프트 구성**
  - `app/core/prompts.py` 의 `get_chat_prompt(doc_context)` 에서
    - 문서 요약, 추출 정보, 행동 안내를 요약해서 system 프롬프트에 삽입
- **경량 RAG + 근거 선택 로직**
  - `DocAnalysisResult.evidence[]` 중에서
    - 마지막 사용자 질문의 키워드와 가장 많이 겹치는 항목 상위 3개를 선택
    - 이를 `sources[]` 로 내려 프론트에서 “이 답변의 근거” 로 표시
- **문서 유형별 추천 질문**
  - `SUGGESTED_QUESTIONS[docType]` 에 미리 정의된 템플릿 기반
  - “언제까지 내야 하나요?”, “어디서 신청하나요?” 등 핵심 질문을 빠르게 유도

### 3.3 자격/신청 가능성 평가

#### `/api/analyze/eligibility` – 주택청약

- 입력: `EligibilityUserProfile` + `DocAnalysisResult`
- 출력: `EligibilityResult`
  - `status`: `eligible | likely | ineligible | unknown`
  - `status_message`, `estimated_score`, `score_reference`, `checklist[]`
- LLM 프롬프트에서 실제 청약 기준(소득, 가구수, 특별공급 등) 예시를 제공하여  
  **간단한 조건 입력만으로 “신청 가능성 + 예상 배점 + 체크리스트”** 를 반환하도록 설계

#### `/api/analyze/job-support-eligibility` – 취업지원금(국민취업지원제도 등)

- 입력: `JobSupportUserProfile` (나이, 가구 소득·재산, 근무일수/시간, 실업급여 수급 여부, 특수 계층 등) + `DocAnalysisResult`
- 출력: `JobSupportEligibilityResult`
  - `eligible_type`: `type_1`(요건심사형) / `type_2`(선발형) / `ineligible`
  - `status_message`, `expected_benefit`, `checklist[]`, `warnings[]`
- 국민취업지원제도 I/II 유형의 기준을 프롬프트에 녹여  
  **LLM 기반 정책 판단 엔진** 처럼 활용

---

## 4. 프론트엔드 – UX & 상호작용

경로: `docguide-ai-frontend/`

### 4.1 메인 페이지 (`src/app/page.tsx`)

- 파일 업로드 UI
  - `accept=".pdf,.txt,.hwp,.doc,.docx,.jpg,.jpeg,.png"`
  - 선택한 파일 이름과 용량 표시, 제거 버튼
- “AI에게 해석 맡기기” 버튼 클릭 시:
  - `FormData` 로 `/api/analyze` 호출
  - 응답(`DocAnalysisResult`)을 `sessionStorage["doc-result"]` 에 저장
  - 업로드한 파일에 대해 `URL.createObjectURL(file)` 로 blob URL 생성 후  
    `sessionStorage["doc-file-url"]` 에 저장 → 이후 문서 뷰어에서 사용

### 4.2 결과 페이지 (`src/app/result/page.tsx`)

- 좌측: 문서 분석 결과
  - `ResultSummaryCard` 로 **🎯 해야 할 일 + 체크리스트 + 핵심 정보** 표시
  - 문서 유형이 `housing_application_notice` 인 경우:
    - “내 조건 적용하기” 버튼 → 주택청약 Eligibility 모달
  - 문서 유형이 `subsidy_notice`/`employment_support`/`job_support` 인 경우:
    - “내 조건으로 자격 확인하기” 버튼 → 취업지원금 Eligibility 모달
- 우측: 고정 채팅 패널
  - `ChatInterface` 에 `docResult` 와 `onOpenViewer(page?)` 전달

### 4.3 채팅 인터페이스 (`src/components/ChatInterface.tsx`)

- **기능**
  - 문서 유형별 추천 질문 3개 자동 로딩 (`/api/chat/suggestions/{docType}`)
  - 사용자가 질문하면:
    - 대화 히스토리와 함께 `/api/chat` 호출
    - AI 답변을 말풍선으로 표시
    - `sources[]` 를 이용해 **“📄 이 답변의 근거”** 블록 표시
      - 근거 텍스트 몇 줄 + (가능하면 `N페이지` 라벨)
      - 각 항목 옆에 **`원문 보기` 버튼** → 해당 페이지로 문서 뷰어 호출
  - 새 질문을 보낼 때는 이전 근거는 숨기고, **항상 “가장 최근 답변의 근거”만** 표시
- 헤더 우측 **전역 `원문 보기` 버튼**
  - 채팅을 하지 않았을 때도 언제든지 원본 PDF를 볼 수 있도록 제공

### 4.4 문서 뷰어 모달 (`src/components/DocumentViewerModal.tsx`)

- `isOpen`, `fileUrl`, `initialPage`, `onClose` props 사용
- `iframe src={`${fileUrl}#page=${initialPage}`}` 로 PDF 뷰어 표시
- 채팅 헤더의 “원문 보기” 버튼 또는 근거 리스트의 “원문 보기” 버튼에서 호출

### 4.5 자격 확인 모달들

- `JobSupportEligibilityModal.tsx`
  - 나이, 가구원 수, 가구 월 소득/재산, 근무일수/시간, 실업급여, 특수 계층 여부 입력
  - `/api/analyze/job-support-eligibility` 호출 → 결과 카드/체크리스트/주의사항 표시
- 결과 모달 UI는 **설문 최소화 + 결과 중심**으로 설계해  
  실제 사용자가 빠르게 “가능/불가 + 다음 행동”을 이해하도록 구성

---

## 5. 실행 방법 (로컬 개발)

### 5.1 백엔드(API)

```bash
cd docguide-ai-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

export OPEN_AI_KEY="your_openai_api_key"  # .env 사용 가능
uvicorn app.main:app --reload
```

### 5.2 프론트엔드

```bash
cd docguide-ai-frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 문서를 업로드하여 테스트할 수 있습니다.

---

## 6. 기술적 의미와 강점 요약

- **Action-oriented Summarization**
  - LLM을 이용해 단순 요약이 아니라 **“언제까지 어디서 무엇을 하세요”** 형태의 행동 지향 요약을 강제
- **Task-specific Prompt Orchestration**
  - 문서 분석, 청약 자격 평가, 취업지원금 자격 평가, Q&A 등 목적 별로 다른 시스템 프롬프트/스키마 사용
- **LLM + Rule 기반 Decision Engine**
  - LLM이 생성한 구조화 결과를 Pydantic으로 검증하고,  
    자격 판정 로직에 재사용하는 **하이브리드 구조**
- **근거 기반 문서 Q&A**
  - 답변마다 `evidence` 기반 근거 문장을 함께 보여주고,  
    원문 페이지로 바로 이동시키는 UX로 hallucination 리스크를 낮춤
- **도메인 특화 확장성**
  - `docType`, 스키마, 프롬프트 구조가 잘 분리되어 있어  
    새로운 공공문서 유형(장학금, 복지카드 등) 추가가 용이

---

## 7. 기술 전략 총정리 (Checklist)

이 프로젝트에서 사용한 **기술적 전략/아이디어**를 한 번에 정리하면 다음과 같습니다.

### 7.1 분석 단계

- **문서 유형 자동 분류**
  - LLM이 전체 텍스트를 보고 `extracted.docType` 을 결정  
    (`housing_application_notice`, `income_tax`, `local_tax`, `year_end_tax`, `health_insurance`, `subsidy_notice` …)
  - 이후 모든 로직(UI, 추천 질문, 자격 평가 등)이 이 `docType` 을 기준으로 분기
- **행동 중심 요약(Action-oriented summarization)**
  - `summary` 를 “언제까지 어디서 무엇을 하세요” 형식으로 강제
- **문서 특성에 따른 필드 추출**
  - 공고문: 제목/마감일/대상/기관 중심
  - 고지서: 금액/납부기한/납부처 중심
  - 연말정산/지원금: 제출기한/필요서류/지원 내용 중심
- **근거(evidence) & 불확실성(uncertainty)**
  - 각 필드별로 어떤 문장을 근거로 삼았는지, 신뢰도와 함께 저장

### 7.2 API & 모델링

- **Pydantic 기반 엄격한 스키마 설계**
  - `DocAnalysisResult`, `EligibilityResult`, `JobSupportEligibilityResult`, `ChatRequest/Response` 등
  - LLM 출력 → 스키마 검증 → UI 렌더링까지 타입을 일관되게 유지
- **Task-specific Prompt Orchestration**
  - 분석/청약 평가/취업지원금 평가/채팅 각각에 다른 시스템 프롬프트 사용
  - 여러 문서 유형 예시를 프롬프트에 포함해 Few-shot 학습 효과
- **경량 RAG + Answer Sources**
  - 완전한 벡터DB 대신, 분석 시 얻은 `evidence[]` 를 재활용해 “이 답변의 근거” 제공
- **문서 유형별 추천 질문 API**
  - `/api/chat/suggestions/{doc_type}` 로 도메인 지식을 캡슐화하여 프론트에서 재사용

### 7.3 프론트엔드 & UX

- **docType → UI 매핑**
  - 청약(`housing_application_notice`) → 주택청약용 Eligibility 모달 노출
  - 취업지원금/지원금(`subsidy_notice`, `employment_support`, `job_support`) → 취업지원 자격 모달 노출
  - 세금/보험/연말정산은 별도 모달 없이 요약 + 채팅 위주 UI
- **행동 우선 레이아웃**
  - 결과 페이지의 최상단을 항상 “🎯 해야 할 일” 카드로 구성
  - 세부 설명은 `자세히 보기` 토글로 숨겨서 인지 부하 최소화
- **조건 입력을 위한 모달 전략**
  - 문서 별로 필요한 정보만 물어보는 **경량 폼** 모달
  - 주택청약: 거주지/가구구성/소득/특별자격 등
  - 취업지원금: 나이/가구소득·재산/근무경험/실업급여/특수계층 등
- **문서 기반 AI 채팅**
  - 문서 유형별 추천 질문 버튼
  - 답변 아래 “📄 이 답변의 근거” 와 원문 보기 버튼
  - 새 질문 시 이전 근거 자동 숨김 → 항상 마지막 답변만 근거 표시
- **원문 뷰어 연동**
  - 업로드 시 생성한 blob URL을 `sessionStorage` 에 저장
  - 채팅/헤더의 `원문 보기` 버튼에서 PDF 뷰어 모달을 호출
  - 향후 evidence.page 와 연동해 페이지 점프까지 확장 가능

### 7.4 신뢰성 & 확장성

- **Hallucination 완화**
  - 프롬프트에서 “문서에 없는 정보는 추측하지 말 것”을 명시
  - 근거 문장을 함께 노출해 사용자가 직접 검증 가능하게 설계
- **도메인 확장 전략**
  - 새로운 문서 유형 추가 시:
    1. `docType` 정의
    2. 예시 프롬프트 추가
    3. 추천 질문/전용 모달(필요 시)만 추가하면 전체 파이프라인 재사용

위 목록이 현재 코드에 반영된 **주요 기술 전략 전부**입니다.  
README를 그대로 제출 자료 기반으로 사용하셔도, 기술적인 포인트는 빠짐없이 커버됩니다.

이 README는 프로젝트 전반의 구조와 기술적 의도를 요약합니다.  
보다 상세한 API 스펙이나 컴포넌트 설명이 필요하다면 `docguide-ai-api/README.md`, `docguide-ai-frontend/README.md` 에서 확장해 사용할 수 있습니다.
