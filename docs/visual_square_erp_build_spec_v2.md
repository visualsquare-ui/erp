# Visual Square ERP — 바이브 코딩 빌드 설계서 (v2)

> 이 문서는 AI 코딩 툴(Claude Code, Cursor 등)에 **단계별로 떼어서** 먹이기 위한 설계서입니다.
> 한 번에 전부 만들지 말고, 한 Phase씩 끝내고 다음으로 넘어가세요.
>
> **v2 변경점:** 디자인 모듈 보강(유형별 분기·수정 횟수·최종 산출물), 결과물/파일 관리(`assets`) + 구글 드라이브 링크, 포트폴리오 쇼케이스, 디자인 시스템 & 고객 대면 화면 가이드 추가.

---

## 0. 한눈에 보기

### 우리가 만드는 것
비주얼스퀘어(Visual Square)는 **디자인 에이전시 + 인쇄 중개(브로커)** 회사입니다.
- 웹·앱·인쇄물·로고·브랜딩 **디자인**을 한다. ← 회사의 진짜 상품
- 인쇄는 직접 안 하고, 다양한 **인쇄소(외주)에 의뢰**한다.
- 인쇄물을 받아서 **고객에게 납품**한다.

따라서 일반 인쇄소 ERP(생산 공정·기계 스케줄·용지 재고)와는 **완전히 다릅니다.** 우리에게 필요한 건 **프로젝트 관리 + 양방향 정산(중개 마진) + 디자인 산출물 관리**입니다.

### 세 가지 핵심 설계 원칙
1. **프로젝트(Project) 중심** — 고객, 작업, 작업지시서, 발주, 인보이스, 받은 빌, 결과물이 전부 하나의 프로젝트에 매달린다. 프로젝트가 모든 것의 허브.
2. **양방향 정산(Dual Ledger)** — 고객에게 받을 돈(인보이스, AR)과 인쇄소에 줄 돈(받은 빌, AP)이 따로 있고, 그 차액 − 내부 인건비 = 실제 수익.
3. **디자인이 곧 영업 자료** — 완료 결과물·시안·자체 화면이 그대로 포트폴리오이자 제안 근거가 된다. 고객이 보는 화면일수록 퀄리티가 곧 신뢰다.

```
수익 = 고객 인보이스(AR) − 인쇄소 빌(AP) − 내부 인건비
```

### 통화 & 세금 (미국 비즈니스 기준)
- **모든 금액은 미국 달러(USD).** 표시 형식은 `$1,200.00`. 코드에서는 `Intl.NumberFormat('en-US', { style:'currency', currency:'USD' })`로 통일.
- 금액 컬럼은 정수 센트가 아니라 `numeric`로 저장하고, 화면 표시에서만 통화 포맷 적용.
- **세금은 미국 주별 판매세(sales tax)** — 한국식 부가세(VAT) 아님. 비주얼스퀘어는 NJ/NY 기반이라 주마다 세율·과세대상이 다름.
- ⚠️ **디자인 용역 vs 인쇄 실물의 과세 여부가 다를 수 있음** (많은 주에서 실물 인쇄물은 과세, 순수 디자인 용역은 비과세이거나 별도 규정). 정확한 적용은 회계사와 확인하고, 시스템은 인보이스 항목별로 세율을 다르게 넣을 수 있게 유연하게 설계.

### 미국 표준 관례 (그대로 따름)
인보이스·날짜·연락처 등은 미국에서 범용적으로 쓰는 방식을 그대로 적용합니다.
- **날짜 형식:** `MM/DD/YYYY` (예: 06/30/2026). DB엔 ISO(`YYYY-MM-DD`)로 저장, 화면 표시만 미국식.
- **지급 조건(payment terms):** `Net 30`이 기본(인보이스 발행 후 30일 내 지급). 필요 시 Net 15 / Due on Receipt 선택. 인보이스에 `terms` 필드와 그에 따른 `due_date` 자동 계산.
- **인보이스 표준 항목:** Invoice # / Issue date / Due date / Bill to (고객 정보) / 항목별 description·qty·rate·amount / Subtotal / Sales tax / **Total due** / 지급 방법 안내.
- **숫자·통화:** 천 단위 콤마, 소수점 2자리 (`$12,500.00`). 음수/할인은 괄호 또는 `-` 표기.
- **연락처:** 전화 `(201) 555-0123` 형식, 주소는 미국식(Street / City, State ZIP).
- **회사 정보:** 인보이스 하단에 사업자명·주소·EIN(연방 사업자번호) 자리 마련(표시는 선택).
- **언어:** 고객 대면 문서(인보이스·포털)는 영어 기본.

