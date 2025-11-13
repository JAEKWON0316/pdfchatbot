# EC2 GitHub Secrets 설정 가이드

EC2 배포를 위한 3가지 GitHub Secrets 값을 얻는 방법을 단계별로 설명합니다.

## 📋 필요한 3가지 Secrets

1. **EC2_HOST** - EC2 인스턴스의 퍼블릭 IP 주소
2. **EC2_USER** - EC2 인스턴스의 사용자명
3. **EC2_SSH_KEY** - SSH 접속용 개인키 (.pem 파일 내용)

---

## 1️⃣ EC2_HOST 확인하기

### 방법 1: AWS 콘솔에서 확인 (가장 쉬움)

1. **AWS 콘솔 접속**
   - https://console.aws.amazon.com 접속
   - 로그인

2. **EC2 대시보드로 이동**
   - 검색창에 "EC2" 입력
   - EC2 서비스 클릭

3. **인스턴스 선택**
   - 왼쪽 메뉴에서 **"인스턴스"** 클릭
   - 배포할 인스턴스 선택

4. **퍼블릭 IPv4 주소 확인**
   - 인스턴스 정보 패널에서 **"퍼블릭 IPv4 주소"** 찾기
   - 예: `3.25.51.77` 또는 `54.123.45.67`

5. **복사**
   - 주소를 복사 (예: `3.25.51.77`)

### 방법 2: AWS CLI로 확인

```bash
# 모든 인스턴스의 퍼블릭 IP 확인
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress,State.Name]' \
  --output table

# 특정 인스턴스의 퍼블릭 IP 확인
aws ec2 describe-instances \
  --instance-ids i-0bbe96743e745fc6c \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

### ⚠️ 주의사항

- **Elastic IP를 사용하는 경우**: Elastic IP 주소를 사용하세요
- **인스턴스가 중지된 경우**: 퍼블릭 IP가 변경될 수 있습니다
- **도메인을 사용하는 경우**: 도메인 주소도 사용 가능합니다 (예: `api.example.com`)

---

## 2️⃣ EC2_USER 확인하기

EC2_USER는 EC2 인스턴스의 운영체제(AMI)에 따라 다릅니다.

### 일반적인 사용자명

| 운영체제 | 사용자명 |
|---------|---------|
| **Ubuntu** | `ubuntu` |
| **Amazon Linux 2** | `ec2-user` |
| **Amazon Linux 2023** | `ec2-user` |
| **Debian** | `admin` |
| **CentOS** | `centos` |
| **RHEL** | `ec2-user` |

### 확인 방법

#### 방법 1: AWS 콘솔에서 확인

1. EC2 인스턴스 선택
2. **"연결"** 탭 클릭
3. **"SSH 클라이언트"** 섹션에서 사용자명 확인
   - 예: `ssh -i "my-key.pem" ubuntu@ec2-3-25-51-77.ap-southeast-2.compute.amazonaws.com`
   - 여기서 `ubuntu`가 사용자명입니다

#### 방법 2: AMI 정보에서 확인

1. EC2 인스턴스 선택
2. **"세부 정보"** 탭에서 **"AMI ID"** 확인
3. AMI 설명에서 운영체제 확인

#### 방법 3: 직접 테스트

```bash
# Ubuntu인 경우
ssh -i your-key.pem ubuntu@your-ec2-ip

# Amazon Linux인 경우
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 💡 가장 일반적인 경우

대부분의 경우:
- **Ubuntu**: `ubuntu`
- **Amazon Linux**: `ec2-user`

---

## 3️⃣ EC2_SSH_KEY 얻기

EC2_SSH_KEY는 EC2 인스턴스 생성 시 다운로드한 `.pem` 파일의 **전체 내용**입니다.

### 방법 1: Windows에서 복사하기

#### PowerShell 사용 (추천)

```powershell
# 키 파일 경로 지정
$keyPath = "C:\Users\YourName\Downloads\pdfchatbot-key.pem"

# 파일 내용을 클립보드에 복사
Get-Content $keyPath | clip

# 확인 메시지
Write-Host "✅ 키 파일 내용이 클립보드에 복사되었습니다!"
```

#### 메모장 사용

1. `.pem` 파일을 **메모장**으로 열기
   - 파일 우클릭 → **"연결 프로그램"** → **"메모장"**

2. **전체 내용 선택 및 복사**
   - `Ctrl + A` (전체 선택)
   - `Ctrl + C` (복사)

3. **내용 확인**
   - 다음과 같은 형식이어야 합니다:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   MIIEpAIBAAKCAQEA...
   (여러 줄의 암호화된 텍스트)
   ...
   -----END RSA PRIVATE KEY-----
   ```

### 방법 2: macOS/Linux에서 복사하기

```bash
# 키 파일 경로 지정
KEY_PATH="~/Downloads/pdfchatbot-key.pem"

# 클립보드에 복사 (macOS)
pbcopy < "$KEY_PATH"

# 또는 Linux (xclip 필요)
xclip -selection clipboard < "$KEY_PATH"

