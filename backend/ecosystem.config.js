module.exports = {
  apps: [{
    name: 'pdfchatbot-backend',
    script: 'dist/server.js',
    instances: 1, // t2.micro는 단일 인스턴스만
    autorestart: true,
    watch: false,
    max_memory_restart: '800M', // t2.micro 메모리 제한 고려
    min_uptime: '10s',
    max_restarts: 5,
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    time: true,
    // 프리티어 최적화 설정
    node_args: '--max-old-space-size=512', // 메모리 제한
    kill_timeout: 5000,
    listen_timeout: 3000,
    // 로그 로테이션 (디스크 공간 절약)
    merge_logs: true,
    log_type: 'json'
  }]
};