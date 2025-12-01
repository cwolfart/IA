# QA Master Plan & Test Scenarios

**Last Updated:** 2025-12-01
**Status:** Active
**Coverage:** Sprints 1-6 (Complete MVP)

## 🎯 Objective
Ensure the integrity of critical business flows in the OF3D Platform. This document serves as the source of truth for manual and automated testing.

## 🔄 Business Flows (Scenarios)

### Scenario 1: Client Project Creation (The "Concierge" Flow)
**Priority:** Critical
**Description:** A Client user logs in, creates a new project via the Concierge wizard, uploads assets, and verifies the project appears on their Dashboard.
**Steps:**
1.  **Login:** User accesses `/login` and authenticates.
2.  **Dashboard:** User clicks "New Project".
3.  **Concierge:** User completes the 4-step wizard (Type -> Details -> Assets -> Review).
4.  **Validation:** User is redirected to `/dashboard` and sees the new project card with status "DRAFT".

### Scenario 2: Stage Management & Notifications (Sprint 5)
**Priority:** High
**Description:** Verify that stage updates trigger notifications and email alerts.
**Steps:**
1.  **Designer Action:** Designer uploads a new image to the "Rendering" stage of a project.
2.  **System Action:** System updates `ProjectStage` with new image and sets status to `REVIEW`.
3.  **Notification:** Client receives a bell notification: "New Render Available".
4.  **Email:** Client receives an email (via Resend) with the subject "New Render Available".
5.  **Client Action:** Client clicks the notification and is taken to the Review Room.

### Scenario 3: Live Review & Version Comparison (Sprint 5)
**Priority:** High
**Description:** Client reviews a project, compares versions, and approves a stage.
**Steps:**
1.  **Access:** Client enters `/project/{id}/review`.
2.  **Comparison:** Client toggles "Compare Mode".
    *   *Validation:* Slider appears showing "Previous Stage" vs "Current Stage".
3.  **Gallery:** Client browses the image gallery to see alternative angles.
4.  **Feedback:** Client places a pin comment on the canvas.
5.  **Approval:** Client clicks "Approve Stage".
    *   *Validation:* Stage status changes to `APPROVED`.
    *   *Validation:* Next stage becomes `IN_PROGRESS`.
    *   *Validation:* Designer gets a notification "Stage Approved".

### Scenario 4: Financial Dashboard (Sprint 6)
**Priority:** Medium
**Description:** Client manages invoices and payments.
**Steps:**
1.  **Access:** Client navigates to `/finances`.
2.  **View:** Client sees list of invoices (Pending, Paid).
3.  **Action:** Client clicks "Pay Now" on a pending invoice.
4.  **Validation:** Invoice status updates to `PAID`.
5.  **Validation:** "Total Due" summary card decreases.

### Scenario 5: Admin Panel (Sprint 6)
**Priority:** Low (Internal)
**Description:** Admin manages platform resources.
**Steps:**
1.  **Access:** Admin user navigates to `/admin`.
2.  **View Users:** Admin sees table of all registered users.
3.  **View Projects:** Admin switches tab to see all projects and their status.
4.  **Security Check:** Non-admin user tries to access `/admin` and is denied/redirected.

## 🛠️ Technical Validation (Static Analysis)

### Flow 1: Project Creation
- **Source:** `app/concierge/page.tsx`
- **Sink:** `lib/db/projects.ts`
- **Verdict:** ✅ Logic is sound.

### Flow 2: Notifications
- **Trigger:** `app/project/[id]/review/page.tsx` (Upload)
- **Action:** `lib/db/notifications.ts` (Create) + `app/actions.ts` (Email)
- **Verdict:** ✅ Integrated correctly.

### Flow 3: Finances
- **Source:** `app/finances/page.tsx`
- **Data:** `lib/db/finances.ts`
- **Verdict:** ✅ Mock payment flow implemented safely.

## 🤖 Automation Plan

### Recommended Test Suite
Run the following Playwright specs to validate the UI:
1.  `tests/flow-01-creation.spec.ts`: Validates the wizard UI elements.
2.  `tests/flow-02-review.spec.ts`: Validates the review room components.
3.  `tests/flow-03-admin.spec.ts`: Validates admin route protection.
