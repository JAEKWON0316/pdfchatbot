import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 로드
const envPath = path.resolve(__dirname, '../.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ .env.local 파일을 찾을 수 없습니다:', result.error);
  process.exit(1);
}

console.log('✅ .env.local 파일 로드 완료');

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('SUPABASE_URL:', SUPABASE_URL ? '설정됨' : '없음');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '없음');
  process.exit(1);
}

console.log('✅ Supabase 환경변수 확인 완료');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DATA_DIR = path.resolve(__dirname, '../public/data');
const BUCKET_NAME = 'pdfs';

async function createBucketIfNotExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log('📦 버킷 생성 중...');
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });
    if (error) {
      console.error('❌ 버킷 생성 실패:', error);
      return false;
    }
    console.log('✅ 버킷 생성 완료');
  } else {
    console.log('✅ 버킷이 이미 존재합니다');
  }
  return true;
}

async function uploadPDFs() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error('❌ public/data 폴더가 없습니다.');
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.pdf'));
  console.log(`📄 ${files.length}개의 PDF 파일 발견`);

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);

    // 파일명을 영문으로 매핑
    const fileNameMap: { [key: string]: string } = {
      '공직선거법(법률).pdf': 'election-law.pdf',
      '국회법(법률).pdf': 'national-assembly-law.pdf',
      '대한민국헌법(헌법).pdf': 'constitution.pdf',
      '헌법재판소법(법률).pdf': 'constitutional-court-law.pdf',
    };

    const safeFileName = fileNameMap[file] || file.replace(/[^a-zA-Z0-9.-]/g, '_');

    console.log(`📤 업로드 중: ${file} → ${safeFileName}`);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(safeFileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error(`❌ ${file} 업로드 실패:`, error);
    } else {
      console.log(`✅ ${file} 업로드 완료`);

      // 공개 URL 생성
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(safeFileName);

      console.log(`   URL: ${data.publicUrl}`);
    }
  }
}

async function main() {
  console.log('🚀 Supabase Storage에 PDF 업로드 시작...\n');

  const bucketReady = await createBucketIfNotExists();
  if (!bucketReady) {
    console.error('❌ 버킷 준비 실패');
    return;
  }

  await uploadPDFs();

  console.log('\n✅ 모든 PDF 업로드 완료!');
  console.log('\n📋 다음 단계:');
  console.log('1. Supabase Dashboard에서 Storage > pdfs 확인');
  console.log('2. 파일이 public으로 설정되었는지 확인');
}

main().catch(console.error);