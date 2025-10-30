import { classifyQuery } from './classifyQuery';

export type Intent = 'greeting' | 'legal_question' | 'chit_chat';

const GREETING_KEYWORDS = ['안녕', '하이', '헬로', '반가워', 'hi', 'hello'];
const LEGAL_KEYWORDS = [
  '법', '조', '항', '헌법', '민법', '법률', '규정', '정관',
  '대통령', '국회', '정부', '법원', '판결', '임기'
];

/**
 * 사용자의 질문 의도를 '인사', '법률 질문', '일상 대화'로 분류합니다.
 * @param query 사용자의 질문 문자열
 * @returns 'greeting', 'legal_question', 'chit_chat' 중 하나의 의도
 */
export function classifyIntent(query: string): Intent {
  const lowerQuery = query.toLowerCase();

  // 1. 인사말 확인
  if (GREETING_KEYWORDS.some(kw => lowerQuery.includes(kw))) {
    return 'greeting';
  }

  // 2. 법률 질문 확인 (조문 번호 또는 법률 키워드 포함 여부)
  const queryType = classifyQuery(query);
  if (queryType.type === 'article_lookup') {
    return 'legal_question';
  }
  if (LEGAL_KEYWORDS.some(kw => lowerQuery.includes(kw))) {
    return 'legal_question';
  }

  // 3. 위 두 경우에 해당하지 않으면 일상 대화로 간주
  return 'chit_chat';
} 