# 또는 cat으로 출력 후 수동 복사
cat "$KEY_PATH"
```

### 방법 3: VS Code에서 복사하기

1. VS Code에서 `.pem` 파일 열기
2. `Ctrl + A` (전체 선택)
3. `Ctrl + C` (복사)

### ⚠️ 중요 주의사항

1. **전체 내용 복사**
   - `-----BEGIN`부터 `-----END`까지 **모든 내용**을 복사해야 합니다
   - 줄바꿈도 포함해서 복사하세요

2. **키 파일 위치 확인**
   - EC2 인스턴스 생성 시 다운로드한 `.pem` 파일
   - 일반적으로 `Downloads` 폴더에 있습니다
   - 파일명 예: `pdfchatbot-key.pem`, `my-key.pem` 등

3. **키 파일을 잃어버린 경우**
   - **새 키 페어를 만들 수 없습니다** (기존 인스턴스에 연결 불가)
   - 해결 방법:
     - 키 파일 백업 확인
     - 새 인스턴스를 생성하고 키 파일을 안전하게 보관

---

## 🔐 GitHub Secrets에 추가하기

### 단계별 가이드

1. **GitHub 저장소 접속**
   - https://github.com/your-username/pdfchatbot 접속

2. **Settings로 이동**
   - 저장소 상단 메뉴에서 **"Settings"** 클릭

3. **Secrets 메뉴 선택**
   - 왼쪽 사이드바에서 **"Secrets and variables"** → **"Actions"** 클릭

4. **Secret 추가**
   - **"New repository secret"** 버튼 클릭

5. **각 Secret 추가**

   #### EC2_HOST 추가
   ```
   Name: EC2_HOST
   Secret: 3.25.51.77  (실제 IP 주소로 변경)
   ```
   - **"Add secret"** 클릭

   #### EC2_USER 추가
   ```
   Name: EC2_USER
   Secret: ubuntu  (또는 ec2-user, 실제 사용자명으로 변경)
   ```
   - **"Add secret"** 클릭

   #### EC2_SSH_KEY 추가
   ```
   Name: EC2_SSH_KEY
   Secret: [복사한 .pem 파일의 전체 내용 붙여넣기]
   ```
   - 클립보드에서 복사한 전체 내용 붙여넣기
   - **"Add secret"** 클릭

### ✅ 확인 방법

모든 Secret이 추가되면 다음과 같이 표시됩니다:

```
EC2_HOST        ●●●●●●●●
EC2_USER        ●●●●●●●●
EC2_SSH_KEY     ●●●●●●●●
```

---

## 🧪 테스트하기

### SSH 연결 테스트

Secrets를 추가한 후, 로컬에서 SSH 연결을 테스트해보세요:

```bash
# Windows PowerShell
ssh -i C:\Users\YourName\Downloads\pdfchatbot-key.pem ubuntu@3.25.51.77

# macOS/Linux
ssh -i ~/Downloads/pdfchatbot-key.pem ubuntu@3.25.51.77
```

연결이 성공하면 Secrets 설정이 올바른 것입니다!

### GitHub Actions 테스트

1. 작은 변경사항을 백엔드에 커밋
2. `main` 브랜치에 푸시
3. GitHub Actions 탭에서 배포 워크플로우 확인
4. 성공하면 설정 완료! ✅

---

## 🐛 문제 해결

### EC2_HOST 오류

**문제**: "Connection refused" 또는 "Host not found"
- **해결**: 
  - EC2 인스턴스가 실행 중인지 확인
  - 퍼블릭 IP 주소가 올바른지 확인
  - 보안 그룹에서 SSH(22) 포트가 열려있는지 확인

### EC2_USER 오류

**문제**: "Permission denied (publickey)"
- **해결**:
  - 사용자명이 올바른지 확인 (ubuntu 또는 ec2-user)
  - AWS 콘솔의 "연결" 탭에서 사용자명 확인

### EC2_SSH_KEY 오류

**문제**: "Invalid key format" 또는 "Permission denied"
- **해결**:
  - `.pem` 파일의 전체 내용을 복사했는지 확인
  - `-----BEGIN`과 `-----END`가 포함되어 있는지 확인
  - 줄바꿈이 포함되어 있는지 확인
  - 앞뒤 공백이 없는지 확인

### 보안 그룹 설정

EC2 보안 그룹에서 다음 포트가 열려있어야 합니다:

| 포트 | 프로토콜 | 소스 | 용도 |
|------|---------|------|------|
| 22 | TCP | GitHub Actions IP 또는 0.0.0.0/0 | SSH 접속 |
| 3001 | TCP | 0.0.0.0/0 | API 서버 |

---

## 📝 요약

1. **EC2_HOST**: AWS 콘솔 → EC2 → 인스턴스 → 퍼블릭 IPv4 주소
2. **EC2_USER**: 
   - Ubuntu → `ubuntu`
   - Amazon Linux → `ec2-user`
3. **EC2_SSH_KEY**: `.pem` 파일 전체 내용 복사 (BEGIN부터 END까지)

모든 Secret을 추가하면 자동 배포가 작동합니다! 🚀

