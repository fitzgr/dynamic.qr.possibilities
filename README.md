# Dynamic QR Possibilities Lab

An interactive web app for demonstrating how one QR code can trigger many possible phone experiences.

## Demo goals

- Show dynamic QR strategy: encode a landing URL and change behavior without reprinting physical materials.
- Show direct QR payload strategy: encode final action payload directly for immediate launch.
- Provide an on-page readme-like playbook for stakeholders during live demos.

## Possibilities included

1. Open URL
2. Phone call
3. SMS message
4. Email compose
5. Maps / directions
6. WhatsApp chat
7. Telegram link
8. FaceTime link
9. App deep link (custom scheme)
10. Android intent URL
11. Wi-Fi payload
12. Contact card (vCard)
13. Calendar event payload (.ics format)
14. Payment link
15. Review request link
16. Coupon payload

Phone web capabilities after landing:

1. Native share sheet (Web Share API)
2. Vibration API
3. Geolocation API
4. Notification permission prompt

## Project structure

- `index.html`: App shell, builder, runner view, and on-page possibilities playbook.
- `styles.css`: Visual design and responsive layout.
- `app.js`: UI logic, event wiring, runner behavior, and playbook rendering.
- `qr-core.js`: Central action catalog and payload generation utilities.
- `tests/qr-core.test.js`: Automated tests for payload helpers and URI generation.

## Run locally

Option A: VS Code Live Server

1. Install Live Server.
2. Open `index.html` with Live Server.

Option B: Python static server

```bash
python -m http.server 5500
```

Then browse to http://localhost:5500.

## Testing

Install dependencies:

```bash
npm install
```

Run tests once:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Demo flow for stakeholders

1. Choose an action in the builder.
2. Toggle QR mode between dynamic and direct.
3. Scan on phone and show runner behavior.
4. Use presets to quickly pivot between use cases.
5. Open the built-in possibilities playbook section and filter by category.
6. Show device APIs from the Phone Capabilities Lab.

## Important behavior notes

- Some actions require user gestures and may not auto-launch on all browsers.
- Deep links and intent URLs vary across iOS and Android.
- Clipboard and notifications often require HTTPS in production.
- Wi-Fi, vCard, calendar, and coupon payloads are generated and copied where direct navigation is not practical.

## Production extension ideas

1. Add backend-managed short links with mutable destination records.
2. Add scan analytics by QR, location, campaign, and timestamp.
3. Add A/B routing and time-window routing.
4. Add device-aware fallback logic for each deep link.
5. Add auth-protected admin UI for campaign operators.
