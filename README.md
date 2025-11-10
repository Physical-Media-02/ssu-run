## 환경 설정

### 1. Node.js 설치

18버전 이상 설치되어있으면 스킵

```bash
# Homebrew 설치 (없는 경우)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 24 설치
brew install node@24

# 또는 fnm으로 설치, nvm이나 fnm 설치되어있으면 패스
brew install fnm
fnm install 24
fnm use 24
```

### 2. pnpm 설치

npm이나 yarn사용할거면 2, 3번 스킵, 스킵하는 경우 pnpm-lock.yaml 파일은 지워주기

```bash
npm install -g pnpm
```

### 3. 프로젝트 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속

## 기술 스택

- **언어**: TypeScript
- **라이브러리**: p5.js
- **번들러**: Vite
- **패키지 매니저**: pnpm
- **Node.js**: 24
