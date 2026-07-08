/**
 * Watercolor Soft Wedding Invitation Configuration
 *
 * 이 파일에서 청첩장의 모든 정보를 수정할 수 있습니다.
 * 이미지는 설정이 필요 없습니다. 아래 폴더에 순번 파일명으로 넣으면 자동 감지됩니다.
 *
 * 이미지 폴더 구조 (파일명 규칙):
 *   images/hero/1.jpg      - 메인 사진 (1장, 필수)
 *   images/story/1.jpg, 2.jpg, ...  - 스토리 사진들 (순번, 자동 감지)
 *   images/gallery/1.jpg, 2.jpg, ... - 갤러리 사진들 (순번, 자동 감지)
 *   images/location/1.jpg  - 약도/지도 이미지 (1장)
 *   images/og/1.jpg        - 카카오톡 공유 썸네일 (1장)
 */

const CONFIG = {
  // ── 1. 초대장 열기 ──
  useCurtain: true,  // 초대장 열기 화면 사용 여부 (true: 사용, false: 바로 본문 표시)

  // ── 2. 메인 (히어로) ──
  groom: {
    name: "양종혁",
    nameEn: "Yang JongHyuk",
    father: "양동섭",
    mother: "구정옥",
    fatherDeceased: false,
    motherDeceased: false
  },

  bride: {
    name: "유이슬",
    nameEn: "Yoo ISeul",
    father: "유석기",
    mother: "오예원",
    fatherDeceased: false,
    motherDeceased: false
  },

  wedding: {
    date: "2026-11-22",
    time: "15:20",
    venue: "루이비스컨벤션웨딩홀 송파문정점",
    hall: "그레이스홀",
    address: "서울시 송파구 법원로 9길 26",
    tel: "02-6281-9000"
  },

  // ── 3. 인사말 ──
  greeting: {
    title: "소중한 분들을 초대합니다",
    content: "10년 동안 함께한 소중한 인연이 결실을 맺어\n이제 평생을 함께할 부부가 됩니다.\n\n저희의 새로운 시작을 축복해주시는 \n모든 분들께 진심으로 감사드리며,\n서로를 아끼고 사랑하며 행복하게 잘 살겠습니다."
  },

  // ── 4. 우리의 이야기 ──
  story: {
    title: "우리의 이야기",
    content: "우리의 가장 아름다운 순간을\n 필름 위에 조심스레 새겼습니다.\n\n따뜻한 마음으로 함께해 주세요."
  },

  // ── 5. 오시는 길 ──
  mapLinks: {
    kakao: "https://map.kakao.com/?urlX=525939.999999998&urlY=1106942.9999999993&urlLevel=3&itemId=1862136403&q=%EB%A3%A8%EC%9D%B4%EB%B9%84%EC%8A%A4%EC%BB%A8%EB%B2%A4%EC%85%98%20%EC%86%A1%ED%8C%8C%EB%AC%B8%EC%A0%95%EC%A0%90&srcid=1862136403&map_type=TYPE_MAP",
    naver: "https://naver.me/Gctrli34"
  },

  // ── 6. 마음 전하실 곳 ──
  accounts: {
    groom: [
      { role: "신랑측", name: "양종혁", bank: "토스뱅크", number: "1000-3404-9406" },
    ],
    bride: [
      { role: "신부측", name: "유이슬", bank: "토스뱅크", number: "1000-3177-2871" },
    ]
  },

  // ── 링크 공유 시 나타나는 문구 ──
  meta: {
    title: "신랑 ♥ 신부 결혼합니다",
    description: "2026년 11월 22일, 소중한 분들을 초대합니다.",
    image: "images/og/1.jpg"
  },

  // ── Google Drive 업로드 ──
  googleDrive: {
    gasUrl: 'https://script.google.com/macros/s/AKfycbyJ0Rz_WyDsNrBkiPax5H90wCGBxk4NugNDIpzp3UgsnBIKsB4y4D4L2en5G_VIYAan/exec',
    enabled: true,  // true로 설정하면 업로드 기능 활성화
    folderName: 'jh_is_wedding_gallery'  // 업로드할 폴더 이름
  }
};
