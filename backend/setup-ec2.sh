#!/bin/bash

# EC2 Ubuntu 서버 초기 설정 스크립트
set -e

echo "🚀 EC2 서버 초기 설정을 시작합니다..."

# 시스템 업데이트
echo "📦 시스템 패키지 업데이트 중..."
sudo apt update && sudo apt upgrade -y

# Node.js 18 설치
echo "📦 Node.js 18 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 글로벌 설치
echo "📦 PM2 설치 중..."
sudo npm install -g pm2

# 방화벽 설정
echo "🔥 방화벽 설정 중..."
sudo ufw allow ssh
sudo ufw allow 3001
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 애플리케이션 디렉토리 생성
echo "📁 애플리케이션 디렉토리 생성 중..."
mkdir -p ~/backend
mkdir -p ~/backend/data
mkdir -p ~/backend/public/data
mkdir -p ~/backend/logs

# 스왑 파일 생성 (메모리 부족 방지)
echo "💾 스왑 파일 생성 중..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# PM2 자동 시작 설정
echo "🔄 PM2 자동 시작 설정 중..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

echo "✅ EC2 서버 초기 설정이 완료되었습니다!"
echo "📋 다음 단계:"
echo "1. 애플리케이션 파일 업로드"
echo "2. 환경변수 설정"
echo "3. PM2로 애플리케이션 시작"

# 시스템 정보 출력
echo ""
echo "🖥️  시스템 정보:"
echo "Node.js 버전: $(node --version)"
echo "npm 버전: $(npm --version)"
echo "PM2 버전: $(pm2 --version)"
echo "사용 가능한 메모리: $(free -h | grep Mem | awk '{print $7}')"
echo "디스크 공간: $(df -h / | tail -1 | awk '{print $4}')"