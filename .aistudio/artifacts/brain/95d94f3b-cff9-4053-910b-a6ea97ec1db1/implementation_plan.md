# Telesonic Lanka Service Management — Masters Hub & Master Screens Suite

Implementation plan for introducing the **Masters Hub** on the main Workspace and building the complete collection of Master Data and Configuration screens (**O1-SCR-MST-01** through **O1-SCR-MST-31**) strictly adhering to Section A3 of the specification.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The PDF specification defines 30 Master Screens (including Customer BP, Equipment, Technicians, Contracts, SLA Rules, Checklist Templates, Budgets, and Tools). All screens share consistent SAP B1 integration badges (`⇄B1`), status pills, action tables (Add, Update, Deactivate, Export, History), tabs with sub-grids, and field-level metadata.

- **Confirmed Decision 1 (Scope Focus)**: Implement the **Masters** module as a dedicated tile on the workspace (`/`). Clicking it opens the **Masters Registry Hub** (`/masters`), displaying organized categories of all 30 Master screens.
- **Confirmed Decision 2 (Interactive Screen Implementation)**: Each master screen will be accessible via dedicated routes or selection drawers (e.g. `/masters/customers`, `/masters/equipment`, `/masters/sla-rules`, etc.) with authentic Sri Lankan test data (e.g. Ceylon Agro Machinery, Jayasuriya Textiles, Lanka Cool Services, LKR currency), live tabs, status badges, working action buttons, and Excel/PDF export simulations.
- **Confirmed Decision 3 (Seamless Navigation & Breadcrumbs)**: Each screen provides linked navigation back to the Masters Hub or related master entities (e.g., Customer → Site → Equipment → Component System).

---

## 1. Overview & Core Concept

- **What It Does**: Provides an enterprise-grade Master Data and Configuration subsystem for Telesonic Lanka Service Management (Option 01). Administrators, service coordinators, and engineering supervisors can view, edit, configure, and audit master records synchronized with SAP Business One.
- **Target Audience / Personas**:
  - _Service Coordinator / Manager_: Reviews Customer Business Partners, Sites/Locations, Installed Base Equipment, Multi-component systems, and Warranties.
  - _Service Administrator_: Manages Checklist Templates, SLA rules, Hold Reasons, Repeat Reasons, and Notification Templates.
  - _Finance & Operations_: Configures Project G/L Budgets, Labour Rates, Franchise Warehouses, and Deviation Thresholds.
- **Key Value**: Replaces disconnected spreadsheet trackers with a unified, audit-logged master repository featuring transparent SAP B1 integration indicators (`⇄B1`), preventing data duplication and enforcing strict business validation rules (e.g., O1-BCR rules).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Workspace Entry (`/`)**:
   - The user sees a new primary module tile: **Masters** (with icon, badge count, and direct link).
2. **Masters Registry Hub (`/masters`)**:
   - Organized into logical business categories:
     - **Core Business Partners & People**: Customer / BP View, Contact Person, Employee / Technician (SAP B1), Subcontractor Technicians.
     - **Sites & Installed Base**: Site & Location, Item / Brand / Model, Serial Number Register & Lifecycle, Equipment / Installed Base, Other-Brand Equipment, Multi-Component Equipment Systems, Tools & Vehicles.
     - **Service Governance & SLAs**: Service Roles, Service Type / Reason / Priority, Hold Reasons, Repeat Detection Periods, SLA Rules & Working Calendars, Checklist Templates.
     - **Commercial & Warranties**: Warranty Rules, Free Service Plans, Contract Templates, Project & G/L Budgets, Cost Element Mappings, Labour Rates, Franchise Warehouses, Deviation Thresholds, Export Permissions, Equipment Category Attributes.
   - Includes real-time search and filter to jump straight to any screen ID (e.g. `MST-06`, `Customer`, `SLA`).
3. **Master Screen Detailed View (e.g. `O1-SCR-MST-01`, `O1-SCR-MST-06`)**:
   - **Header Card**:
     - Screen Title & Screen ID (e.g., `O1-SCR-MST-01 Customer / Business Partner – Service View`)
     - Status Badge (`Active`, `Inactive`, `Pending Installation`, etc.)
     - Action Bar: Status-governed action buttons (`Save`, `Request B1 Change`, `Add`, `Deactivate`, `Export Excel / PDF`, `History / Audit`)
   - **Form Fields Grid**:
     - Visual distinction between SAP B1 Synchronized fields (marked with `⇄B1` badge), calculated read-only fields (subtle neutral background), and editable service attribute fields.
     - Mandatory fields marked with red asterisk `*`.
   - **Tabbed Sub-Grids**:
     - Contextual tabs (e.g. _Addresses / Sites_, _Contacts_, _Equipment_, _Service Calls_, _Contracts_, _Commercial_, _Attachments_, _History_).
     - High-density data tables with tabular figures, sorting, search, and export actions.
   - **History / Audit Drawer**:
     - Quick modal showing change timestamp, user, action, field, before/after values, and reasons.

### Visual Identity & Theme

