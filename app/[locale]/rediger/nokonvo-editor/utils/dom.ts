// <input> types that are UI CONTROLS, not text-entry fields. Focusing one of
// these (e.g. an opacity/zoom slider or a colour picker in the Inspector) must
// NOT switch the editor into Text Mode, otherwise element copy/paste shortcuts
// would be silently swallowed while the user is adjusting a control.
const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

// Returns true when the given element (typically document.activeElement) is an
// editable TEXT context: a text-entry form field or a contenteditable region.
// Used to put the editor in "Text Mode" — where copy/cut/paste/undo must use the
// browser's native text behavior and the custom element-level shortcuts must be
// bypassed, so editing text never duplicates whole blocks/elements.
export function isTextEditingContext(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT") {
    // Only text-entry input types count as Text Mode; sliders/colour pickers/
    // checkboxes are controls and must fall through to Element Mode.
    return !NON_TEXT_INPUT_TYPES.has((el as HTMLInputElement).type);
  }
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  // isContentEditable is true for contenteditable="true" elements and any node
  // nested inside one (it inherits), covering rich text editors as well.
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}
