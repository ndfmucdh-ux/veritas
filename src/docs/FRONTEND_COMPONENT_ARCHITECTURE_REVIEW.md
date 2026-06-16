# Frontend Component Architecture Review

## Executive Summary

The app has a strong visual system and a growing set of reusable components, but it is only partially production-ready from a frontend architecture perspective. The biggest gaps are accessibility consistency, large route files owning too much logic, and inconsistent loading/error/empty-state patterns.

The reader flow is the most important production surface. I improved it by making the multi-select action bar reusable and more accessible, and by documenting recommended component boundaries and props patterns below.

---

## Component Architecture

### Current Strengths

- Reusable UI primitives exist under `components/ui`.
- Reader-specific components are already separated into focused files such as:
  - `ChapterNavigator`
  - `VerseRow`
  - `VerseSidePanel`
  - `ParallelPanel`
  - `ChapterAudioPlayer`
  - `FolderSaveModal`
- Route-level pages use composition rather than rendering everything directly.
- Styling is visually consistent across the app: dark glass surfaces, cyan/gold accents, Cinzel/Inter/Playfair typography.

### Current Weaknesses

- `pages/Read` is still too large and owns too much business logic.
- Several components rely on inline styles instead of tokenized variants.
- Accessibility behavior is inconsistent across custom buttons, dialogs, and floating controls.
- Loading states exist, but empty/error states are not standardized.
- Modal focus management is incomplete.

### Recommended Architecture

```text
components/
  reader/
    ReaderToolbar.jsx
    ReaderSettingsPanel.jsx
    ReaderContent.jsx
    MultiSelectActionBar.jsx
    FolderSaveModal.jsx
    VerseRow.jsx
  feedback/
    EmptyState.jsx
    ErrorState.jsx
    LoadingState.jsx
  primitives/
    ActionButton.jsx
    GlassPanel.jsx
    IconButton.jsx
hooks/
  useChapterLoader.js
  useVerseAnnotations.js
  useVerseSelection.js
  useReadingProgress.js
lib/
  verseCopy.js
  accessibility.js
```

---

## Props Design

### Good Props Patterns Already Present

The app frequently passes explicit callbacks such as:

```jsx
<VerseRow
  verseNum={v.verse}
  text={v.text}
  book={book}
  chapter={chapter}
  translation={translation}
  onUpdate={handleVerseUpdate}
  onOpenNote={setSidePanelVerse}
/>
```

This is good because it keeps child components presentation-focused.

### Props Issues To Improve

Avoid ambiguous props like:

```jsx
active
value
onChange
```

when the component has multiple possible states. Prefer descriptive props:

```jsx
isActive
isSelected
selectedValue
onSelectedValueChange
```

For production-ready reusable components, props should support:

- `aria-label` or visible label
- disabled/loading state
- semantic callback names
- children composition where possible
- stable IDs for labels/descriptions

### Recommended Prop Contract Example

```jsx
<MultiSelectActionBar
  selectedCount={selectedVerses.size}
  copied={copiedSelection}
  onCopy={copySelectedVerses}
  onSave={() => setShowFolderModal(true)}
  onCancel={clearSelection}
/>
```

This is production-friendly because it is small, explicit, reusable, and presentation-only.

---

## Accessibility Evaluation

### What Works

- Most controls are native `<button>` elements.
- Text contrast is generally strong in core reading surfaces.
- The app uses clear visual hierarchy and large touch targets in many mobile flows.

### Main Accessibility Gaps

1. Custom icon buttons often lack `aria-label`.
2. Dialogs need consistent `role="dialog"`, `aria-modal="true"`, and label/description IDs.
3. Escape-to-close behavior is not consistent across modals.
4. Focus trapping is not fully implemented for custom modals.
5. Some animated/floating controls need stronger keyboard focus rings.
6. Status changes should use `aria-live` where appropriate.

### Improvements Implemented

`MultiSelectActionBar` now includes:

- `role="toolbar"`
- accessible labels for each action
- `type="button"`
- focus rings
- `aria-live` for selected verse count
- hidden decorative icons from screen readers

`FolderSaveModal` now includes:

- generated label and description IDs
- Escape-key close handling
- dialog-ready structure support

---

## Loading States

### Current State

The app already uses skeleton loading in the reader:

```jsx
{loading ? (
  <SkeletonVerse />
) : (
  <VerseRow />
)}
```

This is good for perceived performance.

### Recommended Standard

Create shared loading components:

```jsx
<LoadingState label="Loading chapter" />
<EmptyState title="No notes yet" action={<Button>Add note</Button>} />
<ErrorState title="Couldn’t load chapter" action={<Button>Try again</Button>} />
```

This gives all pages consistent production behavior.

---

## Edge Cases

### Important Edge Cases To Handle

- Public user opens `/read` and user-owned progress write fails.
- Offline cache exists but IndexedDB read is slow or unavailable.
- Clipboard API is unavailable.
- Verse folder already contains all selected verses.
- Empty chapter response from external API.
- Unsupported translation code in URL.
- Modal opened on mobile with virtual keyboard.
- User navigates rapidly between chapters while requests are in flight.

### Recommended Pattern

Use request cancellation or stale-response guards in chapter loading hooks:

```js
let isCurrent = true;
const data = await loadChapter();
if (!isCurrent) return;
setVerses(data);
return () => { isCurrent = false; };
```

---

## Responsive Design

### What Works

- Core reader content uses mobile-friendly max widths and spacing.
- Bottom action bars account for viewport width.
- Navigation uses both side and bottom nav patterns.

### Improvements Needed

- Dialogs should consistently support small screens and keyboard-safe layouts.
- Floating controls should avoid overlapping audio controls and bottom navigation.
- Toolbar controls need wrapping/overflow strategy for very narrow devices.

---

## Production-Ready Implementation

### Added/Improved Components

#### `components/reader/MultiSelectActionBar.jsx`

Purpose:

- Reusable toolbar for selected verse actions.
- Presentation-only component with clear callbacks.
- Accessible toolbar semantics.

Usage:

```jsx
<MultiSelectActionBar
  selectedCount={selectedVerses.size}
  copied={copiedSelection}
  onCopy={copySelectedVerses}
  onSave={() => setShowFolderModal(true)}
  onCancel={() => {
    setSelectionMode(false);
    setSelectedVerses(new Set());
  }}
/>
```

#### `lib/verseCopy.js`

Purpose:

- Centralized copy formatting.
- Safe rich HTML clipboard output.
- Plain text fallback.

Usage:

```js
await copyVerseSelection({
  selectedNums,
  verses,
  book,
  chapter,
  translation,
});
```

---

## Recommended Usage Examples

### Reusable Empty State

```jsx
<EmptyState
  title="No saved verses yet"
  description="Select verses while reading and save them into folders."
  action={<Button>Start reading</Button>}
/>
```

### Accessible Icon Button

```jsx
<button
  type="button"
  aria-label="Open reader settings"
  className="focus:outline-none focus:ring-2 focus:ring-cyan/70"
>
  <Settings aria-hidden="true" />
</button>
```

### Accessible Dialog Shell

```jsx
<div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
  <h2 id={titleId}>Save to Folder</h2>
  <p id={descriptionId}>Choose where to save selected verses.</p>
</div>
```

---

## Final Assessment

The app has reusable UI foundations, strong visual design, and good loading foundations, but accessibility and production consistency need more standardization. The most important next step is to continue extracting route logic into hooks/components and adopt shared accessible primitives for dialogs, icon buttons, loading states, empty states, and errors.