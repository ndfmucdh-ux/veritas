# Clean Frontend Architecture Refactor

## Goal

Improve structure without changing reader behavior by separating concerns, reducing coupling, and moving reusable UI/business logic out of route files.

## New Folder Structure

```text
components/
  reader/
    MultiSelectActionBar.jsx      # Reusable selected-verse toolbar
    ReaderSettingsPanel.jsx       # Reader display preferences UI
    ReaderIconButton.jsx          # Accessible reusable reader toolbar button
    FolderSaveModal               # Save selected verses to folders
    VerseRow                      # Verse interaction row
    ChapterNavigator              # Book/chapter/translation navigation
hooks/
  useVerseSelection.js            # Selection mode, selected verses, copy behavior
lib/
  verseCopy.js                    # Clipboard formatting and HTML escaping
docs/
  CLEAN_FRONTEND_ARCHITECTURE_REFACTOR.md
```

## Architecture Description

### Before

`pages/Read` owned too many responsibilities:

- Reader state
- Settings UI
- Verse selection state
- Copy formatting
- Toolbar rendering
- Folder modal orchestration
- Chapter rendering

This made the route component harder to maintain and increased the chance of regressions.

### After

The reader route now delegates focused responsibilities:

- `useVerseSelection` owns selection state and copy actions.
- `ReaderSettingsPanel` owns reader preference controls.
- `ReaderIconButton` owns accessible toolbar button behavior.
- `MultiSelectActionBar` owns selected-verse action UI.
- `verseCopy` owns clipboard payload formatting and escaping.

`pages/Read` remains the orchestration layer, while reusable concerns live in focused modules.

## Props Design

### `ReaderSettingsPanel`

```jsx
<ReaderSettingsPanel
  open={showSettings}
  fontSize={fontSize}
  setFontSize={setFontSize}
  fontFamily={fontFamily}
  setFontFamily={setFontFamily}
  showNumbers={showNumbers}
  setShowNumbers={setShowNumbers}
  oledMode={oledMode}
  setOledMode={setOledMode}
/>
```

### `useVerseSelection`

```js
const {
  selectionMode,
  selectedVerses,
  copiedSelection,
  selectedVerseRefs,
  clearSelection,
  toggleSelectionMode,
  toggleVerseSelection,
  copySelectedVerses,
} = useVerseSelection({ verses, book, chapter, translation });
```

### `MultiSelectActionBar`

```jsx
<MultiSelectActionBar
  selectedCount={selectedVerses.size}
  copied={copiedSelection}
  onCopy={copySelectedVerses}
  onSave={() => setShowFolderModal(true)}
  onCancel={clearSelection}
/>
```

## Implementation Notes

- Behavior remains unchanged.
- Existing optimistic UI updates are preserved.
- Existing route paths and visual design are preserved.
- Clipboard output remains the same but is now centralized and escaped.
- Settings controls now live in a focused, reusable component.
- Reader toolbar buttons now use a focused accessible component.
- Verse selection logic now lives in a focused hook.

## Next Clean Architecture Steps

1. Extract chapter loading into `hooks/useChapterLoader.js`.
2. Extract annotation loading into `hooks/useVerseAnnotations.js`.
3. Extract the top reader toolbar into `components/reader/ReaderToolbar.jsx`.
4. Replace legacy annotation reads with canonical `UserVerseInteraction` reads after migration validation.
5. Add shared `LoadingState`, `ErrorState`, and `EmptyState` components.