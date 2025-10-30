import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 로드
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  throw new Error('Missing required environment variables');
}

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function getOpenAI() {
  return new OpenAI({ apiKey: OPENAI_API_KEY });
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const PUBLIC_DATA_DIR = path.resolve(process.cwd(), "public/data");

async function extractTextFromPDF(filePath: string) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

function splitByArticle(text: string) {
  const regex = /(제\d+조[\s\S]*?)(?=제\d+조|$)/g;
  const matches = text.match(regex);
  if (!matches) return [];

  return matches.map((chunk) => {
    const cleanedChunk = chunk.trim();
    const articleMatch = cleanedChunk.match(/^(제\d+조)/);
    const article_number = articleMatch ? articleMatch[0] : "";

    const lines = cleanedChunk.split('\n');
    const title = lines[0].replace(/^(제\d+조\s*)/, '').trim();

    return {
      article_number,
      title,
      content: cleanedChunk,
    };
  });
}

function generateKeywords(title: string, content: string): string[] {
  const textToProcess = `${title} ${content}`;
  const keywords = textToProcess
    .toLowerCase()
    .replace(/제\d+조/g, '')
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);

  return [...new Set(keywords)];
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text.replace(/\n/g, ' '),
  });
  return res.data[0].embedding;
}

export async function ingestPDF(filePath: string) {
  const fileName = path.basename(filePath);

  console.log(`[${fileName}] DB에서 파일 처리 상태를 확인합니다...`);
  const { data: existingFile, error: checkError } = await getSupabase()
    .from("pdf_files")
    .select("status")
    .eq("file_name", fileName)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error(`[${fileName}] 처리 상태 확인 중 오류 발생:`, checkError);
    return;
  }

  if (existingFile?.status === 'completed') {
    console.log(`[${fileName}] 이미 처리가 완료된 파일입니다. 건너뜁니다.`);
    return;
  }

  console.log(`[${fileName}] 데이터화를 시작합니다.`);
  const { data: fileRecord, error: insertFileError } = await getSupabase()
    .from('pdf_files')
    .upsert({ file_name: fileName, status: 'processing' }, { onConflict: 'file_name' })
    .select('id')
    .single();

  if (insertFileError || !fileRecord) {
    console.error(`[${fileName}] pdf_files 테이블에 기록 실패:`, insertFileError);
    return;
  }

  try {
    const text = await extractTextFromPDF(filePath);
    const articles = splitByArticle(text);

    for (const [i, article] of articles.entries()) {
      const embedding = await getEmbedding(article.content);
      const keywords = generateKeywords(article.title, article.content);

      const { error: chunkError } = await getSupabase().from("pdf_chunks").insert({
        file_id: fileRecord.id,
        law_article_number: article.article_number,
        law_article_title: article.title,
        content: article.content,
        embedding,
        keywords,
      });

      if (chunkError) {
        throw new Error(`조각(chunk) 삽입 실패: ${chunkError.message}`);
      } else {
        console.log(`[${fileName}] 조각 ${i + 1}/${articles.length} 처리 완료`);
      }
    }

    await getSupabase()
      .from('pdf_files')
      .update({ status: 'completed', chunk_count: articles.length })
      .eq('id', fileRecord.id);

    // public/data로 복사
    if (!fs.existsSync(PUBLIC_DATA_DIR)) {
      fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
    }
    fs.copyFileSync(filePath, path.join(PUBLIC_DATA_DIR, fileName));
    console.log(`[${fileName}] 성공적으로 인게스트 및 복사 완료.`);

  } catch (error) {
    console.error(`[${fileName}] 처리 중 심각한 오류 발생:`, error);
    await getSupabase()
      .from('pdf_files')
      .update({ status: 'failed' })
      .eq('id', fileRecord.id);
    throw error;
  }
}

// CLI에서 직접 실행할 때
if (import.meta.url === `file://${process.argv[1]}`) {
  async function main() {
    if (!fs.existsSync(DATA_DIR)) {
      console.error("data 폴더가 없습니다.");
      return;
    }

    const targetFile = process.argv[2];
    if (targetFile) {
      console.log("지정 파일만 인게스트:", targetFile);
      await ingestPDF(targetFile);
    } else {
      const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".pdf"));
      console.log("실제 처리할 파일 목록:", files);
      for (const file of files) {
        await ingestPDF(path.join(DATA_DIR, file));
      }
    }
  }

  main().catch(console.error);
}