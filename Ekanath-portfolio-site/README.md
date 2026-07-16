# Ekanath Anehosur Portfolio

This is a static portfolio website. Open `index.html` in a browser to preview it.

## Edit These First

- `index.html`: personal details, education, project descriptions, skills, interests, future goal, and contact details
- `styles.css`: colors, spacing, layout, and responsive design
- `assets/portfolio-hero.png`: hero background image

## Current Sections

- Home
- About Me
- Education
- Projects
- Skills
- Interests
- Future Goal
- Contact

## Profile Focus

The content is balanced between Full Stack Development and Cloud & DevOps. It presents Ekanath as a Computer Science Engineering graduate with hands-on project experience and a long-term goal of becoming a Cloud Architect.

## Make It Public

Use any static hosting service:

- GitHub Pages
- Netlify
- Vercel

Upload the full `portfolio-site` folder or connect it to a Git repository. The public entry file is `index.html`.

After publishing, add the final public URL to Google Search Console and request indexing. Google can index this site only after it is hosted on a public URL; local files on this computer are not searchable.

## Contact Backend

The contact form keeps the same `/contact` endpoint. To run the secure FastAPI backend locally:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Copy `backend/.env.example` values into your hosting environment and set your real SMTP details there. The backend includes validation, a honeypot field, basic spam checks, rate limiting, CORS origin control, and security headers.
