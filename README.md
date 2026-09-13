# ST_CRM — AI-Assisted Customer Relationship Management

**고객·연락처·상담 데이터를 관리하고, CRM 데이터를 활용해 AI 답변과 상담 분석을 제공하는 웹 애플리케이션**

React·TypeScript·Refine으로 구성한 CRM에 Firebase Authentication과 Firestore를 연결했습니다. 챗봇은 CRM에서 읽어 온 데이터를 질문과 함께 전달하고, 상담 분석 기능은 상담 메모의 분류와 감정 점수를 생성해 Firestore에 저장합니다.

## 담당 역할 — 정유진

- **GPT·Gemini 연동**
- **Firebase 고객·상담 데이터 기반 챗봇 기능 구현**

담당 경험에는 GPT와 Gemini 연동이 포함됩니다. 현재 공개된 코드에서 확인할 수 있는 AI 호출 경로는 Gemini 형식이며, 아래 구현 설명은 이 공개본을 기준으로 합니다.

## 주요 기능

| 기능 | 구현 내용 |
| --- | --- |
| CRM 데이터 관리 | 고객, 연락처, 상담 내역의 목록·생성·수정 화면 |
| 인증 연동 | Firebase 인증 상태 확인 및 Refine 인증 제공자 연결 |
| 데이터 기반 챗봇 | CRM 컬렉션 데이터를 프롬프트에 포함하여 질의응답 |
| 상담 분석 | CSV 예시를 활용한 상담 메모 분류 및 0~100 감정 점수 요청 |
| 분석 결과 저장 | 분석 결과를 해당 상담 문서의 `classification` 필드에 반영 |
| 대시보드·알림 | 데이터 집계, 고객 위험도 표시, 알림 목록 및 읽음 시점 관리 |

## AI와 데이터 처리 흐름

### CRM 질의응답

```text
Firestore: interaction / contact / customer / user
  → 여러 컬렉션 조회
  → 조회 결과를 JSON 문자열로 구성
  → 시스템 지침 + CRM 데이터 + 사용자 질문
  → AI API 요청
  → Markdown 형식으로 응답 표시
```

챗봇에는 데이터에 없는 내용을 만들지 않도록 하는 프롬프트 지침이 있습니다. 이는 모델에 대한 지시이며 답변 정확성을 보장하는 검증 로직은 아닙니다. 현재 방식은 조회한 데이터를 프롬프트에 직접 포함하며, 벡터 검색은 구현되어 있지 않습니다.

### 상담 분류와 감정 분석

```text
상담 메모 + public/classify.csv의 입출력 예시
  → AI API로 분류·감정 점수 요청
  → 응답에서 분류 텍스트와 점수 추출
  → Firestore 상담 문서 업데이트
  → 상담 목록 새로고침
```

공개 코드의 요청·응답 구조는 `contents / parts / candidates`를 사용하는 **Gemini 형식 API**입니다. 사용할 엔드포인트는 환경변수로 지정합니다. 현재 공개본에서 OpenAI GPT 직접 호출 경로는 확인되지 않습니다.

## 주요 코드

| 파일 | 역할 |
| --- | --- |
| [src/chatbot/Chatbot.tsx](src/chatbot/Chatbot.tsx) | 인증 상태, CRM 데이터 로딩, 프롬프트 구성, 챗봇 UI |
| [src/helpers/api/aiStudioApi.ts](src/helpers/api/aiStudioApi.ts) | CSV 예시 로딩, 상담 분석 API 요청, 응답 파싱 |
| [src/helpers/firebase/firestoreHelpers.ts](src/helpers/firebase/firestoreHelpers.ts) | 여러 컬렉션 조회와 분석 결과 저장 |
| [src/helpers/firebase/firebaseConfig.ts](src/helpers/firebase/firebaseConfig.ts) | Firebase 초기화와 Refine 데이터·인증 제공자 |
| [src/pages/ProcessInteraction.tsx](src/pages/ProcessInteraction.tsx) | 상담별 Analyze 동작 및 결과 표시 |
| [src/helpers/firebase/firebaseService.ts](src/helpers/firebase/firebaseService.ts) | 데이터 집계와 규칙 기반 고객 위험도 계산 |
| [src/App.tsx](src/App.tsx) | CRM 리소스, 챗봇, 알림 통합 |

**기술**: React 18 · TypeScript · Refine · Ant Design · Vite · Firebase Authentication · Firestore · Papa Parse

## 로컬 실행 준비

```bash
git clone https://github.com/Yujin-J/ST_CRM.git
cd ST_CRM
npm ci
```

Node.js와 npm이 필요합니다. 현재 `package.json`에는 Node.js `engines` 버전이 명시되어 있지 않습니다.