- **Theme**: Seamless integration with the existing Service Manager design system (neutral palette, clean borders, custom themes: Indigo, Emerald, Ocean, Sunset, Plum).
- **Typography**: `Plus Jakarta Sans` for clean UI labels and typography hierarchy; `JetBrains Mono` for Code IDs, Serial numbers, and currency values (`tabular-nums`).
- **Indicators**:
  - `⇄B1` badge: Slate/blue pill tag indicating two-way or incoming synchronization with SAP Business One.
  - Red indicator `*`: Mandatory fields.
  - Status indicators: Active (`emerald`), Inactive (`neutral`), On Hold (`amber`), Blocked (`rose`).

---

## 3. Key Product Decisions & Trade-Offs

- **Hierarchical Layout vs Flattened View**:
  - _Chosen_: A centralized **Masters Hub** with search, categorization, and quick-jump breadcrumbs, combined with modular full-screen forms for each master screen.
  - _Why_: With 30 master screens, users need quick category scanning and direct search without cluttering the global top navigation.
- **Client-Side State with Sample Data Preloading**:
  - _Chosen_: Rich client-side reactive store preloaded with authentic Sri Lankan test cases (Air conditioning, industrial machines, refrigeration, commercial vehicles), storing local additions/updates in localStorage.
  - _Why_: Allows immediate, zero-latency interactive testing, validation triggering, record editing, and export simulation without requiring an active backend or SAP server.
- **PDF / Excel Export Simulation**:
  - _Chosen_: Generate actual formatted CSV/Excel downloads and browser print/PDF views matching the layout requirements from Section A1 and A9.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Workspace Layout (/)                          │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────┐  ┌───────────────┐ │
│  │ Incidents / Jobs      │  │ Service Catalog    │  │ Masters Tile  │ │
│  │ (Existing Modules)    │  │ Changes / Assets   │  │ (NEW)         │ │
│  └───────────────────────┘  └────────────────────┘  └───────┬───────┘ │
└─────────────────────────────────────────────────────────────┼──────────┘
                                                              │ Click
                                                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Masters Registry Hub                            │
│  (/masters) - Search bar, category filter, Screen ID quick jump        │
│                                                                        │
│   ├── Business Partners & People (MST-01, 02, 09, 10)                 │
│   ├── Installed Base & Assets (MST-03, 04, 05, 06, 07, 08, 31)        │
│   ├── Service Governance & SLAs (MST-11, 12, 13, 14, 15, 16)          │
│   └── Commercial, Plans & Franchise (MST-17 to 28, 30)                 │
└─────────────────────────────────────────────┬──────────────────────────┘
                                              │ Select Screen
                                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Dynamic Master Screen View                         │
│  (/masters/:screenId or in-place interactive controller)               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Header: Screen ID · Status · Action Buttons (Add, Update, Export)│  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Fields Grid: ⇄B1 Badges · Mandatory * · Calculated Read-only     │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Context Tabs: Linked Grids (Equipment, Sites, Items, History)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                      │                                 │
│         ┌────────────────────────────┴───────────────────────────┐     │
│         ▼                                                        ▼     │
│  ┌───────────────┐                                      ┌────────────┐ │
│  │ Audit History │                                      │ CSV / PDF  │ │
│  │ Drawer Modal  │                                      │ Exporter   │ │
│  └───────────────┘                                      └────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy & Module Breakdown

1. `src/routes/index.tsx`:
   - Add `{ to: "/masters", label: "Masters", icon: Database, tone: "bg-primary-soft text-primary" }` to `modules` array.
2. `src/routes/masters.tsx` (or `/masters/index.tsx`):
   - Masters Hub page listing all 30 screens categorized with search, quick filter, and description.
3. `src/components/masters/`:
   - `MasterScreenRenderer.tsx`: Core engine rendering screen headers, actions, form controls, `⇄B1` badges, and tabs.
   - `MasterScreenHeader.tsx`: Title, status, actions table with enabled rules.
   - `MasterField.tsx`: Reusable input/select/date/link component with `⇄B1` sync indicator and validation states.
   - `MasterSubGrid.tsx`: High-density tabular sub-grid with Excel/PDF export buttons.
   - `MasterAuditModal.tsx`: History and audit trail viewer.
4. `src/data/mastersData.ts`:
   - Comprehensive datasets for each of the 30 master screens adhering to the field tables and validation constraints in the PDF.

---

## Phased Implementation Sequence

- **Step 1**: Register the **Masters** tile in `src/routes/index.tsx` and configure route tree.
- **Step 2**: Create master data models, initial mock data, and metadata definitions in `src/data/mastersData.ts`.
- **Step 3**: Build reusable master layout components (`MasterField`, `MasterSubGrid`, `AuditModal`, `B1Badge`).
- **Step 4**: Implement the **Masters Hub** directory and the interactive master screen renderer supporting all screens (**O1-SCR-MST-01** to **O1-SCR-MST-31**).
- **Step 5**: Verify interactive functionality: field editing, status changes, tab switching, and CSV/PDF export.
- **Step 6**: Run `compile_applet` and verify dev server build.
