// Shared look and delivery for every email the app sends.
// One layout (dark card, hero photo, gold seal, serif quote, gold pill button), one sender name, one set of links.
// Emails go out through the app's built-in SendEmail integration, so they use integration credits.

export const APP_URL = "https://luxveritas.app";
export const APP_HOST = "luxveritas.app";
export const BRAND = "Veritas";
export const FROM_NAME = "Veritas";
export const LOGO = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/fd35789be_IMG_1831.jpeg";
const GOLD = "#d9b77e";

// Real links into the app (the app uses normal paths, never "#/").
export const appLink = (path = "/") => `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
export const readLink = (book?: string, chapter?: number | string, verse?: number | string, translation?: string) => {
  const q = new URLSearchParams();
  if (book) q.set("book", book);
  if (chapter) q.set("chapter", String(chapter));
  if (verse) q.set("verse", String(verse));
  if (translation) q.set("translation", translation);
  const s = q.toString();
  return appLink(`/read${s ? `?${s}` : ""}`);
};

export const esc = (v: unknown) => String(v ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const HERO = {
  hope: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900&q=80",
  faith: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80",
  love: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&q=80",
  peace: "https://images.unsplash.com/photo-1439405328-88d5d2a8f36d?w=900&q=80",
  strength: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80",
  wisdom: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
  grace: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  courage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80",
  joy: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=900&q=80",
  prayer: "https://images.unsplash.com/photo-1545730344-26c5815483f2?w=900&q=80",
  purpose: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=900&q=80",
  default: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
} as Record<string, string>;
export const heroFor = (theme?: string) => HERO[String(theme || "").toLowerCase()] || HERO.default;

type Stat = { label: string; value: string | number };
export type EmailOptions = {
  lang?: string;
  chip: string;              // e.g. "📖 VERSÍCULO DEL DÍA"
  hero?: string;             // image url
  title?: string;            // greeting line above the card
  quote?: string;            // italic serif text inside the card
  quoteRef?: string;         // gold reference under the quote
  paragraphs?: string[];     // normal text under the quote
  note?: { label: string; text: string }; // optional second card (reflection)
  stats?: Stat[];
  cta: { label: string; url: string };
  footerTag: string;         // "Veritas — Verse of the Day"
  sentLine?: string;         // "Sent automatically each morning"
  manageLabel?: string;      // link to notification settings
};

const SENT: Record<string, string> = {
  en: "Sent automatically", es: "Enviado automáticamente", fr: "Envoyé automatiquement", pt: "Enviado automaticamente", de: "Automatisch gesendet",
};
const MANAGE: Record<string, string> = {
  en: "Manage reminders", es: "Administrar recordatorios", fr: "Gérer les rappels", pt: "Gerenciar lembretes", de: "Erinnerungen verwalten",
};

// Table layout so it renders in Gmail, Apple Mail and Outlook; bgcolor fallbacks keep dark mode readable.
export function renderEmail(o: EmailOptions): string {
  const lang = o.lang || "en";
  const serif = "Georgia,'Times New Roman',serif";
  const sans = "Helvetica,Arial,sans-serif";
  const year = new Date().getFullYear();
  const paras = (o.paragraphs || []).map((p) =>
    `<p style="margin:0 0 12px;font-family:${serif};font-size:15px;line-height:1.7;color:#d8cdb8;">${esc(p)}</p>`).join("");
  const stats = (o.stats || []).length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;"><tr>${
    (o.stats || []).map((s) => `<td align="center" style="padding:10px 4px;"><div style="font-family:${serif};font-size:26px;font-weight:bold;color:${GOLD};">${esc(s.value)}</div><div style="font-family:${sans};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8d836f;margin-top:4px;">${esc(s.label)}</div></td>`).join("")
  }</tr></table>` : "";
  const quote = o.quote ? `<p style="margin:0 0 18px;font-family:${serif};font-size:21px;line-height:1.65;font-style:italic;color:#f3ead8;">&ldquo;${esc(o.quote)}&rdquo;</p>` : "";
  const ref = o.quoteRef ? `<p style="margin:0;font-family:${sans};font-size:13px;font-weight:bold;letter-spacing:2.5px;text-transform:uppercase;color:${GOLD};">&mdash; ${esc(o.quoteRef)}</p>` : "";
  const note = o.note ? `<tr><td style="padding:0 22px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1b160f;border:1px solid #3a2f1d;border-radius:16px;"><tr><td style="padding:18px 20px;"><div style="font-family:${sans};font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${GOLD};margin-bottom:8px;">${esc(o.note.label)}</div><div style="font-family:${serif};font-size:15px;line-height:1.7;color:#d8cdb8;">${esc(o.note.text)}</div></td></tr></table></td></tr>` : "";
  const title = o.title ? `<tr><td align="center" style="padding:6px 28px 14px;font-family:${serif};font-size:22px;line-height:1.35;color:#f3ead8;">${esc(o.title)}</td></tr>` : "";
  const card = (quote || ref || paras || stats) ? `<tr><td style="padding:0 22px 22px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1c1710" style="background:#1c1710;border:1px solid #3a2f1d;border-radius:22px;"><tr><td align="center" style="padding:30px 24px;">${quote}${ref}${paras}${stats}</td></tr></table></td></tr>` : "";

  return `<!DOCTYPE html><html lang="${esc(lang)}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(o.chip.replace(/^[^\p{L}\p{N}]+/u, ""))}</title></head>
<body style="margin:0;padding:0;background:#0b0907;" bgcolor="#0b0907"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0b0907" style="background:#0b0907;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" bgcolor="#14110c" style="width:100%;max-width:480px;background:#14110c;border:1px solid #4a3b22;border-radius:28px;overflow:hidden;">
<tr><td style="padding:0;line-height:0;"><img src="${esc(o.hero || HERO.default)}" alt="" width="480" style="display:block;width:100%;height:210px;object-fit:cover;"></td></tr>
<tr><td align="center" style="padding:0 24px;"><div style="margin-top:-46px;display:inline-block;background:#14110c;border:3px solid ${GOLD};border-radius:50%;padding:3px;"><img src="${LOGO}" alt="${BRAND}" width="78" height="78" style="display:block;border-radius:50%;"></div></td></tr>
<tr><td align="center" style="padding:16px 24px 18px;font-family:${sans};font-size:12px;font-weight:bold;letter-spacing:4px;text-transform:uppercase;color:${GOLD};">${esc(o.chip)}</td></tr>
${title}${card}${note}
<tr><td align="center" style="padding:6px 24px 30px;"><a href="${esc(o.cta.url)}" style="display:inline-block;background:${GOLD};background-image:linear-gradient(135deg,#c9a45f,#f0d9a6);color:#1a1408;font-family:${sans};font-size:16px;font-weight:bold;padding:16px 40px;border-radius:40px;text-decoration:none;">${esc(o.cta.label)} &rarr;</a></td></tr>
<tr><td align="center" style="padding:24px 24px 28px;border-top:1px solid #2a2216;"><img src="${LOGO}" alt="${BRAND}" width="44" height="44" style="display:inline-block;border-radius:50%;border:2px solid #4a3b22;"><div style="font-family:${sans};font-size:14px;color:#a39880;margin-top:12px;"><b>${BRAND}</b> &mdash; ${esc(o.footerTag)}</div><div style="margin-top:6px;"><a href="${APP_URL}" style="font-family:${sans};font-size:14px;color:${GOLD};text-decoration:none;">${APP_HOST}</a></div><div style="font-family:${sans};font-size:12px;color:#6f664f;margin-top:10px;">${esc(o.sentLine || SENT[lang] || SENT.en)} &middot; &copy; ${year} ${BRAND}</div><div style="margin-top:8px;"><a href="${appLink("/notification-studio")}" style="font-family:${sans};font-size:12px;color:#8d836f;text-decoration:underline;">${esc(o.manageLabel || MANAGE[lang] || MANAGE.en)}</a></div></td></tr>
</table></td></tr></table></body></html>`;
}

// Sends through the app's SendEmail integration (integration credits), always as the app brand.
// Returns true when the email was accepted; false when the address cannot be reached.
export async function sendBrandedEmail(base44: any, args: {
  to: string; subject: string; html: string; category?: "marketing" | "transactional";
}): Promise<boolean> {
  const res = await base44.asServiceRole.integrations.Core.SendEmail({
    to: args.to,
    from_name: FROM_NAME,
    subject: args.subject,
    html: args.html,
    category: args.category || "transactional",
  });
  return res?.success !== false;
}

export const firstNameOf = (name?: string, fallback = "") => String(name || "").trim().split(/\s+/)[0] || fallback;