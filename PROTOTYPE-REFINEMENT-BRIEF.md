# Klockit Prototype — Experience Reference Refinement Brief

**Status:** Active refinement brief  
**Date:** 15 September 2026  
**Purpose:** Make the prototype safe and clear enough to serve as the primary Klockit Experience Reference before further production assembly.

## 1. Authority and intent

The prototype is now the approved primary Experience Reference for Klockit customer and Operator experience.

It should be refined toward the product we actually want to build now, not treated as a distant aspiration. Its shell, flow, copy tone, hints, cross-page links, visual hierarchy and interaction patterns should be preserved to a high degree unless a specific element creates a material product, security, privacy, evidence-integrity or authority risk.

The implementation team should bind real Klockit data, permissions and state into this experience rather than replacing the experience with legacy technical screens.

## 2. Product truths that must remain visible in the prototype

The following are substantive Klockit truths and should not be weakened by prototype refinement:

- Klockit helps businesses know who was at work each day.
- Klockit records arrival and departure; it does not measure worker productivity or whether work was performed well.
- Attendance history must preserve accepted evidence and correction history.
- Effective arrival/departure time is distinct from later Manager correction/acceptance time.
- Missing departure never fabricates a departure time.
- Ambiguous attendance/session association is not silently guessed.
- Trusted Site QR evidence can support direct attendance recording.
- Typed manual Site code is weaker evidence and always requires Manager review.
- Site, Worker and Work Session lifecycle changes preserve history rather than deleting authoritative records.
- Manager, Worker and Platform Operator roles are distinct authority contexts.

## 3. Prototype elements to keep strongly

Preserve and strengthen the existing prototype experience around:

- persistent top-level shell and navigation;
- Today as the natural Manager operating home;
- persistent Workers, Sites and planned sessions without manual load/refresh prerequisites;
- unified Planning rather than separate mini-products for one-off/recurring/batch scheduling;
- contextual cards and links between related work;
- clear Needs Attention / exception workflow;
- useful attendance History with date ranges and filters;
- Worker workspace with Work Presence, My Schedule and My History;
- clear state-aware calls to action;
- short human Site code as fallback and opaque QR payload for stronger evidence;
- friendly, human copy and inline guidance;
- coherent colour/state language across the application.

## 4. Material prototype assumptions to remove or correct before implementation

### 4.1 Worker data must not turn Klockit into an HR system

The current prototype Worker type includes `role`, `email`, `phone`, avatar presentation and other directory-like fields. These must not become required workforce truth merely because they exist in the mock model.

For the core Worker experience, centre on:

- worker name;
- Worker Reference;
- status;
- Site/work pattern relationship where needed;
- language/access state where needed;
- attendance and expected-work context.

Optional contact information may be explored later where there is a clear operational need, but the prototype must not imply a broad HR personnel record.

### 4.2 Site lifecycle terminology

Replace `archived` with **retired** where a Site is no longer active. Retired Sites remain in history and can be reactivated where permitted. Do not imply destructive deletion.

### 4.3 Manual-code review is not an organisation toggle

Remove any organisation setting that implies typed manual Site code review can be disabled.

The rule is platform/product behaviour:

- QR may support direct attendance recording;
- typed manual Site code always goes to Manager review.

The prototype should not present `allowManualCodeFallback` or `requireManagerReviewForManualCode` as customer-configurable policy switches.

### 4.4 Grace-period policy is not yet approved product truth

Do not make a default grace period a central organisation setting unless a later Founder decision explicitly approves it.

The product may compare actual and expected time, but attendance evidence must not disappear because of a timing threshold.

### 4.5 Manager must not appear to fabricate attendance

Remove `manager_entry` as a normal arrival/departure method in the customer experience.

Managers may investigate and resolve exceptions using effective occurrence time plus separate correction/acceptance metadata. The experience should communicate correction/resolution, not silent Manager-created attendance evidence.

### 4.6 Shift swaps

Shift swap UI has already been removed from the visible experience. Remove residual `ShiftSwapRequest` types/data and do not carry this concept into implementation without a separate Founder decision.

### 4.7 Demo role switching

The prototype may need a review-only navigation affordance to move between Manager, Worker and Operator experiences, but this must sit outside the product chrome and be visibly labelled **Prototype navigation**.

