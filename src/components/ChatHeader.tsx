export default function ChatHeader() {
  return (
    <header className="w-full flex flex-col items-center py-6 bg-white border-b">
      <h1 className="text-2xl font-bold text-blue-700">대한롤러스포츠연맹 챗봇</h1>
      <p className="text-gray-500 mt-1">정관 및 규정에 대한 궁금한 점을 자유롭게 물어보세요.<br />
        <span className="text-blue-500">AI가 관련 조항을 찾아 정확한 답변을 드립니다.</span>
      </p>
    </header>
  );
}
