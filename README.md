# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Google Maps Setup (FarmToHome)

If the location picker shows a gray map with "This page didn't load Google Maps correctly", the API key is missing, invalid, or restricted.

1. Open `.env` and set a real browser key:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_real_key...
```

2. In Google Cloud, enable these APIs for the same project:
- Maps JavaScript API
- Places API
- Geocoding API

3. Add allowed HTTP referrers for your key restrictions:
- `http://localhost:5173/*`
- Your production domain (for example `https://farmtohome.in/*`)

4. Ensure billing is enabled on the Google Cloud project.

5. Restart Vite after updating `.env`:

```bash
npm run dev
```