### 참고 카테고리
이런 부류를 "에이전시/스튜디오 관리 소프트웨어"라고 부릅니다. (예: Productive, Workamajig, Streamtime) 막힐 때 이 키워드로 검색하면 UX 참고가 됩니다.

---

## 0.5 디자인 시스템 / 스타일 가이드 (먼저 정하기)

디자인 회사의 ERP라서, 자체 화면도 어느 정도 퀄리티가 있어야 합니다. 단, **여기에 픽셀 단위로 매달리는 건 함정**입니다(기능이 안 굴러가는 채로 디자인에만 몇 주를 쓰기 쉬움). 그래서 전략은 두 갈래로 나눕니다.

**① 내부 화면은 "스타일 가이드 한 번 정해두고 일관성" 전략**
비주얼스퀘어 로고에서 추출한 실제 브랜드 값입니다. 이걸 AI에게 못 박아두면, 추가 노력 거의 없이 흔한 관리자 템플릿 티를 벗습니다.

색상 토큰
| 역할 | 값 | 용도 |
|------|------|------|
| 강조색(코랄) | `#F57D4B` | 버튼·강조·포인트 |
| 텍스트/주조 | `#000000` (UI 본문은 `#141414`로 살짝 완화) | 글자·제목 |
| 배경 | `#FFFFFF` | 메인 배경 |
| 서피스 | `#FBF6F3` | 카드·패널 배경 |
| 보더 | `#E7E2DD` | 구분선·테두리 |
| 코랄 연한톤 | `#FDEDE4` / 진한 텍스트 `#B5491F` | 코랄 배경 위 글자(뱃지 등) |

폰트
- 제목/디스플레이: 고대비 세리프 (예: Playfair Display) — 로고와 같은 결, 화면 제목·로고성 요소에만.
- 본문/UI: **Pretendard** (한글+영문 모두 깔끔) 또는 Inter. 데이터 많은 표·폼은 전부 이 산세리프로.
- ⚠️ 세리프(Playfair 등)는 한글 글리프가 없으니, 한글 텍스트엔 절대 쓰지 말 것. 한글은 Pretendard로.

형태
- **둥근 모서리 최소화** (radius 2~3px 또는 0) — "square"라는 이름에 맞춘 각진 모듈형 느낌.
- 그림자 거의 안 씀, 0.5px 얇은 보더 + 넉넉한 여백으로 정리.
- 컴포넌트 베이스: **shadcn/ui** 채택 후 위 토큰으로 테마 덮어쓰기 (Button, Card, Table, Dialog, Tabs 통일).

**② 고객이 보는 표면에 폴리시를 몰아주기**
진짜 디자인 공을 쏟을 곳은 내부 관리 화면이 아니라, **고객이 직접 보는 화면**입니다. 이게 곧 영업 자료입니다.
- 시안 컨펌 포털 (고객이 시안 보고 승인하는 화면)
- 고객용 프로젝트 상태 페이지 (공유 링크)
- 결과물 **포트폴리오 쇼케이스**

> **바이브 코딩 팁:** 첫 프롬프트에서 "Next.js App Router + TypeScript + Tailwind + shadcn/ui 스택, 그리고 이 스타일 가이드(색·폰트·간격)를 모든 화면에 일관 적용한다"고 한 번 명확히 선언하세요. 이후 모든 코드가 일관되게 나옵니다.

---

## 1. 기술 스택

이미 보유 중인 인프라를 그대로 사용합니다.

