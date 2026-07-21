# Tween Portfolio

A modern portfolio website for a Software Engineering student seeking internships and entry-level developer opportunities.

## Stack

- React + Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Framer Motion
- React Icons

## Project Structure

```text
src/
  assets/
  components/
  data/
  hooks/
  layouts/
  pages/
  routes/
  styles/
  App.jsx
  main.jsx
```

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Customization

Most portfolio content lives in `src/data/siteData.js`. Update the profile name, contact links, projects, skills, education, certifications, and resume details there. Replace `public/resume.txt` with your final resume file when ready.

## Deployment Guide

### Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Use the default Vite settings.
4. Build command: `npm run build`.
5. Output directory: `dist`.

### Netlify

1. Push the project to GitHub.
2. Add a new site from Git.
3. Build command: `npm run build`.
4. Publish directory: `dist`.

### GitHub Pages

1. Install the Pages helper:

```bash
npm install -D gh-pages
```

2. Add these scripts to `package.json`:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

3. If deploying under a repository subpath, set `base` in `vite.config.js`.
4. Run:

```bash
npm run deploy
```
