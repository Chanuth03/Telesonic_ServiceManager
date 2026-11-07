# Telesonic Lanka — Mobile Requirements (Option 01)

Source: `Telesonic_Lanka_Service_Management_Requirements_and_Solution_Scope 30092026 (1).docx`  
Scope: **Service Manager mobile application only** (Option 01 / O1). Option 02 mobile add-on is excluded.

---

## 1. Platform

| Item | Requirement |
|------|-------------|
| App | Service Manager mobile application |
| Platforms | Android / iOS |
| Offline | Offline-capable |
| Licensing | Field users (technicians, inspection engineers, workshop technicians, subcontractors) never require SAP B1 logins |
| Build package | **O1-WP-04** — Mobile execution, attachments, site inspection, post-service inspection (P1, Phase 1) |
| Screens | **MOB-01..14** |
| Development | **O1-DEV-12** — Service Manager mobile (all MOB screens), offline queue (High) |

**Capability summary (A9):** job list, check-in, checklists, parts, labour, photos, signatures, stock count scan, hold request.

---

## 2. Technician role (mobile access)

From A11 — Technician (in-house):

- View assigned jobs
- Check-in
- Record checklist / parts / labour / photos / signature
- Request hold

Subcontractor technician: mobile/portal assigned jobs only for own vendor; no cost view.

---

## 3. Mobile screens (O1-SCR-MOB)

| Screen ID | Purpose | Key data / rules |
|-----------|---------|------------------|
| **O1-SCR-MOB-01** | Login / start (in MOB-01..14 backlog; detailed screen text not fully specified in doc) | Internal SM auth; no SAP B1 login |
| **O1-SCR-MOB-02** | Job list / accept job | Accept/decline; not accepted by threshold → escalation |
| **O1-SCR-MOB-03** | Job detail (in MOB-01..14 backlog; detailed screen text not fully specified in doc) | Assigned job context |
| **O1-SCR-MOB-04** | Travel / check-in | Check-in time, location; GPS optional; customer notified; status → In Progress |
| **O1-SCR-MOB-05** | Diagnosis / checklist / work capture | Checklist, readings, parts, labour hours; mandatory checklist items; serial capture; also used for component pairing on installation |
| **O1-SCR-MOB-06** | Parts used & returned | Parts used, defective part returned; warranty part return mandatory where applicable; queues to SAP B1 Goods Issue/return |
| **O1-SCR-MOB-07** | Labour / time (in MOB-01..14 backlog; labour captured in PRC-14 with MOB-05) | Labour time / hours |
| **O1-SCR-MOB-08** | Photos & evidence | Unlimited photos with tags (before/after, fault, serial plate); camera + gallery; compression; thumbnails; captions; **offline queue** |
| **O1-SCR-MOB-09** | Completion & signature | Customer signature / confirmation; service report PDF; checklist/readings/images where required |
| **O1-SCR-MOB-10** | *(Unconfirmed)* | Doc notes: rule unconfirmed — resolve clarification before build |
| **O1-SCR-MOB-11** | Site inspection | Category checklist; measurements/proposals; unlimited images; inspector + customer signatures |
| **O1-SCR-MOB-12** | Stock count scan | Counted qty, serials/barcode scan; offline → queued |
| **O1-SCR-MOB-13** | Hold request | Request hold (e.g. parts awaited, access issue) for coordinator approval |
| **O1-SCR-MOB-14** | Notifications (in MOB-01..14 backlog; push/in-app covered under notification engine) | In-app / push alerts |

---

## 4. Core mobile process — O1-PRC-14 (Service Execution)

| Step | Screen | Action |
|------|--------|--------|
| O1-PRC-14.01 | MOB-04 | Travel and check-in; customer notified |
| O1-PRC-14.02 | MOB-05 | Diagnosis, checklist, meter reading, parts used/returned, labour time |
| O1-PRC-14.03 | MOB-08 | Unlimited photos with tags; offline queue |
| O1-PRC-14.04 | MOB-09 | Customer signature and confirmation; service report PDF |
| O1-PRC-14.05 | TRX-21 (browser) | Supervisor review and approval |

Exceptions called out: customer unavailable → reschedule/hold; offline → queued; conflict → **O1-BCR-10**; customer refuses to sign → reason + confirmation link.

---

## 5. Related mobile requirements (REQ IDs)

| Req ID | Area | Statement | Priority |
|--------|------|-----------|----------|
| **O1-REQ-133** | Attachments | Unlimited image/document attachments on visits and related transactions; no fixed maximum | P1 |
| **O1-REQ-134** | Attachments | Mobile camera + gallery; compression; thumbnails; captions/tags; offline queueing with sync | P1 |
| **O1-REQ-135** | Attachments | File-size, retention, access per type (BCR-54); never delete from completed transactions — supersede with audit | P1 |
| **O1-REQ-171** | Hold | Technician may request hold from mobile for coordinator approval | P2 |
| **O1-REQ-224** | Franchise stock | Physical count entry including mobile entry with serial/barcode scanning | P1 |
| **O1-REQ-255** | Non-functional | Mobile offline capture with sync status and conflict resolution policy | P2 |
| **O1-REQ-256** | Non-functional | Encryption in transit/at rest for PII, documents and images | P1 |

Site inspection / post-service inspection also map to mobile capture with image upload (see SP-06 / SP-07 and MOB-11 / MOB-05 / MOB-08).

---

## 6. Offline, sync and conflict

