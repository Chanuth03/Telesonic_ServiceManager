# Telesonic Lanka Incentive and Commission Module — Batch 1 (INC-SCR-01 to INC-SCR-05)

An enterprise-grade incentive configuration and operational suite embedded directly into the Servio ITSM application, providing full lifecycle management for sales schemes, commission rate matrices, target achievement slabs, monthly target allocations, and participant profiles.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Decisions & Open Context**:
>
> - **Navigation Strategy**: Confirmed as **Integrated tabs inside the existing Incentive page (`/incentive`)**, preserving the existing Add-on Dashboard while allowing seamless switching between the operational dashboard and the 5 configuration/master screens.
> - **Requirements Document**: You noted that you will paste the exact requirements text. The plan below outlines the complete architectural framework, data models, state management, and UI layout for all five screens ready to ingest your specific rules, field definitions, and approval flows.

---

### 1. Overview & Core Concept

**What It Does**:
Delivers **Batch 1 (INC-SCR-01 through INC-SCR-05)** of the Telesonic Lanka Incentive and Commission Module:

1. **INC-SCR-01 — Incentive Scheme Master**: Scheme header, mandatory fields, rules, slab links, exclusions, GL/posting setups, draft/activation lifecycle, version cloning, and change audit.
2. **INC-SCR-02 — Commission Rate Matrix**: Multi-dimensional matrix editor (e.g. Product Line × Achievement Tier), rate units (%, fixed currency), band validation (overlapping/missing combinations), and Excel import/export.
3. **INC-SCR-03 — Target Incentive Slab Table**: Stepped achievement thresholds, target categories (Volume, Turnover, Strategic Units), incentive reward values, and draft/approval status.
4. **INC-SCR-04 — Monthly Target Entry**: Period selection, division & employee quota entry, monthly target grids, Excel bulk upload/download, validation feedback, and period-locking security.
5. **INC-SCR-05 — Incentive Participant Profile**: Employee details, division/territory mapping, role, eligibility criteria, active scheme assignments, and historical payout overrides.

**Target Audience**:

- Service Managers, Sales Operations Directors, and Finance Officers managing tiered commission policies and sales force incentives in Sri Lanka.

**Key Value**:

- Replaces brittle spreadsheets with auditable, version-controlled SAP Business One add-on forms integrated seamlessly into the modern Servio ITSM interface.

---

### 2. User Experience & Visual Design

#### Navigation & Visual Layout

The `/incentive` page will feature a top-level **Module Sub-Navigation Bar** connecting all Batch 1 capabilities without cluttering the global app shell:

- `Overview & Add-on Form` (Existing Dashboard)
- `INC-SCR-01: Scheme Master`
- `INC-SCR-02: Rate Matrix`
- `INC-SCR-03: Incentive Slabs`
- `INC-SCR-04: Monthly Targets`
- `INC-SCR-05: Participant Profiles`

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Servio ITSM — Telesonic Lanka Incentive Suite                           [Theme: Amber] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Dashboard ] [ 01: Scheme Master ] [ 02: Rate Matrix ] [ 03: Slabs ] [ 04: Targets ] [ 05: Participants ]
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Active View Area (Form header, filters, data tables, detail panels, action buttons)    │
│                                                                                        │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Save] [Close] [Refresh] [Export Excel/PDF]               [ ] Standard  [ ] UDF  [ ] UDT
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Visual Identity & SAP Styling Conventions

- **Project Styling Consistency**: Strict adherence to Servio ITSM design tokens (OKLCH color palette, `--card`, `--primary`, `--border`, `font-mono tabular-nums` for currencies and percentages).
- **SAP Business One Field Legend**:
  - `Standard`: Clean neutral input borders.
  - `UDF (User Defined Field)`: Amber accent indicator (`border-amber-400 bg-amber-50/50`).
  - `UDT/UDO`: Sage/emerald accent indicator (`border-emerald-400 bg-emerald-50/50`).
  - `Add-on Elements`: Purple accent indicator (`border-purple-400 bg-purple-50/50`).
