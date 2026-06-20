export const ACTIONS = {
  url: {
    title: "Open URL",
    description: "Launch a website, menu, campaign, or any web destination.",
    category: "Navigation",
    bestFor: "Landing pages, product pages, files, and forms.",
    fields: [
      { key: "target", label: "URL", placeholder: "https://example.com" }
    ],
    toUri: (v) => v.target || "",
    defaultValues: { target: "https://example.com" },
    launchMode: "navigate"
  },
  phone: {
    title: "Phone Call",
    description: "Open the dialer with a prefilled phone number.",
    category: "Communication",
    bestFor: "Sales, support, reservations, concierge.",
    fields: [
      { key: "number", label: "Phone Number", placeholder: "+15551234567" }
    ],
    toUri: (v) => `tel:${cleanPhone(v.number)}`,
    defaultValues: { number: "+15551234567" },
    launchMode: "navigate"
  },
  sms: {
    title: "SMS Message",
    description: "Open SMS app with number and draft message.",
    category: "Communication",
    bestFor: "Quick inquiries, lead capture, check-ins.",
    fields: [
      { key: "number", label: "Phone Number", placeholder: "+15551234567" },
      { key: "body", label: "Message Body", placeholder: "Hi, I would like to book." }
    ],
    toUri: (v) => `sms:${cleanPhone(v.number)}?body=${encodeURIComponent(v.body || "")}`,
    defaultValues: { number: "+15551234567", body: "Hi! I scanned your QR." },
    launchMode: "navigate"
  },
  email: {
    title: "Email",
    description: "Open email app with prefilled recipient and content.",
    category: "Communication",
    bestFor: "Quote requests, support tickets, contact forms.",
    fields: [
      { key: "to", label: "Recipient", placeholder: "hello@brand.com" },
      { key: "subject", label: "Subject", placeholder: "Question from QR" },
      { key: "body", label: "Body", placeholder: "Hi there...", multiline: true }
    ],
    toUri: (v) => {
      const to = encodeURIComponent(v.to || "");
      const subject = encodeURIComponent(v.subject || "");
      const body = encodeURIComponent(v.body || "");
      return `mailto:${to}?subject=${subject}&body=${body}`;
    },
    defaultValues: {
      to: "hello@brand.com",
      subject: "Question from QR",
      body: "Hey team,"
    },
    launchMode: "navigate"
  },
  maps: {
    title: "Maps / Directions",
    description: "Open maps search or location pin.",
    category: "Navigation",
    bestFor: "Storefronts, events, parking, pickup zones.",
    fields: [
      { key: "query", label: "Search Query", placeholder: "Central Park, New York" }
    ],
    toUri: (v) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.query || "")}`,
    defaultValues: { query: "Central Park, New York" },
    launchMode: "navigate"
  },
  whatsapp: {
    title: "WhatsApp Message",
    description: "Open WhatsApp chat with a prefilled message.",
    category: "Communication",
    bestFor: "Global support, order updates, lead chats.",
    fields: [
      { key: "number", label: "WhatsApp Number", placeholder: "15551234567" },
      { key: "text", label: "Message", placeholder: "Hello!", multiline: true }
    ],
    toUri: (v) => `https://wa.me/${cleanPhone(v.number)}?text=${encodeURIComponent(v.text || "")}`,
    defaultValues: { number: "15551234567", text: "Hi, I found your QR." },
    launchMode: "navigate"
  },
  telegram: {
    title: "Telegram Link",
    description: "Open Telegram profile or channel.",
    category: "Communication",
    bestFor: "Communities, announcements, support channels.",
    fields: [
      { key: "username", label: "Telegram Username", placeholder: "your_channel" }
    ],
    toUri: (v) => `https://t.me/${String(v.username || "").replace(/^@/, "")}`,
    defaultValues: { username: "your_channel" },
    launchMode: "navigate"
  },
  facetime: {
    title: "FaceTime",
    description: "Open FaceTime call URI on compatible devices.",
    category: "Communication",
    bestFor: "Concierge, premium support, virtual tours.",
    fields: [
      { key: "target", label: "Phone or Email", placeholder: "+15551234567 or hello@example.com" }
    ],
    toUri: (v) => `facetime:${String(v.target || "").trim()}`,
    defaultValues: { target: "+15551234567" },
    launchMode: "navigate"
  },
  app: {
    title: "App Deep Link",
    description: "Launch a native app through a custom URI scheme.",
    category: "App",
    bestFor: "Loyalty apps, wallets, account pages, offer screens.",
    fields: [
      { key: "scheme", label: "Deep Link URI", placeholder: "myapp://open/offers" }
    ],
    toUri: (v) => v.scheme || "",
    defaultValues: { scheme: "myapp://open/offers" },
    launchMode: "navigate"
  },
  intent: {
    title: "Android Intent",
    description: "Launch Android app route with fallback URL.",
    category: "App",
    bestFor: "Android-specific deep-link routing.",
    fields: [
      { key: "hostPath", label: "Host + Path", placeholder: "scan/#Intent;scheme=zxing;package=com.example.app;S.browser_fallback_url=https://example.com;end" }
    ],
    toUri: (v) => `intent://${String(v.hostPath || "")}`,
    defaultValues: {
      hostPath: "scan/#Intent;scheme=zxing;package=com.example.app;S.browser_fallback_url=https://example.com;end"
    },
    launchMode: "navigate"
  },
  wifi: {
    title: "Wi-Fi Payload",
    description: "Build a Wi-Fi payload string for scanners that support it.",
    category: "Utility",
    bestFor: "Guest Wi-Fi in venues, hospitality, events.",
    fields: [
      { key: "ssid", label: "SSID", placeholder: "CafeGuest" },
      { key: "password", label: "Password", placeholder: "StrongPass123" },
      { key: "security", label: "Security", placeholder: "WPA" },
      { key: "hidden", label: "Hidden Network (true/false)", placeholder: "false" }
    ],
    toUri: (v) => `WIFI:T:${(v.security || "WPA").toUpperCase()};S:${escapeWifi(v.ssid || "")};P:${escapeWifi(v.password || "")};H:${String(v.hidden || "false").toLowerCase()};;`,
    defaultValues: { ssid: "CafeGuest", password: "StrongPass123", security: "WPA", hidden: "false" },
    launchMode: "copy"
  },
  vcard: {
    title: "Contact Card (vCard)",
    description: "Generate a vCard payload to save contact details.",
    category: "Utility",
    bestFor: "Business cards, speaker bios, reps, agents.",
    fields: [
      { key: "first", label: "First Name", placeholder: "Ava" },
      { key: "last", label: "Last Name", placeholder: "Mason" },
      { key: "org", label: "Company", placeholder: "Dynamic QR Co" },
      { key: "phone", label: "Phone", placeholder: "+15551234567" },
      { key: "email", label: "Email", placeholder: "ava@example.com" }
    ],
    toUri: (v) => [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeText(v.last || "")};${escapeText(v.first || "")};;;`,
      `FN:${escapeText(`${v.first || ""} ${v.last || ""}`.trim())}`,
      `ORG:${escapeText(v.org || "")}`,
      `TEL:${cleanPhone(v.phone || "")}`,
      `EMAIL:${escapeText(v.email || "")}`,
      "END:VCARD"
    ].join("\\n"),
    defaultValues: {
      first: "Ava",
      last: "Mason",
      org: "Dynamic QR Co",
      phone: "+15551234567",
      email: "ava@example.com"
    },
    launchMode: "copy"
  },
  calendar: {
    title: "Calendar Event",
    description: "Create an .ics payload for adding an event.",
    category: "Productivity",
    bestFor: "Webinars, appointments, showtimes, launches.",
    fields: [
      { key: "title", label: "Event Title", placeholder: "Launch Demo" },
      { key: "start", label: "Start (UTC: YYYYMMDDTHHmmssZ)", placeholder: "20260720T170000Z" },
      { key: "end", label: "End (UTC: YYYYMMDDTHHmmssZ)", placeholder: "20260720T180000Z" },
      { key: "location", label: "Location", placeholder: "Online" }
    ],
    toUri: (v) => [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${escapeText(v.title || "Event")}`,
      `DTSTART:${escapeText(v.start || "")}`,
      `DTEND:${escapeText(v.end || "")}`,
      `LOCATION:${escapeText(v.location || "")}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\\n"),
    defaultValues: {
      title: "Launch Demo",
      start: "20260720T170000Z",
      end: "20260720T180000Z",
      location: "Online"
    },
    launchMode: "copy"
  },
  payment: {
    title: "Payment Link",
    description: "Route users to checkout, donation, tip, or invoice.",
    category: "Commerce",
    bestFor: "POS, subscriptions, donations, one-click pay.",
    fields: [
      { key: "url", label: "Payment URL", placeholder: "https://buy.stripe.com/..." }
    ],
    toUri: (v) => v.url || "",
    defaultValues: { url: "https://example.com/pay?order=123" },
    launchMode: "navigate"
  },
  review: {
    title: "Review Request",
    description: "Open review destination to increase ratings.",
    category: "Growth",
    bestFor: "Post-purchase review funnel and social proof.",
    fields: [
      { key: "url", label: "Review URL", placeholder: "https://g.page/r/.../review" }
    ],
    toUri: (v) => v.url || "",
    defaultValues: { url: "https://example.com/reviews" },
    launchMode: "navigate"
  },
  coupon: {
    title: "Coupon Code",
    description: "Copy a promo code payload for checkout flows.",
    category: "Commerce",
    bestFor: "In-store promos, campaigns, activations.",
    fields: [
      { key: "code", label: "Promo Code", placeholder: "SUMMER25" },
      { key: "desc", label: "Description", placeholder: "25% off until Sunday" }
    ],
    toUri: (v) => `COUPON:${escapeText(v.code || "")};DESC:${escapeText(v.desc || "")}`,
    defaultValues: { code: "SUMMER25", desc: "25% off until Sunday" },
    launchMode: "copy"
  }
};

export const PRESETS = {
  restaurant: {
    action: "url",
    values: { target: "https://example.com/menu?table=12&utm_source=qr" }
  },
  event: {
    action: "calendar",
    values: {
      title: "Founder Meetup",
      start: "20260720T170000Z",
      end: "20260720T180000Z",
      location: "Hall A"
    }
  },
  support: {
    action: "whatsapp",
    values: { number: "15551234567", text: "Hi support team, I need help." }
  },
  retail: {
    action: "coupon",
    values: { code: "SAVE20", desc: "20% off in-store today only" }
  }
};

export function buildActionUri(actionKey, values) {
  const actionDef = ACTIONS[actionKey] || ACTIONS.url;
  return actionDef.toUri(values || {});
}

export function buildRunUrl(baseUrl, actionKey, values, autoplay) {
  const runParams = new URLSearchParams();
  runParams.set("run", "1");
  runParams.set("action", actionKey);
  runParams.set("autoplay", autoplay ? "1" : "0");

  Object.entries(values || {}).forEach(([key, value]) => {
    runParams.set(`v_${key}`, value || "");
  });

  return `${baseUrl}?${runParams.toString()}`;
}

export function buildQrValue(mode, runUrl, actionUri) {
  return mode === "dynamic" ? runUrl : actionUri;
}

export function cleanPhone(value) {
  return String(value || "").replace(/[^0-9+]/g, "");
}

export function escapeWifi(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:");
}

export function escapeText(value) {
  return String(value || "").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}
