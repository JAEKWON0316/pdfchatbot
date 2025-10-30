import { supabase } from './supabaseClient';
import { getEmbedding } from './embedding';

// Define the structure of the returned chunks to include law_name
export interface LawChunk {
  id: number;
  law_name: string;
  law_article_number: string;
  law_article_title: string;
  content: string;
  // Optional fields from match_pdf_chunks for hybrid search results
  similarity?: number;
  keyword_score?: number;
  final_score?: number;
}

/**
 * '제1조'와 같이 특정 조항을 직접 검색합니다.
 * @param articleNumber - 검색할 조항 번호 (예: "제1조")
 */
export async function getArticleDirectly(
  articleNumber: string,
): Promise<LawChunk[]> {
  const { data, error } = await supabase.rpc('get_article_by_number', {
    p_article_number: articleNumber,
  });

  if (error) {
    console.error('Error getting article directly:', error);
    return [];
  }
  return (data as LawChunk[]) || [];
}

/**
 * 사용자의 일반 질문에 대해 하이브리드 검색을 수행합니다.
 * @param question - 사용자 질문
 * @param topK - 반환할 결과 수
 */
export async function getRagContext(
  question: string,
  topK = 5,
): Promise<LawChunk[]> {
  const embedding = await getEmbedding(question);

  console.log(
    '#### 생성된 질문 임베딩 (첫 5개 값):',
    embedding ? embedding.slice(0, 5) : 'Embedding is null or undefined',
  );

  const { data, error } = await supabase.rpc('match_pdf_chunks', {
    query_embedding: embedding,
    question_text: question,
    match_count: topK,
    similarity_weight: 0.4,
    keyword_weight: 0.6,
  });

  if (error) {
    console.error('Error matching chunks:', error);
    return [];
  }

  return (data as LawChunk[]) || [];
}
