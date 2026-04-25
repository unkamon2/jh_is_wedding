# jh_is_wedding

## Google Apps Script (GAS) 방식으로 Google Drive 업로드 설정

### 1. Google Apps Script 생성
1. [Google Apps Script](https://script.google.com/)에 접속
2. 새 프로젝트 생성
3. 다음 코드를 붙여넣기:

```javascript
function doGet(e) {
  return ContentService
    .createTextOutput('GAS Web App is running. Use POST to upload files.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    // JSON 데이터 파싱
    const postData = e.postData.getDataAsString();
    if (!postData) {
      return ContentService
        .createTextOutput(JSON.stringify({success: false, error: 'No post data'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const jsonData = JSON.parse(postData);
    const fileData = jsonData.fileData;
    const fileName = jsonData.fileName || 'uploaded_image.jpg';
    const mimeType = jsonData.mimeType || 'image/jpeg';
    const folderName = jsonData.folderName || 'jh_is_wedding_gallery';
    
    if (!fileData) {
      return ContentService
        .createTextOutput(JSON.stringify({success: false, error: 'No file data'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Base64 데이터를 파일로 변환
    const fileBlob = Utilities.newBlob(Utilities.base64Decode(fileData), mimeType, fileName);
    
    // 폴더 찾기 또는 생성
    const folders = DriveApp.getFoldersByName(folderName);
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    // 파일 저장
    const savedFile = folder.createFile(fileBlob);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        fileId: savedFile.getId(),
        fileUrl: savedFile.getUrl(),
        fileName: fileName
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 2. 웹 앱으로 배포 (테스트 배포 권장 - CORS 문제 해결)
1. "배포" > **"테스트 배포"** 선택 (일반 배포가 아닌 테스트 배포)
2. 유형: "웹 앱"
3. **실행 권한: "나"**
4. **액세스 권한: "모든 사용자"**
5. 배포 후 URL 복사 (형식: `.../dev`)

**중요**: 테스트 배포(`/dev`)를 사용해야 CORS 문제가 해결됩니다!

### Google 검증 경고 해결 방법

#### 방법 1: 테스트 모드로 배포 (권장)
- 액세스 권한을 "테스터만"으로 설정하면 검증 경고가 나타나지 않습니다.
- 청첩장 하객들이 사용할 수 있도록 테스터 목록에 이메일을 추가할 수 있습니다.

#### 방법 2: OAuth 동의 화면 설정 (완전 해결)
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "OAuth 동의 화면" 메뉴 선택
4. 사용자 유형: "외부" 선택
5. 앱 정보 입력:
   - 앱 이름: "Wedding Photo Upload"
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처: 본인 이메일
6. 범위: "https://www.googleapis.com/auth/drive.file" 추가
7. 테스트 사용자: 청첩장 하객 이메일 추가 (선택사항)
8. 저장 후 "게시" 상태로 변경

#### 방법 3: Apps Script 프로젝트를 Cloud Console에 연결 (권장)
1. **GCP 프로젝트 ID 확인**
   - [Google Cloud Console](https://console.cloud.google.com/) 접속
   - 상단 프로젝트 선택 드롭다운에서 생성한 프로젝트 선택
   - 프로젝트 ID 복사 (예: `my-wedding-project-123456`)

2. **Apps Script 편집기로 이동**
   - [script.google.com](https://script.google.com/) 접속
   - 기존에 생성한 Apps Script 프로젝트 열기

3. **프로젝트 설정 변경**
   - Apps Script 편집기 왼쪽 메뉴에서 **톱니바퀴 아이콘 (프로젝트 설정)** 클릭
   - "Google Cloud Platform (GCP) 프로젝트" 섹션 찾기
   - **"프로젝트 변경"** 버튼 클릭

4. **GCP 프로젝트 연결**
   - "Google Cloud Platform 프로젝트 변경" 팝업에서 프로젝트 ID 입력
   - **"프로젝트 설정"** 버튼 클릭
   - 연결이 완료되면 확인 메시지가 나타남

5. **권한 승인**
   - 연결 후 Apps Script가 GCP 프로젝트에 접근할 수 있도록 권한을 승인해야 할 수 있음
   - 브라우저에 권한 승인 요청이 나타나면 승인

6. **OAuth 동의 화면 설정 (선택사항)**
   - GCP Console에서 "API 및 서비스" > "OAuth 동의 화면"으로 이동
   - 앱 정보를 입력하여 검증 상태로 만들면 경고가 사라짐

7. **다시 배포**
   - Apps Script에서 "배포" > "새 배포" 선택
   - 유형: "웹 앱"
   - 실행 권한: "나"
   - 액세스 권한: "모든 사용자" (이제 검증 경고 없이 사용 가능)

### GCP 연결의 장점
- 더 안정적인 API 호출
- Google Cloud의 고급 기능 사용 가능
- 검증 경고 완전 해결
- 프로덕션 환경에 적합

### 3. config.js 설정
```javascript
googleDrive: {
  gasUrl: '복사한_웹앱_URL',  // 여기에 GAS 웹 앱 URL 입력
  enabled: true,
  folderName: 'jh_is_wedding_gallery'
}
```

### 4. GitHub Pages 배포
- GAS URL을 설정한 후 GitHub Pages에 배포하면 바로 사용 가능
- 하객은 로그인 없이 사진 업로드 가능

### 장점
- 서버 비용 무료
- CORS 문제 해결
- 하객 로그인 불필요
- 간단한 구현