| 영역 | 기술 | 비고 |
|------|------|------|
| 프론트엔드 | Next.js (App Router) + React | TypeScript 권장 |
| 스타일 | Tailwind CSS + shadcn/ui | 위 스타일 가이드 적용 |
| 백엔드/DB | Supabase (PostgreSQL) | 기존 프로젝트 `bkmmjjeuqrgnmufmsevu` |
| 인증 | Supabase Auth | 사내 직원 로그인용 |
| 파일 저장 | Supabase Storage | 결과물 사진·썸네일·작은 최종 파일 |
| 대용량 파일 | **구글 드라이브 링크(URL)만 기록** | PSD·AI·영상 등 원본 |
| 배포 | Vercel | GitHub 연동 자동 배포 |
| 형상관리 | GitHub (`101chickenusa`) | |

### 파일 저장 전략 (중요)
디자인 소스 파일은 용량이 커서 Storage에 다 넣으면 비용·속도 부담이 큽니다. 그래서 이렇게 나눕니다.

| 종류 | 저장 위치 | 예시 |
|------|-----------|------|
| 보여줄 작은 것 | Supabase Storage (`storage_url`) | 결과물 사진, 썸네일, 최종 PDF |
| 무거운 원본 | 구글 드라이브 → **링크만** (`external_url`) | PSD, AI, 영상, 대형 출력 원본 |

> 처음엔 드라이브 링크를 텍스트로 붙여넣는 방식으로 충분합니다. 나중에 여유가 생기면 구글 드라이브 API로 폴더 자동 생성·파일 목록 연동까지 확장(Phase 9 이후).

---

## 2. 데이터 모델 (DB 스키마)

이게 **가장 중요한 부분**입니다. 테이블 구조가 잘못되면 나중에 전부 갈아엎어야 하니, 여기서 시간을 충분히 쓰세요.
테이블 이름과 컬럼명은 **영어(snake_case)**, 화면 라벨만 한국어로 합니다.

### 2.1 `clients` — 고객
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| name | text | 담당자 이름 |
| company_name | text | 회사명 |
| email | text | |
| phone | text | |
| address | text | |
| memo | text | 비고 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 2.2 `vendors` — 인쇄소(거래처)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| name | text | 인쇄소명 |
| contact_person | text | 담당자 |
| email | text | |
| phone | text | |
| specialty | text | 취급 품목 (명함/대형출력/제본 등) |
| memo | text | |
| created_at | timestamptz | |

### 2.3 `projects` — 프로젝트 (★ 허브 테이블)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| client_id | uuid (FK→clients) | 어느 고객의 프로젝트인가 |
| name | text | 프로젝트명 |
| type | text (enum) | web / app / print / logo / branding |
| status | text (enum) | quote / in_progress / done / on_hold / canceled |
| start_date | date | |
| due_date | date | 마감일 |
| description | text | |
| quote_amount | numeric | 예상 견적 금액 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### 프로젝트 유형별 흐름 차이 (★ 유형별 분기)
유형에 따라 흐름이 다릅니다. UI에서 `type`에 맞춰 탭/기능을 **조건부로** 보여주세요.

| 유형 | 인쇄 발주(PO·빌) | 주 산출물 | 비고 |
|------|:---:|------|------|
| web / app | ❌ 없음 | 드라이브 링크(디자인 핸드오프) | 발주·빌 탭 숨김 |
| print (인쇄물) | ✅ 중심 | 결과물 사진 | 발주·빌이 핵심 |
| logo | △ (명함 등 가끔) | 다포맷 파일(AI/SVG/PNG) | |
| branding | △ | 스타일 가이드 PDF + 다포맷 | 산출물 묶음 큼 |

### 2.4 `tasks` — 작업(태스크)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| project_id | uuid (FK→projects) | |
| title | text | 작업명 |
| assignee | text | 담당자 (이후 users 테이블로 확장 가능) |
| status | text (enum) | todo / doing / review / done |
| due_date | date | |
| sort_order | int | 정렬 순서 |
| created_at | timestamptz | |

### 2.5 `work_orders` — 디자인 작업지시서
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| project_id | uuid (FK→projects) | |
| spec | text | 사양 (인쇄물이면 용지/사이즈/수량/후가공) |
| requirements | text | 요구사항 |
| included_revisions | int | 계약상 무료 포함 수정 횟수 (예: 3) |
| created_at | timestamptz | |

