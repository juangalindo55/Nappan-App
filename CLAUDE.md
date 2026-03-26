# CLAUDE.md - Nappan App Architecture & Guidelines

This file provides guidance to Claude Code when working with the **Nappan** repository.

## Project Overview
**Nappan** is a lifestyle brand app (Coffee, Lunch Box & Fitbar) built with pure HTML5, CSS3, and Vanilla JavaScript. 
**Status:** Recently refactored to a modular multi-page architecture for better maintenance.

## Running Locally
Start the local static server on port 8080:

```bash
# From project root (Windows)
.claude/serve.bat
Then open http://localhost:8080 in the browser.

Architecture & File Structure
The project has moved from a monolithic file to a Modular Multi-page structure.

index.html: Main landing page (Entry Point). Contains the navigation hub to all sections.

styles.css: Cleaned & Optimized. Contains global variables (colors, fonts) and shared layout rules. (Refactored: -300+ redundant lines removed).

script.js: Global logic handler.

goTo(page): Navigation router that points to independent HTML files.

initNappanBox(): Core cart and WhatsApp logic.

Section Pages (Independent Modules)
Each section is now a standalone file to simplify maintenance:

lunch-box.html: Dedicated section for Lunch Box products.

nappan-box.html: Dedicated section for Nappan Box curated selections.

protein-fit-bar.html: Dedicated section for Fit Bar and protein products.

nappan-app.html: Coffee & Experience section (In progress).

Page Pattern
Each section page is independent. To keep things fast and prevent "breaking the whole site," styles and scripts specific to a section can stay within their respective HTML, while sharing the global styles.css.

Design System (NAPPAN Brand)
Fonts: Playfair Display (Headings) + Lora (Body/Italic).

Colors: - Primary: #DAA520 (Gold)

Background: #1a1a1a (Dark)

Accents: #FFF8ED (Warm White), #2D1B0E (Deep Brown).

Principle: Minimalist, high-end "boutique" feel. Optimized for mobile 

WhatsApp Integration
The business phone number for orders is:
528123509768 (Format: 52 + number).

Development Rules
Clean CSS: Do not add redundant styles. Always check styles.css before adding new classes.

Modular Growth: If adding a new business line (e.g., "Bakery"), create a new bakery.html instead of adding it to index.html.

Navigation: Always update the goTo() function in script.js when adding new pages.