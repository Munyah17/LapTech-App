"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Body classes AdminLTE 4 expects for each admin page type. */
const CONSOLE_CLASSES = [
  "layout-fixed",
  "sidebar-expand-lg",
  "sidebar-mini",
  "bg-body-tertiary",
];
const LOGIN_CLASSES = ["login-page", "bg-body-secondary"];
const STATE_CLASSES = ["sidebar-collapse", "sidebar-open"];

/**
 * Boots AdminLTE on /admin routes:
 * - applies the layout classes AdminLTE expects on <body>
 * - lazy-loads adminlte.js (PushMenu, treeview, card widgets, …)
 * - mirrors the app's .dark class onto Bootstrap's data-bs-theme
 */
export function AdminLTEInit() {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    const body = document.body;
    const classes = isLogin ? LOGIN_CLASSES : CONSOLE_CLASSES;
    body.classList.add(...classes);

    // adminlte.js self-initializes (handles late loads + delegated events)
    void import("admin-lte");

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
