# TrueNotify — Frontend

React + Vite version of the TrueNotify dashboard (ported from the original `ui/` HTML/CSS/JS, same styling and layout).

## Run

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The backend URL defaults to `http://localhost:8000` and can be changed at runtime on the **Settings** page.

Other scripts: `npm run build` (production build to `dist/`), `npm run preview` (serve the build), `npm run lint`.

## Structure

```
src/
  main.jsx                 entry — loads Leaflet CSS, then our styles, then <App/>
  App.jsx                  providers + pill nav + all pages
  api/client.js            fetch wrapper (reads the current backend URL per request)
  context/
    SettingsContext.jsx    backend URL / user id, exposes the API client
    ToastContext.jsx       toast()
    SessionContext.jsx     session notifications + actions (loadMessages, clearInbox, …)
    sessionReducer.js      pure reducer for session state
  hooks/
    useDriveSimulator.js   drive-sim engine (timers, queues, packets, event log)
  pages/                   one component per page; drive/ and geo/ have sub-components
  components/
    common/                Page, EmptyState, SectionHeader, PriorityTag, NotificationCard
    layout/                PillNav, Toast
  constants/               routes, presets, lookups, geo seed zones
  utils/                   classifiers, route geometry, geo-zone helpers, time
  styles/                  global CSS split by section — import order in index.css matters
```

### Notes

- All pages stay mounted and are toggled with the `.page.active` class (as in the original), so a running drive simulation and form input survive navigation.
- Styles are plain global CSS, split from the original `styles.css` section by section. `styles/index.css` imports them in the original order; don't reorder, since the cascade depends on it.
- The Geo map uses Leaflet directly. The "Add Zone" form is rendered into the Leaflet popup with a React portal.
