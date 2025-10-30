import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const GREETING_PATTERNS = [
  '안녕', '하이', 'hello', 'hi', 'ㅎㅇ', '잘 지내', '반가워', '굿모닝', '굿나잇', 'hello!', 'hi!', '안녕하세요', '좋은 아침', '잘 있었어', '잘 있었니', '잘 지냈어', '잘 지냈니', '오랜만', '헬로', '헬로우', '하이요', '하이~', '안녕~', '안녕!', '하이!', '반갑습니다', '반갑다', '반가워요', '하이하이', '하이~', '안녕하십니까'
];

const GUIDE_MESSAGE =
  '안녕하세요! PDF 챗봇입니다. 궁금한 점을 아래 입력창에 자유롭게 입력해 주세요.\n답변은 저장된 문서를 기반으로 AI가 제공합니다.';

function isGreeting(text: string) {
  const lower = text.trim().toLowerCase();
  return GREETING_PATTERNS.some((pattern) => lower.includes(pattern));
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ success: false, error: '질문이 필요합니다.' }, { status: 400 });
    }
    if (isGreeting(question)) {
      return NextResponse.json({ success: true, data: { text: GUIDE_MESSAGE } });
    }
    // data 폴더 내 모든 PDF 파일 읽기
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));
    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'data 폴더에 PDF 파일이 없습니다.' }, { status: 404 });
    }
    const pdfBuffers = files.map(filename => fs.readFileSync(path.join(dataDir, filename)));
    // 로그 추가: 실제 첨부되는 파일 정보 출력
    console.log('PDF 파일 목록:', files);
    pdfBuffers.forEach((buf, i) => {
      console.log(`파일명: ${files[i]}, 크기: ${buf.length} bytes`);
    });
    // Gemini API로 여러 PDF와 질문 전송 (항상 한국어로 답변하도록 프롬프트 가공)
    const prompt = `아래 질문에 대해 반드시 한국어로 답변해 주세요.\n질문: ${question}`;
    const fileParts = pdfBuffers.map((buf, i) => ({ type: 'file', data: buf, mimeType: 'application/pdf', name: files[i] }));
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: ([
            { type: 'text', text: prompt },
            ...fileParts,
          ]) as any,
        },
      ],
    });
    // Gemini 응답에서 실제 답변 텍스트만 추출
    const text = result?.text || '답변을 생성하지 못했습니다.';
    // 참고 문서 추출(필요시)
    // const references = ...; // 필요시 추출 로직 추가
    return NextResponse.json({ success: true, data: { text } });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
