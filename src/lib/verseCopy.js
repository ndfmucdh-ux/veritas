const escapeHtml = (value) => String(value).replace(/[&<>"]/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
}[char]));

const getGroupedVerseLabel = (selectedNums) => {
  if (selectedNums.length === 1) return `${selectedNums[0]}`;

  const isContiguous = selectedNums.every((num, index) => index === 0 || num === selectedNums[index - 1] + 1);
  return isContiguous ? `${selectedNums[0]}-${selectedNums[selectedNums.length - 1]}` : selectedNums.join(", ");
};

export const buildVerseSelectionCopyPayload = ({ selectedNums, verses, book, chapter, translation }) => {
  const orderedNums = [...selectedNums].sort((a, b) => a - b);
  const selectedVerseData = orderedNums
    .map(num => verses.find(v => v.verse === num))
    .filter(Boolean);

  const reference = `${book} ${chapter}:${getGroupedVerseLabel(orderedNums)} · ${translation}`;
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const body = selectedVerseData.map(v => `${v.verse}. ${v.text}`).join("\n");
  const plainText = `${reference}\n${date} at ${time}\n\n${body}`;
  const htmlBody = selectedVerseData
    .map(v => `<p style="margin: 0 0 10px; color: #ffffff; font-size: 19px; text-decoration: none;"><span style="color: #fbbf24; font-weight: 700; margin-right: 8px; text-decoration: none;">${v.verse}</span>${escapeHtml(v.text)}</p>`)
    .join("");
  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #ffffff; background: #000000; line-height: 1.55; text-decoration: none;">
    <p style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none;">${escapeHtml(reference)}</p>
    <p style="margin: 0 0 18px; color: #d1d5db; font-size: 13px; text-decoration: none;">${escapeHtml(date)} · ${escapeHtml(time)}</p>
    ${htmlBody}
  </div>`;

  return { plainText, html };
};

export const copyVerseSelection = async (args) => {
  const { plainText, html } = buildVerseSelectionCopyPayload(args);

  if (navigator.clipboard?.write && window.ClipboardItem) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([plainText], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      })
    ]);
    return;
  }

  await navigator.clipboard?.writeText(plainText);
};