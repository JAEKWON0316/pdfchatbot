# AWS 프리티어 EC2 PowerShell 배포 스크립트

Write-Host "🚀 AWS 프리티어 EC2 배포 시작..." -ForegroundColor Green

# 환경변수 확인
if (-not $env:EC2_HOST -or -not $env:EC2_KEY_PATH) {
    Write-Host "❌ 환경변수를 설정해주세요:" -ForegroundColor Red
    Write-Host ""
    Write-Host "`$env:EC2_HOST = 'your-ec2-public-ip'"
    Write-Host "`$env:EC2_KEY_PATH = 'C:\EC2KEY\pdfchatbot-key.pem'"
    Write-Host ""
    Write-Host "예시:"
    Write-Host "`$env:EC2_HOST = '3.25.51.77'"
    Write-Host "`$env:EC2_KEY_PATH = 'C:\EC2KEY\pdfchatbot-key.pem'"
    exit 1
}

$EC2_USER = "ubuntu"

# 키 파일 존재 확인
if (-not (Test-Path $env:EC2_KEY_PATH)) {
    Write-Host "❌ 키 파일을 찾을 수 없습니다: $env:EC2_KEY_PATH" -ForegroundColor Red
    exit 1
}

# SSH 연결 테스트
Write-Host "🔍 EC2 연결 테스트 중..." -ForegroundColor Yellow
try {
    $result = ssh -i $env:EC2_KEY_PATH -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$env:EC2_HOST" "echo 'SSH 연결 성공'" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "SSH 연결 실패"
    }
    Write-Host "✅ SSH 연결 성공!" -ForegroundColor Green
} catch {
    Write-Host "❌ EC2 SSH 연결 실패!" -ForegroundColor Red
    Write-Host ""
    Write-Host "다음을 확인해주세요:"
    Write-Host "1. EC2 인스턴스가 '실행 중' 상태인지"
    Write-Host "2. 보안 그룹에서 SSH(22) 포트가 내 IP에 열려있는지"
    Write-Host "3. EC2_HOST가 퍼블릭 IP 주소인지"
    Write-Host "4. 키 파일이 올바른지"
    exit 1
}

# 환경변수 파일 확인
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env 파일이 없습니다!" -ForegroundColor Red
    Write-Host "다음 명령어로 생성하세요:"
    Write-Host "Copy-Item .env.production .env"
    Write-Host "그리고 .env 파일을 편집하여 실제 API 키를 입력하세요."
    exit 1
}

# 빌드
Write-Host "📦 TypeScript 빌드 중..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패!" -ForegroundColor Red
    exit 1
}

# 파일 압축
Write-Host "📁 배포 파일 압축 중..." -ForegroundColor Yellow
$excludeFiles = @("node_modules", ".git", "*.log", "data")
tar -czf backend-deploy.tar.gz --exclude=node_modules --exclude=.git --exclude=*.log --exclude=data dist package*.json ecosystem.config.js .env setup-ec2-freetier.sh

# EC2로 파일 전송
Write-Host "📤 EC2로 파일 전송 중..." -ForegroundColor Yellow
scp -i $env:EC2_KEY_PATH -o StrictHostKeyChecking=no backend-deploy.tar.gz "$EC2_USER@$env:EC2_HOST`:~/"
scp -i $env:EC2_KEY_PATH -o StrictHostKeyChecking=no setup-ec2-freetier.sh "$EC2_USER@$env:EC2_HOST`:~/"

# EC2에서 배포 실행
Write-Host "🔄 EC2에서 배포 실행 중..." -ForegroundColor Yellow

$deployScript = @'
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
'@

ssh -i $env:EC2_KEY_PATH -o StrictHostKeyChecking=no "$EC2_USER@$env:EC2_HOST" $deployScript

# 로컬 임시 파일 정리
Remove-Item backend-deploy.tar.gz -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 AWS 프리티어 EC2 배포가 완료되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 서비스 URL:" -ForegroundColor Cyan
Write-Host "   백엔드 API: http://$env:EC2_HOST:3001" -ForegroundColor White
Write-Host "   헬스체크: http://$env:EC2_HOST:3001/health" -ForegroundColor White
Write-Host ""
Write-Host "📋 유용한 명령어:" -ForegroundColor Cyan
Write-Host "   SSH 접속: ssh -i $env:EC2_KEY_PATH $EC2_USER@$env:EC2_HOST" -ForegroundColor White
Write-Host "   로그 확인: pm2 logs pdfchatbot-backend" -ForegroundColor White
Write-Host "   재시작: pm2 restart pdfchatbot-backend" -ForegroundColor White
Write-Host "   상태 확인: pm2 status" -ForegroundColor White
Write-Host ""
Write-Host "💡 프론트엔드 환경변수 업데이트:" -ForegroundColor Cyan
Write-Host "   NEXT_PUBLIC_API_URL=http://$env:EC2_HOST:3001" -ForegroundColor White