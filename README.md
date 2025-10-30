# pdfchatbot

Next.js + TypeScript + Supabase 기반 PDF RAG 챗봇

---

## 주요 기능

- PDF 업로드 시 자동 텍스트 추출, 조문 단위 청크 분할, 임베딩 생성, Supabase 벡터 DB 저장, public/data로 복사
- 질문 → 벡터 DB top-k 검색 → context로 LLM 호출 → 답변+참고문서(다운로드 링크) 반환
- 2025 트렌드 UI/UX(파스텔톤, 그라데이션, 라운드 스크롤바, 미니멀 아이콘, 반응형 등)

---

## 폴더 구조

```
/app/api/rag/route.ts      # RAG API
/components                # 프론트엔드 컴포넌트
/scripts/ingest-pdf.ts     # PDF 인게스트 자동화
/scripts/watcher.ts        # data 폴더 감시 자동화
/utils, /db                # 유틸리티, DB 핸들러
/public/data               # 다운로드용 PDF
```

---

## 사용법

1. `.env.local`에 환경변수 등록
2. 의존성 설치  
   ```bash
   npm install
   ```
3. Supabase DB 준비 (pgvector, 테이블, 함수)
4. PDF 업로드: `/data` 폴더에 PDF 파일 추가
5. 인게스트:  
   - 수동:  
     ```bash
     node --loader ts-node/esm scripts/ingest-pdf.ts
     ```
   - 자동:  
     ```bash
     node --loader ts-node/esm scripts/watcher.ts
     ```
6. Next.js 서버 실행  
   ```bash
   npm run dev
   ```
7. 챗봇에서 질문 → 답변 + 참고문서(다운로드 링크) 확인

---

## 확장성

- 다양한 LLM(Gemini, OpenAI 등) 연동 가능
- 청크 분할/임베딩/검색 방식 커스터마이즈
- 프론트엔드 디자인 반복 개선 및 피드백 반영
- PDF 외 다양한 문서 포맷 확장 가능

---

## 환경변수 예시

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
```
# pdfchatbot
