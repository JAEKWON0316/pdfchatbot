# AI PDF 기반 챗봇 프로젝트 설계 및 구현 가이드

---

## 1. 프로젝트 개요

회사 내 규정집 등 PDF 파일을 쉽게 업로드하여 (./data/) 이 위치에 저장 
자동 OCR, 텍스트 분할, 임베딩 생성 후 벡터 DB에 저장,  
사용자가 웹에서 자연어 질문 시 PDF 내용을 기반으로 답변하는 AI 챗봇 서비스 구축  
모바일 친화적 웹사이트(반응형 웹사이트)
Next.js, typescript, api route로 구현
---

## 2. 개발 단계 및 MVP 구현

1단계 (MVP):
Google Gemini API의 PDF 직접 입력 기능을 활용하여
PDF 파일을 API 호출 시 file 타입으로 직접 전달해 질의응답 구현
→ 별도의 OCR·텍스트 전처리 없이 빠른 프로토타입 개발 가능

2단계 (확장):
PDF 파일에서 텍스트를 추출해 청크 분할 후 임베딩 생성
Supabase 벡터 DB 등으로 저장 및 고도화된 벡터 검색 시스템 구축
→ 문서 검색 효율성 및 응답 정확도 향상

## 3. 참고 및 최신 문서
Google Generative AI, Gemini API 관련 최신 문서 및 SDK 가이드는
https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai
에서 확인 가능

## 4. UI/UX 참고
실제 챗봇 UI 및 사용자 경험은
https://koreaskatechatbot.vercel.app/
사이트의 UI와 유사하게,
Playwright와 MCP(개발자 자동화 도구)를 활용해 크롤링

사용자 친화적인 질문 입력, 응답 표시 인터페이스 설계 권장

## 5. 요약
| 단계    | 주요 내용                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| MVP   | Gemini API의 PDF 파일 직접 전달 방식으로 빠른 프로토타입 완성                                                                  |
| 확장    | Supabase 벡터 DB와 LangChain 활용, 고도화된 문서 검색/QA 구축                                                             |
| 최신 문서 | [ai-sdk.dev - Google Generative AI](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai) 참조 |
| UI    | [koreaskatechatbot.vercel.app](https://koreaskatechatbot.vercel.app/) UI를 참고해 Playwright MCP 활용 가능         |


## 6. 시스템 아키텍처

```mermaid
graph LR
  PDF_Folder["📂 로컬/서버 PDF 폴더"] -->|폴더 변경 감지| Ingestion_Service["⚙️ 인게스트 서비스"]
  Ingestion_Service -->|텍스트 추출 + 청크 분할| Text_Chunks["🧩 텍스트 청크"]
  Text_Chunks -->|임베딩 생성| Embedding_DB["🗄️ Supabase 벡터 DB"] --> [Supabase mcp로 pdfchatbot 프로젝트 확인인]
  User_Question["🙋‍♂️ 사용자 질문"] -->|질의 전달| Chat_API["🤖 챗봇 API (LangChain + LLM)"]
  Chat_API -->|벡터 DB 검색| Embedding_DB
  Embedding_DB -->|유사 문서 반환| Chat_API
  Chat_API -->|응답 생성| User_Question

