// =====================================================
// DATE FORMATTING
// =====================================================

// Format date-only values such as:
// 2026-09-11 -> 11/09/2026
export function formatDate(date) {
  if (!date) return "—";

  const value = String(date);

  // Handle YYYY-MM-DD without timezone shifting
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");

    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}


// Format date + time for messages
// Example:
// 2026-09-11T14:30:00Z
// -> 11/09/2026, 08:00 PM
export function formatDateTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}