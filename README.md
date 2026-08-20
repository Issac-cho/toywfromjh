# 💑 우리의 다이어리 (Couple Diary PWA)

두 사람만의 소중한 추억을 기록하고, 공유하고, 안전하게 보관할 수 있는 **커플 전용 웹앱(PWA)** 입니다.
모바일 앱처럼 아이폰/안드로이드의 '홈 화면에 추가'하여 언제든 편하게 열어볼 수 있습니다.

---

## 🌟 주요 기능 (Features)

### 1. 📸 네컷 앨범 (Core Album)
- **최적화된 뷰어:** 세로 비율에 맞춰진 깔끔한 사진 및 영상 갤러리를 제공합니다.
- **추억 기록:** 스마트폰 사진첩의 미디어를 업로드하고, '#데이트', '#1주년' 등 원하는 커스텀 태그를 달 수 있습니다.
- **자동 위치 저장:** (위치 권한 허용 시) 업로드할 때의 GPS 정보가 사진과 함께 자동으로 저장됩니다.

### 2. 🗺️ 데이트 지도 (Memory Map)
- **위치 기반 추억 확인:** 사진에 저장된 위치 정보를 바탕으로, 네이버 지도 위에 커스텀 핀이 생성됩니다.
- **팝업 뷰어:** 지도 위의 핀을 터치하면 해당 장소에서 기록된 사진과 태그를 바로 확인할 수 있습니다.

### 3. 🎙️ 타임캡슐 (Voice Notes)
- **음성 메모:** 텍스트 대신 서로의 따뜻한 목소리를 직접 녹음하여 간직할 수 있습니다.
- **타임캡슐 잠금:** 미래의 특정 날짜(예: 1주년)를 개봉일로 지정하면, 그 날이 되기 전까지는 🔒 자물쇠 아이콘과 함께 블라인드 처리되어 들을 수 없습니다.

### 4. 🔐 듀얼 키 시크릿 폴더 (Dual-Key Vault)
- **동시 인증:** 두 사람이 합의한 특별한 사진을 보관하는 곳입니다. 각자의 기기에서 동시에 지문 버튼을 눌러 승인해야만 폴더가 열립니다.
- **강력한 프라이버시:** 앱을 벗어나거나 5분간 사용이 없으면 보안을 위해 폴더가 자동으로 다시 잠깁니다.
- **시크릿 사진 분리:** 앨범 업로드 시 '시크릿 폴더로 보내기'를 체크하면 일반 앨범에는 노출되지 않습니다.

---

## 🚀 사용 및 설치 방법

### 1. 앱 접속 및 설치 (PWA)
이 앱은 스토어 다운로드 없이 웹 브라우저를 통해 네이티브 앱처럼 설치할 수 있습니다.
1. 아이폰의 **Safari** 또는 안드로이드의 **Chrome**으로 접속합니다.
2. 브라우저 하단의 **공유 버튼(네모에 위 화살표)**을 누릅니다.
3. **[홈 화면에 추가]**를 선택합니다.
4. 이제 홈 화면에 생긴 앱 아이콘을 눌러 전체화면으로 다이어리를 즐겨보세요!

### 2. 커플 연동하기
1. 앱을 처음 열고 **계정을 생성(가입)**합니다.
2. 아직 짝꿍과 연결되지 않았다면 **'상대방 초대하기'** 화면이 나타납니다.
3. **[카카오톡/메시지로 공유하기]** 버튼을 눌러 링크를 전송합니다.
4. 초대를 받은 상대방이 링크를 누르고 가입(로그인)하면, 서로의 다이어리가 연결됩니다.

---

## 💻 로컬 개발 환경 설정 (For Developers)

이 프로젝트를 로컬(내 컴퓨터)에서 직접 실행해보고 싶다면 아래 과정을 따라주세요.

### 1. 레포지토리 클론 및 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 최상단 루트 디렉토리에 `.env.local` 파일을 생성하고 아래의 정보들을 입력합니다. (이 파일은 `.gitignore`에 의해 깃허브에 절대 올라가지 않습니다!)

```env
# Firebase 연동 (Firebase 콘솔 > 프로젝트 설정)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_DATABASE_URL="...-default-rtdb.asia-southeast1.firebasedatabase.app"

# 네이버 지도 연동 (NCP 콘솔 > Maps)
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID="..."
```

### 3. 개발 서버 실행
```bash
npm run dev
# 또는 Turbopack 이슈 방지를 위해
npm run dev --webpack
```
실행 후 `http://localhost:3000` 에 접속하여 확인합니다.

---

## 🛠️ 기술 스택
- **Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS
- **Backend/DB:** Firebase (Auth, Firestore, Storage, Realtime Database)
- **Map:** Naver Maps API (`react-naver-maps`)
- **PWA:** `@ducanh2912/next-pwa`
- **Deployment:** Vercel
