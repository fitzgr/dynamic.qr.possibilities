import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";
import {
  ACTIONS,
  PRESETS,
  buildActionUri,
  buildRunUrl,
  buildQrValue,
  buildStaticLandingUrl,
  resolveContextRoute,
  detectPlatform,
  distanceKm
} from "./qr-core.js";

const state = {
  action: "url",
  values: { ...ACTIONS.url.defaultValues },
  contextResolution: null
};

const refs = {
  appShell: document.getElementById("appShell"),
  builderView: document.getElementById("builderView"),
  runnerView: document.getElementById("runnerView"),
  configForm: document.getElementById("configForm"),
  encodeMode: document.getElementById("encodeMode"),
  autoplay: document.getElementById("autoplay"),
  qrCanvas: document.getElementById("qrCanvas"),
  actionUri: document.getElementById("actionUri"),
  qrValue: document.getElementById("qrValue"),
  staticQrValue: document.getElementById("staticQrValue"),
  copyValueBtn: document.getElementById("copyValueBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  openRunnerBtn: document.getElementById("openRunnerBtn"),
  labOutput: document.getElementById("labOutput"),
  runnerTitle: document.getElementById("runnerTitle"),
  runnerDescription: document.getElementById("runnerDescription"),
  runnerUri: document.getElementById("runnerUri"),
  runnerContext: document.getElementById("runnerContext"),
  runActionBtn: document.getElementById("runActionBtn"),
  rerouteBtn: document.getElementById("rerouteBtn"),
  backBuilderBtn: document.getElementById("backBuilderBtn"),
  runnerOutput: document.getElementById("runnerOutput")
};

refs.possibilitySearch = document.getElementById("possibilitySearch");
refs.possibilityGrid = document.getElementById("possibilityGrid");

init();

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("run") === "1") {
    showRunner(urlParams);
    return;
  }

  if (urlParams.get("entry") === "1") {
    showContextLanding();
    return;
  }

  buildForm();
  attachBuilderEvents();
  attachLabEvents();
  renderPossibilities();
  render();
}

function buildForm() {
  refs.configForm.innerHTML = "";

  const actionField = makeField("Action Type", "action", "select", {
    options: Object.entries(ACTIONS).map(([key, def]) => ({ label: def.title, value: key }))
  });

  refs.configForm.appendChild(actionField.wrap);
  actionField.input.value = state.action;

  actionField.input.addEventListener("change", (event) => {
    state.action = event.target.value;
    state.values = { ...ACTIONS[state.action].defaultValues };
    buildForm();
    render();
  });

  const fields = ACTIONS[state.action].fields;
  fields.forEach((field) => {
    const defaultValue = state.values[field.key] ?? "";
    const fieldDom = makeField(field.label, field.key, field.multiline ? "textarea" : "input", {
      placeholder: field.placeholder || ""
    });

    fieldDom.input.value = defaultValue;
    fieldDom.input.addEventListener("input", (event) => {
      state.values[field.key] = event.target.value;
      render();
    });

    refs.configForm.appendChild(fieldDom.wrap);
  });
}

function makeField(label, name, kind, options = {}) {
  const wrap = document.createElement("div");
  wrap.className = "field";

  const labelEl = document.createElement("label");
  labelEl.htmlFor = name;
  labelEl.textContent = label;

  let input;
  if (kind === "select") {
    input = document.createElement("select");
    options.options.forEach((opt) => {
      const option = document.createElement("option");
      option.textContent = opt.label;
      option.value = opt.value;
      input.appendChild(option);
    });
  } else if (kind === "textarea") {
    input = document.createElement("textarea");
  } else {
    input = document.createElement("input");
    input.type = "text";
  }

  input.id = name;
  input.name = name;
  input.placeholder = options.placeholder || "";

  wrap.appendChild(labelEl);
  wrap.appendChild(input);
  return { wrap, input };
}

function attachBuilderEvents() {
  refs.encodeMode.addEventListener("change", render);
  refs.autoplay.addEventListener("change", render);
  if (refs.possibilitySearch) {
    refs.possibilitySearch.addEventListener("input", renderPossibilities);
  }

  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = PRESETS[btn.dataset.preset];
      if (!preset) {
        return;
      }
      state.action = preset.action;
      state.values = { ...preset.values };
      buildForm();
      render();
    });
  });

  refs.copyValueBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(refs.qrValue.value);
      writeLab("Copied QR value to clipboard.");
    } catch (err) {
      writeLab(`Clipboard failed: ${err.message}`);
    }
  });

  refs.downloadBtn.addEventListener("click", () => {
    const mode = refs.encodeMode.value;
    const link = document.createElement("a");
    link.href = refs.qrCanvas.toDataURL("image/png");
    link.download = mode === "contextual" ? "qr-static-context.png" : `qr-${state.action}.png`;
    link.click();
  });

  refs.openRunnerBtn.addEventListener("click", () => {
    const { runUrl, staticUrl } = buildValues();
    const target = refs.encodeMode.value === "contextual" ? staticUrl : runUrl;
    window.open(target, "_blank", "noopener,noreferrer");
  });
}