Do not imply that a real customer Manager can simply switch into a Worker or Operator authority context.

### 4.8 Export/print conveniences

CSV/PDF/Print controls should not become required MVP functionality merely because the prototype can display them. Keep them only if they materially improve the reference experience and clearly mark them as non-authoritative prototype conveniences until separately approved.

### 4.9 Technical language

Do not expose KIP IDs, canonical IDs, database terms, evidence-engine terminology, internal migration language or other implementation vocabulary in normal customer-facing screens.

## 5. Manager experience refinement

### Today

The Manager should be able to answer quickly:

- Who was expected today?
- Who is at work now?
- Who has completed attendance?
- Who has not arrived?
- What needs attention?

The page should allow natural drill-down from summary cards into the relevant people/records.

### Planning

Keep Planning as one coherent workspace:

- calendar/week matrix;
- Work Patterns as a way to generate recurring sessions;
- generated Work Sessions visible in one register;
- adjust, cancel, suspend/reactivate where product truth permits;
- Worker and Site context already available, never manually loaded;
- links from a Worker or Site into the relevant planned sessions.

### Workers

Workers should be a persistent organisation directory rather than an invitation/test screen.

Each Worker profile should connect naturally to:

- current status;
- expected work;
- recent attendance/history;
- assigned Site/pattern where applicable;
- lifecycle actions that preserve history.

### Sites

Sites should be a persistent location register with:

- active/retired state;
- address/city where useful;
- short Site code;
- QR placard management;
- Worker/session relationships;
- lifecycle history.

### Needs Attention

Use one coherent exception workspace for:

- manual Site-code review;
- missing departure;
- unmatched/ambiguous session association;
- other attendance exceptions supported by product truth.

Every review should show what happened, what was expected, what evidence exists, what the Manager is deciding, and the effective time when applicable.

### History

History should feel like a useful attendance report, not a technical query form.

Retain date presets/custom ranges, Site/Worker/status filters, summary information and natural links to the underlying attendance record where useful.

## 6. Worker experience refinement

Keep a focused Worker experience with:

- **Work Presence** — current attendance state and the next meaningful action;
- **My Schedule** — upcoming expected work;
- **My History** — personal attendance history;
- **Arrive / Leave** as contextual actions rather than a disconnected test screen.

Worker identity/session context should persist through normal navigation. Repeated Worker Reference/PIN entry must not be required after successful Worker sign-in unless the session is intentionally ended.

## 7. New Platform Operator / Klockit Administrator control plane

Add a third, separate prototype experience: **Klockit Operator**.

This is the internal control plane for the Klockit platform, not an organisation Manager view.

### 7.1 Operator shell

Create a distinct internal shell with:

- Klockit Operator identity/context;
- global search for organisation/user/site;
- platform attention/alerts;
- clear separation from customer organisation context;
- persistent navigation;
- audited high-impact actions;
- prototype-only navigation to return to Manager/Worker views without implying real shared authority.

Recommended primary navigation:

1. Platform Overview
2. Organisations
3. Users & Access
4. Subscriptions & Billing
5. Onboarding & Provisioning
6. Content & Experience
7. Platform Operations
8. Audit & Change History
9. Platform Settings

### 7.2 Platform Overview

The Operator should be able to answer at a glance:

- how many organisations exist;
- how many are onboarding, trialling, active, suspended or need support;
- active customer users;
- active workforce records/workers where useful;
- active Sites;
- countries represented;
- onboarding funnel state;
- commercial-state summary;
- current platform warnings/operator attention;
- recent important changes.

Avoid productivity metrics and avoid presenting vanity analytics as product truth.

### 7.3 Organisations

Provide a searchable/filterable organisation register with:

- organisation name/reference;
- status;
- organisation type/segment where useful;
- country;
- primary language;
- locations/Sites count;
- Worker count;
- onboarding state;
- commercial state;
- support status/history;
- last meaningful activity.

Organisation detail should bring together:

- overview;
- Managers/users/access;
- Sites;
- Workers summary;
- planned-work/session infrastructure summary;
- onboarding progress;
- commercial/subscription state;
- support notes/history;
- organisation-level audit history.

Operator must not silently rewrite customer attendance evidence from this view.

### 7.4 Users & Access

Show platform-wide customer user access, including:

- identity/account;
- organisation memberships;
- role/access level;
- invitation state;
- active/suspended access;
- last activity;
- controlled actions such as resend invite, suspend/reactivate access, revoke session where later supported.

Every high-impact action should require an explicit reason and be audit-recorded.

Do not introduce hidden impersonation. If a future support-view feature is required, it must be explicit, clearly bannered, constrained and separately approved.

### 7.5 Subscriptions & Billing

Prototype the **experience architecture**, not final commercial policy.

Show placeholders for:

- current plan;
- trial state;
- billing state;
- renewal/next review date;
- entitlements/capacity summary;
- commercial history;
- operator exceptions/holds.

Do not invent final plan names, prices, billing thresholds or enforcement rules. Use neutral sample states such as `Trial`, `Active`, `Past due`, `Suspended`, `Manual review`.

### 7.6 Onboarding & Provisioning

Allow the Operator to see:

- who registered;
- organisation-creation state;
- Manager/admin access state;
- first Site state;
- Worker onboarding state;
- planned-work setup state;
- first attendance evidence state;
- blockers/support required;
- recommended next setup step.

These are Operator workflow indicators, not an immutable product-readiness policy unless later approved.

### 7.7 Content & Experience

Provide controlled management for centrally managed customer-facing content that genuinely belongs to Klockit, such as:

- onboarding/help copy;
- explanatory guidance;
- QR/print templates;
- support/legal/help links;
- centrally maintained translations;
- platform notices where appropriate.

Content management must not be able to redefine attendance semantics, evidence rules, permissions or security controls.

Changes should be versioned and auditable.

### 7.8 Platform Operations

Focus on business-operation health rather than developer internals.

Useful areas include:

- onboarding failures;
- failed invitations/access operations;
- attendance-processing warnings;
- unresolved platform exceptions;
- inactive or misconfigured Sites;
- queue/background-processing failures where meaningful to support;
- integration/auth/service health summary;
- recent support incidents;
- items requiring Operator action.

### 7.9 Audit & Change History

Provide a searchable immutable history of important changes across:

- organisation configuration;
- access and role changes;
- Site/Worker lifecycle administration where platform-relevant;
- subscription/commercial state;
- centrally managed content;
- platform configuration;
- Operator actions.

Show who acted, what changed, target organisation/user, when, reason and resulting state where available.

Audit history itself is not editable.

### 7.10 Platform Settings

Limit this to configuration that genuinely belongs to Klockit rather than a customer organisation.

Potential prototype areas:

- supported languages;
- default support/contact links;
- centrally managed template defaults;
- platform notices;
- operational feature availability where later approved.

Do not expose security-critical or evidence-integrity switches casually. High-risk platform configuration requires stronger authority and later implementation design.

## 8. Operator security/authority guardrails

The prototype should visually communicate that Operator authority is privileged and distinct.

Before implementation, the following are mandatory design constraints:

- separate Operator authentication/authorization from ordinary organisation Manager authority;
- strong authentication/MFA for Operator accounts;
- reason-required high-impact actions;
- immutable audit of Operator actions;
- no hidden attendance-evidence rewrite capability;
- no silent customer impersonation;
- least-privilege Operator roles may be introduced later if needed.

The prototype may show these controls without selecting the final identity provider or technical implementation.

## 9. Experience-reference completion criteria

Before the prototype is handed back for production assembly, verify that:

- the Manager flow no longer contains speculative HR/productivity concepts;
- the Worker flow is coherent and persistent;
- all visible Site/Worker/session data behaves as persistent organisation context;
- manual Site-code review is always represented as Manager review;
- no organisation setting can disable mandatory review for manual Site code;
- no ordinary Manager action appears to fabricate attendance evidence;
- retired/active lifecycle language preserves history;
- no shift-swap residue remains;
- no technical/governance vocabulary leaks into normal customer copy;
- prototype role switching is clearly outside product chrome;
- the new Operator control plane exists as a coherent internal application;
- commercial screens clearly remain experience assumptions rather than final commercial policy;
- high-risk Operator actions visibly require controlled, auditable handling.

## 10. Handoff rule

Production implementation should not reinterpret this refined prototype into a more technical or fragmented experience.

Where binding real Klockit product truth requires a visible deviation, the implementation team must identify the exact conflict and obtain Founder resolution before changing the approved experience.