### 2.6 `proof_versions` — 시안 버전 / 컨펌 / 수정 횟수
> 작업지시서에 딸린 시안들. "고객이 컨펌 안 했다" 분쟁 방지 + 수정 횟수 추적.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| work_order_id | uuid (FK→work_orders) | |
| version | int | 1차, 2차, 3차... |
| file_url | text | 시안 파일 (Storage) 또는 드라이브 링크 |
| client_approved | boolean | 고객 컨펌 여부 |
| approved_at | timestamptz | 컨펌 시각 |
| is_extra_revision | boolean | 포함 횟수 초과분(추가 청구 대상) |
| memo | text | 수정 요청 내용 등 |
| created_at | timestamptz | |

> **수정 횟수 로직:** `version`이 `work_orders.included_revisions`를 넘어가면 그 시안의 `is_extra_revision`을 true로. 이 항목들은 인보이스에 "추가 수정비"로 올릴 수 있게 표시.

### 2.7 `assets` — 결과물 / 파일 / 포트폴리오 (★ v2 신규)
> 완료 결과물 사진, 최종 납품 파일, 무거운 원본 드라이브 링크를 한 곳에서 관리. 포트폴리오의 원천.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| project_id | uuid (FK→projects) | |
| work_order_id | uuid (FK→work_orders, nullable) | |
| kind | text (enum) | result_photo / final_file / drive_link |
| title | text | 항목 이름 |
| storage_url | text (nullable) | Supabase Storage (사진·작은 파일) |
| external_url | text (nullable) | 구글 드라이브 등 링크 (대용량 원본) |
| thumbnail_url | text (nullable) | 포트폴리오 표시용 썸네일 |
| is_portfolio | boolean | 쇼케이스에 노출할지 |
| memo | text | |
| created_at | timestamptz | |

### 2.8 `invoices` — 고객 인보이스 (AR, 받을 돈)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| project_id | uuid (FK→projects) | |
| client_id | uuid (FK→clients) | |
| invoice_number | text | 자동 생성 (예: VS-2026-0001) |
| issue_date | date | 발행일 |
| terms | text (enum) | 지급 조건: net_30(기본) / net_15 / due_on_receipt |
| due_date | date | 입금 기한 (terms 기준 자동 계산) |
| status | text (enum) | draft / sent / paid / overdue |
| subtotal | numeric | 공급가 |
| tax | numeric | 세액 |
| total | numeric | 합계 |
| paid_amount | numeric | 입금액 |
| paid_date | date | 입금일 |
| created_at | timestamptz | |

### 2.9 `invoice_items` — 인보이스 항목
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| invoice_id | uuid (FK→invoices) | |
| description | text | 항목 설명 (추가 수정비 등) |
| quantity | numeric | 수량 |
| unit_price | numeric | 단가 (USD) |
| amount | numeric | 금액 (수량×단가) |
| is_taxable | boolean | 과세 대상 여부 (인쇄 실물=true, 디자인 용역=주별 상이) |
| tax_rate | numeric | 적용 세율 (예: 0.06625 = NJ 6.625%). 과세 항목만 |

### 2.10 `purchase_orders` — 인쇄 발주 (PO)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| project_id | uuid (FK→projects) | |
| vendor_id | uuid (FK→vendors) | |
| po_number | text | 발주 번호 |
| order_date | date | |
| expected_date | date | 입고 예정일 |
| spec | text | 주문 내역 |
| amount | numeric | 발주 금액 |
| status | text (enum) | ordered / producing / received / canceled |
| created_at | timestamptz | |

### 2.11 `vendor_bills` — 받은 빌 (AP, 줄 돈)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| project_id | uuid (FK→projects) | |
| vendor_id | uuid (FK→vendors) | |
| purchase_order_id | uuid (FK→purchase_orders, nullable) | 어느 발주에 대한 빌인가 |
| bill_number | text | |
| received_date | date | 수령일 |
| due_date | date | 지급 기한 |
| amount | numeric | 청구 금액 |
| status | text (enum) | received / paid |
| paid_date | date | |
| file_url | text | 빌 스캔본 (Storage) |
| created_at | timestamptz | |

### 2.12 관계 요약
```
clients  1 ──── N  projects
vendors  1 ──── N  purchase_orders, vendor_bills
projects 1 ──── N  tasks, work_orders, invoices, purchase_orders, vendor_bills, assets
work_orders 1 ─── N  proof_versions, assets(0~N)
invoices 1 ──── N  invoice_items
purchase_orders 1 ─ N(0~1)  vendor_bills
```

