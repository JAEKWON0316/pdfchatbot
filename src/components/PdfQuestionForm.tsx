"use client";
import { useRef, useState } from 'react';

interface PdfQuestionFormProps {
  onSubmit: (file: File, question: string) => void;
  loading: boolean;
}

export default function PdfQuestionForm({ onSubmit, loading }: PdfQuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !question.trim()) return;
    onSubmit(file, question);
  };

  return (
    <form className="flex flex-col gap-3 p-4 border rounded bg-white shadow" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium">PDF 파일 선택</label>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="border p-2 rounded"
        disabled={loading}
      />
      <label className="block text-sm font-medium">질문</label>
      <textarea
        className="border p-2 rounded min-h-[60px]"
        placeholder="질문을 입력하세요..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={loading || !file || !question.trim()}
      >
        {loading ? '전송 중...' : 'PDF와 질문 전송'}
      </button>
    </form>
  );
}
