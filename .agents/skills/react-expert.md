# React Expert

When editing React components:

- Prefer functional components.
- Use TypeScript.
- Use Tailwind CSS.
- Avoid unnecessary re-renders.
- Follow project coding conventions.

# Skill: Prevent Content Overflow Beyond Page Boundaries

You are a senior React + TypeScript engineer specializing in document layout engines and WYSIWYG editors.

## Project Context

I have a PDF editor built with React and TypeScript.

The editor renders HTML generated from property data.

The HTML is divided into accordion sections, and each accordion section is rendered independently.

Each page contains TWO columns.

The editor already supports:
- Automatic page creation
- Page numbering
- Rendering HTML into the editor
- Two-column layout

Do NOT modify these existing features.

## Current Problem

When rendering an accordion section, the content keeps growing vertically.

If the content exceeds the available height of the current column, it continues outside the page boundary.

This causes content to overflow and become invisible.

## Expected Behaviour

Implement a content flow engine.

Rules:

1. Render content sequentially.

2. Fill Column 1 first.

3. If Column 1 becomes full,
   automatically continue rendering in Column 2.

4. If Column 2 also becomes full,
   automatically create the next page.

5. Continue rendering in Column 1 of the next page.

6. Never allow content to render outside the page boundary.

7. Preserve page numbers.

8. Preserve existing styling.

9. Preserve the existing HTML structure.

10. Do not introduce regressions.

## Very Important

Do NOT split an accordion block unless it is taller than an entire column.

If an accordion block fits completely in the next column,
move the whole block.

Only split inside an accordion block when its own height exceeds the height of an entire column.

When splitting,
maintain the original HTML formatting.

## Constraints

- Do not change UI.
- Do not change CSS unnecessarily.
- Do not change page numbering.
- Do not change zoom logic.
- Do not change drag/drop logic.
- Do not change existing pagination logic except where required for overflow.
- Keep TypeScript strict.
- Reuse existing helper functions whenever possible.
- Produce clean, maintainable code.

## Before Coding

First analyze the current rendering flow.

Explain:
- Why overflow happens.
- Which part of the rendering pipeline should be modified.
- Why your solution is the safest.

Only then implement the feature.

Return the complete updated code for every modified file.
Do not omit any code.


# Skill: Fix Copy/Paste Duplication in the HTML Editor

## Context

File:
`/uploads/properties-html/600000011/600000011-new-1.html`

This HTML file has already been edited and saved successfully.

## Current Issue

When editing the document, if I copy and paste a sentence inside a text input/contenteditable area, the content near the current page is unexpectedly duplicated.

This duplication should never happen.

The issue appears to be caused by the editor treating every paste operation as an element-level paste instead of plain text when the cursor is inside editable text.

## Expected Behavior

### Text Editing Mode

When the cursor is focused inside a text input or a contenteditable text area:

- Copy should copy only the selected text.
- Paste should paste only plain/rich text.
- Do not duplicate nearby page content.
- Do not duplicate surrounding elements.
- Do not recreate blocks.
- Preserve formatting (bold, italic, underline, lists, etc.) if supported.
- Preserve the cursor position after paste.
- Preserve the existing pagination logic.

### Element Editing Mode

When no text field is focused and an element (block/component/image/accordion/etc.) is selected:

- Copy should copy the entire selected element.
- Paste should duplicate only the selected element.
- Existing element copy/paste functionality should continue to work exactly as it does today.

## Required Behavior

The editor must distinguish between two editing modes:

### 1. Text Mode
Activated when:
- A text input is focused.
- A textarea is focused.
- A contenteditable element is focused.

Behavior:
- Enable normal browser copy/cut/paste behavior.
- Disable element duplication logic.
- Only selected text should be copied or pasted.

### 2. Element Mode
Activated when:
- No text field is focused.
- A page element or component is selected.

Behavior:
- Enable the existing element copy/paste functionality.
- Continue duplicating blocks/components as implemented today.

## Constraints

- Do not modify the existing editor architecture.
- Do not break page flow or pagination.
- Do not affect undo/redo.
- Do not affect keyboard shortcuts.
- Do not affect drag-and-drop.
- Do not affect existing element copy/paste.
- Only switch the copy/paste behavior based on the current focus state.