> **마진 계산의 핵심:** 모든 돈 테이블(invoices, vendor_bills)에 `project_id`가 있어서, 프로젝트별 GROUP BY로 "이 프로젝트가 얼마 남았는지"가 자동 계산됩니다.

---

## 3. 단계별 빌드 로드맵

각 Phase를 **하나씩** 완성하세요. 화면에서 직접 눌러봐서 동작하면 다음으로 갑니다.

---

### Phase 0 — 프로젝트 셋업 + 스타일 가이드
**목표:** 빈 Next.js 앱이 Supabase에 연결되고 Vercel에 배포되며, 스타일 가이드가 입혀진 상태.

**만들 것**
- [ ] Next.js (App Router) + TypeScript + Tailwind + shadcn/ui 세팅
- [ ] **스타일 가이드 정의** (0.5장: 색·폰트·간격) 후 전역 적용
- [ ] Supabase 클라이언트 연결 (`.env.local`)
- [ ] GitHub → Vercel 자동 배포 확인
- [ ] 기본 레이아웃: 좌측 사이드바(고객/프로젝트/인보이스/발주·빌/포트폴리오/대시보드)

**AI 프롬프트 예시**
> "Next.js App Router + TypeScript + Tailwind + shadcn/ui로 세팅하고, 비주얼스퀘어 스타일 가이드를 전역에 적용해줘. 강조색 코랄 #F57D4B, 텍스트 #141414, 배경 #FFFFFF, 카드 서피스 #FBF6F3, 보더 #E7E2DD. 제목은 세리프(Playfair Display), 본문·UI는 Pretendard(한글 지원). 둥근 모서리는 2~3px로 최소화하고 그림자 대신 0.5px 보더를 써줘. Supabase 클라이언트(`lib/supabase.ts`)와 좌측 사이드바 레이아웃까지. 데이터 연결은 아직 안 해도 돼."

**완료 확인:** 로컬·Vercel 양쪽에서 스타일이 입혀진 사이드바가 보인다.

---

### Phase 1 — 데이터베이스 스키마 생성
**목표:** 2장의 12개 테이블이 Supabase에 생성되고 테스트 데이터를 넣어볼 수 있는 상태.

**만들 것**
- [ ] 2장의 모든 테이블 SQL 생성 (assets 포함)
- [ ] FK 관계 정확히 연결
- [ ] RLS — 처음엔 "로그인 사용자 전체 권한"으로 단순하게
- [ ] 샘플 데이터 5~10건 직접 입력

**AI 프롬프트 예시**
> "다음 스키마대로 Supabase SQL을 작성해줘 (← 2장 표 붙여넣기). created_at 기본값 now(), FK 정확히, RLS는 authenticated 전체 권한으로."

**완료 확인:** Table Editor에 12개 테이블이 보이고, 고객→프로젝트→인보이스 샘플의 FK가 정상 연결된다.

> ⚠️ **여기서 절대 서두르지 마세요.** 스키마가 틀어지면 뒤가 전부 무너집니다.

---

### Phase 2 — 고객 관리 (CRM)
**목표:** 고객 CRUD + 고객 상세에서 그 고객의 프로젝트·매출·미수금 요약.

**만들 것**
- [ ] 고객 목록 (검색 가능 테이블)
- [ ] 추가/수정 폼 (Dialog)
- [ ] 고객 상세 — 정보 + 프로젝트 목록 + 총 매출/미수금
- [ ] 삭제 (확인 다이얼로그)

**완료 확인:** 고객 추가 즉시 목록 반영, 상세에서 연결 프로젝트가 보인다.

---

### Phase 3 — 프로젝트 + 작업 (유형별 분기 도입)
**목표:** 프로젝트가 허브로 동작하고, **유형(type)에 따라 화면이 달라진다.**

**만들 것**
- [ ] 프로젝트 목록 (상태별 필터)
- [ ] 프로젝트 추가 폼 (고객 선택 + 유형 선택 필수)
- [ ] 프로젝트 상세 = 핵심 화면, 탭 구조:
  - 개요 / 작업 / (이후) 작업지시서 · 결과물 · 인보이스 · 발주·빌
