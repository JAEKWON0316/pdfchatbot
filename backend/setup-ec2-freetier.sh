#!/bin/bash

# AWS 프리티어 EC2 최적화 설정 스크립트
set -e

echo "🚀 AWS 프리티어 EC2 설정을 시작합니다..."
echo "💡 t2.micro 인스턴스 최적화 설정"

# 시스템 업데이트
echo "📦 시스템 패키지 업데이트 중..."
sudo apt update && sudo apt upgrade -y

# 불필요한 패키지 제거 (메모리 절약)
echo "🧹 불필요한 패키지 제거 중..."
sudo apt autoremove -y
sudo apt autoclean

# Node.js 18 설치 (LTS 버전)
echo "📦 Node.js 18 LTS 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 글로벌 설치
echo "📦 PM2 설치 중..."
sudo npm install -g pm2

# 스왑 파일 생성 (t2.micro 메모리 부족 해결)
echo "💾 스왑 파일 생성 중 (메모리 최적화)..."
if [ ! -f /swapfile ]; then
    # 2GB 스왑 파일 생성 (t2.micro에 필수)
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    # 부팅 시 자동 마운트
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    
    # 스왑 사용 최적화 설정
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
fi

# 방화벽 설정 (최소한의 포트만 오픈)
echo "🔥 방화벽 설정 중..."
sudo ufw allow ssh
sudo ufw allow 3001/tcp
sudo ufw --force enable

# 애플리케이션 디렉토리 생성
echo "📁 애플리케이션 디렉토리 생성 중..."
mkdir -p ~/backend/{data,public/data,logs}

# 시스템 모니터링 도구 설치
echo "📊 모니터링 도구 설치 중..."
sudo apt install -y htop iotop

# PM2 자동 시작 설정
echo "🔄 PM2 자동 시작 설정 중..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# 로그 로테이션 설정 (디스크 공간 절약)
echo "📝 로그 로테이션 설정 중..."
sudo tee /etc/logrotate.d/pdfchatbot << EOF
/home/$USER/backend/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

# 시스템 최적화 설정
echo "⚡ 시스템 최적화 설정 중..."
# 메모리 사용량 최적화
echo 'net.core.rmem_max = 16777216' | sudo tee -a /etc/sysctl.conf
echo 'net.core.wmem_max = 16777216' | sudo tee -a /etc/sysctl.conf

# 자동 업데이트 비활성화 (리소스 절약)
sudo systemctl disable apt-daily.service
sudo systemctl disable apt-daily.timer
sudo systemctl disable apt-daily-upgrade.timer
sudo systemctl disable apt-daily-upgrade.service

echo ""
echo "✅ AWS 프리티어 EC2 설정이 완료되었습니다!"
echo ""
echo "📋 설정 완료 항목:"
echo "✓ Node.js 18 LTS 설치"
echo "✓ PM2 프로세스 매니저 설치"
echo "✓ 2GB 스왑 파일 생성 (메모리 최적화)"
echo "✓ 방화벽 설정 (SSH, 3001 포트)"
echo "✓ 로그 로테이션 설정"
echo "✓ 시스템 최적화"
echo ""
echo "🖥️  시스템 정보:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "메모리: $(free -h | grep Mem | awk '{print $2}')"
echo "스왑: $(free -h | grep Swap | awk '{print $2}')"
echo "디스크: $(df -h / | tail -1 | awk '{print $2}')"
echo ""
echo "📋 다음 단계:"
echo "1. 애플리케이션 배포"
echo "2. PM2로 서비스 시작"
echo "3. 모니터링 설정"