## Acceptance Criteria

✅ Copying text inside a text field copies only the selected text.

✅ Pasting inside a text field pastes only the text.

✅ No nearby page content is duplicated.

✅ No extra blocks or elements are created.

✅ Element copy/paste continues to work when an element is selected.

✅ The editor correctly detects whether it is in Text Mode or Element Mode.

## Implementation Hint

Before handling `copy`, `cut`, or `paste` shortcuts/events, detect the current target:

- If the active element is an `<input>`, `<textarea>`, or any element with `contenteditable="true"`, allow the browser's default text copy/paste behavior and bypass the custom element copy/paste handler.

- Otherwise, execute the existing custom element copy/paste logic.

This should completely eliminate the content duplication issue while preserving the existing element duplication functionality.

# Skill: Maintain Even Page Count

## Context

The editor automatically creates and removes pages based on the content. The flipbook must always maintain the correct page pairing by adding or removing a trailing blank page when necessary.

## New Requirement

Whenever the total page count changes, verify whether a trailing blank page should be added or removed.

## Expected Behavior

After every pagination update:

- Recalculate the total number of pages.
- Determine whether the last page is an automatically generated blank page.
- Apply the following rules.

### Rule 1 - Odd Number of Pages

If the total page count is **odd**:

- If a trailing blank page does not exist, automatically create one.
- If a trailing blank page already exists, do nothing.

### Rule 2 - Even Number of Pages

If the total page count is **even**:

- If a trailing blank page exists, remove it.
- If no trailing blank page exists, do nothing.

## Constraints

- Do not modify existing page content.
- Do not recreate all pages.
- Only add or remove the final blank page.
- Do not affect page numbering.
- Do not affect pagination logic.
- Do not affect the flipbook layout.
- Preserve the current cursor position.
- Preserve undo/redo history.
- Avoid unnecessary page re-rendering.

## Acceptance Criteria

- The document always maintains the correct page pairing.
- Odd page counts always end with one additional blank page.
- Even page counts never contain an unnecessary blank page.
- Existing content is never modified.
- Page numbers remain unchanged.
- The flipbook layout remains stable.

## Implementation Notes

- Execute this validation every time the page count changes.
- Detect whether the last page is the system-generated blank page before making any changes.
- Only the automatically generated trailing blank page should be added or removed.
- Never delete a page containing user content.


# Skill: Synchronize Property Image Pages with the Latest Template

## Goal

Ensure that property image pages in an existing HTML document always match the latest version of the image template generated by `buildImagePagePair(image, index)`.

## Requirements

- Treat `buildImagePagePair(image, index)` as the single source of truth.
- Never manually update `<img>` attributes, captions, classes, wrappers, or styles.
- Never duplicate the template markup inside the synchronization function.
- Generate all image page HTML exclusively through `buildImagePagePair()`.

## Synchronization Rules

For every image in `propertyImages`:

1. Locate the existing image pair:
   - `#page_img{index}a`
   - `#page_img{index}b`

2. If both pages exist:
   - Remove both pages completely.
   - Generate fresh HTML using `buildImagePagePair(image, index)`.
   - Insert the new HTML in exactly the same location.

3. If the pages do not exist:
   - Generate them using `buildImagePagePair(image, index)`.
   - Insert them into the image section while preserving page order.

4. After processing all images:
   - Remove any remaining image pages whose index no longer exists in `propertyImages`.

## Important Constraints

The synchronization logic must not assume anything about the internal HTML structure produced by `buildImagePagePair()`.

Future template changes may include:

- different wrapper elements
- additional containers
- new CSS classes
- different image positioning
- new captions
- overlays
- decorative elements
- inline styles
- metadata
- accessibility attributes

The synchronization code must continue working without modification because it always regenerates pages from the template instead of patching existing DOM elements.

## Expected Result

The final HTML should always:

- exactly match the latest `buildImagePagePair()` output
- preserve the surrounding non-image pages
- maintain the correct page order
- remove obsolete image pages
- create missing image pages
- automatically adopt future template changes

## Preferred Implementation

Use Cheerio to manipulate the DOM.

Avoid updating individual elements.

Instead:

