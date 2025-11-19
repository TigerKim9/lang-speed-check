# Language Speed Comparison

여러 프로그래밍 언어의 실행 속도를 비교할 수 있는 웹 애플리케이션입니다.

## 지원 언어

- C
- C++
- Rust
- Go
- Zig
- Java
- Kotlin
- Dart
- Swift
- JavaScript (Node.js)
- Python
- Ruby
- PHP

## 기능

- 각 언어별 코드 입력 및 개별 실행
- 전체 언어 일괄 실행
- 실행 시간 측정 (밀리초 단위)
- 속도 순위 자동 정렬
- 예제 코드 제공 (1~1000만 합계 계산)

## 실행 방법

### Docker 사용 (권장)

```bash
# 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build

# 중지
docker-compose down
```

### 직접 실행

각 언어의 컴파일러/인터프리터가 설치되어 있어야 합니다.

```bash
# 의존성 설치
npm install

# 서버 실행
npm start
```

## 접속

브라우저에서 `http://localhost:3000` 접속

## 스크린샷

```
┌─────────────┬────────────────────┬─────┬──────────┐
│ Language    │ Code               │ Run │ Result   │
├─────────────┼────────────────────┼─────┼──────────┤
│ C           │ [code input]       │ Run │ 45.2 ms  │
│ Rust        │ [code input]       │ Run │ 42.8 ms  │
│ Go          │ [code input]       │ Run │ 78.5 ms  │
│ Python      │ [code input]       │ Run │ 892.3 ms │
│ ...         │ ...                │ ... │ ...      │
└─────────────┴────────────────────┴─────┴──────────┘
```

## 주의사항

- 실제 운영 환경에서는 보안을 위한 샌드박싱이 필요합니다
- Docker 이미지 첫 빌드 시 10-20분 소요됩니다
- 이미지 크기: 약 3-4GB

## 기술 스택

- Backend: Node.js + Express
- Frontend: HTML/CSS/JavaScript
- Container: Docker

## 라이선스

MIT
