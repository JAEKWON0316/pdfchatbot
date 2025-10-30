# GitHub Actions CI/CD 설정 가이드

## 🚀 자동 배포 설정

### 1. GitHub Secrets 설정

GitHub 저장소에서:
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. 다음 3개의 Secret 추가:

```
Name: EC2_HOST
Value: 3.25.51.77

Name: EC2_USER
Value: ubuntu

Name: EC2_SSH_KEY
Value: [pdfchatbot-key.pem 파일의 전체 내용]
```

### 2. SSH 키 복사 방법

Windows PowerShell에서:
```powershell
Get-Content C:\EC2KEY\pdfchatbot-key.pem | clip
```

또는 메모장으로 열어서 전체 복사:
```
-----BEGIN RSA PRIVATE KEY-----
...전체 내용...
-----END RSA PRIVATE KEY-----
```

### 3. 작동 방식

```
코드 수정 → Git Push → GitHub Actions 자동 실행
    ↓
빌드 → 테스트 → EC2 배포 → PM2 재시작
    ↓
배포 완료 알림
```

### 4. 배포 확인

1. GitHub 저장소 → **Actions** 탭
2. 최근 워크플로우 실행 확인
3. 로그 확인

### 5. 수동 배포 트리거

```bash
# 백엔드 코드 수정 후
git add backend/
git commit -m "feat: Update backend feature"
git push origin main

# GitHub Actions가 자동으로 배포 시작!
```

### 6. 배포 제외 설정

프론트엔드만 수정할 때는 자동 배포되지 않습니다:
```yaml
paths:
  - 'backend/**'  # backend 폴더 변경 시에만 배포
```

## 🔔 알림 설정 (선택사항)

### Slack 알림 추가

`.github/workflows/deploy.yml`에 추가:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to EC2'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

## 📊 배포 상태 뱃지

README.md에 추가:

```markdown
![Deploy Status](https://github.com/JAEKWON0316/pdfchatbot/actions/workflows/deploy.yml/badge.svg)
```

## 🐛 문제 해결

### SSH 연결 실패
- EC2_SSH_KEY가 올바른지 확인
- EC2 보안 그룹에서 GitHub Actions IP 허용

### 빌드 실패
- 로컬에서 `npm run build` 테스트
- 의존성 확인

### 배포 실패
- EC2 서버 상태 확인
- PM2 로그 확인: `pm2 logs`