- locate the existing image page pair
- replace the entire page pair with freshly generated HTML from `buildImagePagePair()`
- return the updated HTML together with a summary of the changes performed

The implementation should be clean, maintainable, and future-proof.

# Skill: Synchronize Property Document Images from WebMegler

## Context

There are three files involved:

- controllers/sync-text-from-webmegler.js
- controllers/pdfGenerationController.js
- views/property-template.ejs

The existing sync flow is already working correctly for:

- Property Images
- Property Details
- Accordion Content

The API `syncTextsFromWebmegler` in `pdfGenerationController.js` fetches the latest property information from WebMegler and passes it into the `syncAll()` function, which updates the saved HTML.

I have now introduced a new API called:

getDocumentImages()

This API returns all Property Document Images.

## Objective

Extend the existing synchronization flow so Property Document Images are synchronized exactly like Property Images.

Do not create a separate synchronization pipeline.

Instead, integrate the new document images into the existing sync flow.

## Required Changes

### Step 1

Study the existing implementation of:

- syncTextsFromWebmegler
- syncAll()
- property image synchronization
- accordion synchronization

Understand how data flows from the controller into the synchronization layer.

### Step 2

Modify `syncTextsFromWebmegler` so that after fetching the normal property data it also fetches

getDocumentImages()

and stores the result as

documentImages

### Step 3

Pass `documentImages` into `syncAll()` together with the existing data.

Current flow is similar to:

syncAll({
    html,
    property,
    propertyImages,
    ...
})

Update it to:

syncAll({
    html,
    property,
    propertyImages,
    documentImages,
    ...
})

without breaking existing functionality.

### Step 4

Inside sync-text-from-webmegler.js

Extend the synchronization pipeline so it processes

documentImages

using the same architecture used for Property Images.

If the EJS template contains dedicated pages for Property Document Images,

the synchronization should:

- locate existing document image pages
- regenerate them from the latest template
- replace old pages
- add missing pages
- remove obsolete pages

The synchronization must preserve all surrounding pages.

### Step 5

Study property-template.ejs to understand how Property Document Images are rendered.

Reuse the same rendering logic instead of manually generating HTML.

The template should remain the single source of truth.

### Step 6

Ensure the implementation is future-proof.

If the document image template changes later, synchronization should automatically adopt those changes without requiring modifications to the synchronization logic.

## Constraints

- Do not duplicate template markup.
- Reuse existing synchronization architecture.
- Follow the same coding style already used for Property Images.
- Avoid introducing duplicate logic.
- Keep the implementation modular and maintainable.
- Do not break existing synchronization for Property Images or Accordion content.

## Expected Result

After calling `syncTextsFromWebmegler`:

- property data is updated
- property images are updated
- accordion content is updated
- property document images are also updated automatically

using the existing synchronization pipeline.


# Skill: Fix Rich Text Block Rendering and Preserve HTML Structure in the PDF Editor

## Context

File:

/home/abservetech/Kumaran/Lokalmegleren/Lokalmegleren-Admin/app/[locale]/rediger/Nokonvo.tsx

This file contains the main PDF editor where HTML pages are rendered and edited.

The editor supports multiple editable block types, including Rich Text blocks.

## Current Issues

### Issue 1 - Rich Text does not appear in the Sidebar

The editor renders Rich Text content on the page, but the corresponding Rich Text block is not listed in the left sidebar.

Expected behavior:

- Every Rich Text block rendered in the document should appear in the sidebar.
- Selecting a Rich Text block from the sidebar should focus the correct block inside the editor.
- Selecting a Rich Text block inside the editor should highlight the corresponding sidebar item.
- Newly added Rich Text blocks should automatically appear in the sidebar.
- Deleted Rich Text blocks should automatically disappear from the sidebar.

Investigate how the sidebar currently detects editable blocks and extend that logic so Rich Text blocks participate exactly like existing supported block types.

---

### Issue 2 - Preserve Exact HTML Structure When Saving

Currently, after editing Rich Text and saving, the generated HTML changes its DOM structure.

This causes problems because the saved HTML no longer matches the original template.

The editor should preserve the existing HTML structure.

Expected behavior:

