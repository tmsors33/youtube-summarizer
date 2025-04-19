# YouTube 영상 요약 서비스

YouTube 영상 URL을 입력하면 해당 영상의 내용을 자동으로 요약해주는 웹 애플리케이션입니다.

## 기능

- YouTube 비디오 링크 입력
- 비디오 내용 추출 및 요약
- 비디오 정보 표시 (제목, 채널, 조회수 등)
- 모바일 및 데스크탑 대응 반응형 디자인

## 사용 시 참고사항

- 일반 YouTube 영상은 대부분 잘 요약되지만, **Shorts 영상**은 자막 추출 특성상 정확도가 다소 떨어질 수 있습니다.

## 기술 스택

- **프론트엔드**: Next.js, React, TailwindCSS
- **백엔드**: Next.js API Routes
- **외부 API**: YouTube Data API, OpenAI API

## 실행 방법

1. 저장소 복제

```bash
git clone https://github.com/yourusername/youtube-link-summarizer.git
cd youtube-link-summarizer
```

2. 종속성 설치

```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력합니다:

```
YOUTUBE_API_KEY=your_youtube_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

5. 브라우저에서 확인

브라우저에서 `http://localhost:3000`로 접속하여 애플리케이션을 확인합니다.

## API 키 발급 방법

### YouTube API 키

1. [Google Cloud Console](https://console.cloud.google.com)에 로그인
2. 새 프로젝트 생성
3. 'API 및 서비스' > 'API 라이브러리' 이동
4. 'YouTube Data API v3' 검색 후 활성화
5. 'API 및 서비스' > '사용자 인증 정보' 이동
6. 'API 키 생성' 클릭하여 키 발급

### OpenAI API 키

1. [OpenAI API](https://platform.openai.com/signup) 회원가입
2. [API 키 생성 페이지](https://platform.openai.com/account/api-keys)에서 새 API 키 생성

## 프로젝트 구조

```
youtube-link-summarizer/
├── components/        # 재사용 가능한 컴포넌트
├── lib/               # 유틸리티 함수
├── pages/             # 페이지 및 API 라우트
│   ├── api/           # 백엔드 API 엔드포인트
│   └── ...            # 페이지 컴포넌트
├── public/            # 정적 파일 (이미지 등)
├── styles/            # 글로벌 스타일
└── ...                # 설정 파일 등
```

## 라이선스

MIT License 