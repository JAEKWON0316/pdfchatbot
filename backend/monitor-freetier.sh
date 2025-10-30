#!/bin/bash

# AWS 프리티어 리소스 모니터링 스크립트
echo "📊 AWS 프리티어 EC2 리소스 모니터링"
echo "=================================="

# 시스템 정보
echo "🖥️  시스템 정보:"
echo "   호스트명: $(hostname)"
echo "   가동시간: $(uptime -p)"
echo "   현재시간: $(date)"
echo ""

# CPU 사용률
echo "⚡ CPU 사용률:"
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
echo "   현재 CPU: ${cpu_usage}%"
echo ""

# 메모리 사용률
echo "💾 메모리 사용률:"
free -h | grep -E "Mem|Swap"
echo ""
memory_percent=$(free | grep Mem | awk '{printf("%.1f"), $3/$2 * 100.0}')
echo "   메모리 사용률: ${memory_percent}%"
echo ""

# 디스크 사용률
echo "💿 디스크 사용률:"
df -h / | tail -1
echo ""

# 네트워크 사용량 (대략적)
echo "🌐 네트워크 인터페이스:"
ip -s link show | grep -A1 "eth0\|ens"
echo ""

# PM2 프로세스 상태
echo "🔄 PM2 프로세스 상태:"
if command -v pm2 &> /dev/null; then
    pm2 status
    echo ""
    pm2 monit --no-interaction || true
else
    echo "   PM2가 설치되지 않았습니다."
fi
echo ""

# 로그 파일 크기
echo "📝 로그 파일 크기:"
if [ -d "~/backend/logs" ]; then
    du -sh ~/backend/logs/* 2>/dev/null || echo "   로그 파일이 없습니다."
else
    echo "   로그 디렉토리가 없습니다."
fi
echo ""

# 프리티어 한계 경고
echo "⚠️  프리티어 한계 확인:"
echo "   CPU: t2.micro는 CPU 크레딧 시스템 사용"
echo "   메모리: 1GB 제한 (현재 ${memory_percent}% 사용)"
echo "   스토리지: 30GB EBS 무료 (월간)"
echo "   네트워크: 15GB 아웃바운드 무료 (월간)"
echo ""

# 최적화 권장사항
if (( $(echo "$memory_percent > 80" | bc -l) )); then
    echo "🚨 메모리 사용률이 높습니다! (${memory_percent}%)"
    echo "   권장사항: pm2 restart 또는 스왑 파일 확인"
fi

# 프로세스별 메모리 사용량
echo "🔍 상위 메모리 사용 프로세스:"
ps aux --sort=-%mem | head -6
echo ""

# 포트 사용 확인
echo "🔌 열린 포트:"
sudo netstat -tlnp | grep -E ":22|:3001|:80|:443" || echo "   주요 포트가 열려있지 않습니다."
echo ""

echo "✅ 모니터링 완료!"
echo ""
echo "💡 유용한 명령어:"
echo "   실시간 모니터링: htop"
echo "   PM2 모니터링: pm2 monit"
echo "   로그 확인: pm2 logs pdfchatbot-backend"