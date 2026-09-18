# Klockit — FEF-ERAS-001 Alignment

**Status:** Aligned  
**Date:** 18 September 2026  
**Framework reference:** FEF-ERAS-001 — Experience Reference & Assembly Standard

## Purpose

This repository is the Klockit Experience Reference. It governs the intended human-facing assembly of Klockit but does not replace Klockit's Product Truth, programme authority, architecture, security, evidence semantics or implementation authority in the main `Fkenogo/klockit` repository.

## Authority Boundary

### Product Truth authority

The main Klockit repository remains authoritative for:

- attendance and work-presence semantics;
- Worker, Site, Work Session and Institution lifecycle;
- identity and role authority;
- evidence strength and review rules;
- correction/history preservation;
- privacy, non-surveillance and non-productivity boundaries;
- architecture and implementation decisions.

### Experience Reference authority

This repository is the primary reference for:

- Manager, Worker and Platform Operator experience architecture;
- product shell and navigation;
- Today, Planning, Workers, Sites, Needs Attention and History composition;
- cross-page relationships and contextual drill-down;
- language and interaction patterns;
- experience hierarchy and information density.

Production implementation should bind real Klockit state, permissions, evidence and commands into this experience rather than allowing legacy technical screens or package boundaries to determine the final product shell.

## Material Treatments

The existing `PROTOTYPE-REFINEMENT-BRIEF.md` already records material Product Truth corrections and prototype assumptions. Under FEF-ERAS-001 these should be understood as ADOPT / ADAPT / REJECT / UNRESOLVED treatments rather than as new backend authority.

Examples include:

- worker-directory fields must not turn Klockit into an HR system;
- manual Site-code review is not customer-configurable;
- Manager actions must not fabricate attendance evidence;
- shift swaps are not authorised merely because a prototype can represent them;
- prototype role switching is review-only and does not create production authority;
- export/print conveniences are not MVP requirements unless separately authorised.

## Implementation Expectation

When the production Klockit repository reaches interface assembly:

1. identify the relevant Experience Reference flow;
2. identify the governing Product Truth and real data/state/permission boundary;
3. classify material divergence as ADAPT, REJECT or UNRESOLVED rather than silently changing either side;
4. assemble coherent vertical flows rather than disconnected screens;
5. use Founder product preview during development to verify both correctness and experience fidelity.

## Non-Effects

This alignment does not authorise production implementation, backend changes, new product scope, or any Product Truth decision. It records how the existing Klockit Experience Reference should be used under FEF-ERAS-001.
