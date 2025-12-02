"use client";

interface DocumentViewerModalProps {
  isOpen: boolean;
  fileUrl: string | null;
  initialPage?: number | null;
  onClose: () => void;
}

export default function DocumentViewerModal({
  isOpen,
  fileUrl,
  initialPage,
  onClose,
}: DocumentViewerModalProps) {
  if (!isOpen || !fileUrl) return null;

  const pageParam =
    initialPage && initialPage > 0 ? `#page=${initialPage}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 sm:px-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              원본 문서 보기
            </h2>
            {initialPage && initialPage > 0 && (
              <p className="mt-0.5 text-xs text-gray-500">
                {initialPage} 페이지 근처에서 이 내용을 확인할 수 있어요
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <span className="sr-only">닫기</span>
            ✕
          </button>
        </div>

        {/* PDF 뷰어 */}
        <div className="flex-1 bg-gray-100">
          <iframe
            src={`${fileUrl}${pageParam}`}
            className="h-full w-full"
            title="문서 뷰어"
          />
        </div>
      </div>
    </div>
  );
}


