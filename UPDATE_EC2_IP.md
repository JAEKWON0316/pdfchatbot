# EC2 IP 주소 변경 가이드

EC2 인스턴스 유형을 변경하거나 재시작하면 퍼블릭 IP 주소가 변경될 수 있습니다.

## 📋 새로운 IP 주소 확인 방법

1. AWS 콘솔 접속
2. EC2 → 인스턴스 선택
3. **퍼블릭 IPv4 주소** 확인
4. 예: `13.125.123.45`

## 🔄 변경해야 할 파일들

### 1. 코드 파일

#### `next.config.ts`
```typescript
destination: 'http://새로운-IP:3001/api/:path*',
```

#### `vercel.json`
```json
"NEXT_PUBLIC_API_URL": "http://새로운-IP:3001"
```

#### `.github/workflows/frontend-deploy.yml`
```yaml
NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL || 'http://새로운-IP:3001' }}
```

#### `.github/workflows/frontend-ci.yml`
```yaml
NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL || 'http://새로운-IP:3001' }}
```

### 2. GitHub Secrets

GitHub 저장소 → Settings → Secrets and variables → Actions

- `EC2_HOST` → 새로운 IP 주소로 업데이트
- `NEXT_PUBLIC_API_URL` (선택사항) → `http://새로운-IP:3001`로 업데이트

### 3. Vercel 환경변수

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

- `NEXT_PUBLIC_API_URL` → `http://새로운-IP:3001`로 업데이트
- 배포 재실행 필요

### 4. 백엔드 CORS 설정

EC2 서버의 `~/backend/.env` 파일:

```bash
# EC2에 SSH 접속
ssh -i your-key.pem ubuntu@새로운-IP

# .env 파일 수정
cd ~/backend
nano .env
```

`FRONTEND_URL` 확인 (Vercel URL이면 변경 불필요):
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

서버 재시작:
```bash
pm2 restart pdfchatbot-backend
```

## 🔒 Elastic IP 사용 권장

IP 주소가 계속 바뀌지 않도록 Elastic IP를 사용하는 것을 권장합니다:

1. AWS 콘솔 → EC2 → Elastic IPs
2. **Allocate Elastic IP address** 클릭
3. 생성된 Elastic IP 선택
4. **Actions** → **Associate Elastic IP address**
5. 인스턴스 선택 → Associate

이후 Elastic IP 주소를 사용하면 IP가 변경되지 않습니다!