- Do not rebuild the Rich Text section.
- Do not generate a different DOM hierarchy.
- Do not move elements.
- Do not reorder nodes.
- Do not remove wrapper elements.
- Do not change class names.
- Do not change IDs.
- Do not modify inline styles.
- Do not alter surrounding elements.

Only update the Rich Text content itself.

The saved HTML should be structurally identical to the original HTML, with only the edited text changed.

---

## Investigation

Study the following:

- How editable blocks are detected.
- How sidebar items are generated.
- How block selection works.
- How Rich Text blocks are registered.
- How HTML is serialized when saving.
- How existing editable block types preserve their structure.

Reuse the existing architecture instead of creating a separate implementation.

---

## Constraints

- Do not break existing editor functionality.
- Do not introduce duplicate logic.
- Follow the current editor architecture.
- Preserve backward compatibility.
- Keep the implementation modular.
- Preserve exact DOM ordering.
- Preserve whitespace where required.
- Preserve existing attributes.
- Preserve page layout.

---

## Success Criteria

✔ Rich Text blocks appear in the sidebar.

✔ Sidebar selection and editor selection stay synchronized.

✔ Saving the document preserves the original HTML structure.

✔ Only the Rich Text content changes.

✔ The resulting HTML remains compatible with the PDF generation pipeline.

✔ Existing editor functionality continues to work without regression.


# Skill: Implement Role-Based Access Control for the PDF Editor

## Context

Editor file:

/home/abservetech/Kumaran/Lokalmegleren/Lokalmegleren-Admin/app/[locale]/rediger/Nokonvo.tsx

User information can be obtained from:

/home/abservetech/Kumaran/Lokalmegleren/Lokalmegleren-Admin/services/authService.ts

```ts
export const getUser = () => localStorage.getItem("user") || null;

const user = JSON.parse(getUser() || "{}");
```

The logged-in user object contains the information required to determine whether the current user is an Admin or a regular User.

---

## Objective

Implement role-based permissions inside the editor.

There should be two roles:

- Admin
- User

The editor should behave differently depending on the logged-in user's role.

---

## Admin Permissions

Admins should retain all existing functionality.

They should be able to:

- Edit text
- Edit images
- Drag and drop any block
- Reorder blocks
- Add new elements
- Delete elements
- Access all editor tools
- Use all existing editor features without restriction

No existing Admin functionality should change.

---

## User Permissions

Users should have limited editing capabilities.

### Allowed

- Edit text content
- Replace/edit images
- Save changes

### Not Allowed

- Drag and drop any element
- Reorder blocks
- Move sections
- Add new elements
- Duplicate elements
- Delete elements
- Change page structure
- Access layout editing features

Users should only be able to modify the content of existing editable blocks.

---

## Implementation Requirements

Determine the current user's role using the existing authentication service.

Example:

```ts
const user = JSON.parse(getUser() || "{}");
```

Identify the role field from the stored user object instead of introducing a new authentication mechanism.

Do not hardcode role names if they already exist in the application.

---

## UI Behaviour

For regular users:

- Hide or disable drag handles.
- Hide or disable "Add Element" controls.
- Hide or disable block insertion controls.
- Disable sortable interactions.
- Prevent drag events programmatically.
- Prevent keyboard shortcuts that add or rearrange blocks.
- Disable context menu actions related to layout changes.

For administrators:

- Preserve the current UI and functionality exactly as it is today.

---

## Security

Do not rely only on hiding buttons.

The editor logic itself should prevent restricted actions.

Even if a restricted action is triggered programmatically, the editor should reject it for regular users.

---

## Code Quality

- Reuse the existing editor architecture.
- Centralize permission checks where possible.
- Avoid scattering role checks throughout the codebase.
- Keep the implementation modular and maintainable.
- Minimize code duplication.

---

## Success Criteria

Admin:

✔ Full editor access

✔ Drag and drop enabled

✔ Add/Delete elements enabled

✔ All existing functionality preserved

User:

✔ Can edit text

✔ Can edit images

✔ Cannot drag blocks

✔ Cannot reorder pages or elements

✔ Cannot add new elements

✔ Cannot modify the document structure

✔ Can save content changes

The final implementation should introduce role-based permissions without affecting the current editor workflow for administrators.