- [ ] **유형별 조건부 UI:** web/app이면 발주·빌 탭 숨김, print면 표시 (2.3 표 기준)
- [ ] 태스크 CRUD (칸반: todo/doing/review/done)

**AI 프롬프트 예시**
> "projects 목록·상세를 만들어줘. 상세는 탭 구조. project.type이 'web'/'app'이면 발주·빌 탭을 숨기고 'print'면 보여줘. 작업 탭은 tasks 칸반."

**완료 확인:** 인쇄 프로젝트엔 발주 탭이 있고 웹 프로젝트엔 없다.

---

### Phase 4 — 작업지시서 + 시안 컨펌 + 수정 횟수
**목표:** 작업지시서 작성, 시안 버전 누적, 고객 컨펌 기록, 포함 수정 횟수 초과 추적.

**만들 것**
- [ ] 프로젝트 상세에 "작업지시서" 탭
- [ ] 작성 폼 (사양/요구사항 + included_revisions)
- [ ] Storage 버킷 + 시안 업로드 (또는 드라이브 링크)
- [ ] 시안 버전 누적 + 각 버전 컨펌 버튼 (approved_at 기록)
- [ ] **수정 횟수 초과 자동 표시:** version > included_revisions면 is_extra_revision 플래그 + "추가 청구 대상" 뱃지
- [ ] 컨펌 이력 타임라인

**AI 프롬프트 예시**
> "work_orders + proof_versions 탭을 만들어줘. 시안 버전을 누적하고 컨펌 버튼으로 approved_at 기록. version이 included_revisions를 넘으면 is_extra_revision=true로 표시하고 '추가 청구 대상' 뱃지를 붙여줘."

**완료 확인:** 4차 시안인데 포함이 3차면 "추가 청구 대상"으로 뜬다.

---

### Phase 5 — 결과물 / 파일 관리 (assets) ★ v2 신규
**목표:** 완료 결과물 사진 업로드, 최종 파일 보관, 대용량 원본은 드라이브 링크 기록.

**만들 것**
- [ ] 프로젝트 상세에 "결과물" 탭
- [ ] 결과물 사진 업로드 (Storage) — 인쇄물/제품 완성 사진 기록
- [ ] 드라이브 링크 추가 (external_url에 URL만 저장)
- [ ] 최종 파일 업로드(작은 것) 또는 링크
- [ ] 각 항목에 `is_portfolio` 토글 (쇼케이스 노출 여부)
- [ ] 썸네일 그리드로 보기

**AI 프롬프트 예시**
> "assets 탭을 만들어줘. kind는 result_photo(사진 업로드→Storage)/drive_link(URL만 저장)/final_file. 각 항목에 '포트폴리오에 추가' 토글(is_portfolio). 사진은 썸네일 그리드로 보여줘."

**완료 확인:** 완성 사진을 올리면 그리드에 뜨고, 드라이브 링크는 클릭하면 새 탭에서 열린다.

---

### Phase 6 — 인보이스 (AR, 받을 돈)
**목표:** 프로젝트 기준 인보이스 발행 + 입금 추적. (추가 수정비도 항목으로)

**만들 것**
- [ ] 프로젝트 상세에 "인보이스" 탭
- [ ] 인보이스 생성 (invoice_items 여러 줄, 자동 합계, **항목별 과세/세율 반영**한 세액 계산)
- [ ] 모든 금액 USD 표시 (`$1,200.00`, `Intl.NumberFormat` en-US)
- [ ] 번호 자동 생성 (VS-연도-순번)
- [ ] 상태(draft/sent/paid/overdue) + 입금 처리
- [ ] 인쇄용 인보이스 화면 / PDF
- [ ] 전체 목록 + 미수금 필터

**완료 확인:** 항목 추가 시 합계 자동, 입금 처리 시 paid로 전환.

---

### Phase 7 — 발주(PO) + 받은 빌(AP, 줄 돈)
**목표:** 인쇄소 발주 + 받은 빌 등록으로 줄 돈 추적. (인쇄 유형 프로젝트 위주)

