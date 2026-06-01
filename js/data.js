// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const JOB_CATEGORIES = [
  { category: "기술", jobs: ["소프트웨어 엔지니어", "프론트엔드 엔지니어", "백엔드 엔지니어", "풀스택 엔지니어", "모바일 엔지니어", "데이터 엔지니어", "AI/ML 엔지니어", "DevOps 엔지니어", "QA 엔지니어", "보안 엔지니어", "클라우드 엔지니어", "블록체인 엔지니어"] },
  { category: "데이터 사이언스", jobs: ["데이터 사이언티스트", "데이터 분석가", "비즈니스 인텔리전스", "머신러닝 엔지니어", "리서치 사이언티스트"] },
  { category: "제품 관리", jobs: ["프로덕트 매니저", "프로덕트 디렉터", "기술 프로덕트 매니저", "프로덕트 오너"] },
  { category: "소프트웨어 개발 관리", jobs: ["소프트웨어 엔지니어링 매니저", "CTO", "VP of Engineering", "기술 리더"] },
  { category: "디자인", jobs: ["프로덕트 디자이너", "UX 디자이너", "UI 디자이너", "UX 리서처", "그래픽 디자이너"] },
  { category: "비즈니스", jobs: ["경영 컨설턴트", "비즈니스 개발", "전략 기획", "기획자"] },
  { category: "금융", jobs: ["투자 은행가", "애널리스트", "재무 분석가", "회계사", "벤처 캐피탈리스트", "액추어리"] },
  { category: "엔지니어링", jobs: ["하드웨어 엔지니어", "기계 엔지니어", "전기 엔지니어", "항공우주 엔지니어", "화학 엔지니어", "바이오메디컬 엔지니어"] },
  { category: "인사", jobs: ["인사 담당자", "리크루터", "총무/인사", "피플 오퍼레이션"] },
  { category: "전략 및 운영", jobs: ["마케팅", "마케팅 오퍼레이션", "비즈니스 애널리스트", "고객 서비스", "데이터 분석가", "코퍼레이트 개발"] },
  { category: "영업", jobs: ["영업 담당자", "세일즈 엔지니어", "고객 성공 매니저", "테크니컬 어카운트 매니저"] },
  { category: "IT", jobs: ["사이버보안 애널리스트", "IT 전문가", "시스템 어드민", "네트워크 엔지니어"] },
  { category: "법무", jobs: ["법무 담당자", "컴플라이언스 오피서", "법률 오퍼레이션", "패러리걸"] },
  { category: "행정", jobs: ["행정 비서", "비서실장", "창업자/대표"] },
  { category: "의료", jobs: ["의사", "간호사", "약사", "독성학자"] },
  { category: "부동산", jobs: ["시설 관리자", "부동산 매니저", "부동산 중개인"] },
];

const POPULAR_COMPANIES = [
  { name: "삼성전자", color: "#1428A0", abbr: "삼성", slug: "samsung" },
  { name: "카카오", color: "#FEE500", abbr: "카카오", slug: "kakao" },
  { name: "네이버", color: "#03C75A", abbr: "NAVER", slug: "naver" },
  { name: "현대자동차", color: "#002C5F", abbr: "현대", slug: "hyundai" },
  { name: "LG전자", color: "#A50034", abbr: "LG", slug: "lg" },
  { name: "SK하이닉스", color: "#E4003B", abbr: "SK", slug: "sk-hynix" },
  { name: "쿠팡", color: "#1672CF", abbr: "쿠팡", slug: "coupang" },
  { name: "토스", color: "#0064FF", abbr: "toss", slug: "toss" },
  { name: "배달의민족", color: "#2AC1BC", abbr: "배민", slug: "baemin" },
  { name: "당근마켓", color: "#FF6F0F", abbr: "당근", slug: "daangn" },
  { name: "라인", color: "#06C755", abbr: "LINE", slug: "line" },
  { name: "크래프톤", color: "#1A1A2E", abbr: "KRAFT", slug: "krafton" },
];

const LEVELS = ["CL1 (신입)", "CL2 (주임)", "CL3 (대리)", "CL4 (과장)", "CL5 (차장)", "F1 (임원)"];

const CAREER_DATA = [
  { level: "CL1", base: 3800, stock: 200, bonus: 300 },
  { level: "CL2", base: 5200, stock: 600, bonus: 500 },
  { level: "CL3", base: 7000, stock: 1200, bonus: 800 },
  { level: "CL4", base: 9500, stock: 2500, bonus: 1200 },
  { level: "CL5", base: 13000, stock: 5000, bonus: 2000 },
  { level: "F1", base: 20000, stock: 12000, bonus: 4000 },
];

const SCATTER_DATA = {
  CL1: [3200, 3500, 3800, 4000, 4200],
  CL2: [4500, 5000, 5200, 5500, 5800, 6000],
  CL3: [6200, 6800, 7000, 7500, 8000, 8500],
  CL4: [8000, 9000, 9500, 10500, 11000],
  CL5: [11000, 12000, 13000, 15000, 17000],
  F1: [18000, 22000, 28000, 35000],
};

