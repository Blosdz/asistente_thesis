# Extractable components

## StudentLayout

- Source: `src/layouts/StudentLayout.jsx`
- Category: layout
- Description: Fixed student app shell with product label, animated role navigation, notifications and account menu.
- Extractable props: active navigation route, notification count, account menu visibility.
- Hardcoded: AppThesis/Student text, navigation labels, Lucide icons, shell classes.

## AnimatedTopNav

- Source: `src/components/navigation/AnimatedTopNav.jsx`
- Category: layout
- Description: Responsive horizontal navigation with animated active pill.
- Extractable props: items, active route, aria label.
- Hardcoded: measurement behavior and animation classes.

## Modal

- Source: `src/components/ui/modal.jsx`
- Category: basic
- Description: Accessible portal modal with header, scroll area, close control and optional footer actions.
- Extractable props: title, subtitle, width, open, action labels.
- Hardcoded: Lucide close icon and panel structure.

## AccessManagementModal

- Source: `src/components/student/workspace/AccessManagementModal.jsx`
- Category: basic
- Description: Access-management feature containing assigned and available advisor lists.
- Extractable props: thesis title, assigned count, search query, advisor rows, loading state.
- Hardcoded: section labels, Lucide icons, responsive two-column structure.

## Button

- Source: `src/components/ui/button.jsx`
- Category: basic
- Description: Shared action primitive with semantic variants.
- Extractable props: variant, size, disabled.
- Hardcoded: variant class mapping.

## Card

- Source: `src/components/ui/card.jsx`
- Category: basic
- Description: Pale blue/white surface card and header/title/content primitives.
- Extractable props: children and className.
- Hardcoded: gradient, border and shadow treatment.