**만들 것**
- [ ] 인쇄소(vendors) CRUD
- [ ] 프로젝트 상세에 "발주·빌" 탭 (print 유형에서만 노출)
- [ ] 발주 생성 (인쇄소·사양·금액)
- [ ] 받은 빌 등록 (발주 연결, 스캔 업로드, 금액)
- [ ] 발주액 vs 빌액 대조 (차이 시 경고)
- [ ] 미지급 빌 목록 + 지급 처리

**완료 확인:** 발주→빌 연결, 미지급 빌 지급 처리.

---

### Phase 8 — 대시보드 + 마진 + 포트폴리오 쇼케이스
**목표:** "이 프로젝트 남았나?" + "회사 전체 현황" + "보여줄 포트폴리오"가 한눈에.

**만들 것**
- [ ] 프로젝트 상세 상단 **마진 카드**: AR합계 − AP합계 = 마진, 마진율
- [ ] 메인 대시보드: 진행중 프로젝트 수 / 이번 달 매출 / 미수금 / 미지급금 / 마감 임박
- [ ] 프로젝트별 수익성 순위
- [ ] **포트폴리오 쇼케이스 화면**: is_portfolio=true인 assets를 갤러리로 (유형·고객별 필터). 고객 제안 시 보여줄 자료.

**AI 프롬프트 예시**
> "프로젝트 상세에 마진 카드(invoices.total 합 − vendor_bills.amount 합, 마진율) 추가. 메인 대시보드에 핵심 지표 카드들. 그리고 is_portfolio=true 자산을 모은 포트폴리오 갤러리 화면을 만들어줘 — 여기는 디자인 신경 써서 깔끔하게."

**완료 확인:** 프로젝트마다 마진 자동 표시, 포트폴리오 화면에 선별 결과물이 갤러리로 뜬다.

---

### Phase 9 — 다듬기 & 고객 대면 화면
**목표:** 실제 업무 사용 + 고객이 보는 화면 폴리시.

**만들 것**
- [ ] 직원 로그인(Supabase Auth) + 간단 권한
- [ ] 전역 검색 (고객·프로젝트·인보이스)
- [ ] 마감일/미수금 알림 (배지 또는 이메일)
- [ ] 데이터 내보내기 (CSV/Excel)
- [ ] 반응형(모바일) 정리
- [ ] **고객 대면 화면에 폴리시 집중** (영업 자료가 되는 부분):
  - 시안 컨펌 포털 (고객이 링크로 들어와 시안 보고 승인)
  - 고객용 프로젝트 상태 공유 페이지
  - 포트폴리오 쇼케이스 공개 버전
- [ ] (선택) 구글 드라이브 API 연동 — 폴더 자동 생성·파일 목록

**완료 확인:** 로그인 없이는 접근 불가. 프로젝트 1건을 처음부터 끝까지(고객→프로젝트→작업지시서→시안 컨펌→결과물 업로드→발주→빌→인보이스→마진·포트폴리오) 막힘없이 돌릴 수 있다.

---

## 4. 바이브 코딩 진행 팁

1. **한 번에 한 Phase.** "전부 만들어줘"는 금물. 기능 단위로 자르세요.
2. **스키마를 항상 같이 보여주기.** 새 작업마다 관련 테이블 정의(2장)를 프롬프트에 붙이면 컬럼명을 안 헷갈립니다.
3. **완료 확인을 눈으로.** 각 Phase의 "완료 확인"을 화면에서 직접 눌러보고 넘어가세요.
4. **에러는 통째로 복사해서 주기.** 빨간 메시지 전체가 "안 돼요"보다 10배 빠릅니다.
5. **자주 커밋.** Phase마다 GitHub 커밋. 망가지면 되돌립니다.
6. **내부 화면에 과몰입 금지.** 스타일 가이드만 지키면 충분. 디자인 공은 고객 대면 화면(Phase 8·9)에 몰아주세요.

---

## 5. 2차 개발 — 고객 포털 (Client Portal) ★

> **1차(Phase 0~9)로 내부 ERP가 안정적으로 돌아간 뒤** 착수합니다. 고객이 직접 들어오는 외부 화면 + 온라인 결제라 권한·보안·결제 연동이 무거워서, 내부 시스템이 검증된 다음에 붙이는 게 안전합니다.

