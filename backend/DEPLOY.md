# EC2 배포 가이드

## 1. EC2 인스턴스 생성

### AWS 콘솔에서 EC2 인스턴스 생성
1. **AMI 선택**: Ubuntu Server 20.04 LTS 또는 22.04 LTS
2. **인스턴스 타입**: t3.small 이상 권장 (t2.micro는 메모리 부족 가능)
3. **키 페어**: 새로 생성하거나 기존 키 사용
4. **보안 그룹 설정**:
   - SSH (22): 내 IP 또는 필요한 IP 범위
   - Custom TCP (3001): 0.0.0.0/0 (API 서버용)
   - HTTP (80): 0.0.0.0/0 (선택사항)
   - HTTPS (443): 0.0.0.0/0 (선택사항)

### 키 파일 권한 설정
```bash
chmod 400 ~/.ssh/your-key.pem
```

## 2. EC2 서버 초기 설정

### SSH 접속
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-ip
```

### 초기 설정 스크립트 실행
```bash
# 로컬에서 스크립트 전송
scp -i ~/.ssh/your-key.pem setup-ec2.sh ubuntu@your-ec2-ip:~/

# EC2에서 실행
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-ip
chmod +x setup-ec2.sh
./setup-ec2.sh
```

## 3. 환경변수 설정

### 프로덕션 환경변수 파일 수정
```bash
# 로컬에서 .env.production 파일을 실제 값으로 수정
cp .env.production .env
# .env 파일 편집하여 실제 API 키들 입력
```

## 4. 배포 실행

### 환경변수 설정
```bash
export EC2_HOST=your-ec2-ip
export EC2_USER=ubuntu
export EC2_KEY_PATH=~/.ssh/your-key.pem
```

### 배포 스크립트 실행
```bash
chmod +x deploy.sh
./deploy.sh
```

## 5. 배포 확인

### 헬스체크
```bash
curl http://your-ec2-ip:3001/health
```

### API 테스트
```bash
curl -X POST http://your-ec2-ip:3001/api/rag \
  -H "Content-Type: application/json" \
  -d '{"question":"안녕하세요"}'
```

## 6. 모니터링 및 관리

### PM2 명령어
```bash
# EC2에 SSH 접속 후
pm2 status                    # 프로세스 상태 확인
pm2 logs pdfchatbot-backend   # 로그 확인
pm2 restart pdfchatbot-backend # 재시작
pm2 stop pdfchatbot-backend   # 중지
pm2 delete pdfchatbot-backend # 삭제
```

### 로그 확인
```bash
# 실시간 로그
pm2 logs pdfchatbot-backend --lines 100

# 로그 파일 직접 확인
tail -f ~/backend/logs/combined.log
```

### 시스템 리소스 확인
```bash
# 메모리 사용량
free -h

# 디스크 사용량
df -h

# CPU 사용량
top
```

## 7. 트러블슈팅

### 포트 충돌 해결
```bash
# 포트 사용 중인 프로세스 확인
sudo netstat -tlnp | grep :3001
sudo kill -9 <PID>
```

### 메모리 부족 해결
```bash
# 스왑 파일 확인
sudo swapon --show

# 추가 스왑 파일 생성 (필요시)
sudo fallocate -l 2G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2
```

### 방화벽 문제 해결
```bash
# 방화벽 상태 확인
sudo ufw status

# 포트 열기
sudo ufw allow 3001
```

### SSL/HTTPS 설정 (선택사항)
```bash
# Nginx 설치
sudo apt install nginx

# Let's Encrypt 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com
```

## 8. 자동 배포 설정 (선택사항)

### GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to EC2
      env:
        EC2_HOST: ${{ secrets.EC2_HOST }}
        EC2_USER: ${{ secrets.EC2_USER }}
        EC2_KEY: ${{ secrets.EC2_KEY }}
      run: |
        echo "$EC2_KEY" > key.pem
        chmod 400 key.pem
        export EC2_KEY_PATH=./key.pem
        cd backend
        ./deploy.sh
```

## 9. 백업 및 복구

### 데이터 백업
```bash
# PDF 파일 백업
tar -czf backup-$(date +%Y%m%d).tar.gz ~/backend/data ~/backend/public/data

# S3에 백업 (선택사항)
aws s3 cp backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

### 복구
```bash
# 백업에서 복구
tar -xzf backup-20231030.tar.gz -C ~/
pm2 restart pdfchatbot-backend
```