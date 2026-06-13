# Clean Architecture Refactor — Current Bible App

## Refactor Completed

### Profile page decomposition
The large `pages/Profile` route has started moving toward a cleaner component architecture:

```text
components/profile/
  ProfileStatsRow.jsx
  ProfileTabBar.jsx
pages/
  Profile
```

### What changed
- Extracted the profile quick metrics row into `ProfileStatsRow`.
- Extracted profile tab navigation into `ProfileTabBar`.
- Removed tab constants and tab icon mapping from the page route.
- Preserved existing behavior, visual styling, admin-only email tab visibility, and data flow.
- Added basic accessible tab semantics to the extracted profile tab bar.

## Target Folder Structure

```text
components/profile/
  ProfileHeader.jsx
  ProfileStatsRow.jsx
  ProfileTabBar.jsx
  ProfileOverviewTab.jsx
  ProfileLibraryTab.jsx
  ProfileInsightsTab.jsx
  ProfileReadingTab.jsx
  ProfileSettingsTab.jsx
  rows/
    LibraryRow.jsx
    SettingLink.jsx
    ToggleRow.jsx
    NotifTimeRow.jsx
```

## Architecture Direction
- `pages/Profile` should become orchestration only: data loading, selected tab state, and handler wiring.
- Presentational components should receive explicit props and avoid direct entity calls.
- Data-heavy dashboard sections can later move to a backend aggregation function if needed.

## Next Recommended Refactor
1. Extract `ProfileHeader`.
2. Extract each tab into its own file.
3. Move reusable row components out of `pages/Profile`.
4. Add accessible tab semantics to `ProfileTabBar`.