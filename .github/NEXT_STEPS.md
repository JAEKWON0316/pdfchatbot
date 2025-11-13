# 🚀 CI/CD 설정 완료 후 다음 단계

GitHub Secrets 설정이 완료되었습니다! 이제 배포를 시작할 수 있습니다.

## ✅ 완료된 작업

- [x] 프론트엔드 GitHub Secrets 설정 (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [x] 백엔드 GitHub Secrets 설정 (EC2_HOST, EC2_USER, EC2_SSH_KEY)
- [x] CI/CD 워크플로우 설정 완료

## 📋 다음 단계

### 1. EC2 서버 초기 설정 확인

EC2 서버에 다음이 설치되어 있어야 합니다:

#### 필수 설치 항목

```bash
# EC2에 SSH 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# Node.js 18+ 설치 확인
node --version  # v18.x.x 이상이어야 함

# PM2 설치 확인
pm2 --version

# 설치되어 있지 않다면:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

#### 환경변수 파일 확인

EC2 서버의 `~/backend/.env` 파일이 있어야 합니다:

```bash
# EC2에서 확인
cd ~/backend
cat .env

# .env 파일이 없다면 생성 필요
nano .env
```

필수 환경변수:
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

#### 디렉토리 구조 확인

```bash
# EC2에서 확인
cd ~/backend
ls -la

# 필요한 디렉토리 생성
mkdir -p data public/data logs
```

### 2. 첫 배포 테스트

#### 방법 1: 작은 변경사항으로 테스트

```bash
# 로컬에서
git checkout -b test-deploy

# 작은 변경사항 (예: 주석 추가)
echo "# Test deployment" >> backend/src/server.ts

git add backend/src/server.ts
git commit -m "test: Test CI/CD deployment"
git push origin test-deploy

# main 브랜치에 머지
git checkout main
git merge test-deploy
git push origin main
```

#### 방법 2: 직접 main 브랜치에 푸시

```bash
# 작은 변경사항
echo "# Updated" >> backend/README.md

git add backend/README.md
git commit -m "chore: Test deployment"
git push origin main
```

### 3. 배포 확인

#### GitHub Actions 확인

1. GitHub 저장소 → **Actions** 탭
2. 최근 워크플로우 실행 확인
3. **Backend CI** → 성공 확인
4. **Backend Deploy** → 성공 확인

#### EC2 서버 확인

```bash
# EC2에 SSH 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs pdfchatbot-backend --lines 50

# 헬스체크
curl http://localhost:3001/health
```

#### API 테스트

```bash
# 로컬에서 테스트
curl http://your-ec2-ip:3001/health

# 또는 브라우저에서
http://your-ec2-ip:3001/health
```

### 4. 프론트엔드 배포 테스트

```bash
# 프론트엔드 작은 변경
echo "/* Test */" >> src/app/page.tsx

git add src/app/page.tsx
git commit -m "test: Test frontend deployment"
git push origin main
```

Vercel 대시보드에서 배포 상태 확인:
- https://vercel.com/dashboard

## 🔍 문제 해결

### CI 실패 시

1. **GitHub Actions 로그 확인**
   - Actions 탭 → 실패한 워크플로우 클릭
   - 로그에서 오류 확인

2. **일반적인 오류**
   - TypeScript 타입 오류 → 로컬에서 `npx tsc --noEmit` 실행
   - ESLint 오류 → 로컬에서 `npm run lint` 실행
   - 빌드 실패 → 로컬에서 `npm run build` 실행

### 배포 실패 시

1. **SSH 연결 실패**
   - EC2_HOST, EC2_USER, EC2_SSH_KEY 확인
   - EC2 인스턴스가 실행 중인지 확인
   - 보안 그룹에서 SSH(22) 포트 확인

2. **PM2 실행 실패**
   - EC2에서 `pm2 logs pdfchatbot-backend` 확인
   - `.env` 파일이 올바른지 확인
   - Node.js 버전 확인

3. **포트 접근 불가**
   - 보안 그룹에서 3001 포트 확인
   - EC2 방화벽 설정 확인

## 📝 체크리스트

배포 전 확인사항:

- [ ] EC2에 Node.js 18+ 설치됨
- [ ] EC2에 PM2 설치됨
- [ ] EC2에 `~/backend/.env` 파일 존재
- [ ] EC2 보안 그룹에서 3001 포트 열림
- [ ] GitHub Secrets 모두 설정됨
- [ ] 로컬에서 빌드 성공 (`npm run build`)

## 🎉 배포 성공 후

배포가 성공하면:

1. **자동 배포 활성화**
   - `main` 브랜치에 푸시하면 자동 배포
   - CI 통과 후 자동 배포

2. **모니터링**
   - GitHub Actions에서 배포 상태 확인
   - PM2로 서버 상태 모니터링

3. **다음 개발**
   - 기능 브랜치에서 개발
   - PR 생성 시 CI 자동 실행
   - main 머지 시 자동 배포

## 💡 유용한 명령어

### EC2 서버 관리

```bash
# SSH 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# PM2 명령어
pm2 status                    # 상태 확인
pm2 logs pdfchatbot-backend   # 로그 확인
pm2 restart pdfchatbot-backend # 재시작
pm2 stop pdfchatbot-backend   # 중지
pm2 monit                     # 실시간 모니터링
```

### 로컬 테스트

```bash
# 백엔드 빌드 테스트
cd backend
npm run build

# 프론트엔드 빌드 테스트
npm run build

# 타입 체크
npx tsc --noEmit
```

---

**이제 준비가 완료되었습니다! 작은 변경사항을 푸시해서 배포를 테스트해보세요!** 🚀

