const ChatBotHero = () => (
  <section className="w-full flex flex-col items-center justify-center py-16">
    <div className="bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-3xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Jack1 PDF 챗봇</h1>
      <p className="text-base md:text-lg text-gray-500 mb-4 text-center font-semibold">
        회사 규정집, 업무 매뉴얼 등 PDF 파일 기반으로<br />
        궁금한 점을 AI에게 자유롭게 질문하세요.
      </p>
      <ul className="text-xs text-gray-400 mb-4 list-disc list-inside text-left">
        <li>PDF 파일명 또는 내용을 포함해 질문하면 더 정확한 답변</li>
        <li>인삿말/일상 대화는 안내 메시지로 대체</li>
        <li>최신 트렌드 UI/UX, 반응형, 애니메이션 적용</li>
      </ul>
      <div className="flex gap-2 mt-2">
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Gemini API</span>
        <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">Next.js 14</span>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">TailwindCSS 3.4.1</span>
      </div>
    </div>
  </section>
);

export default ChatBotHero;
