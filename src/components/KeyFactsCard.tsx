import type { ExtractedFields } from "@/lib/types";

interface KeyFactsCardProps {
  extracted: ExtractedFields;
}

export default function KeyFactsCard({ extracted }: KeyFactsCardProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-lg sm:rounded-2xl sm:p-8">
      <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
        문서 핵심 정보
      </h2>
      <dl className="space-y-3 sm:space-y-4">
        {extracted.title && (
          <div>
            <dt className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">
              공고명
            </dt>
            <dd className="text-base font-semibold text-gray-900 sm:text-lg">
              {extracted.title}
            </dd>
          </div>
        )}
        <div>
          <dt className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">
            문서 유형
          </dt>
          <dd className="text-base text-gray-900 sm:text-lg">
            {extracted.docType === "housing_application_notice"
              ? "주택청약 공고"
              : extracted.docType}
          </dd>
        </div>
        {extracted.deadline && (
          <div>
            <dt className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">
              신청/납부 기한
            </dt>
            <dd className="text-base font-semibold text-red-600 sm:text-lg">
              {extracted.deadline}
            </dd>
          </div>
        )}
        {extracted.authority && (
          <div>
            <dt className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">
              발급 기관
            </dt>
            <dd className="text-base text-gray-900 sm:text-lg">
              {extracted.authority}
            </dd>
          </div>
        )}
        {extracted.applicantType && (
          <div>
            <dt className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">
              대상
            </dt>
            <dd className="text-base text-gray-900 sm:text-lg">
              {extracted.applicantType}
            </dd>
          </div>
        )}
        {extracted.amount && (
          <div>
            <dt className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">
              금액
            </dt>
            <dd className="text-base font-semibold text-gray-900 sm:text-lg">
              {extracted.amount.toLocaleString()}원
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
