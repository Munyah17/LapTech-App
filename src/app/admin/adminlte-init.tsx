"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Body classes AdminLTE 4 expects for each admin page type. */
const CONSOLE_CLASSES = [
  "layout-fixed",
  "sidebar-expand-lg",
  "bg-body-tertiary",
];
const LOGIN_CLASSES = ["login-page", "bg-body-secondary"];
const STATE_CLASSES = ["sidebar-collapse", "sidebar-open"];

/**
 * Boots AdminLTE on /admin routes:
 * - applies the layout classes AdminLTE expects on <body>
 * - mirrors the app's .dark class onto Bootstrap's data-bs-theme
 *
 * NOTE: adminlte.js is intentionally NOT loaded — its PushMenu toggles
 * sidebar-collapse/sidebar-mini behind React's back, which produced a
 * two-stage icon-bar slide and a dead close button on mobile. The shell
 * drives body.sidebar-open itself.
 */
export function AdminLTEInit() {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    const body = document.body;
    const classes = isLogin ? LOGIN_CLASSES : CONSOLE_CLASSES;
    body.classList.add(...classes);
    // Defensive: kill any sidebar-collapse left over from a previous
    // PushMenu session — on desktop it hides the sidebar entirely.
    body.classList.remove("sidebar-collapse");

    return () => {
      body.classList.remove(...classes, ...STATE_CLASSES);
    };
  }, [isLogin]);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => {
      html.dataset.bsTheme = html.classList.contains("dark") ? "dark" : "light";
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      delete html.dataset.bsTheme;
    };
  }, []);

  return null;
}
