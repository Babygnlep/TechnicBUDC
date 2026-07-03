# Reel Crew — Recruitment Website

A modern, cinematic recruitment site for a media production team. Built with
Next.js 15 (App Router), TypeScript, and Tailwind CSS. Submissions post to a
Google Sheet via a Google Apps Script Web App.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Folder structure

```
app/                  # App Router pages, layout, global styles
  layout.tsx
  page.tsx
  globals.css
components/           # Page sections
  Navbar.tsx
  Hero.tsx
  About.tsx
  ApplicationForm.tsx
  Footer.tsx
  ui/                 # Reusable primitives
    Button.tsx
    Input.tsx
    Modal.tsx
    Alert.tsx
    Spinner.tsx
lib/                  # Non-UI logic
  api.ts              # submitApplication() — the only place fetch() is called
  config.ts           # API_URL — the only place the backend URL is defined
  validation.ts       # Field + form validation
  types.ts            # Shared TypeScript interfaces
```

## Connect the Google Sheet backend

### 1. Create the Sheet

Create a Google Sheet with a tab (e.g. "Applications") and header row:

```
Timestamp | FirstName | LastName | StudentID | Gmail | Phone
```

### 2. Add the Apps Script

In the Sheet, go to **Extensions → Apps Script** and replace the contents of
`Code.gs` with:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Applications");
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),        // Timestamp, generated here
    data.firstName,
    data.lastName,
    data.studentId,
    data.email,
    data.phone
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Select type **Web app**.
3. Set **Execute as** to "Me" and **Who has access** to "Anyone".
4. Click **Deploy** and copy the generated Web App URL.

### 4. Set the URL in the app

Open `lib/config.ts` and paste the URL:

```ts
export const API_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
```

This is the **only** place the URL is defined — `lib/api.ts` imports it from
here for the POST request.

## Request shape

The client POSTs this JSON body to `API_URL`:

```json
{
  "firstName": "...",
  "lastName": "...",
  "studentId": "...",
  "email": "...",
  "phone": "..."
}
```

## Validation rules

- All fields are required.
- Email must be a valid `@gmail.com` address.
- Student ID must be numeric only.
- Phone must be 9–15 digits (spaces, dashes, parentheses, and a leading `+`
  are stripped before checking).

## Notes

- Colors, fonts, and animation timings are defined as design tokens in
  `tailwind.config.ts` — adjust there rather than in individual components.
- Reduced-motion preferences are respected globally (see `app/globals.css`).
