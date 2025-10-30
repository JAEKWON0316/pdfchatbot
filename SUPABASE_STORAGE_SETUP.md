# Supabase Storage PDF 업로드 가이드

## 📦 PDF 파일을 Supabase Storage에 업로드

### 1. 환경변수 확인

`.env.local` 파일에 Supabase 설정이 있는지 확인:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. PDF 업로드 스크립트 실행

```bash
npm run upload-pdfs
```

또는:
```bash
node --loader ts-node/esm scripts/upload-pdfs-to-supabase.ts
```

### 3. Supabase Dashboard 확인

1. Supabase Dashboard 접속
2. **Storage** 메뉴 클릭
3. **pdfs** 버킷 확인
4. 업로드된 PDF 파일 확인

### 4. 버킷 공개 설정 확인

1. **pdfs** 버킷 클릭
2. **Configuration** 탭
3. **Public bucket** 활성화 확인

### 5. 배포

백엔드를 재배포하면 자동으로 Supabase Storage의 PDF를 사용합니다.

```bash
cd backend
npm run build
# EC2 배포 또는 로컬 테스트
```

## 🔗 작동 방식

```
사용자 → 참고문헌 클릭
    ↓
/api/files/{filename}
    ↓
Supabase Storage Public URL
    ↓
PDF 다운로드
```

## ✅ 장점

- ✅ GitHub 용량 제한 없음
- ✅ Vercel 빌드 크기 제한 없음
- ✅ 빠른 CDN 제공
- ✅ 무료 (Supabase 프리티어 1GB)