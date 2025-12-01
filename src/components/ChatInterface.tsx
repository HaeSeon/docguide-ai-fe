"use client";

import { useState, useRef, useEffect } from "react";
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  DocAnalysisResult,
  SuggestedQuestion,
} from "@/lib/types";
import ChatBubble from "./ChatBubble";
import SuggestedQuestions from "./SuggestedQuestions";

interface ChatInterfaceProps {
  docResult: DocAnalysisResult;
}

export default function ChatInterface({ docResult }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 초기 추천 질문 로드
  useEffect(() => {
    loadInitialSuggestions();
  }, []);

  const loadInitialSuggestions = async () => {
    try {
      const docType = docResult.extracted.docType;
      const response = await fetch(
        `http://localhost:8000/api/chat/suggestions/${docType}?limit=3`
      );
      if (response.ok) {
        const data: SuggestedQuestion[] = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error("추천 질문 로드 실패:", err);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    setError(null);

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const requestBody: ChatRequest = {
        doc_id: docResult.id,
        doc_context: docResult,
        messages: updatedMessages,
      };

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `서버 오류가 발생했습니다. (${response.status})`
        );
      }

      const data: ChatResponse = await response.json();

      // AI 응답 추가
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error("채팅 오류:", err);
      setError(
        err instanceof Error
          ? err.message
          : "답변 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl bg-white shadow-lg sm:rounded-2xl">
      {/* 헤더 */}
      <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
              AI에게 질문하기
            </h3>
            <p className="text-xs text-gray-500">
              이 문서에 대해 궁금한 점을 물어보세요
            </p>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" style={{ minHeight: "300px" }}>
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-4 text-4xl">🤖</div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              문서에 대해 무엇이든 물어보세요!
            </p>
            <p className="text-xs text-gray-500">
              납부 기한, 금액, 방법 등을 확인할 수 있습니다
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatBubble key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* 추천 질문 */}
      {suggestions.length > 0 && !isLoading && (
        <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
          <SuggestedQuestions
            questions={suggestions}
            onSelect={(q) => sendMessage(q)}
          />
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            placeholder="궁금한 점을 입력하세요..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-6"
          >
            {isLoading ? "..." : "전송"}
          </button>
        </div>
      </div>
    </div>
  );
}

