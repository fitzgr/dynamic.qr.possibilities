import { describe, expect, it } from "vitest";
import {
  buildActionUri,
  buildRunUrl,
  buildQrValue,
  cleanPhone,
  escapeWifi,
  escapeText,
  ACTIONS
} from "../qr-core.js";

describe("qr-core helpers", () => {
  it("sanitizes phone values", () => {
    expect(cleanPhone("+1 (555) 123-4567")).toBe("+15551234567");
  });

  it("escapes wifi payload characters", () => {
    expect(escapeWifi("Cafe:Guest;A,B")).toBe("Cafe\\:Guest\\;A\\,B");
  });

  it("escapes text newlines and separators", () => {
    expect(escapeText("one,two;\nthree")).toBe("one\\,two\\;\\nthree");
  });
});

describe("uri builders", () => {
  it("builds sms uri", () => {
    const uri = buildActionUri("sms", { number: "+15550001111", body: "hello world" });
    expect(uri).toBe("sms:+15550001111?body=hello%20world");
  });

  it("builds wifi payload", () => {
    const uri = buildActionUri("wifi", {
      ssid: "Cafe",
      password: "pw",
      security: "wpa",
      hidden: "false"
    });
    expect(uri).toBe("WIFI:T:WPA;S:Cafe;P:pw;H:false;;");
  });

  it("builds vcard payload", () => {
    const uri = buildActionUri("vcard", {
      first: "Ava",
      last: "Mason",
      org: "Co",
      phone: "+1 555-123-4567",
      email: "a@example.com"
    });
    expect(uri).toContain("BEGIN:VCARD");
    expect(uri).toContain("FN:Ava Mason");
    expect(uri).toContain("TEL:+15551234567");
  });
});

describe("qr value strategy", () => {
  it("builds run url with params", () => {
    const runUrl = buildRunUrl(
      "https://demo.example/",
      "url",
      { target: "https://target.example/a?x=1" },
      true
    );

    expect(runUrl).toContain("run=1");
    expect(runUrl).toContain("action=url");
    expect(runUrl).toContain("autoplay=1");
    expect(runUrl).toContain("v_target=https%3A%2F%2Ftarget.example%2Fa%3Fx%3D1");
  });

  it("returns dynamic value when mode is dynamic", () => {
    expect(buildQrValue("dynamic", "run-url", "action-uri")).toBe("run-url");
  });

  it("returns action uri when mode is direct", () => {
    expect(buildQrValue("direct", "run-url", "action-uri")).toBe("action-uri");
  });

  it("has many action possibilities for demos", () => {
    expect(Object.keys(ACTIONS).length).toBeGreaterThanOrEqual(15);
  });
});
