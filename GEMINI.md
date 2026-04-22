# GEMINI.md - Instructional Context for Suvam Mondal's Portfolio Website

## Project Overview
This project is a personal portfolio website for **Suvam Mondal**, a Data Analyst specializing in Healthcare, BI, and AI. The website is a single-page application (SPA) that features a modern, interactive interface, including an AI-powered chat assistant.

- **Primary Technologies:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla ES6+).
- **Backend/AI:** A Cloudflare Worker (`https://suvambot.mondal-suvam3.workers.dev`) handles the AI chat logic.
- **Hosting:** GitHub Pages (deployed from the `HBD.github.io` directory).
- **Domain:** [suvam.co.in](https://suvam.co.in) (configured via `CNAME`).

## Directory Structure and Key Files
- `HBD.github.io/index.html`: The main entry point containing the site structure, bio, experience highlights, and skills.
- `HBD.github.io/style.css`: Comprehensive styling, including dark mode support (via `:root` variables and `.dark` class), animations, and responsive design.
- `HBD.github.io/script.js`: Handles all client-side logic, including page navigation, dark mode toggling, the loading screen, and the AI chat interface.
- `HBD.github.io/resume_k.pdf`: The current resume available for download.
- `HBD.github.io/CNAME`: Custom domain configuration for GitHub Pages.
- `HBD.github.io/Photo_self.jpg` & `HBD.github.io/face.jpeg`: Profile and avatar images.

## Building and Running
As this is a pure static website with no build system or external dependencies, there is no build step required.

- **Local Development:** To preview the site locally, serve the `HBD.github.io` directory using any static file server:
  - `python3 -m http.server 8000 --directory HBD.github.io`
  - `npx serve HBD.github.io`
- **Testing:** Manually verify the chat interface and responsiveness in modern browsers (Chrome, Safari, Firefox).

## Development Conventions
- **Vanilla Approach:** The project intentionally avoids frameworks (like React or Tailwind) to maintain simplicity and performance.
- **Mobile-First Design:** The layout is optimized for mobile devices with a bottom navigation bar and touch-friendly elements.
- **Dark Mode:** System or user-toggled dark mode is implemented using CSS variables.
- **SPA Behavior:** Navigation between "Experience", "Skills", and "Home" is handled via CSS transitions (`transform: translateX`) and JavaScript visibility toggles to avoid full page reloads.
- **AI Integration:** The chat assistant communicates with a Cloudflare Worker. Any changes to the chat logic would likely require updates to both `script.js` and the external Worker script.

## Roadmap & TODOs
- [ ] Implement actual contact form or link to email.
- [ ] Add more projects/case studies section.
- [ ] Update resume when new experience is gained.
