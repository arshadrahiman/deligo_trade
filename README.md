# Delitrade - Commercial Gym & Warehouse Equipment Supply (React.js Edition)

A high-performance **React.js + Vite + Tailwind CSS** platform for commercial fitness equipment wholesale, warehousing, and B2B quotation / sales invoicing in Dubai and the UAE.

---

## 🌐 GitHub Pages Deployment

This repository is pre-configured for automated and manual deployment to **GitHub Pages**:

- **Live Storefront URL:** **[https://arshadrahiman.github.io/deligo_trade/](https://arshadrahiman.github.io/deligo_trade/)**
- **Admin Portal URL:** **[https://arshadrahiman.github.io/deligo_trade/#admin](https://arshadrahiman.github.io/deligo_trade/#admin)**
- **Relative Asset Base (`base: './'`)**: Works out-of-the-box on `https://arshadrahiman.github.io/deligo_trade/` or custom domains.
- **SPA 404 Routing Fallback (`404.html`)**: Automatically created on build so refreshing sub-routes like `/#admin` or direct URLs loads smoothly.
- **GitHub Actions Automated Deployment**: Every push to `main` automatically triggers `.github/workflows/deploy.yml` to build and deploy to GitHub Pages.

### Enabling GitHub Pages on GitHub:
1. Go to your repository on GitHub: [https://github.com/arshadrahiman/deligo_trade/settings/pages](https://github.com/arshadrahiman/deligo_trade/settings/pages)
2. Under **Build and deployment** → **Source**, select:
   - **GitHub Actions** (recommended — zero config, runs automatically on every `git push`).
   - *Or* select **Deploy from a branch** and choose `gh-pages` if deploying via `npm run deploy`.

---

## 🚀 Development & Deployment Commands

```bash
# 1. Start local dev server (port 3000)
npm run dev

# 2. Build for production (compiles assets and generates 404.html fallback)
npm run build

# 3. Preview production build locally
npm run preview

# 4. Manual deploy to gh-pages branch (optional alternative to GitHub Actions)
npm run deploy
```

---

## 🔐 Admin Portal Access Details

The Admin Portal is **completely unlisted and hidden** from the storefront (no buttons in header, navigation bar, or footer). It is accessible exclusively by visiting the direct link:

- **Local Admin Path:** `http://localhost:3000/#admin`
- **GitHub Pages Admin Path:** `https://arshadrahiman.github.io/deligo_trade/#admin`

---

## 🛠 Features & Capabilities

### 1. Storefront (Public)
- **Zero Admin Footprint:** No admin links in navbar, mobile menu, or footer.
- **Top Announcement Marquee:** Warehouse direct stock, 5% UAE VAT, and factory direct pricing.
- **Header & Responsive Navigation:** Catalog, Services, About, Support, and animated Cart CTA.
- **4 Feature Pillars:** Industrial gym equipment branding, certified stations, 10,500 sq ft warehouse in Al Muteena.
- **Real-Time Live Search:** Autocomplete suggestions dropdown by product name, model code (`LP-045`, `B072`), and trending chips.
- **Commercial Catalog (82 Machines):** Plate Loaded, Strength & Cables, Cardio, Free Weights, and Core & Specialty with specifications and pricing.
- **Cart & Commercial Quotation Generator:** Interactive line items, 5% UAE VAT, Dirhams & Fils words conversion, and wire transfer bank details.
- **PDF Download & Print:** Instant client-side PDF export (`jsPDF`) and native browser print styles.
- **Full Touch Optimization:** Responsive for all screen sizes (mobile, tablet, desktop) with multi-finger and gesture pinch-to-zoom disabled.

### 2. Administrator Portal
- **Standalone Login Page:** Clean, focused login with no storefront navigation or banners.
- **Created Quotes & Sales Invoices:** Search, filter, view, and download all generated customer bills.
- **Convert Quotation to Sales Invoice:** Automatic generation of tax invoice numbers (`INV-2026-XXX`).
- **Interactive Bill Preview & Price Override:**
  - **Admin-Only Price Modification:** Admins can manually override unit prices on any line item before generating the sales invoice.
  - Compares catalog price vs. custom negotiated price with discount percentage calculation.
- **Terms & Conditions Template Selector (Mandatory):** Select and edit 2 customizable T&C templates before finalizing invoices.
- **Dynamic "+ Add Additional Charge" Button:** Add custom fields for site delivery, turnkey assembly, rubber matting, or logistics fees in real time.
- **Product & Stock Management (CRUD + Qty):** Add, update, and delete machinery; quick inline stock quantity modifiers (`+` / `-`).
- **Logo & Branding Customizer:** Upload a custom logo or use the default typography logo.
- **Bank Details Manager:** Add and edit company bank accounts for wire transfers (ADCB, FAB, Emirates NBD).
