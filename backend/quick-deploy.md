# 🚀 빠른 배포 가이드

## 인스턴스 정보
- 인스턴스 ID: i-0bbe96743e745fc6c
- 상태: 실행 중 (확인 필요)

## 배포 단계

### 1. 인스턴스 정보 확인
AWS 콘솔에서 다음 정보를 확인하세요:
- 퍼블릭 IPv4 주소: [여기에 입력]
- 키 페어 이름: [여기에 입력]

### 2. 환경변수 설정
```bash
# 터미널에서 실행 (실제 값으로 변경)
export EC2_HOST=your-public-ip
export EC2_KEY_PATH=~/Downloads/your-key-name.pem

# 예시:
# export EC2_HOST=3.34.123.456
# export EC2_KEY_PATH=~/Downloads/pdfchatbot-key.pem
```

### 3. 환경변수 파일 준비
```bash
cd backend
cp .env.production .env
# .env 파일을 편집하여 실제 API 키 입력
```

### 4. 배포 실행
```bash
chmod +x deploy-freetier.sh
./deploy-freetier.sh
```

### 5. 배포 확인
```bash
# 헬스체크
curl http://your-ec2-ip:3001/health

# API 테스트
curl -X POST http://your-ec2-ip:3001/api/rag \
  -H "Content-Type: application/json" \
  -d '{"question":"안녕하세요"}'
```