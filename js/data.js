// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const POPULAR_COMPANIES = [
  { name: '삼성전자', color: '#1428A0', abbr: '삼성', slug: 'samsung' },
  { name: '카카오', color: '#FEE500', abbr: '카카오', slug: 'kakao' },
  { name: '네이버', color: '#03C75A', abbr: 'NAVER', slug: 'naver' },
  { name: 'LG전자', color: '#A50034', abbr: 'LG', slug: 'lg' },
  { name: '현대자동차', color: '#002C5F', abbr: '현대', slug: 'hyundai' },
  { name: 'SK하이닉스', color: '#EA0029', abbr: 'SK', slug: 'sk-hynix' },
  { name: '쿠팡', color: '#FFCD00', abbr: '쿠팡', slug: 'coupang' },
  { name: '토스', color: '#0064FF', abbr: '토스', slug: 'toss' },
  { name: '배달의민족', color: '#7AC142', abbr: '배민', slug: 'baemin' },
  { name: '라인플러스', color: '#00C300', abbr: 'LINE', slug: 'line' },
  { name: '크래프톤', color: '#1C1C1C', abbr: 'PUBG', slug: 'krafton' },
  { name: 'KB국민은행', color: '#FFBC00', abbr: 'KB', slug: 'kb' },
];

const JOB_CATEGORIES = [
  { category: '소프트웨어 엔지니어링', jobs: ['프론트엔드', '백엔드', '풀스택', '모바일(iOS)', '모바일(Android)', '임베디드', 'DevOps/SRE', '보안'] },
  { category: '데이터 & AI', jobs: ['데이터 사이언티스트', '머신러닝 엔지니어', '데이터 엔지니어', 'AI 연구원', 'BI 분석가'] },
  { category: '프로덕트', jobs: ['프로덕트 매니저', '프로덕트 오너', '그로스 PM'] },
  { category: '디자인', jobs: ['UX 디자이너', 'UI 디자이너', '프로덕트 디자이너', '브랜드 디자이너', '모션 디자이너'] },
  { category: '비즈니스', jobs: ['경영기획', '사업개발', '전략기획', 'M&A'] },
  { category: '마케팅', jobs: ['퍼포먼스 마케터', '브랜드 마케터', 'CRM', 'SEO/ASO'] },
  { category: '세일즈', jobs: ['영업', 'B2B 세일즈', '파트너십', '어카운트 매니저'] },
  { category: '재무/회계', jobs: ['재무기획', '회계', '세무', '투자'] },
  { category: '인사/조직', jobs: ['HR 제너럴리스트', '리크루터', 'HRBP', '조직문화'] },
  { category: '법무', jobs: ['사내변호사', '컴플라이언스', '지식재산권'] },
  { category: '운영/SCM', jobs: ['물류', '구매/조달', '생산관리', '품질관리'] },
  { category: '컨설팅', jobs: ['경영컨설팅', 'IT컨설팅', '전략컨설팅'] },
  { category: '금융', jobs: ['투자은행', '자산운용', '리스크관리', '퀀트'] },
  { category: '연구개발', jobs: ['반도체 설계', '소재 연구', '바이오 연구', '화학 연구'] },
  { category: '의료/바이오', jobs: ['의사', '약사', '임상연구원', '의료기기'] },
  { category: '기타', jobs: ['어드민/총무', '교육/HRD', '고객지원', '기타'] },
];

const LEVELS = ['CL1', 'CL2', 'CL3', 'CL4', 'CL5', 'F1'];

const CAREER_DATA = [
  { level: 'CL1', base: 3800, stock: 200, bonus: 300 },
  { level: 'CL2', base: 5200, stock: 600, bonus: 600 },
  { level: 'CL3', base: 7500, stock: 1800, bonus: 1200 },
  { level: 'CL4', base: 10000, stock: 4000, bonus: 2000 },
  { level: 'CL5', base: 14000, stock: 8000, bonus: 3500 },
  { level: 'F1',  base: 20000, stock: 20000, bonus: 8000 },
];

const SCATTER_DATA = {
  CL1: [3200, 3500, 3600, 3800, 3900, 4000, 4200],
  CL2: [4500, 5000, 5200, 5500, 5800, 6200],
  CL3: [6500, 7000, 7500, 8000, 8500, 9500, 10000],
  CL4: [9000, 10000, 11000, 12000, 13500, 15000],
  CL5: [13000, 15000, 17000, 19000, 22000, 26000],
  F1:  [25000, 30000, 35000, 45000, 60000],
};

const RECENT_SUBMISSIONS = [
  { company: '삼성전자', level: 'CL3', title: '소프트웨어 엔지니어', loc: '수원', base: 7800, stock: 2000, bonus: 1200, date: '2일 전' },
  { company: '카카오', level: 'CL4', title: '백엔드 엔지니어', loc: '판교', base: 10500, stock: 4500, bonus: 2000, date: '3일 전' },
  { company: '네이버', level: 'CL3', title: '프론트엔드 엔지니어', loc: '성남', base: 8200, stock: 2500, bonus: 1500, date: '5일 전' },
  { company: '토스', level: 'CL4', title: '풀스택 엔지니어', loc: '서울', base: 12000, stock: 5000, bonus: 2500, date: '1주 전' },
  { company: 'LG전자', level: 'CL2', title: 'AI 연구원', loc: '서울', base: 5500, stock: 800, bonus: 700, date: '1주 전' },
];