const RECENT_SUBMISSIONS = [
  { company: "삼성전자", level: "CL3", title: "소프트웨어 엔지니어", loc: "수원", base: 8200, stock: 1500, bonus: 900, date: "2025.05.28" },
  { company: "카카오", level: "CL4", title: "백엔드 엔지니어", loc: "판교", base: 11000, stock: 3500, bonus: 1500, date: "2025.05.27" },
  { company: "네이버", level: "CL3", title: "프론트엔드 엔지니어", loc: "판교", base: 9500, stock: 2000, bonus: 1000, date: "2025.05.26" },
  { company: "토스", level: "CL4", title: "프로덕트 매니저", loc: "서울", base: 13000, stock: 5000, bonus: 2000, date: "2025.05.25" },
  { company: "쿠팡", level: "CL2", title: "데이터 분석가", loc: "서울", base: 6200, stock: 800, bonus: 600, date: "2025.05.24" },
];

const BENEFITS = [
  { cat: "보험 및 건강", icon: "🏥", items: ["치과 보험", "건강 보험", "생명 보험", "시력 보험", "정신건강 지원", "장애 보험", "상해 보험"] },
  { cat: "주거 및 교통", icon: "🏠", items: ["통근 지원", "주택 구입 보조", "이사 지원", "사내 셔틀", "주차 지원", "유류비 지원"] },
  { cat: "재무 및 연금", icon: "💰", items: ["퇴직연금 (DB형)", "퇴직연금 (DC형)", "우리사주 (ESOP)", "성과 인센티브", "스톡옵션", "상여금"] },
  { cat: "휴가 및 복지", icon: "🌴", items: ["연차 (15일+)", "육아 휴직", "가족 돌봄 휴가", "안식년 제도", "리프레시 휴가", "경조 휴가"] },
  { cat: "식사 및 편의", icon: "🍽️", items: ["무료 식사 제공", "카페테리아 운영", "사내 카페", "간식 제공", "사내 헬스장", "온사이트 세탁"] },
  { cat: "교육 및 성장", icon: "📚", items: ["교육비 지원", "도서 구입비", "컨퍼런스 참가비", "자격증 지원", "외국어 교육"] },
  { cat: "기타", icon: "🎁", items: ["재택근무 지원", "자녀 학자금", "경조사 지원", "사원 할인", "동호회 지원", "봉사활동 지원"] },
];

const SALARY_FILTERS = [
  { label: "Location (4)", key: "location" },
  { label: "직군 (1)", key: "jobFamily" },
  { label: "포커스 태그", key: "focusTag" },
  { label: "기간 (1)", key: "timeRange" },
  { label: "회사", key: "company" },
  { label: "회사 규모", key: "companySize" },
  { label: "기업 가치", key: "valuation" },
  { label: "제출 유형", key: "submissionType" },
];

const COMPANY_LEVELS = {
  Google: [
    { name: "L3", sub: "SWE I" }, { name: "L4", sub: "SWE II" }, { name: "L5", sub: "Senior SWE" },
    { name: "L6", sub: "Staff SWE" }, { name: "L7", sub: "Senior Staff SWE" }, { name: "L8", sub: "Principal Engineer" },
    { name: "L9", sub: "Distinguished Engineer" }, { name: "L10", sub: "Google Fellow" }
  ],
  삼성전자: [
    { name: "CL1", sub: "신입 사원" }, { name: "CL2", sub: "주임 연구원" }, { name: "CL3", sub: "선임 연구원" },
    { name: "CL4", sub: "책임 연구원" }, { name: "CL5", sub: "수석 연구원" }, { name: "F1", sub: "임원" }
  ],
  카카오: [
    { name: "Junior", sub: "주니어" }, { name: "Senior", sub: "시니어" }, { name: "Staff", sub: "스태프" },
    { name: "Principal", sub: "프린시펄" }, { name: "Fellow", sub: "펠로우" }
  ],
  네이버: [
    { name: "L1", sub: "신입" }, { name: "L2", sub: "경력 2-5년" }, { name: "L3", sub: "경력 5-10년" },
    { name: "L4", sub: "시니어" }, { name: "L5", sub: "리더" }
  ],
};

const TOP_PAYING = [
  { rank: 1, company: "토스", abbr: "toss", color: "#0064FF", tc: "₩9,180만" },
  { rank: 2, company: "카카오", abbr: "카카오", color: "#FEE500", tc: "₩8,650만" },
  { rank: 3, company: "네이버", abbr: "NAVER", color: "#03C75A", tc: "₩8,200만" },
  { rank: 4, company: "쿠팡", abbr: "쿠팡", color: "#1672CF", tc: "₩7,900만" },
  { rank: 5, company: "삼성전자", abbr: "삼성", color: "#1428A0", tc: "₩7,500만" },
  { rank: 6, company: "당근마켓", abbr: "당근", color: "#FF6F0F", tc: "₩7,200만" },
  { rank: 7, company: "라인", abbr: "LINE", color: "#06C755", tc: "₩7,000만" },
];

const REPORT_LEVELS = [
  { lvl: "CL1 신입", y24: "₩3.6천만", y25: "₩3.7천만", chg: "+1.64%", pos: true },
  { lvl: "CL2 주임", y24: "₩4.8천만", y25: "₩4.9천만", chg: "+1.8%", pos: true },
  { lvl: "CL3 대리", y24: "₩6.5천만", y25: "₩6.7천만", chg: "+4.2%", pos: true },
  { lvl: "CL4 과장", y24: "₩9.2천만", y25: "₩9.9천만", chg: "+7.5%", pos: true },
  { lvl: "CL5 차장", y24: "₩1.3억", y25: "₩1.26억", chg: "-3.5%", pos: false },
];
