import express from 'express';
import { supabase } from '../utils/supabaseClient.js';

export const filesRouter = express.Router();

const BUCKET_NAME = 'pdfs';

// 한글 파일명을 영문으로 매핑
const fileNameMap: { [key: string]: string } = {
    '공직선거법': 'election-law.pdf',
    '국회법': 'national-assembly-law.pdf',
    '대한민국헌법': 'constitution.pdf',
    '헌법재판소법': 'constitutional-court-law.pdf',
};

// PDF 파일 목록 조회
filesRouter.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list();

        if (error) throw error;

        const files = data?.map(file => ({
            name: file.name.replace('.pdf', ''),
            url: supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name).data.publicUrl,
            size: file.metadata?.size,
            createdAt: file.created_at,
        })) || [];

        res.json({ files });
    } catch (error) {
        console.error('Files list error:', error);
        res.status(500).json({ error: '파일 목록을 가져올 수 없습니다.' });
    }
});

// 특정 PDF 파일 URL 조회
filesRouter.get('/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const decodedFilename = decodeURIComponent(filename);

        // 한글 파일명을 영문으로 변환
        const englishFilename = fileNameMap[decodedFilename] ||
            (decodedFilename.endsWith('.pdf') ? decodedFilename : `${decodedFilename}.pdf`);

        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(englishFilename);

        res.json({
            name: decodedFilename,
            url: data.publicUrl
        });
    } catch (error) {
        console.error('File URL error:', error);
        res.status(500).json({ error: '파일 URL을 가져올 수 없습니다.' });
    }
});