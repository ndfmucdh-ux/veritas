/**
 * Deep link handler for prayer push notifications
 * When a user taps a prayer notification, navigate to the prayer journal entry
 */
export const createPrayerDeepLink = (prayerId) => {
  return `/prayer-journal?entry=${prayerId}`;
};

export const handlePrayerNotificationTap = (prayerId) => {
  const url = createPrayerDeepLink(prayerId);
  window.location.href = url;
};

export const getPrayerIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("entry");
};