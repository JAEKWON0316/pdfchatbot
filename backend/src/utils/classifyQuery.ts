export type QueryClassification = {
  type: 'article_lookup' | 'semantic_query';
  articleNumbers?: string[];
  keywords: string[];
};

/**
 * 사용자의 질문을 분석하여 '조문 검색' 또는 '의미 기반 검색'으로 분류하고, 키워드를 추출합니다.
 * @param query 사용자의 질문 문자열
 * @returns 분류 결과 객체
 */
export function classifyQuery(query: string): QueryClassification {
  // "제1조", "1조", "제2조의2" 등과 같은 패턴을 찾기 위한 정규식
  const articleRegex = /(?:제\s?)?(\d+조(?:의\d+)?)/g;
  const matches = [...query.matchAll(articleRegex)];

  // 조문 번호와 관련 없는 순수 키워드를 추출
  const keywords = query
    .replace(articleRegex, '') // 조문 패턴을 제거
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거
    .split(/\s+/)
    .filter(kw => kw.length > 0 && kw.trim() !== '제'); // 빈 문자열 및 '제' 키워드 제외

  if (matches.length > 0) {
    // 조문 번호가 하나라도 발견되면, '조문 검색'으로 분류
    const articleNumbers = new Set<string>();
    matches.forEach(match => {
      const articleNum = match[1]; // 예: "1조" 또는 "2조의2"
      // '7조' 와 '제7조' 형태 모두를 포함하여 검색 정확도 향상
      articleNumbers.add(articleNum.startsWith('제') ? articleNum : `제${articleNum}`);
      articleNumbers.add(articleNum.replace(/^제/, ''));
    });
    
    return {
      type: 'article_lookup',
      articleNumbers: [...articleNumbers],
      keywords: keywords, // 조문 검색 시에도 키워드를 함께 반환
    };
  }

  // 조문 번호가 없는 경우, '의미 기반 검색'으로 분류
  return {
    type: 'semantic_query',
    keywords: keywords,
  };
}