| Item | Requirement |
|------|-------------|
| Offline capture | Required for field evidence and job updates when connectivity is poor |
| Queue | Offline changes are queued and synced when online |
| Conflict policy | **O1-BCR-10** — Offline conflict policy for the mobile application |
| BCR-10 status | **Not specified** — options: (a) last write + conflict log; (b) server wins; (c) field-level merge. Owner: IT / Service |
| Testing | **O1-TST-14** — Capture offline, sync, conflict policy |
| Integration failure | Offline mobile conflict when server version is newer → BCR-10 + conflict log |

---

## 7. Notifications (mobile-relevant)

Notification channels include **mobile push** and **in-app**, plus SMS/email (WhatsApp excluded).  
Examples tied to mobile flow: check-in / travel notify customer; completion / signature; hold request to coordinator.

---

## 8. Gaps / clarifications still open

1. **O1-BCR-10** offline conflict policy must be decided before build finalisation.
2. **O1-SCR-MOB-10** marked unconfirmed in the requirement mapping.
3. Full field-level specs for **MOB-01, MOB-03, MOB-07, MOB-14** are thinner than MOB-02/04/05/06/08/09/11/12/13 in the document text.
4. Offline **email/password login against the server** is not specified; the document requires offline **capture and sync**, not first-time online authentication while offline.

---

## 9. Implementation backlog reference

**O1-WP-04** — Mobile execution, attachments, site inspection, post-service inspection  
- Priority: P1  
- Depends on: O1-WP-02  
- Screens: MOB-01..14  
- Complexity: High  
- Phase: 1  
- Testing: Functional, integration, UAT (+ **O1-TST-14** for offline)

---

## 10. Process flow (doc → app)

### Technician day flow

```
Download / open PWA
        │
        ▼
[MOB-01] /mobile/login
  online  → /api/auth/login
  offline → AppInitializer uses stored JWT + profile (if valid)
        │
        ▼
[Home] /mobile/
  tiles → Jobs | Stock Count | Notifications
        │
        ▼
[MOB-02] /mobile/jobs
  Accept / Decline assigned job
        │
        ▼
[MOB-03] /mobile/jobs/$jobId
  workflow hub for that job
        │
        ├─► [MOB-04] /travel          check-in (GPS optional)
        ├─► [MOB-05] diagnosis        EXCLUDED in current UI
        ├─► [MOB-06] /parts           parts used / returned
        ├─► [MOB-07] /labour          labour & time
        ├─► [MOB-08] /photos          evidence (offline queue)
        ├─► [MOB-11] /inspection      site inspection
        ├─► [MOB-13] /hold            hold request
        └─► [MOB-09] /completion      signature & close
                │
                ▼
        Supervisor review (browser TRX-21) — not on mobile
```

### Doc process O1-PRC-14 vs app

| Doc step | Doc screen | App route | Status |
|-----------|------------|-----------|--------|
| PRC-14.01 Travel & check-in | MOB-04 | `/mobile/jobs/$jobId/travel` | Built |
| PRC-14.02 Diagnosis / checklist / parts / labour | MOB-05 | *(split)* parts→MOB-06, labour→MOB-07; diagnosis screen excluded | Partial |
| PRC-14.03 Photos offline queue | MOB-08 | `/mobile/jobs/$jobId/photos` | Built |
| PRC-14.04 Signature & report | MOB-09 | `/mobile/jobs/$jobId/completion` | Built |
| PRC-14.05 Supervisor approve | TRX-21 | Browser only | Out of mobile scope |

Side flows (not inside PRC-14 linear path):

| Flow | Screen | App route | Status |
|------|--------|-----------|--------|
| Accept / decline | MOB-02 | `/mobile/jobs` | Built |
| Hold request | MOB-13 | `/mobile/jobs/$jobId/hold` | Built |
| Site inspection | MOB-11 | `/mobile/jobs/$jobId/inspection` | Built |
| Stock count | MOB-12 | `/mobile/stock-count` | Built |
| Notifications | MOB-14 | `/mobile/notifications` | Built |

---

## 11. Screen mapping (requirements ↔ code)

| Screen | Route / file | Mapped in app? | Notes |
|--------|--------------|----------------|-------|
| MOB-01 Login | `/mobile/login` → `mobile.login.tsx` | Yes | Email/password; offline bypass via stored JWT |
| MOB-02 Job list | `/mobile/jobs` → `mobile.jobs.tsx` | Yes | Accept / Decline present |
| MOB-03 Job detail | `/mobile/jobs/$jobId` → `mobile.jobs.$jobId.tsx` | Yes | Workflow hub |
| MOB-04 Travel / check-in | `.../travel` | Yes | GPS optional |
| MOB-05 Diagnosis & checklist | — | **Excluded** | Job detail marks `O1-SCR-MOB-05 (Excluded)` |
| MOB-06 Parts | `.../parts` | Yes | |
| MOB-07 Labour | `.../labour` | Yes | Separate screen (doc often folds labour into MOB-05) |
| MOB-08 Photos | `.../photos` | Yes | Offline queue path |
| MOB-09 Completion | `.../completion` | Yes | |
| MOB-10 | — | **Missing / unconfirmed** | Doc says resolve before build |
| MOB-11 Inspection | `.../inspection` | Yes | |
| MOB-12 Stock count | `/mobile/stock-count` | Yes | Home tile |
| MOB-13 Hold | `.../hold` | Yes | |
| MOB-14 Notifications | `/mobile/notifications` | Yes | Home tile |

### Gaps to watch when checking the flow

1. **MOB-05 excluded** — PRC-14.02 checklist/diagnosis is not a live screen; parts and labour are separate.
2. **MOB-10** — no route; clarification still open in the source doc.
3. **Offline** — capture/queue exists (Dexie + sync); **O1-BCR-10** conflict policy still undecided.
4. **Supervisor step** — after MOB-09, review stays on desktop (TRX-21), which matches the doc.
