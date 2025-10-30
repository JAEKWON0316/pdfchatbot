# Vercel 배포 가이드

## 🚀 빠른 배포 (5분 완성)

### 1. GitHub 저장소 생성 및 푸시

```bash
# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: PDF Chatbot with EC2 backend"

# GitHub 저장소 생성 후 연결
git remote add origin https://github.com/your-username/pdfchatbot.git

# 푸시
git branch -M main
git push -u origin main
```

### 2. Vercel 배포

#### 방법 1: Vercel 웹사이트 (추천)

1. **Vercel 접속**: https://vercel.com
2. **GitHub로 로그인**
3. **New Project** 클릭
4. **Import Git Repository** 선택
5. 방금 만든 저장소 선택
6. **Configure Project**:
   - Framework Preset: Next.js (자동 감지됨)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
7. **Environment Variables** 추가:
   ```
   NEXT_PUBLIC_API_URL = http://3.25.51.77:3001
   ```
8. **Deploy** 클릭!

#### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 배포 후 확인

배포가 완료되면 Vercel이 URL을 제공합니다:
```
https://your-project-name.vercel.app
```

해당 URL로 접속하여 챗봇이 정상 작동하는지 확인하세요!

## 🔧 환경변수 설정

Vercel 대시보드에서:
1. **프로젝트 선택**
2. **Settings** → **Environment Variables**
3. 다음 변수 추가:

```
Name: NEXT_PUBLIC_API_URL
Value: http://3.25.51.77:3001
Environment: Production, Preview, Development
```

## 🌐 커스텀 도메인 연결 (선택사항)

1. Vercel 대시보드 → **Settings** → **Domains**
2. **Add Domain** 클릭
3. 도메인 입력 (예: mychatbot.com)
4. DNS 설정 안내에 따라 설정

## 🔄 자동 배포 설정

GitHub에 푸시하면 자동으로 Vercel에 배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "Update feature"
git push

# Vercel이 자동으로 배포 시작!
```

## ⚠️ 주의사항

### CORS 문제 해결

EC2 백엔드에서 Vercel 도메인을 허용해야 합니다.

EC2에 SSH 접속 후:

```bash
cd ~/backend

# .env 파일 수정
nano .env
```

`FRONTEND_URL`을 Vercel URL로 변경:
```
FRONTEND_URL=https://your-project-name.vercel.app
```

서버 재시작:
```bash
pm2 restart pdfchatbot-backend
```

## 📊 배포 상태 확인

- **Vercel 대시보드**: https://vercel.com/dashboard
- **배포 로그**: 각 배포의 상세 로그 확인 가능
- **Analytics**: 방문자 통계 확인

## 🐛 문제 해결

### 빌드 실패
- Vercel 대시보드에서 빌드 로그 확인
- 로컬에서 `npm run build` 테스트

### API 연결 실패
- 환경변수 `NEXT_PUBLIC_API_URL` 확인
- EC2 보안 그룹에서 3001 포트 확인
- EC2 서버 상태 확인: `pm2 status`

### CORS 오류
- EC2 백엔드의 `FRONTEND_URL` 설정 확인
- 백엔드 재시작: `pm2 restart pdfchatbot-backend`

## 🎉 배포 완료!

축하합니다! 이제 전 세계 어디서나 접속 가능한 PDF 챗봇이 완성되었습니다!

### 최종 시스템 구조:

```
┌─────────────────────────┐
│   프론트엔드 (Vercel)    │
│   https://xxx.vercel.app │
└───────────┬─────────────┘
            │ HTTPS
            ↓
┌─────────────────────────┐
│   백엔드 API (EC2)       │
│   http://3.25.51.77:3001│
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│   Supabase DB           │
│   (벡터 검색)            │
└─────────────────────────┘
```