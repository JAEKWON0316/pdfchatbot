import { supabase } from '../utils/supabaseClient';

export async function insertPdfChunk(chunk: {
  article_number: string;
  title: string;
  content: string;
  embedding: number[];
  file_name: string;
  page_number: number;
}) {
  const { data, error } = await supabase.from('pdf_chunks').insert([chunk]);
  if (error) throw error;
  return data;
}

export async function matchPdfChunks(queryEmbedding: number[], matchCount = 5) {
  const { data, error } = await supabase.rpc('match_pdf_chunks', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });
  if (error) throw error;
  return data;
}