- **Interactive Feedback**:
  - Live overlapping band validation in the Rate Matrix.
  - Period lock visual padlock badge (`Period Locked — Read Only`) in Monthly Target Entry.
  - Sonner toast notifications for validations, status transitions, and Excel imports/exports.

---

### 3. Key Product Decisions & Architecture

#### Decision 1: Modular Sub-Component Architecture

- **Approach**: Separate distinct screen modules into dedicated subcomponents under `src/components/incentive/`:
  - `SchemeMasterView.tsx` (INC-SCR-01)
  - `RateMatrixView.tsx` (INC-SCR-02)
  - `IncentiveSlabView.tsx` (INC-SCR-03)
  - `MonthlyTargetEntryView.tsx` (INC-SCR-04)
  - `ParticipantProfileView.tsx` (INC-SCR-05)
- **Why**: Keeps code modular, highly maintainable, and isolated for future batches (INC-SCR-06+) without creating an unmanageable monolithic file.

#### Decision 2: Unified In-Memory & LocalStorage State Store

- **Approach**: Extend `src/lib/incentive-data.ts` to manage all entities (Schemes, Matrices, Slabs, Targets, and Participants) with optimistic reactive updates and localStorage persistence.
- **Why**: Allows instant testing of draft/approval workflows, version copying, and validation without needing an external database.

---

### 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             src/routes/incentive.tsx                     │
│               (Master Route Controller & Tab Sub-Navigation)             │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
┌────────▼─────────┐       ┌─────────▼─────────┐       ┌─────────▼─────────┐
│  INC-SCR-01      │       │  INC-SCR-02       │       │  INC-SCR-03       │
│  Scheme Master   │       │  Rate Matrix      │       │  Incentive Slabs  │
└────────┬─────────┘       └─────────┬─────────┘       └─────────┬─────────┘
         │                           │                           │
         │                 ┌─────────▼─────────┐       ┌─────────▼─────────┐
         │                 │  INC-SCR-04       │       │  INC-SCR-05       │
         │                 │  Monthly Targets  │       │  Participants     │
         │                 └─────────┬─────────┘       └─────────┬─────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                   ┌─────────────────▼─────────────────┐
                   │    src/lib/incentive-data.ts      │
                   │ (Data Models, Validation, Export) │
                   └───────────────────────────────────┘
```

#### Core Data Entities & Validations

1. **Scheme Master (INC-SCR-01)**:
   - Fields: Scheme Code, Name, Effective From/To, Currency (`LKR`), Status (`Draft`, `Active`, `Inactive`), Version Number (`v1.0`, `v1.1`), Calculation Base (`Turnover`, `Gross Margin`, `Collection`), Exclusions list.
   - Lifecycle: Active schemes cannot be edited in-place; triggers "Create New Version" workflow.
2. **Commission Rate Matrix (INC-SCR-02)**:
   - Dimension A (Rows): Product Line / Division (`RLC`, `RLD`, `Enterprise`).
   - Dimension B (Columns): Achievement Band ($0-70\%$, $71-90\%$, $91-100\%$, $>100\%$).
   - Rate Unit: Percentage or Fixed LKR per unit. Overlap detection engine.
3. **Target Incentive Slab Table (INC-SCR-03)**:
   - Slabs: Min Target %, Max Target %, Incentive Payout (LKR), Accelerator %, Status (`Draft`, `Approved`).
4. **Monthly Target Entry (INC-SCR-04)**:
   - Period selector, Division filter, Target table with individual agent quotas, Lock Period toggle, Excel template import/export.
5. **Incentive Participant Profile (INC-SCR-05)**:
   - Employee ID, Name, Division, Role, Hire Date, Assigned Scheme, Commission Split %, Payment Bank Account info.
