# Plan: meta-marketing-service

- 프로젝트: visualsquare-erp (erp.seenutech.com)
- 작성일: 2026-08-12
- 단계: Plan
- 요청 배경: 2026-08-12 SEENU KIOSK lunch-rush 캠페인 게시 시작 (FB 사진 게시물 + 릴스, Seenu Tech 페이지 / seenu.tech.ai 인스타 동시 게시). 성과를 ERP에서 상시 모니터링하고, 이후 게시 자체를 자동화하려는 요구.

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 마케팅 게시물 성과가 Meta Business Suite 안에만 있어 ERP(회계·리드·프로젝트)와 분리되어 있고, 게시는 매번 수동 반복 작업이다. |
| **Solution** | Meta Graph API로 게시물·광고 성과를 Supabase에 주기 수집하고 `(erp)/marketing`에 대시보드로 노출. 2단계로 콘텐츠 캘린더 기반 자동 게시까지 확장. |
| **Function UX Effect** | ERP 사이드바에 Marketing 메뉴 추가 — 캠페인별 도달·재생·클릭·리드가 매출·리드 데이터와 한 화면에서 연결된다. |
| **Core Value** | 게시→성과→리드→매출이 하나의 시스템에 모여, 감이 아니라 숫자로 채널·크리에이티브를 고르게 된다. |

## 1. 목표 / 비목표

**목표**
1. FB 페이지·IG 계정의 게시물(오가닉) 성과를 하루 2회 이상 자동 수집
2. 광고 집행 시작 시 광고 인사이트(지출·CPM·CTR·결과당 비용) 수집
3. `(erp)/marketing` 대시보드: 캠페인/게시물 단위 추이, 기간 비교
4. UTM 규칙 표준화 → 링크 클릭이 ERP 리드 파이프라인(`leads`)과 연결
5. (2단계) 콘텐츠 캘린더 기반 예약 게시 — 릴스·사진·캐러셀 FB+IG 동시

**비목표 (이번 사이클에서 제외)**
- Threads·LinkedIn·네이버 수집 (수동 유지)
- 댓글·DM 관리 (Business Suite 유지)
- Meta Sound Collection 음악 삽입 (API 미지원 — 음원은 파일에 사전 합성)
- 페이스북 그룹 게시 (API 미지원 — 수동 유지)

## 2. 요구사항

**기능 (FR)**
- FR-01 Meta 계정 연결 정보(페이지 ID, IG ID, 토큰)를 서버 환경변수/Supabase Vault로 관리
- FR-02 Vercel Cron으로 게시물 목록·인사이트 수집 (1일 2~4회, 기존 heartbeat cron 패턴 재사용)
- FR-03 게시물 스냅샷 테이블에 일자별 지표 적재 (도달, 재생, 좋아요, 저장, 팔로우, 링크클릭)
- FR-04 광고 계정 인사이트 수집 (`/insights`, spend·impressions·ctr·cost_per_result)
- FR-05 대시보드: 캠페인 필터 · 게시물 테이블 · 지표 추이 차트 · 전주 대비
- FR-06 UTM 빌더: `utm_source=facebook|instagram / utm_medium=reel|feed|story / utm_campaign={캠페인}` 규칙 고정
- FR-07 (2단계) publish_queue 테이블 + cron 게시: 예약 시각에 Graph API로 릴스/사진 게시
- FR-08 (2단계) 게시 실패 재시도·알림 (기존 ERP 알림 방식 따름)

**비기능 (NFR)**
- NFR-01 토큰은 시스템 사용자 장기 토큰 — 클라이언트 노출 금지, 서버 라우트에서만 사용
- NFR-02 Graph API 버전 고정(v23+) 및 사용 버전 기록 — 연 1회 버전 상향 점검
- NFR-03 수집 실패가 ERP 다른 서비스에 영향 없도록 격리 (cron 라우트 독립)
- NFR-04 RLS: marketing 테이블은 인증 사용자 read, service role만 write

## 3. 아키텍처 초안

```
Meta Graph API (system user token)
   │  ①게시물/인사이트 GET          ②(2단계) 게시 POST
   ▼
Vercel Cron → /api/marketing/collect   /api/marketing/publish
   ▼
Supabase (meta_posts, meta_insights_daily, meta_ad_insights_daily, publish_queue)
   ▼
(erp)/marketing 대시보드  ←  기존 (erp)/leads 와 UTM으로 연결
```

**데이터 모델 초안**
- `meta_accounts` — 페이지/IG/광고계정 ID, 토큰 참조, 상태
- `meta_posts` — 게시물 ID, 플랫폼, 유형(reel/photo/carousel), 캠페인, permalink, 게시시각
- `meta_insights_daily` — post_id × date, reach, plays, reactions, saves, follows, link_clicks
- `meta_ad_insights_daily` — ad_id × date, spend, impressions, clicks, ctr, cost_per_result
- `publish_queue` — (2단계) asset 경로, 캡션, 채널, 예약시각, 상태, 결과 post_id

## 4. 선행 조건 (외부 의존 — 일정 리스크)

1. Meta 개발자 앱 생성, 비즈니스 연결 (business_id 992137573465963)
2. 시스템 사용자 생성 + 장기 토큰 발급
3. 권한: `pages_read_engagement` `pages_manage_posts` `instagram_basic` `instagram_manage_insights` `instagram_content_publish` `ads_read`
4. 자사 자산 전용이라 App Review 없이 가능한 범위 확인 (Business 앱 + 자사 페이지는 대체로 검수 불요)

## 5. 단계별 범위

| 단계 | 범위 | 산출물 |
|---|---|---|
| **1a** | 수집 파이프라인 + 원시 테이블 | cron 라우트, 마이그레이션, 수집 검증 |
| **1b** | 대시보드 v1 (게시물 테이블 + 추이) | `(erp)/marketing` 페이지 |
| **1c** | UTM 표준 + 리드 연결 | UTM 빌더, leads 조인 뷰 |
| **2** | 예약 게시 (릴스·사진) | publish_queue + 게시 cron + 간단 캘린더 UI |

## 6. 성공 기준

- 대시보드에서 lunch-rush 캠페인의 릴스 재생수·도달을 **당일 데이터로** 확인 가능
- 수집 실패율 < 1% (7일 기준), 실패 시 다음 주기 자동 복구
- UTM 클릭 → leads 유입 매칭이 최소 1건 이상 검증
- (2단계) 예약 게시 1건이 사람 개입 없이 FB+IG 동시 게시 성공

## 7. 리스크

| 리스크 | 대응 |
|---|---|
| 토큰 만료·권한 회수 | 시스템 사용자 토큰 + 수집 라우트에서 토큰 헬스체크, 실패 시 대시보드 배너 |
| App Review 지연 | 1단계는 read 권한 위주 — 자사 자산은 대부분 검수 불요. publish 권한만 2단계로 분리 |
| API 버전 폐기 | 버전 고정 + 응답 스키마 로깅 |
| 지표 정의 변경(Meta 측) | 원시 응답 JSON 보관 컬럼 유지 |

## 8. 오픈 질문

1. 광고 계정 ID (아직 광고 미집행 — 집행 시점에 연결)
2. 알림 채널: ERP 내 배너로 충분한지, 이메일 필요한지
3. 대시보드 접근 권한: ERP 로그인 사용자 전체 vs 별도 역할
