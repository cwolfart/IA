# QA Master Plan & Test Scenarios

**Last Updated:** 2025-12-01
**Status:** Active

## 🎯 Objective
Ensure the integrity of critical business flows in the OF3D Platform. This document serves as the source of truth for manual and automated testing.

## 🔄 Business Flows (Scenarios)

### Scenario 1: Client Project Creation (The "Concierge" Flow)
**Priority:** Critical
**Description:** A Client user logs in, creates a new project via the Concierge wizard, uploads assets, and verifies the project appears on their Dashboard.

**Steps:**
1.  **Login:** User accesses `/login` and authenticates via Firebase.
2.  **Dashboard (Pre-state):** User lands on `/dashboard`. List may be empty.
3.  **Initiate:** User clicks "New Project".
4.  **Concierge Step 1 (Type):** User selects "Residential".
5.  **Concierge Step 2 (Details):** User enters Title "Casa de Praia" and Description "Vista para o mar".
6.  **Concierge Step 3 (Assets):** User uploads `planta_baixa.pdf`.
    *   *Validation:* File must be uploaded to Storage `projects/{id}/planta_baixa.pdf`.
7.  **Concierge Step 4 (Review):** User reviews data and clicks "Submit".
8.  **Dashboard (Post-state):** User is redirected to `/dashboard`.
    *   *Validation:* "Casa de Praia" card is visible.
    *   *Validation:* Status is "DRAFT".

### Scenario 2: Designer Project View (Future)
**Priority:** High
**Description:** A Designer views a project assigned to them.
*(Pending implementation of Designer Role assignment)*

### Scenario 3: Live Review (The "Review Room" Flow)
**Priority:** High
**Description:** Client enters a project review room to view renders.

**Steps:**
1.  **Access:** User clicks on "Casa de Praia" card in Dashboard.
2.  **Navigation:** Redirects to `/project/{id}/review`.
3.  **Interaction:** User can zoom/pan the canvas.
4.  **Feedback:** User places a Pin Comment on the image.

## 🛠️ Technical Validation (Static Analysis)

### Flow 1 Integrity Check
- **Source:** `app/concierge/page.tsx`
- **Sink:** `lib/db/projects.ts` -> Firestore `projects` collection.
- **Retrieval:** `app/dashboard/page.tsx` -> `getUserProjects(uid)`.
- **Linkage:** The `clientId` field is correctly passed from Auth Context to the Project Document.
- **Verdict:** ✅ Logic is sound.

## 🤖 Automation Plan
To strictly enforce these flows, we recommend installing **Playwright**.

```bash
npm init playwright@latest
```

### Proposed Test Spec (`tests/flow-01-creation.spec.ts`)
```typescript
test('should create a project successfully', async ({ page }) => {
  await page.goto('/login');
  // ... auth steps ...
  await page.click('text=New Project');
  await page.click('text=Residential');
  // ... fill form ...
  await page.click('text=Submit Project');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Casa de Praia')).toBeVisible();
});
```
