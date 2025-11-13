# CI/CD 자동 배포 설정 가이드

이 프로젝트는 프론트엔드와 백엔드를 독립적으로 자동 배포하며, 배포 전에 코드 품질 검사를 수행합니다.

## 📋 워크플로우 구조

### 1. 프론트엔드 CI (코드 품질 검사)
- **파일**: `.github/workflows/frontend-ci.yml`
- **트리거**: PR 및 push 시 프론트엔드 파일 변경
- **검사 항목**:
  - ESLint 린팅
  - TypeScript 타입 체크
  - 빌드 검증

### 2. 프론트엔드 배포 (Vercel)
- **파일**: `.github/workflows/frontend-deploy.yml`
- **트리거**: `main` 브랜치에 프론트엔드 파일 변경 시
- **배포 대상**: Vercel
- **전제 조건**: CI 통과 필수

### 3. 백엔드 CI (코드 품질 검사)
- **파일**: `.github/workflows/backend-ci.yml`
- **트리거**: PR 및 push 시 백엔드 파일 변경
- **검사 항목**:
  - TypeScript 타입 체크
  - 빌드 검증

### 4. 백엔드 배포 (EC2)
- **파일**: `.github/workflows/backend-deploy.yml`
- **트리거**: `main` 브랜치에 백엔드 파일 변경 시
- **배포 대상**: AWS EC2 (PM2로 실행)
- **전제 조건**: CI 통과 필수

## 🔐 GitHub Secrets 설정

### 프론트엔드 배포용 Secrets

GitHub 저장소 → Settings → Secrets and variables → Actions에서 다음 Secrets를 추가하세요:

1. **VERCEL_TOKEN**
   - Vercel 대시보드 → Settings → Tokens에서 생성
   - 또는: `vercel login` 후 `vercel link` 실행하여 토큰 확인

2. **VERCEL_ORG_ID**
   - Vercel 대시보드 → Settings → General에서 확인
   - 또는: `.vercel/project.json` 파일에서 확인

3. **VERCEL_PROJECT_ID** (선택사항)
   - Vercel 대시보드 → 프로젝트 설정에서 확인
   - 또는: `.vercel/project.json` 파일에서 확인

### 백엔드 배포용 Secrets

1. **EC2_HOST**
   - EC2 인스턴스의 퍼블릭 IP 또는 도메인
   - 예: `3.25.51.77` 또는 `ec2.example.com`
   - 📖 [자세한 확인 방법](./EC2_SECRETS_GUIDE.md#1%EF%B8%8F-ec2_host-확인하기)

2. **EC2_USER**
   - EC2 인스턴스의 사용자명
   - Amazon Linux: `ec2-user`
   - Ubuntu: `ubuntu`
   - 📖 [자세한 확인 방법](./EC2_SECRETS_GUIDE.md#2%EF%B8%8F-ec2_user-확인하기)

3. **EC2_SSH_KEY**
   - EC2 인스턴스 접속용 SSH 개인키 전체 내용
   - `.pem` 파일의 전체 내용을 복사하여 붙여넣기
   - 📖 [자세한 확인 방법](./EC2_SECRETS_GUIDE.md#3%EF%B8%8F-ec2_ssh_key-얻기)

> 💡 **상세 가이드**: [EC2_SECRETS_GUIDE.md](./EC2_SECRETS_GUIDE.md) 파일을 참고하세요!

## 🚀 사용 방법

### CI/CD 프로세스

1. **PR 생성 시**
   - CI 워크플로우가 자동 실행
   - 코드 품질 검사 (린팅, 타입 체크, 빌드)
   - 검사 통과 후 PR 머지 가능

2. **프론트엔드 변경 시 (main 브랜치)**
   ```bash
   git add src/ components/ package.json
   git commit -m "Update frontend"
   git push origin main
   ```
   → CI 실행 → 통과 시 자동으로 Vercel에 배포

3. **백엔드 변경 시 (main 브랜치)**
   ```bash
   git add backend/
   git commit -m "Update backend"
   git push origin main
   ```
   → CI 실행 → 통과 시 자동으로 EC2에 배포

4. **둘 다 변경 시**
   ```bash
   git add .
   git commit -m "Update both"
   git push origin main
   ```
   → 각각의 CI 실행 → 통과 시 각각 배포

### 배포 확인

GitHub Actions 탭에서 CI/CD 상태를 확인할 수 있습니다:
- ✅ 성공: 검사/배포 완료
- ❌ 실패: 로그 확인 후 수정
- ⏳ 진행 중: 실행 중

## 🔍 문제 해결

### CI 실패

1. **ESLint 오류 (프론트엔드)**
   - 로컬에서 `npm run lint` 실행
   - 오류 수정 후 재커밋

2. **TypeScript 타입 오류**
   - 로컬에서 `npx tsc --noEmit` 실행
   - 타입 오류 수정

3. **빌드 실패**
   - 로컬에서 `npm run build` 테스트
   - 빌드 로그 확인

### 프론트엔드 배포 실패

1. **CI 실패로 배포 안 됨**
   - CI 워크플로우 로그 확인
   - 오류 수정 후 재푸시

2. **VERCEL_TOKEN 오류**
   - Vercel 토큰이 유효한지 확인
   - 토큰 권한 확인 (프로젝트 접근 권한 필요)

### 백엔드 배포 실패

1. **CI 실패로 배포 안 됨**
   - CI 워크플로우 로그 확인
   - 오류 수정 후 재푸시

2. **SSH 연결 실패**
   - EC2_HOST, EC2_USER 확인
   - EC2 보안 그룹에서 GitHub Actions IP 허용 확인
   - SSH 키 권한 확인

3. **PM2 실행 실패**
   - EC2에서 `pm2 list` 확인
   - 로그 확인: `pm2 logs pdfchatbot-backend`

4. **파일명 오류**
   - `ecosystem.config.js` 파일이 존재하는지 확인

## 📝 참고사항

- **CI는 PR과 push 모두에서 실행**됩니다
- **배포는 main 브랜치에만 실행**됩니다
- **배포 전에 CI를 통과해야 합니다** (needs: ci)
- 각 워크플로우는 독립적으로 실행됩니다
- 경로 필터링으로 불필요한 실행을 방지합니다
- CI/CD 실패 시 GitHub Actions에서 알림을 받을 수 있습니다

## 🔄 CI/CD 플로우 다이어그램

```
PR 생성/코드 푸시
    ↓
CI 실행 (린팅, 타입체크, 빌드)
    ↓
✅ 통과?
    ├─ ❌ 실패 → 오류 수정 필요
    └─ ✅ 성공
         ↓
    main 브랜치인가?
         ├─ 아니오 → 종료
         └─ 예 → 배포 실행
              ↓
         배포 완료 ✅
```

