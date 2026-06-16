# UI State Primitives

Reusable, accessible building blocks for the four universal async UI states:
**loading, empty, error, and inline spinner**. Located in `components/ui/states/`.

Import from the barrel:

```jsx
import { Spinner, LoadingState, EmptyState, ErrorState } from "@/components/ui/states";
```

---

## Why

Before this, every component hand-rolled `<Loader2 className="animate-spin" />` loaders,
bespoke empty-state markup, and inline red error text. That meant:

- Inconsistent look and spacing across pages.
- No accessibility — no `role="status"`, `aria-live`, `aria-busy`, or `role="alert"`.
- Layout shift (CLS) because loaders reserved no space.
- Duplicated code in dozens of files.

These primitives fix all four in one place.

---

## Component Architecture

| Component | Role | a11y |
|---|---|---|
| `Spinner` | Just the spinning icon (inside buttons, inline) | `role="status"` + `aria-label` |
| `LoadingState` | Full-panel loader with announced label | `role="status"` `aria-live="polite"` `aria-busy` |
| `EmptyState` | "No data yet" panel | decorative icon `aria-hidden` |
| `ErrorState` | Error panel with optional retry | `role="alert"` `aria-live="assertive"` |

All four are presentational (no data fetching) — they receive everything via props,
so they are fully reusable and testable.

---

## Props

### `Spinner`
| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `"xs"\|"sm"\|"md"\|"lg"\|"xl"` | `"md"` | |
| `color` | string | cyan | Any CSS color |
| `label` | string | `"Loading"` | Screen-reader text |
| `className` | string | — | |

### `LoadingState`
| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | string | `"Loading…"` | Visible + announced |
| `size` | spinner size | `"md"` | |
| `color` | string | cyan | |
| `minHeight` | number | `160` | Reserves space → prevents layout shift |
| `inline` | boolean | `false` | Compact inline row variant |

### `EmptyState`
| Prop | Type | Default | Notes |
|---|---|---|---|
| `icon` | emoji string OR Lucide component | — | `"🔖"` or `Bookmark` |
| `title` | string | — | Primary line |
| `description` | string | — | Secondary line |
| `action` | ReactNode | — | e.g. a CTA button |

### `ErrorState`
| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | string | `"Something went wrong"` | |
| `description` | string | — | |
| `onRetry` | function | — | Shows "Try again" button when set |
| `retryLabel` | string | `"Try again"` | |

---

## Usage Examples

### Loading / empty / error in one render path

```jsx
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/states";

if (loading) return <LoadingState label="Loading your library…" />;
if (error)   return <ErrorState description="Could not load your library." onRetry={reload} />;
if (items.length === 0)
  return <EmptyState icon="🔖" title="No bookmarks yet" description="Tap any verse to bookmark it" />;

return items.map(/* … */);
```

### Inline loader inside a button

```jsx
<button disabled={saving}>
  {saving ? <Spinner size="sm" label="Saving" /> : "Save"}
</button>
```

### Inline loading row (no big panel)

```jsx
<LoadingState inline label="Searching scripture…" />
```

### Empty state with a call-to-action

```jsx
<EmptyState
  icon={Bookmark}
  title="No saved spots"
  description="Save your place while listening"
  action={<a href="/read" className="…">Start reading</a>}
/>
```

---

## Conventions

- **Always** branch loading → error → empty → data, in that order.
- Use `LoadingState` (not a raw `Loader2`) for any panel-level load.
- Use `Spinner` only for inline/in-button cases.
- Pass a meaningful `label` so screen-reader users know *what* is loading.
- Prefer `EmptyState` `description` to guide the user toward the action that fills it.