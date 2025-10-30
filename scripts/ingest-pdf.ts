import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 파일 로드 및 검증
const envPath = path.resolve(__dirname, "../.env.local");
const result = dotenv.config({ path: envPath });

if (result.error || !result.parsed) {
  console.error("Error loading .env.local file:", result.error);
  throw new Error("Failed to load environment variables from .env.local");
}
console.log(".env.local loaded successfully.");

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const DATA_DIR = path.resolve(__dirname, "../data");
const PUBLIC_DATA_DIR = path.resolve(__dirname, "../public/data");

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
    
    // 첫 줄을 제목으로 추출 시도
    const lines = cleanedChunk.split('\n');
    const title = lines[0].replace(/^(제\d+조\s*)/, '').trim();

    return {
      article_number,
      title,
      content: cleanedChunk, // 전체 내용을 content로 사용
    };
  });
}

/**
 * 조문 내용과 제목을 기반으로 검색용 키워드를 생성합니다.
 * @param title 조문 제목
 * @param content 조문 전체 내용
 * @returns 키워드 문자열 배열
 */
function generateKeywords(title: string, content: string): string[] {
  const textToProcess = `${title} ${content}`;
  const keywords = textToProcess
    .toLowerCase()
    .replace(/제\d+조/g, '') // "제1조" 같은 조항 번호 제거
    .replace(/[^\w\s가-힣]/g, ' ') // 특수문자를 공백으로 치환
    .split(/\s+/)
    .filter(word => word.length > 1); // 한 글자 단어 제외

  return [...new Set(keywords)]; // 중복 제거 후 반환
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.replace(/\n/g, ' '), // 임베딩 시 줄바꿈 제거
  });
  return res.data[0].embedding;
}

async function ingestPDF(filePath: string) {
  const fileName = path.basename(filePath);

  // --- 개선된 중복 확인 로직 (pdf_files 테이블 사용) ---
  console.log(`[${fileName}] DB에서 파일 처리 상태를 확인합니다...`);
  const { data: existingFile, error: checkError } = await supabase
    .from("pdf_files")
    .select("status")
    .eq("file_name", fileName)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // 'PGRST116'은 행이 없다는 에러
    console.error(`[${fileName}] 처리 상태 확인 중 오류 발생:`, checkError);
    return;
  }

  if (existingFile?.status === 'completed') {
    console.log(`[${fileName}] 이미 처리가 완료된 파일입니다. 건너뜁니다.`);
    return;
  }
  // --- 중복 확인 로직 끝 ---

  console.log(`[${fileName}] 데이터화를 시작합니다.`);
  const { data: fileRecord, error: insertFileError } = await supabase
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

      const { error: chunkError } = await supabase.from("pdf_chunks").insert({
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

    // 모든 조각 처리 후 상태 업데이트
    await supabase
      .from('pdf_files')
      .update({ status: 'completed', chunk_count: articles.length })
      .eq('id', fileRecord.id);

    // public/data로 복사
    fs.copyFileSync(filePath, path.join(PUBLIC_DATA_DIR, fileName));
    console.log(`[${fileName}] 성공적으로 인게스트 및 복사 완료.`);

  } catch (error) {
    console.error(`[${fileName}] 처리 중 심각한 오류 발생:`, error);
    // 오류 발생 시 상태를 'failed'로 업데이트
    await supabase
      .from('pdf_files')
      .update({ status: 'failed' })
      .eq('id', fileRecord.id);
  }
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error("data 폴더가 없습니다.");
    return;
  }
  if (!fs.existsSync(PUBLIC_DATA_DIR)) {
    fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
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
