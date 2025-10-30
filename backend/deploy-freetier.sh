#!/bin/bash

# AWS 프리티어 EC2 간단 배포 스크립트
set -e

echo "🚀 AWS 프리티어 EC2 배포 시작..."

# 환경변수 확인
if [ -z "$EC2_HOST" ] || [ -z "$EC2_KEY_PATH" ]; then
    echo "❌ 환경변수를 설정해주세요:"
    echo ""
    echo "export EC2_HOST=your-ec2-public-ip"
    echo "export EC2_KEY_PATH=~/Downloads/pdfchatbot-key.pem"
    echo ""
    echo "예시:"
    echo "export EC2_HOST=3.34.123.456"
    echo "export EC2_KEY_PATH=~/Downloads/pdfchatbot-key.pem"
    echo ""
    exit 1
fi

EC2_USER="ubuntu"  # Ubuntu AMI 기본 사용자

# 키 파일 권한 확인
if [ ! -f "$EC2_KEY_PATH" ]; then
    echo "❌ 키 파일을 찾을 수 없습니다: $EC2_KEY_PATH"
    exit 1
fi

# Windows에서는 chmod가 작동하지 않으므로 건너뜀
# chmod 400 "$EC2_KEY_PATH"

# SSH 연결 테스트
echo "🔍 EC2 연결 테스트 중..."
if ! ssh -i "$EC2_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'SSH 연결 성공'" 2>/dev/null; then
    echo "❌ EC2 SSH 연결 실패!"
    echo ""
    echo "다음을 확인해주세요:"
    echo "1. EC2 인스턴스가 '실행 중' 상태인지"
    echo "2. 보안 그룹에서 SSH(22) 포트가 내 IP에 열려있는지"
    echo "3. EC2_HOST가 퍼블릭 IP 주소인지"
    echo "4. 키 파일이 올바른지"
    echo ""
    echo "AWS 콘솔에서 확인:"
    echo "- EC2 > 인스턴스 > 퍼블릭 IPv4 주소 복사"
    echo "- EC2 > 보안 그룹 > 인바운드 규칙 확인"
    exit 1
fi

echo "✅ SSH 연결 성공!"

# 환경변수 파일 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다!"
    echo "다음 명령어로 생성하세요:"
    echo "cp .env.production .env"
    echo "그리고 .env 파일을 편집하여 실제 API 키를 입력하세요."
    exit 1
fi

# 빌드
echo "📦 TypeScript 빌드 중..."
npm run build

# 파일 압축
echo "📁 배포 파일 압축 중..."
tar -czf backend-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=data \
    dist package*.json ecosystem.config.js .env setup-ec2-freetier.sh

# EC2로 파일 전송
echo "📤 EC2로 파일 전송 중..."
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no backend-deploy.tar.gz "$EC2_USER@$EC2_HOST:~/"

# 초기 설정 스크립트도 전송
scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no setup-ec2-freetier.sh "$EC2_USER@$EC2_HOST:~/"

# EC2에서 배포 실행
echo "🔄 EC2에서 배포 실행 중..."
ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'EOF'
    set -e
    
    # 처음 배포인지 확인
    if [ ! -d "~/backend" ]; then
        echo "🔧 첫 배포 - 서버 초기 설정 실행 중..."
        chmod +x setup-ec2-freetier.sh
        ./setup-ec2-freetier.sh
    fi
    
    echo "🛑 기존 프로세스 중지 중..."
    pm2 stop pdfchatbot-backend || true
    pm2 delete pdfchatbot-backend || true
    
    echo "📁 백업 및 새 파일 배포 중..."
    rm -rf ~/backend-backup
    mv ~/backend ~/backend-backup || true
    mkdir -p ~/backend
    cd ~/backend
    
    echo "📦 파일 압축 해제 중..."
    tar -xzf ~/backend-deploy.tar.gz
    
    echo "📦 의존성 설치 중..."
    npm ci --only=production --no-audit --no-fund
    
    echo "📁 디렉토리 생성 중..."
    mkdir -p data public/data logs
    
    echo "🚀 PM2로 애플리케이션 시작 중..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo "🧹 정리 중..."
    rm ~/backend-deploy.tar.gz ~/setup-ec2-freetier.sh
    
    echo ""
    echo "✅ 배포 완료!"
    echo "📊 프로세스 상태:"
    pm2 status
    
    echo ""
    echo "💾 시스템 리소스:"
    echo "메모리 사용량:"
    free -h
    echo ""
    echo "디스크 사용량:"
    df -h /
EOF

# 로컬 임시 파일 정리
rm backend-deploy.tar.gz

echo ""
echo "🎉 AWS 프리티어 EC2 배포가 완료되었습니다!"
echo ""
echo "🔗 서비스 URL:"
echo "   백엔드 API: http://$EC2_HOST:3001"
echo "   헬스체크: http://$EC2_HOST:3001/health"
echo ""
echo "📋 유용한 명령어:"
echo "   SSH 접속: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST"
echo "   로그 확인: pm2 logs pdfchatbot-backend"
echo "   재시작: pm2 restart pdfchatbot-backend"
echo "   상태 확인: pm2 status"
echo ""
echo "💡 프론트엔드 환경변수 업데이트:"
echo "   NEXT_PUBLIC_API_URL=http://$EC2_HOST:3001"