const BENEFITS = [
  { cat: '복지포인트/지원금', items: ['연간 복지포인트', '생일 선물', '명절 선물', '건강검진 지원', '자기개발비 지원'] },
  { cat: '보험/건강', items: ['단체 실손보험', '치과 보험', '임직원 건강검진', '심리상담 지원', '헬스장 이용권'] },
  { cat: '식사/간식', items: ['구내식당 운영', '점심 식대 지원', '간식 제공', '커피 무제한', '저녁 식대 지원'] },
  { cat: '주거/교통', items: ['통근버스 운행', '주차 지원', '주택 대출 지원', '사택 제공', '교통비 지원'] },
  { cat: '육아/가족', items: ['육아휴직', '배우자 출산휴가', '어린이집 운영', '자녀 학자금', '가족 돌봄 휴가'] },
  { cat: '교육/성장', items: ['도서 구매 지원', '외부 교육 지원', '사내 강의', '학위 취득 지원', '컨퍼런스 참가비'] },
  { cat: '휴가/유연근무', items: ['리프레시 휴가', '반차 자유', '재택근무', '유연근무제', '안식월'] },
];

const COMPANY_LEVELS = {
  삼성전자: [
    { name: 'CL1', sub: '신입 / 인턴' },
    { name: 'CL2', sub: '대리급 (3~6년)' },
    { name: 'CL3', sub: '과장급 (7~10년)' },
    { name: 'CL4', sub: '차장/부장급' },
    { name: 'CL5', sub: '수석급 / 팀장' },
    { name: 'F1', sub: '임원급 (펠로우/마스터)' },
  ],
  카카오: [
    { name: 'Junior', sub: '0~3년차' },
    { name: 'Senior', sub: '4~7년차' },
    { name: 'Staff', sub: '8~12년차' },
    { name: 'Principal', sub: '13년차+' },
    { name: 'Fellow', sub: '기술 임원' },
  ],
  네이버: [
    { name: 'L1', sub: '인턴/신입' },
    { name: 'L2', sub: '주임급' },
    { name: 'L3', sub: '대리/과장급' },
    { name: 'L4', sub: '부장급' },
    { name: 'L5', sub: '수석급' },
    { name: 'L6', sub: '리더/임원' },
  ],
  Google: [
    { name: 'L3', sub: '신입 SWE' },
    { name: 'L4', sub: '소프트웨어 엔지니어' },
    { name: 'L5', sub: '시니어 SWE' },
    { name: 'L6', sub: '스태프 SWE' },
    { name: 'L7', sub: '시니어 스태프 SWE' },
    { name: 'L8', sub: '프린시펄 엔지니어' },
    { name: 'L9', sub: '디스팅귀시드 엔지니어' },
    { name: 'L10', sub: '구글 펠로우' },
  ],
};

const TOP_PAYING = [
  { rank: 1, company: '토스(비바리퍼블리카)', abbr: '토스', color: '#0064FF', tc: '₩1.8억' },
  { rank: 2, company: '쿠팡', abbr: '쿠팡', color: '#FFCD00', tc: '₩1.6억' },
  { rank: 3, company: '크래프톤', abbr: 'PUBG', color: '#1C1C1C', tc: '₩1.5억' },
  { rank: 4, company: '카카오', abbr: '카카오', color: '#FEE500', tc: '₩1.4억' },
  { rank: 5, company: '네이버', abbr: 'NAVER', color: '#03C75A', tc: '₩1.35억' },
  { rank: 6, company: '삼성전자', abbr: '삼성', color: '#1428A0', tc: '₩1.2억' },
  { rank: 7, company: '라인플러스', abbr: 'LINE', color: '#00C300', tc: '₩1.15억' },
];

const REPORT_LEVELS = [
  { lvl: 'CL1 신입', y24: '₩3.6천만', y25: '₩3.7천만', chg: '+1.64%', pos: true },
  { lvl: 'CL2 주임', y24: '₩5.5천만', y25: '₩5.8천만', chg: '+4.5%',  pos: true },
  { lvl: 'CL3 선임', y24: '₩8.2천만', y25: '₩8.7천만', chg: '+6.1%',  pos: true },
  { lvl: 'CL4 책임', y24: '₩1.3억',   y25: '₩1.4억',   chg: '+8.2%',  pos: true },
  { lvl: 'CL5 수석', y24: '₩1.9억',   y25: '₩2.1억',   chg: '+10.5%', pos: true },
  { lvl: 'F1 임원',  y24: '₩3.2억',   y25: '₩3.0억',   chg: '-6.3%',  pos: false },
];

const SALARY_FILTERS = [
  { label: '직군',     key: 'job' },
  { label: '경력',     key: 'yoe' },
  { label: '학력',     key: 'edu' },
  { label: '지역',     key: 'loc' },
  { label: '레벨',     key: 'level' },
  { label: '기간',     key: 'period' },
  { label: '고용형태', key: 'type' },
  { label: '재직상태', key: 'status' },
];
