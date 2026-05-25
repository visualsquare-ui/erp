export type Language = "en" | "ko";

export type IndustryPage = {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  audience: string;
  visualTheme: {
    mood: string;
    imageSrc: string;
    palette: [string, string, string];
    previewItems: [string, string, string, ...string[]];
  };
  processSteps: StudioProcessStep[];
  services: string[];
  deliverables: string[];
  outcomes: string[];
  faq: { question: string; answer: string }[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  language: Language;
  publishDate: string;
  category: string;
  industrySlug: string;
  readingMinutes: number;
  summary: string;
  keyPoints: string[];
  sections: { heading: string; body: string[]; bullets?: string[] }[];
  faq: { question: string; answer: string }[];
  ko?: {
    title: string;
    description: string;
    category: string;
    summary: string;
    keyPoints: string[];
    sections: { heading: string; body: string[]; bullets?: string[] }[];
  };
};

export type WeeklyBlogPlan = {
  weekOf: string;
  posts: Pick<BlogPost, "slug" | "title" | "language" | "publishDate" | "industrySlug">[];
};

export type StudioProcessStep = {
  number: string;
  title: string;
  description: string;
  output: string;
};

export type IndustryPageKo = {
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  audience: string;
  visualTheme: {
    mood: string;
    previewItems: [string, string, string, ...string[]];
  };
  services: string[];
  deliverables: string[];
  outcomes: string[];
  faq: { question: string; answer: string }[];
};

export type StudioProcessStepKo = Pick<
  StudioProcessStep,
  "title" | "description" | "output"
>;

type IndustryProcessCopy = Record<
  | "inquiry"
  | "diagnosis"
  | "discovery"
  | "direction"
  | "scope"
  | "production"
  | "review"
  | "growth",
  { description: string; output: string }
>;

function createIndustryProcessSteps(copy: IndustryProcessCopy): StudioProcessStep[] {
  return [
    {
      number: "01",
      title: "Inquiry",
      ...copy.inquiry,
    },
    {
      number: "02",
      title: "Business diagnosis",
      ...copy.diagnosis,
    },
    {
      number: "03",
      title: "Discovery meetings",
      ...copy.discovery,
    },
    {
      number: "04",
      title: "Direction options",
      ...copy.direction,
    },
    {
      number: "05",
      title: "Scope and roadmap",
      ...copy.scope,
    },
    {
      number: "06",
      title: "Design system production",
      ...copy.production,
    },
    {
      number: "07",
      title: "Review and launch prep",
      ...copy.review,
    },
    {
      number: "08",
      title: "Growth updates",
      ...copy.growth,
    },
  ];
}

export const studioProcessSteps: StudioProcessStep[] = [
  {
    number: "01",
    title: "Inquiry",
    description:
      "You tell us what you are opening, changing, or trying to improve.",
    output: "Project fit",
  },
  {
    number: "02",
    title: "Business diagnosis",
    description:
      "We review the business type, audience, local competition, and the visual problems that need to be solved.",
    output: "Business priorities",
  },
  {
    number: "03",
    title: "Discovery meetings",
    description:
      "We use 1-2 meetings to clarify your ideas, taste, budget, timeline, and customer touchpoints.",
    output: "Creative brief",
  },
  {
    number: "04",
    title: "Direction options",
    description:
      "We present A, B, and C directions and recommend the strongest path.",
    output: "Recommended direction",
  },
  {
    number: "05",
    title: "Scope and roadmap",
    description:
      "After choosing a direction, we define the exact brand, web, print, and content scope.",
    output: "Approved scope",
  },
  {
    number: "06",
    title: "Design system production",
    description:
      "The selected direction becomes logos, colors, type, layouts, pages, collateral, and files.",
    output: "Design assets",
  },
  {
    number: "07",
    title: "Review and launch prep",
    description:
      "We refine the work, check details, prepare web QA, and organize files for vendors or launch.",
    output: "Launch-ready files",
  },
  {
    number: "08",
    title: "Growth updates",
    description:
      "After launch, the brand keeps improving through content, campaigns, SEO, GEO, and seasonal updates.",
    output: "Living brand system",
  },
];

const studioProcessStepKoByTitle: Record<string, StudioProcessStepKo> = {
  Inquiry: {
    title: "문의 접수",
    description: "무엇을 오픈, 변경, 개선하려는지 알려주시면 프로젝트 적합성을 먼저 확인합니다.",
    output: "프로젝트 적합성",
  },
  "Business diagnosis": {
    title: "비즈니스 진단",
    description:
      "업종, 고객, 지역 경쟁, 현재 접점, 해결해야 할 시각 문제를 함께 검토합니다.",
    output: "비즈니스 우선순위",
  },
  "Discovery meetings": {
    title: "디스커버리 미팅",
    description:
      "아이디어, 취향, 예산, 일정, 고객 접점을 1-2회 미팅으로 정리합니다.",
    output: "크리에이티브 브리프",
  },
  "Direction options": {
    title: "방향 제안",
    description: "A, B, C 방향을 제시하고 비즈니스에 가장 강한 방향을 추천합니다.",
    output: "추천 방향",
  },
  "Scope and roadmap": {
    title: "범위와 로드맵",
    description:
      "선택한 방향에 맞춰 브랜드, 웹, 인쇄, 콘텐츠 범위를 정확히 정의합니다.",
    output: "승인된 범위",
  },
  "Design system production": {
    title: "디자인 시스템 제작",
    description:
      "선택한 방향을 로고, 컬러, 타입, 레이아웃, 페이지, 인쇄물, 파일로 제작합니다.",
    output: "디자인 자산",
  },
  "Review and launch prep": {
    title: "검토와 런칭 준비",
    description:
      "디테일을 다듬고 웹 QA, 인쇄 사양, 벤더 전달용 파일을 정리합니다.",
    output: "런칭 준비 파일",
  },
  "Growth updates": {
    title: "성장 업데이트",
    description:
      "런칭 후 콘텐츠, 캠페인, SEO/GEO, 시즌 업데이트로 브랜드를 계속 개선합니다.",
    output: "운영형 브랜드 시스템",
  },
};

export function getStudioProcessStepKo(
  step: StudioProcessStep,
): StudioProcessStepKo {
  return (
    studioProcessStepKoByTitle[step.title] ?? {
      title: step.title,
      description: step.description,
      output: step.output,
    }
  );
}

export const industryPageKoBySlug: Record<string, IndustryPageKo> = {
  "med-spa-branding-design": {
    name: "메드스파",
    eyebrow: "뷰티와 웰니스",
    title: "뉴욕 뉴저지 메드스파 브랜딩과 디자인",
    description:
      "메드스파와 에스테틱 클리닉을 위한 브랜드 아이덴티티, 웹사이트, 인쇄물, 런칭 자료, 제작 준비 비주얼 자산.",
    audience:
      "뉴욕/뉴저지에서 오픈, 리프레시, 성장을 준비하는 메드스파, 에스테틱 클리닉, 레이저 스튜디오, 웰니스 팀을 위한 페이지입니다.",
    visualTheme: {
      mood: "프리미엄, 차분한 예약 중심",
      previewItems: ["예약 페이지", "서비스 메뉴", "기프트 카드", "런칭 소셜"],
    },
    services: [
      "브랜드 아이덴티티",
      "로고 디자인",
      "웹사이트와 랜딩페이지 디자인",
      "서비스 메뉴와 브로셔 디자인",
      "소셜 및 광고 크리에이티브",
      "인쇄 제작 코디네이션",
    ],
    deliverables: [
      "로고 시스템과 브랜드 컬러",
      "예약 중심 웹사이트 페이지",
      "시술 메뉴와 가격 안내 자료",
      "기프트 카드, 리퍼럴 카드, 런칭 플라이어",
      "인스타그램 템플릿과 캠페인 그래픽",
      "인쇄와 벤더 전달용 제작 준비 파일",
    ],
    outcomes: [
      "첫 예약 전부터 더 프리미엄한 첫인상",
      "웹, 인쇄, 소셜, 매장 접점까지 일관된 비주얼",
      "벤더 전달 문제를 줄이는 빠른 런칭 준비",
    ],
    faq: [
      {
        question: "메드스파 오픈 전에 전체 브랜드 시스템이 꼭 필요한가요?",
        answer:
          "항상 큰 브랜드북이 필요한 것은 아니지만, 로고, 컬러, 타입, 웹사이트 방향, 서비스 메뉴, 런칭 인쇄물이 명확하면 첫날부터 더 안정감 있게 보입니다.",
      },
      {
        question: "인쇄물 제작까지 같이 조율할 수 있나요?",
        answer:
          "네. Visual Square는 디자인 에이전시이자 프린트 브로커로서 제작 준비 파일을 만들고 필요한 경우 인쇄 벤더와 사양을 조율합니다.",
      },
    ],
  },
  "dental-clinic-branding-design": {
    name: "치과",
    eyebrow: "헬스케어 프랙티스",
    title: "뉴욕 뉴저지 치과 브랜딩과 디자인",
    description:
      "치과, 교정 클리닉, 전문 진료 클리닉을 위한 신뢰 중심 비주얼 시스템.",
    audience:
      "새로 오픈하는 치과, 확장하는 클리닉, 더 전문적인 환자 접점이 필요한 진료실을 위한 페이지입니다.",
    visualTheme: {
      mood: "깨끗하고 임상적이며 신뢰감 있는",
      previewItems: ["병원 웹사이트", "환자 패킷", "리퍼럴 카드", "케어 시트"],
    },
    services: [
      "브랜드 아이덴티티",
      "웹사이트 디자인",
      "환자 양식과 인쇄물",
      "병원 커뮤니케이션 자료",
      "Google 비즈니스 프로필 이미지 지원",
      "제작 준비 파일 전달",
    ],
    deliverables: [
      "로고와 병원 아이덴티티",
      "홈페이지와 서비스 페이지 디자인",
      "신규 환자 패킷과 리퍼럴 카드",
      "보험 및 서비스 설명 시트",
      "예약 리마인더와 리뷰 요청 그래픽",
      "실내 안내물과 방향 사인용 인쇄 파일",
    ],
    outcomes: [
      "신규 환자에게 더 신뢰감 있는 첫인상",
      "서비스, 결제 옵션, 다음 단계에 대한 더 명확한 설명",
      "디지털과 인쇄 접점 전반의 일관된 브랜드 표현",
    ],
    faq: [
      {
        question: "치과 브랜딩에서 가장 중요한 것은 무엇인가요?",
        answer:
          "깨끗함, 차분함, 신뢰감입니다. 환자는 누구인지, 어디서 예약하는지, 왜 믿을 수 있는지를 빠르게 이해해야 합니다.",
      },
      {
        question: "새 병원에만 필요한 작업인가요?",
        answer:
          "아닙니다. 기존 병원도 오래된 로고, 웹사이트, 환자 양식, 인쇄물을 정리하면 전체 아이덴티티를 바꾸지 않고도 훨씬 전문적으로 보일 수 있습니다.",
      },
    ],
  },
  "restaurant-cafe-branding-design": {
    name: "레스토랑과 카페",
    eyebrow: "푸드 앤 베버리지",
    title: "뉴욕 뉴저지 레스토랑과 카페 브랜딩 디자인",
    description:
      "레스토랑, 카페, 베이커리, 디저트샵, 호스피탈리티 브랜드를 위한 런칭 준비 디자인 시스템.",
    audience:
      "메뉴, 웹사이트, 패키지, 소셜 런칭 그래픽, 인쇄물이 함께 작동해야 하는 푸드 비즈니스를 위한 페이지입니다.",
    visualTheme: {
      mood: "기억에 남고 식욕을 자극하는 캠페인 준비형",
      previewItems: ["메뉴 시스템", "테이크아웃 플라이어", "패키지 라벨", "소셜 런칭"],
    },
    services: [
      "로고와 브랜드 아이덴티티",
      "메뉴 디자인",
      "웹사이트와 랜딩페이지 디자인",
      "패키지와 라벨 디자인",
      "소셜 런칭 크리에이티브",
      "인쇄 벤더 코디네이션",
    ],
    deliverables: [
      "메인 로고와 보조 마크",
      "매장용, 테이크아웃, 디지털 메뉴 레이아웃",
      "오픈 플라이어와 로컬 프로모션 자료",
      "패키지 스티커, 라벨, 봉투 그래픽",
      "Google, Yelp, 소셜 프로필 비주얼",
      "제작 준비 인쇄 파일",
    ],
    outcomes: [
      "고객 방문 전부터 더 명확한 브랜드 스토리",
      "급하게 조합한 느낌이 아닌 의도적인 메뉴와 프로모션",
      "시즌 캠페인에 반복 사용할 수 있는 디자인 자산",
    ],
    faq: [
      {
        question: "레스토랑은 로고와 메뉴 중 무엇부터 시작해야 하나요?",
        answer:
          "로고와 메뉴는 함께 설계하는 것이 좋습니다. 오픈 후 메뉴는 브랜드를 가장 자주 보여주는 핵심 접점이기 때문입니다.",
      },
      {
        question: "인쇄 사양도 도와줄 수 있나요?",
        answer:
          "네. 종이, 후가공, 사이즈, 벤더 전달 파일 형식 등 제작 조건을 고려해 인쇄용 파일을 준비할 수 있습니다.",
      },
    ],
  },
  "real-estate-property-marketing-design": {
    name: "부동산",
    eyebrow: "프로퍼티 마케팅",
    title: "부동산과 프로퍼티 마케팅 디자인",
    description:
      "브로셔, 리스팅 덱, 리스 자료, 프로퍼티 웹사이트, 투자자용 디자인을 만드는 부동산 팀용 시스템.",
    audience:
      "리스팅, 임대, 프레젠테이션을 위한 완성도 높은 자료가 필요한 브로커, 매니저, 개발사, 상업용 부동산 팀을 위한 페이지입니다.",
    visualTheme: {
      mood: "구조적이고 프리미엄하며 정보 중심",
      previewItems: ["리스팅 브로셔", "피치 덱", "프로퍼티 시트", "이메일 그래픽"],
    },
    services: [
      "리스팅 브로셔 디자인",
      "프레젠테이션 덱 디자인",
      "프로퍼티 웹사이트 방향",
      "이메일과 캠페인 그래픽",
      "인쇄 준비 마케팅 자료",
      "프로퍼티 자산 브랜드 정리",
    ],
    deliverables: [
      "임대 플라이어와 리스팅 브로셔",
      "피치 덱과 오퍼링 스타일 프레젠테이션",
      "프로퍼티 팩트 시트",
      "이메일 캠페인 비주얼",
      "지도, 어메니티 그래픽, 지역 하이라이트",
      "인쇄와 PDF 출력 패키지",
    ],
    outcomes: [
      "더 신뢰감 있는 프로퍼티 프레젠테이션",
      "더 명확한 세일즈와 리스 자료",
      "여러 리스팅에 반복 사용할 수 있는 디자인 시스템",
    ],
    faq: [
      {
        question: "하나의 부동산 템플릿으로 여러 리스팅을 운영할 수 있나요?",
        answer:
          "네. 재사용 가능한 레이아웃 시스템은 각 프로퍼티의 사진, 정보, 세일즈 포인트를 살리면서도 전체 자료를 일관되게 유지합니다.",
      },
      {
        question: "인쇄 브로셔만 디자인하나요?",
        answer:
          "아닙니다. PDF 덱, 웹 자산, 이메일 그래픽, 인쇄물을 하나의 마케팅 패키지로 지원할 수 있습니다.",
      },
    ],
  },
  "retail-showroom-branding-design": {
    name: "리테일과 쇼룸",
    eyebrow: "리테일 브랜드",
    title: "리테일과 쇼룸 브랜딩 디자인",
    description:
      "리테일 스토어와 쇼룸을 위한 비주얼 아이덴티티, 판매 자료, 디스플레이, 룩북, 캠페인 자산.",
    audience:
      "브랜드 표현을 더 강하게 만들고 싶은 부티크, 쇼룸, 전문 리테일러, 제품 기반 비즈니스를 위한 페이지입니다.",
    visualTheme: {
      mood: "큐레이션된 촉감과 제품 중심",
      previewItems: ["룩북", "제품 라벨", "셸프 카드", "캠페인 자산"],
    },
    services: [
      "브랜드 리프레시",
      "룩북과 카탈로그 디자인",
      "리테일 캠페인 그래픽",
      "패키지와 라벨 디자인",
      "매장 내 인쇄물",
      "제작 파일 준비",
    ],
    deliverables: [
      "브랜드 리프레시 키트",
      "시즌 룩북과 카탈로그",
      "셸프 토커, 카드, 포스터",
      "제품 라벨과 패키지 그래픽",
      "디지털 캠페인 자산",
      "인쇄 벤더 전달 파일",
    ],
    outcomes: [
      "고객에게 보이는 비주얼의 일관성 강화",
      "오프라인과 디지털 채널 전반의 제품 스토리텔링 개선",
      "세일즈, 이벤트, 시즌 프로모션에 반복 사용할 수 있는 자산",
    ],
    faq: [
      {
        question: "작은 리테일 스토어는 무엇부터 정리해야 하나요?",
        answer:
          "로고, 타이포그래피, 컬러, 제품 사진 방향, 자주 쓰는 인쇄 및 디지털 템플릿부터 일관되게 정리하는 것이 좋습니다.",
      },
      {
        question: "기존 브랜드 자산을 활용할 수 있나요?",
        answer:
          "네. 현재 아이덴티티에 가치가 있다면 전체 리브랜딩을 강요하지 않고 기존 자산을 정리하고 확장할 수 있습니다.",
      },
    ],
  },
  "professional-services-branding-design": {
    name: "전문 서비스",
    eyebrow: "로컬 전문가",
    title: "전문 서비스 브랜딩과 웹 디자인",
    description:
      "로컬 전문 서비스 비즈니스를 위한 신뢰 중심 브랜딩, 웹사이트, 고객 대면 자료.",
    audience:
      "온라인과 인쇄물에서 더 안정감 있게 보여야 하는 법률사무소, 회계법인, 컨설턴트, 에이전시, 서비스 제공자를 위한 페이지입니다.",
    visualTheme: {
      mood: "신뢰감 있고 선명하며 프레젠테이션 준비형",
      previewItems: ["웹사이트", "역량 소개 덱", "원페이지 자료", "명함"],
    },
    services: [
      "브랜드 아이덴티티",
      "웹사이트 디자인",
      "역량 소개 덱 디자인",
      "명함과 스테이셔너리",
      "세일즈 자료",
      "소셜 및 광고 비주얼",
    ],
    deliverables: [
      "로고와 기본 브랜드 자산",
      "웹사이트 페이지 구조와 디자인",
      "서비스 원페이지 자료",
      "피치 또는 역량 소개 덱",
      "명함과 레터헤드",
      "LinkedIn 및 광고 크리에이티브",
    ],
    outcomes: [
      "세일즈 대화 전부터 더 신뢰감 있는 존재감",
      "서비스와 차별점에 대한 더 명확한 설명",
      "소개, 제안, 팔로업에 사용할 일관된 자료",
    ],
    faq: [
      {
        question: "전문 서비스 회사에도 비주얼 브랜딩이 필요한가요?",
        answer:
          "네. 소개 기반 비즈니스라도 고객은 문의 전에 웹사이트, 제안서, 문서 디자인을 보고 신뢰도를 판단합니다.",
      },
      {
        question: "단계별로 진행할 수 있나요?",
        answer:
          "가능합니다. 많은 회사가 웹사이트 리프레시와 핵심 자료부터 시작한 뒤 덱, 광고, 전문 자료로 확장합니다.",
      },
    ],
  },
};

export function getIndustryPageKo(industry: IndustryPage) {
  return industryPageKoBySlug[industry.slug];
}

export const industryPages: IndustryPage[] = [
  {
    slug: "med-spa-branding-design",
    name: "Med Spa",
    eyebrow: "Beauty and wellness",
    title: "Med Spa Branding and Design in New York and New Jersey",
    description:
      "Brand identity, websites, print collateral, launch materials, and production-ready visual assets for med spas and aesthetic clinics.",
    audience:
      "For med spa owners, aesthetic clinics, laser studios, and wellness teams preparing to open, refresh, or grow in NY/NJ.",
    visualTheme: {
      mood: "Premium, calm, booking-ready",
      imageSrc: "/marketing/med-spa-branding-design.png",
      palette: ["#F7DED9", "#8E5E54", "#FFFFFF"],
      previewItems: ["Booking page", "Service menu", "Gift card", "Launch social"],
    },
    processSteps: createIndustryProcessSteps({
      inquiry: {
        description:
          "You tell us what kind of med spa, aesthetic clinic, or wellness service you are opening or refreshing.",
        output: "Project fit",
      },
      diagnosis: {
        description:
          "We review your treatment mix, price point, local competitors, booking path, and trust signals.",
        output: "Med spa brand priorities",
      },
      discovery: {
        description:
          "We clarify the owner vision, ideal client, tone, launch timeline, menu structure, and in-office needs.",
        output: "Beauty and wellness creative brief",
      },
      direction: {
        description:
          "We present A, B, and C directions for the brand feel, then recommend the most credible premium path.",
        output: "Recommended med spa direction",
      },
      scope: {
        description:
          "We define what belongs in the launch: identity, website, booking pages, service menu, cards, and social assets.",
        output: "Approved launch scope",
      },
      production: {
        description:
          "The direction becomes a calm visual system across web pages, service menus, offers, cards, and campaign graphics.",
        output: "Booking-ready launch kit",
      },
      review: {
        description:
          "We refine details, check mobile booking flow, prepare print files, and organize vendor-ready assets.",
        output: "Launch-ready files",
      },
      growth: {
        description:
          "After opening, we keep updating treatments, seasonal offers, SEO content, and campaign visuals.",
        output: "Ongoing treatment marketing",
      },
    }),
    services: [
      "Brand identity",
      "Logo design",
      "Website and landing page design",
      "Service menu and brochure design",
      "Social and ad creative",
      "Print production coordination",
    ],
    deliverables: [
      "Logo system and brand colors",
      "Booking-focused website pages",
      "Treatment menu and pricing sheets",
      "Gift cards, referral cards, and launch flyers",
      "Instagram templates and campaign graphics",
      "Production-ready files for print and vendor handoff",
    ],
    outcomes: [
      "A more premium first impression before the first appointment",
      "Consistent visuals across web, print, social, and in-office touchpoints",
      "Faster launch preparation with fewer vendor handoff problems",
    ],
    faq: [
      {
        question: "Do med spas need a full brand system before opening?",
        answer:
          "A full brand system is not always required, but a clear logo, color palette, type style, website direction, service menu, and launch collateral make the business look more established from day one.",
      },
      {
        question: "Can Visual Square coordinate printed materials too?",
        answer:
          "Yes. Visual Square is a design agency and print broker, so we can prepare production-ready files and coordinate with print vendors when the project needs physical materials.",
      },
    ],
  },
  {
    slug: "dental-clinic-branding-design",
    name: "Dental",
    eyebrow: "Healthcare practices",
    title: "Dental Clinic Branding and Design in NY/NJ",
    description:
      "Trust-building visual systems for dental practices, orthodontic offices, and specialty clinics.",
    audience:
      "For new dental practices, expanding clinics, and offices that need a cleaner, more professional patient-facing presence.",
    visualTheme: {
      mood: "Clean, clinical, reassuring",
      imageSrc: "/marketing/dental-clinic-branding-design.png",
      palette: ["#DDECF1", "#2E6673", "#FFFFFF"],
      previewItems: ["Practice website", "Patient packet", "Referral card", "Care sheet"],
    },
    processSteps: createIndustryProcessSteps({
      inquiry: {
        description:
          "You tell us whether the practice is opening, expanding, changing ownership, or refreshing outdated materials.",
        output: "Project fit",
      },
      diagnosis: {
        description:
          "We review patient trust points, services, insurance communication, local search presence, and office touchpoints.",
        output: "Practice communication priorities",
      },
      discovery: {
        description:
          "We clarify the dentist's positioning, patient profile, tone, appointment flow, and required forms or print pieces.",
        output: "Patient experience brief",
      },
      direction: {
        description:
          "We present A, B, and C directions for a clean, credible practice identity and recommend the strongest route.",
        output: "Recommended practice direction",
      },
      scope: {
        description:
          "We define the website, service pages, new patient materials, referral cards, and office communication pieces.",
        output: "Approved patient touchpoints",
      },
      production: {
        description:
          "The direction becomes a trustworthy system for web, forms, service explanations, cards, and patient handouts.",
        output: "Patient-ready communication set",
      },
      review: {
        description:
          "We refine copy hierarchy, test mobile booking clarity, and prepare print-ready files for office use.",
        output: "Launch-ready patient materials",
      },
      growth: {
        description:
          "After launch, we support service updates, review request graphics, local SEO content, and seasonal patient campaigns.",
        output: "Ongoing practice updates",
      },
    }),
    services: [
      "Brand identity",
      "Website design",
      "Patient forms and print collateral",
      "Office communication materials",
      "Google Business Profile image support",
      "Production-ready handoff",
    ],
    deliverables: [
      "Logo and practice identity",
      "Homepage and service page design",
      "New patient packet and referral cards",
      "Insurance and service explanation sheets",
      "Appointment reminder and review request graphics",
      "Interior communication and directional print files",
    ],
    outcomes: [
      "A more trustworthy first impression for new patients",
      "Clearer explanation of services, payment options, and patient next steps",
      "Consistent brand presentation across digital and printed touchpoints",
    ],
    faq: [
      {
        question: "What matters most for dental branding?",
        answer:
          "Dental branding should feel clean, calm, and credible. Patients need to quickly understand who you are, where to book, and why the practice feels trustworthy.",
      },
      {
        question: "Is this only for new practices?",
        answer:
          "No. Existing practices often benefit from refreshing old logos, outdated websites, patient forms, and printed materials without changing the entire business identity.",
      },
    ],
  },
  {
    slug: "restaurant-cafe-branding-design",
    name: "Restaurant and Cafe",
    eyebrow: "Food and beverage",
    title: "Restaurant and Cafe Branding Design in New York and New Jersey",
    description:
      "Launch-ready design systems for restaurants, cafes, bakeries, dessert shops, and hospitality brands.",
    audience:
      "For food businesses that need menus, websites, packaging, social launch graphics, and print materials to work together.",
    visualTheme: {
      mood: "Memorable, appetizing, campaign-ready",
      imageSrc: "/marketing/restaurant-cafe-branding-design.png",
      palette: ["#F8D7A9", "#3B2F25", "#F57D4B"],
      previewItems: ["Menu system", "Takeout flyer", "Packaging label", "Social launch"],
    },
    processSteps: createIndustryProcessSteps({
      inquiry: {
        description:
          "You tell us the food concept, opening plan, menu type, service model, and local audience.",
        output: "Project fit",
      },
      diagnosis: {
        description:
          "We review the menu, price point, location, competitors, delivery platforms, and the most visible customer touchpoints.",
        output: "Restaurant launch priorities",
      },
      discovery: {
        description:
          "We clarify the owner story, dining experience, photography needs, packaging, signage context, and opening schedule.",
        output: "Food and beverage creative brief",
      },
      direction: {
        description:
          "We present A, B, and C directions for the restaurant personality and recommend the most memorable system.",
        output: "Recommended food brand direction",
      },
      scope: {
        description:
          "We define menus, website or landing page, takeout materials, packaging labels, local flyers, and social launch assets.",
        output: "Approved opening scope",
      },
      production: {
        description:
          "The direction becomes readable menus, packaging graphics, web sections, promotional pieces, and reusable social layouts.",
        output: "Menu and opening campaign assets",
      },
      review: {
        description:
          "We proof menu hierarchy, prices, sizes, print specs, and launch files before production or publishing.",
        output: "Print and launch-ready files",
      },
      growth: {
        description:
          "After opening, we support seasonal menus, specials, event promos, local SEO content, and social campaigns.",
        output: "Ongoing restaurant campaigns",
      },
    }),
    services: [
      "Logo and brand identity",
      "Menu design",
      "Website and landing page design",
      "Packaging and label design",
      "Social launch creative",
      "Print vendor coordination",
    ],
    deliverables: [
      "Primary logo and secondary marks",
      "Dine-in, takeout, and digital menu layouts",
      "Opening flyer and local promotion materials",
      "Packaging stickers, labels, and bag graphics",
      "Google, Yelp, and social profile visuals",
      "Production-ready print files",
    ],
    outcomes: [
      "A clearer brand story before customers visit",
      "Menus and promotions that feel intentional instead of pieced together",
      "Reusable design assets for future seasonal campaigns",
    ],
    faq: [
      {
        question: "Should a restaurant start with a logo or a menu?",
        answer:
          "The logo and menu should be designed together because the menu is often the most-used expression of the brand after opening.",
      },
      {
        question: "Can Visual Square help with print specs?",
        answer:
          "Yes. We can prepare files for print and coordinate production requirements such as paper, finish, size, and vendor-ready file formats.",
      },
    ],
  },
  {
    slug: "real-estate-property-marketing-design",
    name: "Real Estate",
    eyebrow: "Property marketing",
    title: "Real Estate and Property Marketing Design",
    description:
      "Brochures, listing decks, leasing materials, property websites, and investor-facing design for real estate teams.",
    audience:
      "For brokers, property managers, developers, and commercial teams that need polished materials for listings, leasing, and presentations.",
    visualTheme: {
      mood: "Structured, premium, information-rich",
      imageSrc: "/marketing/real-estate-property-marketing-design.png",
      palette: ["#E8E3D8", "#1E2930", "#C7A76C"],
      previewItems: ["Listing brochure", "Pitch deck", "Property sheet", "Email graphic"],
    },
    processSteps: createIndustryProcessSteps({
      inquiry: {
        description:
          "You tell us what property, listing, leasing push, development, or investor presentation needs support.",
        output: "Project fit",
      },
      diagnosis: {
        description:
          "We review the audience, property facts, competitive set, photo assets, sales story, and decision timeline.",
        output: "Property marketing priorities",
      },
      discovery: {
        description:
          "We clarify the listing position, key amenities, neighborhood story, data hierarchy, and required print or PDF formats.",
        output: "Property presentation brief",
      },
      direction: {
        description:
          "We present A, B, and C directions for the property story and recommend the most credible presentation system.",
        output: "Recommended property direction",
      },
      scope: {
        description:
          "We define brochures, fact sheets, maps, pitch decks, email graphics, web assets, and export requirements.",
        output: "Approved marketing scope",
      },
      production: {
        description:
          "The direction becomes structured brochures, listing sheets, decks, maps, amenity graphics, and campaign assets.",
        output: "Listing and deck system",
      },
      review: {
        description:
          "We check data accuracy, image placement, PDF quality, print specs, and presentation flow before handoff.",
        output: "Broker-ready files",
      },
      growth: {
        description:
          "After launch, we update availability, pricing, campaign graphics, property pages, and follow-up materials.",
        output: "Ongoing property updates",
      },
    }),
    services: [
      "Listing brochure design",
      "Presentation deck design",
      "Property website direction",
      "Email and campaign graphics",
      "Print-ready marketing collateral",
      "Brand cleanup for property assets",
    ],
    deliverables: [
      "Leasing flyers and listing brochures",
      "Pitch decks and offering-style presentations",
      "Property fact sheets",
      "Email campaign visuals",
      "Maps, amenity graphics, and area highlights",
      "Print and PDF export packages",
    ],
    outcomes: [
      "More credible property presentations",
      "Clearer sales and leasing materials",
      "Reusable design systems for multiple listings or properties",
    ],
    faq: [
      {
        question: "Can one real estate template support multiple listings?",
        answer:
          "Yes. A reusable layout system can keep listings consistent while allowing each property to show its own photos, facts, and selling points.",
      },
      {
        question: "Do you design only print brochures?",
        answer:
          "No. We can support PDF decks, web assets, email graphics, and print-ready collateral as one connected marketing package.",
      },
    ],
  },
  {
    slug: "retail-showroom-branding-design",
    name: "Retail and Showroom",
    eyebrow: "Retail brands",
    title: "Retail and Showroom Branding Design",
    description:
      "Visual identity, sales collateral, displays, lookbooks, and campaign assets for retail stores and showrooms.",
    audience:
      "For boutiques, showrooms, specialty retailers, and product-based businesses that need stronger brand presentation.",
    visualTheme: {
      mood: "Curated, tactile, product-led",
      imageSrc: "/marketing/retail-showroom-branding-design.png",
      palette: ["#EAD7C7", "#24332E", "#F9F4EF"],
      previewItems: ["Lookbook", "Product label", "Shelf card", "Campaign asset"],
    },
    processSteps: createIndustryProcessSteps({
      inquiry: {
        description:
          "You tell us what store, showroom, collection, product line, or seasonal campaign needs a stronger presentation.",
        output: "Project fit",
      },
      diagnosis: {
        description:
          "We review the product mix, customer journey, merchandising, packaging, current visuals, and sales touchpoints.",
        output: "Retail presentation priorities",
      },
      discovery: {
        description:
          "We clarify the brand personality, product story, photography direction, in-store materials, and campaign timing.",
        output: "Retail creative brief",
      },
      direction: {
        description:
          "We present A, B, and C directions for the retail experience and recommend the most usable visual system.",
        output: "Recommended retail direction",
      },
      scope: {
        description:
          "We define the lookbook, labels, shelf cards, campaign graphics, store materials, and production file needs.",
        output: "Approved retail scope",
      },
      production: {
        description:
          "The direction becomes product-led layouts for catalogs, labels, cards, posters, digital campaigns, and sales tools.",
        output: "Retail asset system",
      },
      review: {
        description:
          "We refine product hierarchy, file sizes, print finishes, and vendor handoff details before production.",
        output: "Store-ready files",
      },
      growth: {
        description:
          "After launch, we support seasonal collections, event graphics, product updates, ads, and promotional content.",
        output: "Ongoing retail campaigns",
      },
    }),
    services: [
      "Brand refresh",
      "Lookbook and catalog design",
      "Retail campaign graphics",
      "Packaging and label design",
      "In-store print collateral",
      "Production file preparation",
    ],
    deliverables: [
      "Brand refresh kit",
      "Seasonal lookbooks and catalogs",
      "Shelf talkers, cards, and posters",
      "Product labels and packaging graphics",
      "Digital campaign assets",
      "Print vendor handoff files",
    ],
    outcomes: [
      "More consistent customer-facing visuals",
      "Better product storytelling across physical and digital channels",
      "Reusable assets for sales, events, and seasonal promotions",
    ],
    faq: [
      {
        question: "What should a small retail store prioritize first?",
        answer:
          "Start with a consistent logo, typography, color system, product photography direction, and a few high-use print and digital templates.",
      },
      {
        question: "Can Visual Square work with existing brand assets?",
        answer:
          "Yes. We can clean up and extend existing assets instead of forcing a full rebrand when the current identity still has value.",
      },
    ],
  },
  {
    slug: "professional-services-branding-design",
    name: "Professional Services",
    eyebrow: "Local experts",
    title: "Professional Services Branding and Web Design",
    description:
      "Credibility-focused branding, websites, and client-facing materials for local professional service businesses.",
    audience:
      "For law offices, accounting firms, consultants, agencies, and service providers that need to look more established online and in print.",
    visualTheme: {
      mood: "Credible, sharp, presentation-ready",
      imageSrc: "/marketing/professional-services-branding-design.png",
      palette: ["#E8EEF0", "#141414", "#F57D4B"],
      previewItems: ["Website", "Capability deck", "One-pager", "Business card"],
    },
    processSteps: createIndustryProcessSteps({
      inquiry: {
        description:
          "You tell us what service, firm, offer, proposal process, or credibility gap needs stronger design support.",
        output: "Project fit",
      },
      diagnosis: {
        description:
          "We review the referral path, competitors, service clarity, sales materials, website trust, and client objections.",
        output: "Credibility priorities",
      },
      discovery: {
        description:
          "We clarify the firm's expertise, ideal client, decision process, tone, content needs, and sales follow-up materials.",
        output: "Professional services brief",
      },
      direction: {
        description:
          "We present A, B, and C directions for a sharper expert presence and recommend the clearest route.",
        output: "Recommended credibility direction",
      },
      scope: {
        description:
          "We define the identity, website pages, capability deck, service one-pagers, cards, and proposal support pieces.",
        output: "Approved credibility scope",
      },
      production: {
        description:
          "The direction becomes a polished system for web, decks, one-pagers, stationery, LinkedIn, and ad visuals.",
        output: "Sales-ready brand assets",
      },
      review: {
        description:
          "We refine messaging hierarchy, responsive pages, presentation flow, and print files before client-facing use.",
        output: "Client-ready files",
      },
      growth: {
        description:
          "After launch, we support insight articles, case materials, service updates, social proof, and local SEO content.",
        output: "Ongoing authority content",
      },
    }),
    services: [
      "Brand identity",
      "Website design",
      "Capability deck design",
      "Business cards and stationery",
      "Sales collateral",
      "Social and ad visuals",
    ],
    deliverables: [
      "Logo and brand basics",
      "Website page structure and design",
      "Service one-pagers",
      "Pitch or capability deck",
      "Business cards and letterhead",
      "LinkedIn and ad creative",
    ],
    outcomes: [
      "A more credible presence before sales conversations",
      "Clearer explanation of services and differentiators",
      "Consistent materials for referrals, proposals, and follow-ups",
    ],
    faq: [
      {
        question: "Do professional service firms need visual branding?",
        answer:
          "Yes. Even referral-driven firms are judged by their website, proposal materials, and business documents before a prospect decides to reach out.",
      },
      {
        question: "Can the work be done in phases?",
        answer:
          "Yes. Many firms start with a website refresh and core collateral, then expand into decks, ads, and more specialized materials.",
      },
    ],
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "branding-checklist-before-opening-med-spa-ny-nj",
    title: "Med Spa Launch Checklist",
    description:
      "What to prepare before opening: identity, website, service menu, print, and launch assets.",
    language: "en",
    publishDate: "2026-05-26T09:30:00-04:00",
    category: "Brand Launch",
    industrySlug: "med-spa-branding-design",
    readingMinutes: 7,
    summary:
      "Before a med spa opens, the brand needs to feel premium, consistent, and ready for bookings across every customer touchpoint.",
    keyPoints: [
      "Build the logo, color palette, website, service menu, and launch collateral together.",
      "Prioritize booking clarity and trust over decorative design.",
      "Prepare print and vendor-ready files before the opening timeline gets tight.",
    ],
    sections: [
      {
        heading: "Start with the client experience",
        body: [
          "A med spa brand is judged before a client arrives. The website, booking page, service menu, social graphics, gift cards, and printed materials all shape whether the business feels premium or improvised.",
          "Before designing individual pieces, map the first customer path: discovery, service comparison, booking, appointment reminder, arrival, checkout, and follow-up. The visual system should make each step feel calm, clear, and connected.",
        ],
      },
      {
        heading: "Make booking feel simple",
        body: [
          "The most attractive brand still fails if the client cannot understand treatments, pricing direction, or how to book. A launch website should organize services by client need, not only by internal treatment categories.",
          "For aesthetic services, trust signals matter early. Show the treatment approach, provider credibility, consultation process, safety language, and realistic next steps before asking the client to commit.",
        ],
      },
      {
        heading: "Prepare the launch assets",
        body: [
          "The launch kit should make booking clear and keep every touchpoint visually connected. The goal is not to make more files for the sake of it. The goal is to avoid a rushed opening where the website, menu, print pieces, and social posts all look like they came from different businesses.",
        ],
        bullets: [
          "Logo files for web, print, social profiles, and vendor handoff",
          "Website sections for services, pricing direction, booking, and trust signals",
          "Printed service menus, intro offers, referral cards, and in-office materials",
          "Reusable social templates for launch offers and treatment education",
        ],
      },
      {
        heading: "Check the physical touchpoints",
        body: [
          "Med spa launches often focus on Instagram and the booking page, then leave in-office materials until the last week. That is where the brand starts to feel unfinished.",
          "Print the service menu, consultation sheets, referral cards, gift cards, and opening offer materials early enough to review scale, paper, color, and readability in the actual space.",
        ],
      },
      {
        heading: "Keep the first month editable",
        body: [
          "The first month after opening usually reveals what clients ask about most. Build the launch system so service descriptions, offer graphics, and treatment education can be updated without redesigning everything.",
          "A strong med spa brand is not only pretty on day one. It gives the business a clean system for adding treatments, promotions, before-and-after education, and seasonal campaigns as the clinic grows.",
        ],
      },
    ],
    ko: {
      title: "메드스파 런칭 체크리스트",
      description:
        "오픈 전에 준비해야 할 아이덴티티, 웹사이트, 서비스 메뉴, 인쇄물, 런칭 자산을 정리합니다.",
      category: "브랜드 런칭",
      summary:
        "메드스파가 오픈하기 전, 브랜드는 모든 고객 접점에서 프리미엄하고 일관되며 예약 준비가 된 모습으로 보여야 합니다.",
      keyPoints: [
        "로고, 컬러 팔레트, 웹사이트, 서비스 메뉴, 런칭 인쇄물을 따로 만들지 말고 하나의 시스템으로 준비합니다.",
        "장식적인 디자인보다 예약의 명확함과 신뢰감을 먼저 설계합니다.",
        "오픈 일정이 촉박해지기 전에 인쇄와 벤더 전달용 파일을 미리 정리합니다.",
      ],
      sections: [
        {
          heading: "고객 경험에서 시작하기",
          body: [
            "메드스파 브랜드는 고객이 방문하기 전부터 평가됩니다. 웹사이트, 예약 페이지, 서비스 메뉴, 소셜 그래픽, 기프트 카드, 인쇄물은 모두 이 비즈니스가 프리미엄하게 느껴지는지 아니면 급하게 만든 것처럼 보이는지를 결정합니다.",
            "개별 제작물부터 만들기 전에 고객의 첫 여정을 먼저 그려야 합니다. 발견, 서비스 비교, 예약, 예약 리마인더, 방문, 결제, 팔로업까지 각 단계가 차분하고 명확하며 연결되어 보이도록 비주얼 시스템을 설계해야 합니다.",
          ],
        },
        {
          heading: "예약이 쉽게 느껴지게 만들기",
          body: [
            "아무리 보기 좋은 브랜드라도 고객이 시술, 가격 방향, 예약 방법을 이해하지 못하면 실패합니다. 런칭 웹사이트는 내부 시술 카테고리만 나열하는 대신 고객의 니즈를 기준으로 서비스를 정리해야 합니다.",
            "에스테틱 서비스에서는 초반 신뢰 신호가 중요합니다. 고객에게 바로 예약을 요구하기 전에 시술 접근 방식, 담당자의 신뢰도, 상담 과정, 안전 관련 문구, 다음 단계가 명확하게 보여야 합니다.",
          ],
        },
        {
          heading: "런칭 자산 준비하기",
          body: [
            "런칭 키트는 예약을 명확하게 만들고 모든 접점이 하나의 브랜드처럼 보이게 해야 합니다. 목적은 파일을 많이 만드는 것이 아닙니다. 웹사이트, 메뉴, 인쇄물, 소셜 포스트가 각각 다른 비즈니스에서 온 것처럼 보이는 급한 오픈을 피하는 것입니다.",
          ],
          bullets: [
            "웹, 인쇄, 소셜 프로필, 벤더 전달용 로고 파일",
            "서비스, 가격 방향, 예약, 신뢰 요소를 담은 웹사이트 섹션",
            "인쇄용 서비스 메뉴, 오픈 프로모션, 리퍼럴 카드, 매장 내 안내물",
            "런칭 오퍼와 시술 교육에 반복 사용할 수 있는 소셜 템플릿",
          ],
        },
        {
          heading: "오프라인 접점 확인하기",
          body: [
            "메드스파 런칭은 인스타그램과 예약 페이지에 집중하다가 매장 내 인쇄물을 마지막 주까지 미루는 경우가 많습니다. 바로 그 지점에서 브랜드가 미완성처럼 느껴지기 시작합니다.",
            "서비스 메뉴, 상담 시트, 리퍼럴 카드, 기프트 카드, 오픈 프로모션 인쇄물은 실제 공간에서 크기, 종이, 컬러, 가독성을 확인할 수 있을 만큼 일찍 출력해봐야 합니다.",
          ],
        },
        {
          heading: "첫 달은 수정 가능하게 만들기",
          body: [
            "오픈 후 첫 달에는 고객이 어떤 질문을 가장 많이 하는지 드러납니다. 서비스 설명, 프로모션 그래픽, 시술 교육 콘텐츠를 전체 디자인을 다시 하지 않고도 업데이트할 수 있게 런칭 시스템을 만들어야 합니다.",
            "좋은 메드스파 브랜드는 첫날 예쁘게 보이는 것에서 끝나지 않습니다. 클리닉이 성장하면서 시술, 프로모션, 비포/애프터 교육, 시즌 캠페인을 깔끔하게 추가할 수 있는 시스템을 제공합니다.",
          ],
        },
      ],
    },
    faq: [
      {
        question: "What should a med spa design first?",
        answer:
          "Start with brand identity, website structure, service menu, and launch collateral. These assets shape most customer touchpoints before opening.",
      },
      {
        question: "Is social media design enough for a med spa launch?",
        answer:
          "No. Social graphics help, but the brand also needs a credible website, clear service materials, and production-ready print files.",
      },
      {
        question: "How early should design work start?",
        answer:
          "Ideally 60 to 90 days before opening so the website, print production, and launch campaign are not rushed.",
      },
    ],
  },
  {
    slug: "what-a-dental-practice-needs-before-launch",
    title: "What a Dental Practice Needs Before Launch: Logo, Website, Print, and Patient Touchpoints",
    description:
      "A launch design guide for dental practices that need to look trustworthy from the first patient interaction.",
    language: "en",
    publishDate: "2026-05-28T09:30:00-04:00",
    category: "Healthcare Branding",
    industrySlug: "dental-clinic-branding-design",
    readingMinutes: 6,
    summary:
      "A dental practice launch needs more than a logo. The patient experience should feel clear and credible across web, print, and office materials.",
    keyPoints: [
      "Patients judge trust through consistency, clarity, and organization.",
      "Website, new patient materials, forms, and appointment touchpoints should share one design system.",
      "A phased refresh can work when a full rebrand is not necessary.",
    ],
    sections: [
      {
        heading: "Design should reduce uncertainty",
        body: [
          "New patients want to know what services you offer, how to book, what the office feels like, and whether the practice looks organized. Good design makes those answers easier to find.",
        ],
      },
      {
        heading: "Build the patient-facing kit",
        body: [
          "The core kit includes a logo, website, service pages, new patient packet, referral card, insurance information sheet, appointment graphics, and Google Business Profile visuals.",
        ],
      },
      {
        heading: "Avoid the common launch mistake",
        body: [
          "Many practices build each item separately. That creates a website, forms, and printed materials that feel unrelated. A small brand system keeps everything aligned without slowing the launch.",
        ],
      },
    ],
    faq: [
      {
        question: "Does a dental office need custom branding?",
        answer:
          "Yes, especially when it is new or competing locally. Custom branding helps the practice feel credible and memorable.",
      },
      {
        question: "What is the most important website section?",
        answer:
          "Clear service and booking information usually matters most because it helps patients take the next step.",
      },
    ],
  },
  {
    slug: "logo-vs-brand-identity-ny-nj-small-business",
    title: "Logo vs Brand Identity: What NY/NJ Small Businesses Actually Need",
    description:
      "A practical explanation of the difference between a logo and a brand identity for local businesses preparing to launch or refresh.",
    language: "en",
    publishDate: "2026-05-29T09:30:00-04:00",
    category: "Brand Strategy",
    industrySlug: "professional-services-branding-design",
    readingMinutes: 5,
    summary:
      "A logo identifies the business, but a brand identity makes every customer-facing asset feel connected.",
    keyPoints: [
      "A logo alone is rarely enough for a business launch.",
      "Brand identity includes colors, type, layout rules, image direction, and file usage.",
      "Small businesses can start with a focused identity kit instead of a large brand book.",
    ],
    sections: [
      {
        heading: "The logo is only one part",
        body: [
          "A logo helps people recognize the business. A brand identity helps the business look consistent on a website, business card, flyer, menu, social post, and proposal.",
        ],
      },
      {
        heading: "What a useful identity kit includes",
        body: [
          "Most local businesses need logo variations, colors, typography, spacing guidance, social profile assets, print-ready files, and a few reusable templates.",
        ],
      },
    ],
    faq: [
      {
        question: "Can a small business start with just a logo?",
        answer:
          "It can, but a focused identity kit usually prevents inconsistent materials and saves redesign time later.",
      },
      {
        question: "What is the minimum useful brand package?",
        answer:
          "Logo files, color palette, typography, basic layout direction, and templates for the most-used digital and print assets.",
      },
    ],
  },
  {
    slug: "restaurant-opening-design-checklist",
    title: "Restaurant Opening Design Checklist: Menu, Website, Print, Social, and Storefront Graphics",
    description:
      "A practical design checklist for restaurants, cafes, bakeries, and food businesses preparing to open.",
    language: "en",
    publishDate: "2026-06-02T09:30:00-04:00",
    category: "Food and Beverage",
    industrySlug: "restaurant-cafe-branding-design",
    readingMinutes: 6,
    summary:
      "Restaurant design should connect the menu, website, packaging, social launch, and local promotion materials before opening day.",
    keyPoints: [
      "Menu design is one of the most important brand touchpoints.",
      "Digital and printed launch materials should be planned together.",
      "Reusable templates make seasonal campaigns easier after opening.",
    ],
    sections: [
      {
        heading: "Build around the menu",
        body: [
          "For restaurants and cafes, the menu often carries the brand more than any other asset. It needs to be readable, on-brand, and practical for updates.",
        ],
      },
      {
        heading: "Prepare launch materials early",
        body: [
          "Opening flyers, takeout menus, packaging stickers, website pages, Google and Yelp visuals, and social graphics should share one system.",
        ],
      },
    ],
    faq: [
      {
        question: "What should a restaurant design before opening?",
        answer:
          "Logo, menu, website or landing page, takeout materials, packaging graphics, social launch assets, and local promotion pieces.",
      },
      {
        question: "Why design the menu early?",
        answer:
          "The menu affects brand feel, photography needs, print specs, pricing clarity, and customer ordering behavior.",
      },
    ],
  },
  {
    slug: "how-better-design-helps-local-businesses-look-established",
    title: "How Better Design Helps Local Businesses Look More Established",
    description:
      "How consistent design helps local businesses build credibility across websites, print, social media, and sales materials.",
    language: "en",
    publishDate: "2026-06-04T09:30:00-04:00",
    category: "Design Strategy",
    industrySlug: "professional-services-branding-design",
    readingMinutes: 5,
    summary:
      "Consistent design makes a business feel more organized, credible, and ready to serve customers.",
    keyPoints: [
      "Customers notice consistency before they can explain it.",
      "Better design can improve trust without a full rebrand.",
      "The most visible touchpoints should be fixed first.",
    ],
    sections: [
      {
        heading: "Credibility is built through repetition",
        body: [
          "When a website, flyer, business card, proposal, and social profile all look related, the business feels more established. The customer does not need to study the details; the consistency does the work.",
        ],
      },
      {
        heading: "Start with high-use assets",
        body: [
          "A local business should usually fix the assets people see most often first: website, Google profile images, business cards, service menus, sales PDFs, and social templates.",
        ],
      },
    ],
    faq: [
      {
        question: "Does better design always require a rebrand?",
        answer:
          "No. Many businesses can improve trust by cleaning up typography, layout, color usage, and recurring materials.",
      },
      {
        question: "Which design assets should be fixed first?",
        answer:
          "Start with the website, core sales materials, social profile visuals, and any printed materials customers handle directly.",
      },
    ],
  },
  {
    slug: "ny-nj-business-opening-design-checklist-ko",
    title: "뉴욕 뉴저지에서 비즈니스 오픈 전 준비해야 할 디자인 체크리스트",
    description:
      "한인 비즈니스 오너를 위한 로고, 웹사이트, 인쇄물, SNS, 오픈 홍보물 준비 가이드.",
    language: "ko",
    publishDate: "2026-06-05T09:30:00-04:00",
    category: "Korean Business Guide",
    industrySlug: "professional-services-branding-design",
    readingMinutes: 5,
    summary:
      "오픈 전 디자인은 로고 하나가 아니라 고객이 처음 보는 모든 접점의 신뢰감을 만드는 작업입니다.",
    keyPoints: [
      "로고, 웹사이트, 명함, 브로셔, SNS, 오픈 홍보물을 함께 계획해야 합니다.",
      "미국 고객에게 보이는 영어 자료의 완성도가 중요합니다.",
      "인쇄 제작까지 고려한 파일 준비가 필요합니다.",
    ],
    sections: [
      {
        heading: "오픈 전 디자인은 한 번에 연결되어야 합니다",
        body: [
          "비즈니스 오픈을 준비할 때 로고만 먼저 만들고 나머지를 따로 진행하면 웹사이트, 명함, 전단지, SNS 이미지가 서로 다른 느낌이 되기 쉽습니다.",
          "처음부터 기본 브랜드 방향과 주요 제작물을 함께 잡으면 더 전문적으로 보이고, 제작 일정도 줄일 수 있습니다.",
        ],
      },
      {
        heading: "먼저 준비할 항목",
        body: [
          "기본 로고 파일, 웹사이트 또는 랜딩페이지, 명함, 서비스 소개서, 오픈 프로모션 카드, SNS 프로필 이미지, 인쇄용 파일이 필요합니다.",
        ],
      },
    ],
    faq: [
      {
        question: "오픈 몇 주 전부터 디자인을 준비해야 하나요?",
        answer:
          "가능하면 60일 전부터 준비하는 것이 좋습니다. 웹사이트, 인쇄물, 수정, 제작 일정을 고려해야 하기 때문입니다.",
      },
      {
        question: "한국어 자료도 같이 만들 수 있나요?",
        answer:
          "가능합니다. 다만 미국 현지 고객이 주 타겟이면 영어 자료를 기준으로 잡고, 필요한 경우 한국어 자료를 보조로 만드는 방식이 좋습니다.",
      },
    ],
  },
  {
    slug: "med-spa-website-design-mistakes",
    title: "Med Spa Website Design Mistakes That Make a Brand Look Less Premium",
    description:
      "Common website and brand presentation mistakes that make med spas look less credible or less premium.",
    language: "en",
    publishDate: "2026-06-09T09:30:00-04:00",
    category: "Website Design",
    industrySlug: "med-spa-branding-design",
    readingMinutes: 6,
    summary:
      "A med spa website should build trust quickly, explain treatments clearly, and make booking feel easy.",
    keyPoints: [
      "Premium design depends on clarity, restraint, and trust signals.",
      "Treatment pages should answer practical client questions.",
      "Booking calls to action should be easy to find without feeling aggressive.",
    ],
    sections: [
      {
        heading: "The site should not feel generic",
        body: [
          "Many med spa websites use soft colors and beauty imagery but fail to explain services clearly. A premium site needs strong structure, readable service pages, clear booking paths, and consistent brand details.",
        ],
      },
      {
        heading: "Common mistakes",
        body: [
          "Weak typography, unclear treatment descriptions, inconsistent image style, buried booking buttons, and mismatched social graphics can make a strong service business feel less credible online.",
        ],
      },
    ],
    faq: [
      {
        question: "What makes a med spa website feel premium?",
        answer:
          "Clear layout, refined typography, consistent imagery, treatment education, reviews or trust signals, and simple booking paths.",
      },
      {
        question: "Does a med spa need separate treatment pages?",
        answer:
          "Usually yes. Separate pages help clients understand each treatment and improve search visibility for specific services.",
      },
    ],
  },
  {
    slug: "dental-branding-ideas-that-help-patients-trust-a-new-practice",
    title: "Dental Branding Ideas That Help Patients Trust a New Practice",
    description:
      "Design ideas that help new dental practices feel clean, calm, credible, and patient-friendly.",
    language: "en",
    publishDate: "2026-06-11T09:30:00-04:00",
    category: "Healthcare Branding",
    industrySlug: "dental-clinic-branding-design",
    readingMinutes: 5,
    summary:
      "Dental branding should make patients feel oriented, informed, and confident before the first appointment.",
    keyPoints: [
      "Trust comes from clarity more than decoration.",
      "Use consistent visuals across website, forms, office materials, and reminders.",
      "Patient education materials are part of the brand experience.",
    ],
    sections: [
      {
        heading: "Trust is a design outcome",
        body: [
          "Dental patients look for signs of organization and professionalism. A clean website, clear patient packet, consistent appointment materials, and calm office visuals all contribute to trust.",
        ],
      },
      {
        heading: "Use design to explain the practice",
        body: [
          "Service one-pagers, insurance explanation sheets, new patient materials, and post-treatment instructions should be visually consistent and easy to understand.",
        ],
      },
    ],
    faq: [
      {
        question: "What colors work best for dental brands?",
        answer:
          "There is no single best color, but dental brands often benefit from calm, clean palettes with enough contrast for readability.",
      },
      {
        question: "Should patient forms be branded?",
        answer:
          "Yes. Branded forms and instructions make the practice feel more organized and reduce confusion.",
      },
    ],
  },
  {
    slug: "print-materials-every-local-business-should-prepare-before-opening",
    title: "Print Materials Every Local Business Should Prepare Before Opening",
    description:
      "A launch checklist for business cards, flyers, menus, brochures, referral cards, packaging pieces, and other printed materials.",
    language: "en",
    publishDate: "2026-06-12T09:30:00-04:00",
    category: "Print and Production",
    industrySlug: "professional-services-branding-design",
    readingMinutes: 5,
    summary:
      "Printed materials still matter for local businesses, especially when they support sales, referrals, packaging, and in-person customer experiences.",
    keyPoints: [
      "Print should be planned with brand identity, not after it.",
      "Production-ready files reduce delays and vendor mistakes.",
      "Start with materials customers actually touch or keep.",
    ],
    sections: [
      {
        heading: "Print is part of the brand system",
        body: [
          "Business cards, flyers, menus, brochures, referral cards, packaging stickers, and service sheets should not feel like separate projects. They should extend the same visual system.",
        ],
      },
      {
        heading: "Prepare files for production",
        body: [
          "Good print preparation includes correct size, bleed, color setup, image quality, paper or finish direction, and export formats that the vendor can use without guessing.",
        ],
      },
    ],
    faq: [
      {
        question: "What print materials should a local business make first?",
        answer:
          "Start with business cards, service or menu sheets, opening flyers, referral cards, and any customer-facing materials used during sales or visits.",
      },
      {
        question: "Can one design be reused across print sizes?",
        answer:
          "The visual system can be reused, but each print size should be laid out separately for readability and production accuracy.",
      },
    ],
  },
  {
    slug: "real-estate-marketing-design-brochures-decks-digital-assets",
    title: "Real Estate Marketing Design: Brochures, Listing Decks, and Digital Assets",
    description:
      "How real estate teams can create more consistent property marketing across brochures, decks, web pages, and campaigns.",
    language: "en",
    publishDate: "2026-06-16T09:30:00-04:00",
    category: "Real Estate Marketing",
    industrySlug: "real-estate-property-marketing-design",
    readingMinutes: 6,
    summary:
      "Real estate marketing design should make property information easier to scan and more credible across print and digital formats.",
    keyPoints: [
      "Property materials need strong information hierarchy.",
      "A reusable system helps teams market multiple listings consistently.",
      "Print and digital assets should be designed from the same source structure.",
    ],
    sections: [
      {
        heading: "Property marketing is information design",
        body: [
          "Real estate collateral has to present photos, facts, maps, amenities, neighborhood context, and financial or leasing details without overwhelming the reader.",
        ],
      },
      {
        heading: "Build reusable listing systems",
        body: [
          "A strong brochure or deck system can support multiple properties with consistent layouts for highlights, specs, location, photography, and calls to action.",
        ],
      },
    ],
    faq: [
      {
        question: "What should a real estate brochure include?",
        answer:
          "Key property facts, strong photography, location context, amenities, floor plans or maps when relevant, and a clear next step for the prospect.",
      },
      {
        question: "Can property decks and brochures share one design system?",
        answer:
          "Yes. That is usually the best approach because it keeps print and PDF materials consistent.",
      },
    ],
  },
  {
    slug: "retail-branding-checklist-small-store-professional",
    title: "Retail Branding Checklist: How to Make a Small Store Look More Professional",
    description:
      "A practical checklist for retail stores and showrooms that need more consistent visual presentation.",
    language: "en",
    publishDate: "2026-06-17T09:30:00-04:00",
    category: "Retail Branding",
    industrySlug: "retail-showroom-branding-design",
    readingMinutes: 5,
    summary:
      "Retail branding should connect product presentation, packaging, store materials, social content, and seasonal campaigns.",
    keyPoints: [
      "Small stores look more established when every touchpoint feels connected.",
      "Product labels, cards, lookbooks, and social assets should share one system.",
      "A brand refresh can be smaller than a full rebrand.",
    ],
    sections: [
      {
        heading: "Consistency helps products sell",
        body: [
          "Retail customers compare visual signals quickly. Product cards, labels, displays, social posts, and sales materials should make the store feel intentional.",
        ],
      },
      {
        heading: "Start with reusable assets",
        body: [
          "A useful retail system includes product photography direction, labels, cards, promotional templates, packaging graphics, and a simple campaign layout system.",
        ],
      },
    ],
    faq: [
      {
        question: "Does a retail store need a full rebrand?",
        answer:
          "Not always. Many stores need a focused refresh that improves consistency across product, print, and digital materials.",
      },
      {
        question: "What assets matter most for retail?",
        answer:
          "Product labels, packaging, sales cards, signage or display graphics when needed, lookbooks, and social campaign templates.",
      },
    ],
  },
  {
    slug: "korean-business-owner-logo-website-print-guide",
    title: "한인 비즈니스 오너를 위한 로고, 웹사이트, 인쇄물 준비 가이드",
    description:
      "미국 현지 고객을 타겟하는 한인 비즈니스를 위한 브랜드, 웹사이트, 인쇄물 준비 가이드.",
    language: "ko",
    publishDate: "2026-06-18T09:30:00-04:00",
    category: "Korean Business Guide",
    industrySlug: "professional-services-branding-design",
    readingMinutes: 5,
    summary:
      "한인 비즈니스도 미국 현지 고객에게 보이는 영어 브랜드 경험과 인쇄물 완성도가 중요합니다.",
    keyPoints: [
      "영어 웹사이트와 인쇄물이 먼저 신뢰를 만듭니다.",
      "로고보다 전체 고객 접점의 일관성이 중요합니다.",
      "디자인 파일은 제작까지 고려해서 준비해야 합니다.",
    ],
    sections: [
      {
        heading: "미국 고객에게 보이는 첫인상을 기준으로 잡아야 합니다",
        body: [
          "한인 비즈니스라도 주 고객이 미국 현지 고객이라면 영어 웹사이트, Google 프로필, 브로셔, 메뉴, 명함, SNS 이미지의 완성도가 중요합니다.",
          "한국어 자료는 보조로 운영하되, 기본 브랜드 경험은 현지 고객이 이해하기 쉬운 방향으로 설계하는 것이 좋습니다.",
        ],
      },
      {
        heading: "로고보다 중요한 것은 일관성입니다",
        body: [
          "좋은 로고 하나만으로는 부족합니다. 웹사이트, 인쇄물, SNS, 소개 자료가 같은 톤으로 연결되어야 더 전문적으로 보입니다.",
        ],
      },
    ],
    faq: [
      {
        question: "영어와 한국어 자료를 모두 만들어야 하나요?",
        answer:
          "타겟 고객에 따라 다릅니다. 미국 현지 고객이 1순위라면 영어 자료를 중심으로 만들고 한국어 자료는 필요한 곳에 보조로 두는 것이 좋습니다.",
      },
      {
        question: "인쇄물은 언제 준비해야 하나요?",
        answer:
          "오픈이나 캠페인 날짜 기준 최소 몇 주 전에는 디자인과 제작 파일이 준비되어야 일정 지연을 줄일 수 있습니다.",
      },
    ],
  },
];

export const weeklyBlogPlan: WeeklyBlogPlan[] = [
  {
    weekOf: "2026-05-25",
    posts: blogPosts.slice(0, 3).map(toPlanPost),
  },
  {
    weekOf: "2026-06-01",
    posts: blogPosts.slice(3, 6).map(toPlanPost),
  },
  {
    weekOf: "2026-06-08",
    posts: blogPosts.slice(6, 9).map(toPlanPost),
  },
  {
    weekOf: "2026-06-15",
    posts: blogPosts.slice(9, 12).map(toPlanPost),
  },
];

function toPlanPost(
  post: BlogPost,
): Pick<BlogPost, "slug" | "title" | "language" | "publishDate" | "industrySlug"> {
  return {
    slug: post.slug,
    title: post.title,
    language: post.language,
    publishDate: post.publishDate,
    industrySlug: post.industrySlug,
  };
}

export function getIndustryPage(slug: string) {
  return industryPages.find((industry) => industry.slug === slug) ?? null;
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

export function getBlogVisibilityDate(
  now = new Date(),
  environment = process.env.NODE_ENV,
) {
  if (environment !== "development") {
    return now;
  }

  const firstScheduledPost = blogPosts
    .slice()
    .sort(
      (left, right) =>
        new Date(left.publishDate).getTime() -
        new Date(right.publishDate).getTime(),
    )[0];

  if (!firstScheduledPost) {
    return now;
  }

  const firstPublishDate = new Date(firstScheduledPost.publishDate);

  return now < firstPublishDate ? firstPublishDate : now;
}

export function getPublishedBlogPosts(now = new Date()) {
  return blogPosts
    .filter((post) => new Date(post.publishDate) <= now)
    .sort(
      (left, right) =>
        new Date(right.publishDate).getTime() -
        new Date(left.publishDate).getTime(),
    );
}

export function getRelatedPostsForIndustry(industrySlug: string, now = new Date()) {
  return getPublishedBlogPosts(now).filter(
    (post) => post.industrySlug === industrySlug,
  );
}

export function formatPublishDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://visualsquare.com";
}
