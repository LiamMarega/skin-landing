import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as analyticsLogEvent, setUserProperties, type Analytics } from "firebase/analytics";
import { getPerformance, trace, type FirebasePerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyBoD_5CSukcZLMFQCmG5ZOevwwDQma1nOo",
  authDomain: "skin-labs-pro.firebaseapp.com",
  projectId: "skin-labs-pro",
  storageBucket: "skin-labs-pro.firebasestorage.app",
  messagingSenderId: "239824949627",
  appId: "1:239824949627:web:42d14f20f901004fe12dde",
  measurementId: "G-F17HG5D72S",
};

let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

function getDeviceCategory(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|webOS|Opera M(ini|obi)/i.test(ua)) return "mobile";
  return "desktop";
}

export function initFirebase(): { analytics: Analytics; logEvent: typeof logEvent; logError: typeof logError } {
  if (analytics) {
    return {
      analytics,
      logEvent: logEvent as typeof logEvent,
      logError,
    };
  }

  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  performance = getPerformance(app);

  // User properties: timezone, device, referrer (origin is tracked by GA4 automatically)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "unknown";
  const deviceCategory = getDeviceCategory();
  setUserProperties(analytics, {
    user_timezone: timezone,
    device_category: deviceCategory,
    page_load_timestamp: String(Date.now()),
  });

  // Global error handler → send to Analytics (Crashlytics-style for web)
  if (typeof window !== "undefined") {
    window.onerror = (message, source, lineno, colno, error) => {
      logError({
        message: String(message),
        source: source ?? undefined,
        lineno: lineno ?? undefined,
        colno: colno ?? undefined,
        stack: error?.stack ?? undefined,
        name: error?.name ?? undefined,
      });
      return false;
    };
    window.addEventListener("unhandledrejection", (event) => {
      logError({
        message: "UnhandledRejection",
        reason: String(event.reason),
        stack: event.reason?.stack ?? undefined,
      });
    });
  }

  const api = {
    analytics,
    logEvent: logEvent as typeof logEvent,
    logError,
  };
  if (typeof window !== "undefined") {
    (window as unknown as { __firebaseAnalytics: typeof api }).__firebaseAnalytics = api;
  }
  return api;
}

export function logEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (!analytics) return;
  const safeParams: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) safeParams[k] = v as string | number | boolean;
    }
  }
  analyticsLogEvent(analytics, name, safeParams);
}

export function logError(details: {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  name?: string;
  reason?: string;
}): void {
  logEvent("javascript_error", {
    error_message: details.message.slice(0, 500),
    error_source: details.source,
    error_line: details.lineno,
    error_column: details.colno,
    error_stack: details.stack?.slice(0, 1000),
    error_name: details.name,
    error_reason: details.reason?.slice(0, 500),
  });
}

export function getPerformanceTrace(name: string) {
  return performance ? trace(performance, name) : null;
}

