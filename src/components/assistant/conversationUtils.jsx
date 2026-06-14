export function getSemanticGroup(messages = []) {
  const text = messages.map(m => m.content || "").join(" ").toLowerCase();

  const groups = [
    { label: "Prayer & Intercession", words: ["prayer", "pray", "intercede", "healing", "burden", "answered", "journal"] },
    { label: "Bible Study", words: ["study", "theology", "doctrine", "meaning", "context", "passage", "verse", "scripture"] },
    { label: "Reading Guidance", words: ["read", "reading", "plan", "chapter", "book", "progress", "where do i read"] },
    { label: "Encouragement", words: ["strength", "encourage", "anxious", "fear", "peace", "persevere", "comfort"] },
    { label: "App Help", words: ["app", "veritas", "button", "download", "offline", "feature", "how do i"] },
  ];

  return groups.find(group => group.words.some(word => text.includes(word)))?.label || "Daily Reflection";
}

export function getConversationTitle(messages = []) {
  const firstUserMessage = messages.find(m => m.role === "user")?.content || "New conversation";
  const clean = firstUserMessage.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 45)}…` : clean;
}

export function getConversationSummary(messages = []) {
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content).join(" ");
  const clean = userMessages.replace(/\s+/g, " ").trim();
  return clean.length > 120 ? `${clean.slice(0, 117)}…` : clean;
}

export function withTimestamps(messages = []) {
  return messages.map(message => ({
    created_at: message.created_at || new Date().toISOString(),
    ...message,
  }));
}