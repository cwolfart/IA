# 🚀 Deployment Guide - OF3D Platform

This guide explains how to deploy the OF3D Platform to production using Vercel.

## 1. Prerequisites

*   A [Vercel](https://vercel.com) account.
*   A [Firebase](https://firebase.google.com) project (already configured).
*   A [Resend](https://resend.com) account (for emails).

## 2. Environment Variables

You must configure the following environment variables in your Vercel project settings:

### Firebase Configuration
Get these values from your Firebase Console -> Project Settings -> General -> Your Apps -> SDK Setup and Configuration.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Email Configuration (Resend)
Get this API key from your Resend Dashboard.

```env
RESEND_API_KEY=re_123456789
```

### Application URL
Used for generating links in emails.

```env
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

## 3. Deployment Steps

### Option A: Vercel CLI (Recommended)
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root.
3.  Follow the prompts to link the project.
4.  Run `vercel --prod` to deploy.

### Option B: Git Integration
1.  Push your code to a GitHub/GitLab/Bitbucket repository.
2.  Import the repository in Vercel.
3.  Add the environment variables in the Vercel dashboard.
4.  Vercel will automatically build and deploy every push to `main`.

## 4. Post-Deployment Checks

1.  **Auth:** Verify you can log in/sign up.
    *   *Note:* You must add your Vercel domain to the "Authorized Domains" list in Firebase Authentication settings.
2.  **Database:** Verify projects load on the dashboard.
3.  **Storage:** Try uploading a file in the Concierge or Review Room.
    *   *Note:* Ensure Firebase Storage Rules allow writes from authenticated users.
4.  **Emails:** Trigger a notification and check if the email arrives.

## 5. Security Rules (Firestore & Storage)

Ensure your Firebase Security Rules are deployed.

**Firestore:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
