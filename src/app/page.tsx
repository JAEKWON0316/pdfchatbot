"use client";
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatSection from '@/components/ChatSection';
import ChatInput from '@/components/ChatInput';

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  time: string;
  references?: string[];
  isError?: boolean;
  onRetry?: () => void;
}

function formatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      time: formatTime(new Date()),
    };
    
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      role: 'bot',
      content: '',
      time: formatTime(new Date()),
      references: [],
    };

    const tempMessages = [...messages, userMessage, botMessage];
    setMessages(tempMessages);
    setIsLoading(true);

    const processRequest = async () => {
      try {
        // Vercel rewrites를 사용하므로 상대 경로 사용
        const response = await fetch('/api/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: '서버 응답을 파싱할 수 없습니다.'}));
          throw new Error(errorData.error || `API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // 답변을 한 번에 설정
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessage.id
              ? { 
                  ...msg, 
                  content: data.answer || '답변을 받을 수 없습니다.',
                  references: data.references || []
                }
              : msg
          )
        );

      } catch (e) {
        console.error("API request error:", e);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessage.id
              ? { 
                  ...msg, 
                  content: '', // 에러 내용은 카드에서 직접 처리
                  isError: true, 
                  onRetry: () => {
                    // 재시도 시, 에러 메시지를 제외한 마지막 사용자 메시지까지의 기록으로 복원하고 다시 요청
                    const messagesForRetry = tempMessages.slice(0, -1);
                    setMessages(messagesForRetry);
                    handleSend(input);
                  }
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    processRequest();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 bg-gradient-to-br from-purple-50 via-indigo-50 via-blue-50 to-purple-100">
        <ChatSection messages={messages} isLoading={isLoading} />
      </main>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
      <Footer />
    </div>
  );
}
