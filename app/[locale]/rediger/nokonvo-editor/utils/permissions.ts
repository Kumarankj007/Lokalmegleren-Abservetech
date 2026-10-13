"use client";

import { createContext, useContext } from "react";

import { getUser } from "@/services/authService";

/* ═══════════════════════════════════════════════════════════════════════
   ROLE-BASED ACCESS CONTROL
   ───────────────────────────────────────────────────────────────────────
   Single source of truth for what the logged-in user may do inside the PDF
   editor. Two roles exist (mirroring the register/login forms):

     • ADMIN — full editor: transform, add, duplicate, delete, manage pages.
     • USER  — content only: edit text + images and save. No layout editing.

   The role is read from the same auth service the rest of the app uses
   (localStorage `user.role`) — no new auth mechanism. Restricted flags are
   consumed BOTH by the UI (to hide/disable controls) and by the ops hooks
   (to reject the action even if triggered programmatically), so hiding a
   button is never the only line of defence.
   ═══════════════════════════════════════════════════════════════════════ */

export type EditorRole = "ADMIN" | "USER";

export interface EditorPermissions {
  role: EditorRole;
  isAdmin: boolean;
  /** Move / resize / rotate / drag elements on the canvas. */
  canTransformElements: boolean;
  /** Create brand-new elements (toolbar tools, drop-to-create, paste). */
  canAddElements: boolean;
  /** Duplicate an existing element or flow line. */
  canDuplicateElements: boolean;
  /** Delete an existing element or flow line. */
  canDeleteElements: boolean;
  /** Add / delete / duplicate / move / reorder pages (page structure). */
  canManagePages: boolean;
  /** Edit the CONTENT of existing text / image blocks. Always allowed. */
  canEditContent: boolean;
  /** Save the document. Always allowed. */
  canSave: boolean;
}

const ADMIN_PERMISSIONS: EditorPermissions = {
  role: "ADMIN",
  isAdmin: true,
  canTransformElements: true,
  canAddElements: true,
  canDuplicateElements: true,
  canDeleteElements: true,
  canManagePages: true,
  canEditContent: true,
  canSave: true,
};

const USER_PERMISSIONS: EditorPermissions = {
  role: "USER",
  isAdmin: false,
  canTransformElements: false,
  canAddElements: false,
  canDuplicateElements: false,
  canDeleteElements: false,
  canManagePages: false,
  canEditContent: true,
  canSave: true,
};

/** The permission set for a role. */
export function permissionsForRole(role: EditorRole): EditorPermissions {
  return role === "ADMIN" ? ADMIN_PERMISSIONS : USER_PERMISSIONS;
}

/**
 * Resolve the current user's editor role from the auth service. Any value that
 * is not explicitly `ADMIN` (including a missing user, unparseable JSON, or an
 * unknown role) resolves to the restricted `USER` role, so the editor fails
 * closed. Server-side (no `window`) it returns `USER` too — the editor only
 * mounts on the client, so the real role is resolved on mount.
 */
export function getEditorRole(): EditorRole {
  if (typeof window === "undefined") return "USER";
  try {
    const raw = getUser();
    if (!raw) return "USER";
    const user = JSON.parse(raw);
    const role = String(user?.role ?? "").trim().toUpperCase();
    return role === "ADMIN" ? "ADMIN" : "USER";
  } catch {
    return "USER";
  }
}

/** Resolve the full permission set for the logged-in user. */
export function resolveEditorPermissions(): EditorPermissions {
  return permissionsForRole(getEditorRole());
}

/**
 * Context default is the ADMIN set. This is a fail-open fallback for the UI
 * ONLY — it is used solely if a component reads permissions outside the
 * provider (which the editor never does; the root always supplies the resolved
 * value). Enforcement of restricted actions lives in the ops hooks, which
 * receive the resolved permissions explicitly rather than through this context.
 */
export const PermissionsContext = createContext<EditorPermissions>(ADMIN_PERMISSIONS);

/** Read the active editor permissions from context (UI hide/disable checks). */
export function usePermissions(): EditorPermissions {
  return useContext(PermissionsContext);
}