루트에 `.env.local`을 만들고 본인의 개발용 설정을 입력합니다. 이 파일은 `.gitignore`에서 제외됩니다.

```dotenv
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
VITE_FIREBASE_PROJECT_ID=<your-firebase-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
VITE_FIREBASE_APP_ID=<your-firebase-app-id>
VITE_AI_API_URL=<your-compatible-generate-content-endpoint>
VITE_AI_API_KEY=<your-ai-api-key>
```

Firebase 인증 제공자와 Firestore 접근 규칙, 화면에서 사용하는 데이터 컬렉션을 별도로 준비해야 합니다. 샘플 데이터 자동 구성 스크립트는 포함되어 있지 않습니다. 실제 고객 정보 대신 합성 데이터를 사용하세요.

```bash
npm run dev
# 빌드
npm run build
```

접속 주소는 실행 시 출력되는 로컬 주소를 사용합니다.

### 현재 공개본의 실행 제약

- 코드에서 사용하는 `react-markdown`과 `axios`가 `package.json`의 직접 의존성에 선언되어 있지 않습니다. 깨끗한 환경에서 설치·빌드할 때 의존성 보완이 필요할 수 있습니다.
- `aiStudioApi.ts`에는 브라우저 코드에 적합하지 않은 `stream/consumers` import가 남아 있습니다.
- 위 명령은 설정·실행 절차를 설명합니다. 현재 공개본의 전체 빌드와 외부 서비스 연동 성공은 검증되지 않았습니다.

## 구현 범위

- **데이터 접근**: 주요 앱은 Firestore 데이터 제공자를 사용합니다.
- **고객 위험도**: 생성 후 경과 일수와 매출 조건을 사용하는 규칙 기반 계산입니다.
- **분석 결과**: 모델 출력의 텍스트 파싱 방식이며, 분류 정확도와 점수의 정량 평가 결과는 포함되어 있지 않습니다.
- **운영 전 보완**: AI 요청이 브라우저에서 직접 전송되므로 `VITE_` 환경변수는 비밀 키를 보호하지 못합니다. 운영 시 서버 측 API 호출, 권한에 따른 데이터 필터링, 프롬프트 로그 제거가 필요합니다.

## 기반 기술과 협업 규칙

Refine과 Ant Design을 기반으로 확장한 프로젝트입니다. 프레임워크 제공 기능과 이 저장소의 CRM·AI 연동 코드를 함께 사용합니다.

<details>
<summary>기존 Git 브랜치·커밋 작성 규칙</summary>

### Git Branch Guidelines

### Branch Naming Convention

```
<type>/<ticket_id>(-optional-description)
```

### Types (Same as commit types)

- `feat`: Feature branches
- `fix`: Bug fix branches
- `docs`: Documentation changes
- `style`: Style/formatting changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks (can not have a ticket ID)
- `perf`: Performance improvements (can not have a ticket ID)

### Examples

```
feat/ERP-1
fix/ERP-2
docs/ERP-3
refactor/ERP-4
test/ERP-5
chore/update-dependencies
```

## Git Commit Guidelines

### Commit Message Format

```
<type>: [<user_story_id/task_id>] <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries
- `perf`: A code change that improves performance

### Subject Rules

1. Use imperative, present tense: "change" not "changed" nor "changes"
2. Don't capitalize the first letter
3. No dot (.) at the end
4. Maximum 50 characters

### Examples

```
feat: [ERP-1] add search by email functionality
fix: [ERP-2] resolve Google OAuth redirect issue
docs: [ERP-3] update installation instructions
style: [ERP-4] format customer list component
refactor: [ERP-5] simplify error handling logic
test: [ERP-6] add unit tests for customer creation
chore: update React dependencies
perf: optimize customer search query
```

### Body Rules (Optional)

- Use imperative, present tense
- Include motivation for the change
- Contrast this with previous behavior
- Wrap at 72 characters

### Footer Rules (Optional)

- Reference issues and pull requests
- Note breaking changes
- Format for breaking changes: BREAKING CHANGE: <description>

### Examples with Body and Footer

```
feat: [ERP-1] implement customer deletion

- Add confirmation dialog before deletion
- Include cascade deletion of related records
- Add activity logging for deletion events

Closes #123
BREAKING CHANGE: Customer deletion now requires admin role
```

### Do's and Don'ts

✅ Do:

- Keep commits atomic (one logical change per commit)
- Write meaningful commit messages
- Use the type and scope consistently
- Reference issues in the footer

❌ Don't:

- Mix multiple unrelated changes in one commit
- Write vague messages like "fix stuff"
- Forget to specify the type
- Exceed character limits

</details>
