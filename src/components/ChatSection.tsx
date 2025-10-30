import ChatMessageCard from './ChatMessageCard';
import ChatHero from './ChatHero';
import { Message } from '@/app/page';
import { useRef, useEffect } from 'react';

interface ChatSectionProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatSection = ({ messages, isLoading }: ChatSectionProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className="flex-1 flex flex-col items-center justify-start w-full min-h-0 max-w-6xl mx-auto">
      <div className="w-full flex flex-col gap-8 py-12 px-6 flex-1 min-h-0">
      {messages.length === 0 ? (
        <ChatHero />
      ) : (
        messages.map((msg, i) => (
          <ChatMessageCard 
            key={msg.id} 
            {...msg} 
            isLoading={isLoading && i === messages.length - 1 && msg.role === 'bot'}
          />
        ))
      )}
        <div ref={messagesEndRef} />
        <div className="flex-shrink-0 h-8 md:h-12" />
    </div>
  </section>
);
};

export default ChatSection;
