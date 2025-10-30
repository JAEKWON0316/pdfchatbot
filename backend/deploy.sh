#!/bin/bash

# EC2 배포 스크립트
set -e

echo "🚀 PDF Chatbot Backend 배포 시작..."

# 환경변수 확인
if [ -z "$EC2_HOST" ] || [ -z "$EC2_USER" ] || [ -z "$EC2_KEY_PATH" ]; then
    echo "❌ 환경변수를 설정해주세요:"
    echo "export EC2_HOST=your-ec2-ip"
    echo "export EC2_USER=ubuntu"
    echo "export EC2_KEY_PATH=path/to/your/key.pem"
    echo ""
    echo "예시:"
    echo "export EC2_HOST=3.34.123.456"
    echo "export EC2_USER=ubuntu"
    echo "export EC2_KEY_PATH=~/.ssh/my-key.pem"
    exit 1
fi

# SSH 연결 테스트
echo "🔍 EC2 연결 테스트 중..."
if ! ssh -i "$EC2_KEY_PATH" -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'SSH 연결 성공'" 2>/dev/null; then
    echo "❌ EC2 SSH 연결 실패. 다음을 확인해주세요:"
    echo "1. EC2 인스턴스가 실행 중인지"
    echo "2. 보안 그룹에서 SSH(22) 포트가 열려있는지"
    echo "3. 키 파일 경로와 권한이 올바른지 (chmod 400)"
    exit 1
fi

# 빌드
echo "📦 TypeScript 빌드 중..."
npm run build

# 파일 압축 (node_modules 제외)
echo "📁 파일 압축 중..."
tar -czf backend.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    dist package*.json ecosystem.config.js .env

# EC2로 파일 전송
echo "📤 EC2로 파일 전송 중..."
scp -i "$EC2_KEY_PATH" backend.tar.gz "$EC2_USER@$EC2_HOST:~/"

# EC2에서 배포 실행
echo "🔄 EC2에서 배포 실행 중..."
ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << 'EOF'
    set -e
    
    echo "🛑 기존 프로세스 중지 중..."
    pm2 stop pdfchatbot-backend || true
    pm2 delete pdfchatbot-backend || true
    
    echo "📁 백업 및 새 파일 배포 중..."
    rm -rf ~/backend-backup
    mv ~/backend ~/backend-backup || true
    mkdir -p ~/backend
    cd ~/backend
    
    echo "📦 파일 압축 해제 중..."
    tar -xzf ~/backend.tar.gz
    
    echo "📦 의존성 설치 중..."
    npm ci --only=production
    
    echo "📁 디렉토리 생성 중..."
    mkdir -p data public/data logs
    
    echo "🚀 PM2로 애플리케이션 시작 중..."
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "🧹 정리 중..."
    rm ~/backend.tar.gz
    
    echo "✅ 배포 완료!"
    echo "📊 프로세스 상태:"
    pm2 status
EOF

# 로컬 임시 파일 정리
rm backend.tar.gz

echo ""
echo "🎉 배포가 완료되었습니다!"
echo "🔗 백엔드 URL: http://$EC2_HOST:3001"
echo "💚 헬스체크: http://$EC2_HOST:3001/health"
echo ""
echo "📋 유용한 명령어:"
echo "ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST"
echo "pm2 logs pdfchatbot-backend"
echo "pm2 restart pdfchatbot-backend"