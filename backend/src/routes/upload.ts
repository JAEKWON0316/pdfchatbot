import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ingestPDF } from '../scripts/ingest-pdf.js';

export const uploadRouter = express.Router();

// 업로드 디렉토리 설정
const uploadDir = path.join(process.cwd(), 'data');
const publicDataDir = path.join(process.cwd(), 'public/data');

// 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 한글 파일명 지원
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PDF 파일만 업로드 가능합니다.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB 제한
  }
});

// PDF 업로드 및 자동 인게스트
uploadRouter.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF 파일이 필요합니다.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    console.log(`📄 PDF 업로드 완료: ${fileName}`);

    // 자동 인게스트 실행
    try {
      await ingestPDF(filePath);
      console.log(`✅ 인게스트 완료: ${fileName}`);
      
      res.json({
        message: 'PDF 업로드 및 처리가 완료되었습니다.',
        fileName,
        status: 'success'
      });
    } catch (ingestError) {
      console.error(`❌ 인게스트 실패: ${fileName}`, ingestError);
      res.status(500).json({
        error: 'PDF 처리 중 오류가 발생했습니다.',
        fileName,
        details: ingestError instanceof Error ? ingestError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: '파일 업로드 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 업로드된 파일 목록 조회
uploadRouter.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir)
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        name: file,
        size: fs.statSync(path.join(uploadDir, file)).size,
        uploadDate: fs.statSync(path.join(uploadDir, file)).mtime
      }));

    res.json({ files });
  } catch (error) {
    console.error('File list error:', error);
    res.status(500).json({ error: '파일 목록을 가져올 수 없습니다.' });
  }
});