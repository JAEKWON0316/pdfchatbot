# ⚖️ 대한민국 법률 기반 구조적 RAG 챗봇 워크플로우

> 이 시스템은 "제27조가 뭐야?" 같은 조문 번호 질의부터  
> "국회의원과 대통령의 임기기간은 각각 어떻게 돼?" 같은 비교 질문까지 정확히 응답하도록 설계된 구조입니다.

---

## 📌 핵심 설계 원칙

- ✅ PDF 법률 문서를 신뢰 가능한 출처로 사용
- ✅ 질문이 조문 번호 기반인지, 의미 기반인지 판별
- ✅ 필요한 경우 복수 조문을 찾아 비교 요약
- ✅ 응답에 실제 조문 인용과 출처 명시

---

## 🧱 시스템 구성 요약

```plaintext
PDF → 조문 단위 청크 분할 + 메타데이터 추가
↓
벡터 임베딩 (OpenAI 등) → Supabase.pgvector 저장
↓
질문 분석 (조문번호 추출, 키워드 추출)
↓
- 조문번호가 있다 → 직접 조회
- 키워드만 있다 → 유사도 검색
↓
여러 조문 관련 시 → N개 조문 LLM에 전달 → 요약/비교 생성
↓
응답 + 조문 출처 포함

1. 🧾 조문 단위 청크 분할
PDF → 텍스트 변환 후, 제XX조(의X)? 기준으로 Split

각 조문에는 다음 메타데이터 부여

{
  "law_name": "헌법",
  "article_number": "제70조",
  "title": "대통령의 임기",
  "content": "대통령의 임기는 5년으로 하며, 중임할 수 없다.",
  "tokens": 35
}

2. 🧠 질의 분류 로직 (핵심)
// utils/classifyQuery.ts

export function classifyQuery(query: string): {
  type: 'article_lookup' | 'semantic_query',
  articleNumbers?: string[],
  keywords?: string[]
} {
  const regex = /제\d+조(의\d+)?/g;
  const matches = query.match(regex);

  if (matches && matches.length > 0) {
    return {
      type: 'article_lookup',
      articleNumbers: matches
    };
  }

  // 키워드 추출은 일단 단순 분할로 처리
  const keywords = query
    .replace(/[^\w\s가-힣]/g, '')
    .split(/\s+/)
    .filter((kw) => kw.length > 1);

  return {
    type: 'semantic_query',
    keywords
  };
}

3. 🔍 검색 로직
조문 조회 모드


sql
복사
편집
SELECT * FROM law_chunks
ORDER BY embedding <#> '[질문 벡터]'
LIMIT 5;

4. 🤖 LLM 응답 생성 프롬프트
프롬프트 포맷:

css
복사
편집
[법령명 조문번호] 조문 내용

...

사용자 질문: {질문 원문}

위 조문들에 근거하여 질문에 대한 정확하고 요약된 법률적 설명을 생성하세요.  
비교가 필요한 경우는 항목별로 분리하고, 반드시 근거 조문 번호를 포함하세요.
예시 응답:

scss
복사
편집
대통령의 임기는 5년이며, 중임할 수 없습니다. (헌법 제70조)  
국회의원의 임기는 4년입니다. (헌법 제41조)

출처: 헌법 제41조, 제70조

5. 🎯 멀티조문 비교 응답 구조
요소	처리 방식
2개 이상 키워드 감지	→ 키워드별로 관련 Chunk 추출
조문 다중 조회	→ Top-k 후보 중 법령명 + 조문번호로 묶어 정렬
프롬프트에서 항목별 요약	→ LLM이 비교형 응답 생성 (예시: 대통령 vs 국회의원 임기)

6. 📤 조문 포함 응답 예시
Q. 국회의원과 대통령 임기기간은 각각 얼마나 돼?

diff
복사
편집
답변:

- 국회의원의 임기는 4년입니다. (헌법 제41조)
- 대통령의 임기는 5년이며, 중임할 수 없습니다. (헌법 제70조)

출처: 헌법 제41조, 제70조