**목표:** 고객사마다 전용 페이지(로그인)에 들어와서 ① 자기 프로젝트 진행상태 확인, ② 미결제 인보이스 즉시 온라인 결제, ③ (연동 시) 시안 컨펌까지 한 곳에서.

**만들 것**
- [ ] **고객 계정/로그인** — 직원 계정과 분리. Supabase Auth user ↔ `clients` 매핑(예: `clients.auth_user_id` 또는 별도 `client_users` 테이블)
- [ ] **내 프로젝트 대시보드** — 그 고객의 projects 목록, 상태(견적/진행중/완료), 태스크 진행률, 마감일
- [ ] **시안 컨펌(통합)** — Phase 9의 컨펌 포털을 포털 안으로 흡수: 고객이 시안 보고 바로 승인 → `proof_versions.approved_at` 기록
- [ ] **인보이스 조회 + 즉시 결제** — 미결제(unpaid/overdue) 인보이스 목록 → 결제 버튼 → 결제 완료 시 `invoices.status`를 paid로 자동 전환
- [ ] **결제 트랜잭션 기록** — 새 테이블 `payments` (invoice_id, 결제수단, 거래ID, 금액, 결제일시, 상태) 권장

**아키텍처 주의점 (이게 핵심)**
- **권한 분리(RLS):** 1차에서 "로그인 사용자 전체 권한"으로 단순하게 둔 RLS를, 여기서는 **반드시 실제 정책으로 강화**해야 합니다. 고객은 자기 `client_id`에 속한 데이터만 보이게 — 잘못하면 A 고객이 B 고객 인보이스를 봅니다. 가장 신경 써야 할 보안 지점.
- **결제 대행사(PG)는 Stripe로 확정:** 미국 비즈니스이므로 Stripe 사용(USD 결제, 카드·ACH 지원). Stripe Checkout 또는 Payment Links로 시작하면 가장 빠르고, 인보이스를 Stripe Invoicing에 연동하는 방식도 검토 가능. 직접 카드정보를 받지 말고 Stripe가 처리하게 둘 것(PCI 부담 회피).
- **결제 확인은 webhook으로:** "결제 버튼 눌렀다"가 아니라 PG가 보내주는 webhook으로 실제 결제 완료를 확인해서 status를 바꿔야 안전합니다(위변조 방지).
- **별도 진입점:** 내부 ERP와 분리된 경로(`/portal`) 또는 서브도메인(`portal.도메인`)으로 두면 깔끔합니다.
- **디자인 우선순위 ↑:** 이 화면은 고객이 직접 보는 영업 자료라서, 0.5장 전략대로 폴리시를 제대로 줍니다.

**데이터 영향 (1차 스키마에 추가될 것)**
| 추가/변경 | 내용 |
|-----------|------|
| `clients` 또는 `client_users` | 로그인용 auth 매핑 |
| `payments` (신규) | 결제 트랜잭션 기록 |
| `invoices` | 결제 연동 필드(거래ID 등) 보강 가능 |
| RLS 정책 | 고객 = 본인 client_id 데이터만 |

**완료 확인:** 고객 A로 로그인하면 A의 프로젝트·인보이스만 보이고, 미결제 인보이스를 결제하면 status가 paid로 바뀐다. B의 데이터는 절대 안 보인다.

---

## 6. 그 외 향후 확장

- 견적서 자동 생성 (인보이스 직전 단계)
- 타임시트 → 인건비 자동 반영 → 더 정확한 마진
- 구글 드라이브 API 깊은 연동 (자동 폴더·동기화)
- 반복 청구 (월 구독형 디자인 유지보수)
- 다른 비주얼스퀘어 외 사업체와 연동

---

## 부록: 빌드 순서 한 줄 요약

```
Phase 0 셋업+스타일 → 1 스키마 → 2 고객 → 3 프로젝트+작업(유형분기) →
4 작업지시서+컨펌+수정횟수 → 5 결과물/파일 → 6 인보이스(AR) →
7 발주+빌(AP) → 8 대시보드+마진+포트폴리오 → 9 다듬기+고객화면
```

> 기억하세요: **프로젝트가 허브, 마진이 심장, 결과물이 포트폴리오.**
> 내부 화면은 일관성만, 디자인 공은 고객이 보는 화면에.
