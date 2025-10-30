# PM2 모니터링 가이드

## 📊 PM2 기본 모니터링

### 1. 실시간 모니터링

```bash
# EC2 접속
ssh -i /c/EC2KEY/pdfchatbot-key.pem ubuntu@3.25.51.77

# 실시간 모니터링
pm2 monit

# 프로세스 상태
pm2 status

# 로그 확인
pm2 logs pdfchatbot-backend --lines 100

# 실시간 로그
pm2 logs pdfchatbot-backend
```

### 2. PM2 Plus (무료 모니터링)

```bash
# PM2 Plus 연결
pm2 link <secret_key> <public_key>

# 웹 대시보드: https://app.pm2.io
```

### 3. 메모리/CPU 모니터링

```bash
# 리소스 사용량
pm2 describe pdfchatbot-backend

# 메트릭 확인
pm2 show pdfchatbot-backend
```

## 🔔 알림 설정

### Slack 알림 (선택사항)

```bash
# PM2 Slack 모듈 설치
pm2 install pm2-slack

# Slack Webhook 설정
pm2 set pm2-slack:slack_url https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## 📈 로그 관리

### 로그 로테이션

```bash
# PM2 로그 로테이션 설치
pm2 install pm2-logrotate

# 설정
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 🚨 자동 재시작 설정

이미 `ecosystem.config.js`에 설정되어 있습니다:
- 메모리 800MB 초과 시 자동 재시작
- 크래시 시 자동 재시작
- 최대 5회 재시작 시도

## 💡 유용한 명령어

```bash
# 프로세스 재시작
pm2 restart pdfchatbot-backend

# 프로세스 중지
pm2 stop pdfchatbot-backend

# 프로세스 삭제
pm2 delete pdfchatbot-backend

# 모든 프로세스 재시작
pm2 restart all

# PM2 업데이트
pm2 update

# PM2 저장
pm2 save
```