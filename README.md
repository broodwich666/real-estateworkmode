# Zad's REFLASHAPP Work Mode v2

Upload the contents of this folder to the root of the existing `real-estateworkmode` repository.

New:
- Brain combines the chapter library, raw course notes, and flashcard index.
- Vault stores photos, PDFs, documents, audio, video, and other files locally on the device.
- Rentals, Sales, Clients, Properties, Tasks, and Showing Checklists remain included.

Vault files are not uploaded to GitHub. Clearing browser website data can remove local Vault files.

## Apps in this repo

**Work Mode (repo root / GitHub Pages)**  
The existing static PWA stays at the root: `index.html`, `app.js`, `data.js`, `styles.css`, `sw.js`, `manifest.json`. GitHub Pages behavior is unchanged.

**Rental Match CRM (`crm/`)**  
An additive Next.js + SQLite app for matching rental clients to listings. It does not replace Work Mode.

```bash
cd crm && npm install && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). CRM details are in `crm/README.md`. CRM inventory comes from manual entry, CSV, or a future licensed MLS Grid feed — not scraping.
