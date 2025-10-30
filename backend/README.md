# PDF Chatbot Backend

Express.js 기반의 PDF RAG 챗봇 백엔드 API 서버입니다.

## 🚀 주요 기능

- **RAG API**: PDF 문서 기반 하이브리드 검색 및 답변 생성
- **파일 업로드**: PDF 업로드 및 자동 인게스트
- **벡터 검색**: Supabase pgvector를 활용한 의미 기반 검색
- **조문 검색**: 법률 조문 번호 기반 정확한 검색
- **의도 분류**: 인사, 법률 질문, 일상 대화 자동 분류

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── routes/
│   │   ├── rag.ts          # RAG API 라우터
│   │   └── upload.ts       # 파일 업로드 라우터
│   ├── utils/
│   │   ├── supabaseClient.ts
│   │   ├── embedding.ts
│   │   ├── classifyQuery.ts
│   │   └── intentClassifier.ts
│   ├── scripts/
│   │   └── ingest-pdf.ts   # PDF 인게스트 스크립트
│   └── server.ts           # 메인 서버 파일
├── dist/                   # 빌드 결과물
├── data/                   # PDF 파일 저장소
├── public/data/            # 다운로드용 PDF
└── logs/                   # 로그 파일
```

## 🛠 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드 및 실행
```bash
npm run build
npm start
```

## 🌐 API 엔드포인트

### RAG API
- **POST** `/api/rag`
  ```json
  {
    "question": "헌법 제1조가 뭐야?"
  }
  ```

### 파일 업로드
- **POST** `/api/upload` (multipart/form-data)
- **GET** `/api/upload/files` - 업로드된 파일 목록

### 헬스체크
- **GET** `/health`

## 🚀 EC2 배포

### 1. EC2 인스턴스 준비
```bash
# Node.js 18+ 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치
sudo npm install -g pm2

# 방화벽 설정 (포트 3001 오픈)
sudo ufw allow 3001
```

### 2. 배포 스크립트 실행
```bash
# 환경변수 설정
export EC2_HOST=your-ec2-ip
export EC2_USER=ubuntu
export EC2_KEY_PATH=path/to/your/key.pem

# 배포 실행
chmod +x deploy.sh
./deploy.sh
```

### 3. Docker 배포 (선택사항)
```bash
# Docker 이미지 빌드
docker build -t pdfchatbot-backend .

# 컨테이너 실행
docker run -d \
  --name pdfchatbot-backend \
  -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  pdfchatbot-backend
```

## 🔧 환경변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 | ✅ |
| `OPENAI_API_KEY` | OpenAI API 키 | ✅ |
| `PORT` | 서버 포트 (기본값: 3001) | ❌ |
| `NODE_ENV` | 환경 (development/production) | ❌ |
| `FRONTEND_URL` | 프론트엔드 URL (CORS 설정용) | ❌ |

## 📊 모니터링

### PM2 명령어
```bash
# 프로세스 상태 확인
pm2 status

# 로그 확인
pm2 logs pdfchatbot-backend

# 프로세스 재시작
pm2 restart pdfchatbot-backend

# 프로세스 중지
pm2 stop pdfchatbot-backend
```

### 로그 파일
- `logs/out.log` - 표준 출력
- `logs/err.log` - 에러 로그
- `logs/combined.log` - 통합 로그

## 🔍 트러블슈팅

### 1. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
sudo netstat -tlnp | grep :3001
sudo kill -9 <PID>
```

### 2. 메모리 부족
```bash
# 스왑 파일 생성 (EC2 t2.micro 등)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 3. 파일 권한 문제
```bash
# 디렉토리 권한 설정
sudo chown -R $USER:$USER ~/backend
chmod -R 755 ~/backend/data
```

## 🤝 프론트엔드 연동

프론트엔드에서 백엔드 API를 사용하려면:

1. 프론트엔드 환경변수 설정:
   ```env
   NEXT_PUBLIC_API_URL=http://your-ec2-ip:3001
   ```

2. API 클라이언트 사용:
   ```typescript
   import { apiClient } from '@/lib/api';
   
   const response = await apiClient.chat('질문 내용');
   ```

## 📝 라이센스

MIT License