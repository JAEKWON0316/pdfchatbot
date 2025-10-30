import { IoPersonCircle, IoChatbubbleEllipses } from 'react-icons/io5';

interface ChatMessageFlatProps {
  role: 'user' | 'bot';
  content: string;
  time: string;
  references?: string[];
}

const ChatMessageFlat = ({ role, content, time, references }: ChatMessageFlatProps) => (
  <div className={`flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`flex items-end gap-2 max-w-[80%] ${role === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className="flex flex-col items-center">
        {role === 'user' ? (
          <IoPersonCircle className="text-3xl text-blue-400" />
        ) : (
          <IoChatbubbleEllipses className="text-3xl text-purple-400" />
        )}
        <span className="text-[10px] text-gray-400 mt-1">{time}</span>
      </div>
      <div className={`rounded-2xl px-4 py-3 text-base whitespace-pre-line shadow ${role === 'user' ? 'bg-blue-50 text-blue-900' : 'bg-white text-gray-900 border border-gray-100'}`}
        style={{ minWidth: 60 }}>
        {content}
        {role === 'bot' && references && references.length > 0 && (
          <div className="mt-2 border-t pt-2 text-xs text-gray-400">
            <div className="font-bold mb-1">참고 문서</div>
            <ul className="flex flex-wrap gap-2">
              {references.map((ref, i) => (
                <li key={i}>
                  <a href={`/data/${ref}`} download className="underline text-blue-500 hover:text-blue-700">{ref}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ChatMessageFlat;