function attachLabEvents() {
  const shareBtn = document.getElementById("btnShare");
  const vibrateBtn = document.getElementById("btnVibrate");
  const geoBtn = document.getElementById("btnGeo");
  const notifyBtn = document.getElementById("btnNotify");

  shareBtn.addEventListener("click", async () => {
    if (!navigator.share) {
      writeLab("Web Share API not supported on this device/browser.");
      return;
    }

    try {
      await navigator.share({
        title: "Dynamic QR Lab",
        text: "Testing phone-native share from a QR landing page.",
        url: window.location.href
      });
      writeLab("Share completed.");
    } catch (err) {
      writeLab(`Share canceled or failed: ${err.message}`);
    }
  });

  vibrateBtn.addEventListener("click", () => {
    if (!navigator.vibrate) {
      writeLab("Vibration API not supported.");
      return;
    }
    navigator.vibrate([120, 60, 120]);
    writeLab("Vibration requested.");
  });

  geoBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      writeLab("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        writeLab(`Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`);
      },
      (error) => {
        writeLab(`Geolocation failed: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  notifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      writeLab("Notifications not supported.");
      return;
    }

    const perm = await Notification.requestPermission();
    writeLab(`Notification permission: ${perm}`);
  });
}

function buildValues() {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const actionUri = buildActionUri(state.action, state.values);
  const runUrl = buildRunUrl(
    baseUrl,
    state.action,
    state.values,
    refs.autoplay.checked
  );
  const staticUrl = buildStaticLandingUrl(baseUrl);
  const qrValue = buildQrValue(refs.encodeMode.value, runUrl, actionUri, staticUrl);

  return { actionUri, runUrl, qrValue, staticUrl };
}

async function render() {
  const { actionUri, qrValue, staticUrl } = buildValues();
  refs.actionUri.value = refs.encodeMode.value === "contextual"
    ? "Context router decides final action at runtime using time/day/device/location signals."
    : actionUri;
  refs.qrValue.value = qrValue;
  refs.staticQrValue.value = staticUrl;

  try {
    await QRCode.toCanvas(refs.qrCanvas, qrValue, {
      width: 320,
      margin: 1,
      color: {
        dark: "#05241c",
        light: "#ffffff"
      }
    });
  } catch (err) {
    writeLab(`QR generation error: ${err.message}`);
  }
}

async function showContextLanding() {
  refs.builderView.classList.add("hidden");
  document.getElementById("phoneLab").classList.add("hidden");
  document.getElementById("possibilities").classList.add("hidden");
  refs.runnerView.classList.remove("hidden");
  refs.runnerContext.classList.remove("hidden");
  refs.rerouteBtn.classList.remove("hidden");

  await rerouteFromContext(false);

  refs.runActionBtn.onclick = () => {
    if (!state.contextResolution) {
      return;
    }
    launchAction(state.contextResolution.actionKey, state.contextResolution.uri);
  };

  refs.rerouteBtn.onclick = async () => {
    await rerouteFromContext(true);
  };

  refs.backBuilderBtn.onclick = () => {
    window.location.href = `${window.location.origin}${window.location.pathname}`;
  };
}

async function rerouteFromContext(includeLocation) {
  const context = await gatherVisitorContext(includeLocation);
  const resolved = resolveContextRoute(context);
  state.contextResolution = resolved;

  refs.runnerTitle.textContent = `Context Route: ${resolved.actionTitle}`;
  refs.runnerDescription.textContent = `${resolved.ruleTitle}. ${resolved.ruleDescription}`;
  refs.runnerUri.textContent = resolved.uri;
  refs.runnerOutput.textContent = `Resolved by rule '${resolved.ruleId}' with minute bucket ${resolved.context.minuteBucket}.`;

  const ctx = resolved.context;
  refs.runnerContext.textContent = [
    `time=${ctx.localTimeLabel}`,
    `weekday=${ctx.dayOfWeek} (weekend=${ctx.isWeekend})`,
    `platform=${ctx.platform} device=${ctx.deviceType}`,
    `timezone=${ctx.timezone}`,
    `language=${ctx.language}`,
    `returningVisitor=${ctx.hasVisitedBefore}`,
    `referrer=${ctx.referrer || "direct"}`,
    `locationGranted=${ctx.locationGranted}`,
    `distanceKm=${typeof ctx.distanceKm === "number" ? ctx.distanceKm.toFixed(2) : "n/a"}`
  ].join("\n");
}

async function gatherVisitorContext(includeLocation) {
  const now = new Date();
  const userAgent = navigator.userAgent || "";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const minute = now.getMinutes();
  const hour24 = now.getHours();
  const dayOfWeek = now.getDay();
  const hasVisitedBefore = localStorage.getItem("dqr_seen") === "1";
  localStorage.setItem("dqr_seen", "1");

  const context = {
    minute,
    hour24,
    dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    platform: detectPlatform(userAgent),
    deviceType: /mobile|iphone|android/i.test(userAgent) ? "mobile" : "desktop",
    language: navigator.language || "unknown",
    timezone,
    localTimeLabel: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    hasVisitedBefore,
    referrer: document.referrer || "direct",
    locationGranted: false,
    distanceKm: null
  };

  if (!includeLocation || !navigator.geolocation) {
    return context;
  }

  const position = await getPositionSafe();
  if (!position) {
    return context;
  }

  const storeLat = 43.7579;
  const storeLon = -79.2365;
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  context.locationGranted = true;
  context.distanceKm = distanceKm(lat, lon, storeLat, storeLon);
  return context;
}

function getPositionSafe() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 9000 }
    );
  });
}

function showRunner(params) {
  refs.builderView.classList.add("hidden");
  document.getElementById("phoneLab").classList.add("hidden");
  document.getElementById("possibilities").classList.add("hidden");
  refs.runnerView.classList.remove("hidden");
  refs.rerouteBtn.classList.add("hidden");
  refs.runnerContext.classList.add("hidden");

  const actionKey = params.get("action") || "url";
  const actionDef = ACTIONS[actionKey] || ACTIONS.url;
  const values = {};

  actionDef.fields.forEach((field) => {
    values[field.key] = params.get(`v_${field.key}`) || "";
  });

  const uri = buildActionUri(actionKey, values);
  refs.runnerTitle.textContent = actionDef.title;
  refs.runnerDescription.textContent = actionDef.description;
  refs.runnerUri.textContent = uri;

  refs.runActionBtn.onclick = () => {
    launchAction(actionKey, uri);
  };

  refs.backBuilderBtn.onclick = () => {
    window.location.href = `${window.location.origin}${window.location.pathname}`;
  };

  if (params.get("autoplay") === "1") {
    setTimeout(() => launchAction(actionKey, uri), 300);
  }
}

function launchAction(actionKey, uri) {
  try {
    if (ACTIONS[actionKey]?.launchMode === "copy") {
      navigator.clipboard
        .writeText(uri)
        .then(() => {
          refs.runnerOutput.textContent = "Payload copied to clipboard. Paste into your target app/device flow.";
        })
        .catch(() => {
          refs.runnerOutput.textContent = "Copy failed. Use the payload shown above manually.";
        });
      return;
    }

    window.location.href = uri;
    refs.runnerOutput.textContent = `Launched: ${uri}`;
  } catch (err) {
    refs.runnerOutput.textContent = `Action failed: ${err.message}`;
  }
}

function writeLab(text) {
  refs.labOutput.textContent = text;
}

function renderPossibilities() {
  if (!refs.possibilitySearch || !refs.possibilityGrid) {
    return;
  }

  const filter = (refs.possibilitySearch.value || "").trim().toLowerCase();
  refs.possibilityGrid.innerHTML = "";

  Object.values(ACTIONS)
    .filter((item) => {
      if (!filter) {
        return true;
      }
      const haystack = `${item.title} ${item.description} ${item.category} ${item.bestFor}`.toLowerCase();
      return haystack.includes(filter);
    })
    .forEach((item) => {
      const card = document.createElement("article");
      card.className = "possibility-card";

      const category = document.createElement("p");
      category.className = "possibility-meta";
      category.textContent = item.category;

      const title = document.createElement("h3");
      title.className = "possibility-title";
      title.textContent = item.title;

      const desc = document.createElement("p");
      desc.className = "possibility-desc";
      desc.textContent = item.description;

      const bestFor = document.createElement("p");
      bestFor.className = "possibility-for";
      bestFor.textContent = `Best for: ${item.bestFor}`;

      card.append(category, title, desc, bestFor);
      refs.possibilityGrid.appendChild(card);
    });

  if (!refs.possibilityGrid.childElementCount) {
    const empty = document.createElement("p");
    empty.className = "possibility-desc";
    empty.textContent = "No matches yet. Try another keyword.";
    refs.possibilityGrid.appendChild(empty);
  }
}
