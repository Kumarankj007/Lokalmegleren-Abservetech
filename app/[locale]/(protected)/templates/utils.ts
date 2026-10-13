// Shared helpers for the master-templates screen.
import { APICONSTANT, APIURLS } from "@/services/config";

/**
 * A brand-new master template is seeded from this reference property layout
 * (served statically by the backend). It already carries the full page
 * structure + data-bindings, so `generate-from-template` can re-fill them for
 * any property later. Kept as a path so the heavy HTML is fetched at runtime,
 * never bundled.
 */
export const BASE_TEMPLATE_PATH = "/template/base-template.html";

/**
 * Minimal, valid fallback used only if the reference layout can't be fetched
 * (e.g. missing on this environment). One blank A4 page the editor recognises.
 */
const BLANK_TEMPLATE_HTML = (name: string) =>
  `<!DOCTYPE html>
<html><head><title>${name}</title><meta charset="utf-8"/>
<style>
</style>
</head><body>
<div id="page_1" class="page" data-page="page_1" data-page-bg="#ffffff" style="position:relative;width:794px;height:1123px;background:#ffffff;overflow:hidden;">
</div>
</body></html>`;

/** Fetch the base template HTML used to seed a new master template. */
export const fetchBaseTemplateHtml = async (name: string): Promise<string> => {
  try {
    const res = await fetch(BASE_TEMPLATE_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return html?.trim() ? html : BLANK_TEMPLATE_HTML(name);
  } catch (error) {
    console.error("Failed to load base template, using blank skeleton:", error);
    return BLANK_TEMPLATE_HTML(name);
  }
};

/** Open the shared Nokonvo editor in master-template edit mode (new tab). */
export const openTemplateEditor = (template: { _id: string; name: string }) => {
  const params = new URLSearchParams({
    templateId: template._id,
    title: template.name || "",
  });
  window.open(`/en/rediger?${params.toString()}`, "_blank");
};
