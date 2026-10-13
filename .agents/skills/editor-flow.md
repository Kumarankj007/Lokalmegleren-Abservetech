# Skill: Preserve Admin Template Layout While Synchronizing WebMegler Data

## Project Structure

### Server

/home/abservetech/Kumaran/Lokalmegleren/Lokalmegleren-server

### Admin

/home/abservetech/Kumaran/Lokalmegleren/Lokalmegleren-Admin

Before making any implementation, analyze the existing codebase and understand the current synchronization flow.

If an existing function already works correctly, do not modify or replace it unnecessarily.

The implementation should extend the existing architecture rather than rewrite it.

---

# Overall Workflow

There are three major stages in this system.

---

## A) Admin Creates Template

Base template:

/home/abservetech/Kumaran/Lokalmegleren/Lokalmegleren-Admin/public/template/base-template.html

The base template acts as the starting point.

An administrator can create multiple custom templates from this base template.

Examples:

- Rearrange pages
- Move text blocks
- Move image blocks
- Change layouts
- Resize elements
- Reorder sections
- Modify the overall page design

The template created by the administrator becomes the master layout for future HTML generation.

Once the template is saved, its layout should be treated as the user's customized design.

---

## B) Generate HTML

The primary source of data is the EJS template.

The system generates property HTML using:

- property-template.ejs

There are two possible generation scenarios.

### Scenario 1

Generate HTML directly from the default EJS template.

### Scenario 2

Generate HTML using an existing Admin-created template.

In this case:

- The administrator's layout must be preserved.
- Property content should populate into the correct placeholders.
- Element ordering should follow the customized template.
- The generated HTML should respect the administrator's saved structure.

The EJS template remains the source of dynamic data, while the saved template controls layout.

---

## C) Synchronize Updated WebMegler Data

API:

/webmegler/html/sync-webmegler-text/:propertyId

Purpose:

Synchronize updated data from WebMegler into an existing HTML document.

This API must update only the content.

It must not reset or destroy the administrator's customized layout.

---

# Synchronization Rules

## Preserve Layout

If an administrator has:

- moved text blocks
- moved images
- changed page order
- changed layout
- resized sections
- changed element positions

those changes must remain exactly as they are.

Synchronization must never recreate the page layout.

---

## Update Content Only

When WebMegler data changes:

Update:

- text
- property details
- accordion content
- property images
- property document images
- other dynamic property data

without changing:

- element position
- page order
- layout
- styling
- custom wrappers
- administrator modifications

---

## Restore Missing Content

If synchronized content has been deleted from the HTML by mistake, the synchronization process should intelligently restore only the missing content.

Examples:

- missing text block
- deleted image placeholder
- removed accordion section
- removed document image section

Only the missing dynamic content should be recreated.

The rest of the customized layout must remain untouched.

---

## Never Revert Layout

Synchronization must never revert the document back to the default EJS layout.

Even if the EJS template changes in the future, the administrator's customized layout should always take priority.

Only missing dynamic content should be restored.

---

# Existing Functions

Before implementing any new logic:

Analyze the existing synchronization functions.

Examples include:

- syncTextsFromWebmegler
- syncAll
- image synchronization
- accordion synchronization
- document synchronization
- HTML generation pipeline

Reuse the existing implementation wherever possible.

If a function is already working correctly:

- do not rewrite it
- do not replace it
- do not introduce duplicate logic

Only extend the functionality where necessary.

---

# Implementation Guidelines

- Follow the current project architecture.
- Keep functions modular.
- Avoid code duplication.
- Reuse existing helper methods.
- Preserve backward compatibility.
- Minimize changes to working code.
- Maintain current coding conventions.

---

# Success Criteria

✔ Administrators can create multiple custom templates.

✔ Generated HTML respects the administrator's saved layout.

✔ Synchronization updates only dynamic content.

✔ Administrator layout is never overwritten.

✔ Element positions remain unchanged.

✔ Page ordering remains unchanged.

✔ Missing dynamic content is restored when necessary.

✔ Existing synchronization logic continues to work.

✔ New functionality integrates cleanly into the existing codebase without breaking current behavior.