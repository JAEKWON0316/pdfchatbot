export default function ChatHelp() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 px-2 py-1">
      <span className="font-semibold">Enter</span>로 전송, <span className="font-semibold">Shift+Enter</span>로 줄바꿈
      <span className="ml-2 text-blue-500">더 정확한 답변을 위해 구체적으로 질문해 주세요!</span>
    </div>
  );
}
