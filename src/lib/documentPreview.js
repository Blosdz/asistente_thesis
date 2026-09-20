/** The API returns semantic HTML; presentation belongs to the preview iframe. */
export function buildDocumentPreview(html) {
  if (!html) return '';
  const document = new DOMParser().parseFromString(html, 'text/html');
  const style = document.createElement('style');
  style.textContent = `
    html { background: #fff; color-scheme: light; }
    body { box-sizing: border-box; max-width: 880px; margin: 0 auto;
      padding: 56px clamp(24px, 7vw, 72px) 80px; background: #fff; color: #172033;
      font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.75;
      overflow-wrap: anywhere; }
    h1 { font-size: 28px; line-height: 1.3; margin: 0 0 32px; }
    h2 { font-size: 21px; line-height: 1.4; margin: 32px 0 16px; }
    h3,h4,h5,h6 { line-height: 1.5; margin: 24px 0 12px; }
    p { margin: 0 0 16px; text-align: justify; }
    img,svg { max-width: 100%; height: auto; }
    table { max-width: 100%; border-collapse: collapse; }
    td,th { border: 1px solid #cbd5e1; padding: 8px; }
    pre { white-space: pre-wrap; }
    ::selection { background: #dbeafe; }
    @media(max-width: 480px) { body { padding: 28px 20px; font-size: 15px; } h1 { font-size: 24px; } }
  `;
  document.head.append(style);
  document.documentElement.lang = 'es';
  return '<!doctype html>' + document.documentElement.outerHTML;
}
