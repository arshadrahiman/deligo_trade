/**
 * Dynamically updates the browser favicon and page title
 * using the configured logo from Admin Config.
 * 
 * Supports:
 * - Custom Base64 image data URLs (uploaded logos)
 * - Custom image URLs (HTTPS links)
 * - Dynamic fallback brand favicon badge rendered via canvas
 */
export function updateDynamicFavicon(companySettings) {
  if (typeof document === 'undefined') return;

  try {
    let link =
      document.getElementById('dynamic-favicon') ||
      document.querySelector("link[rel*='icon']");

    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-favicon';
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const companyName = companySettings?.companyName || 'DELITRADE';

    // 1. If custom logo URL is present, apply it directly to favicon
    if (companySettings?.customLogoUrl && companySettings.customLogoUrl.trim()) {
      const url = companySettings.customLogoUrl.trim();
      const isSvg = url.includes('.svg') || url.startsWith('data:image/svg');
      link.type = isSvg ? 'image/svg+xml' : 'image/png';
      link.href = url;
    } else {
      // 2. Fallback: Dynamically generate high-DPI canvas badge favicon
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Rounded gold gradient rectangle
        const grad = ctx.createLinearGradient(0, 0, 64, 64);
        grad.addColorStop(0, '#f59e0b'); // amber-500
        grad.addColorStop(0.5, '#eab308'); // yellow-500
        grad.addColorStop(1, '#d97706'); // amber-600

        ctx.fillStyle = grad;
        const r = 14;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(64 - r, 0);
        ctx.quadraticCurveTo(64, 0, 64, r);
        ctx.lineTo(64, 64 - r);
        ctx.quadraticCurveTo(64, 64, 64 - r, 64);
        ctx.lineTo(r, 64);
        ctx.quadraticCurveTo(0, 64, 0, 64 - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();

        // Border highlight
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Monogram initials
        const initials =
          companyName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase() || 'DT';

        ctx.fillStyle = '#020617'; // slate-950
        ctx.font = 'bold 30px "JetBrains Mono", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 32, 34);

        link.type = 'image/png';
        link.href = canvas.toDataURL('image/png');
      }
    }

    // Also update document title to reflect company name
    if (companyName) {
      document.title = `${companyName} • Commercial Gym Machinery ERP`;
    }
  } catch (err) {
    console.error('Failed to update dynamic favicon:', err);
  }
}
