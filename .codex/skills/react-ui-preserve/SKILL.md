# Skill: Preserve React UI

## Purpose

Use this skill whenever modifying frontend screens that already have styling and layout.

## Rules

Preserve:

- Tailwind classes
- layout
- component structure
- animations
- form fields
- labels
- loading indicators
- toast behavior
- route structure

Allowed changes:

- replace data fetching
- replace auth calls
- add API imports
- add error handling
- add token handling
- minor state changes required by API migration

Avoid:

- broad rewrites
- redesign
- component renaming
- changing UX copy unless required
- changing CSS unless asked

## Output

For every change:

- state what UI was preserved
- state what data layer changed
- state endpoint used
