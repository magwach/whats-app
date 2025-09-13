export default function formatDate(date_ms: number | null) {
  if (date_ms === null) return "";
  const date = new Date(date_ms); // Directly convert ms to Date
  const now = new Date();

  // Reset time for date-only comparison
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  // 1️⃣ Today → show time
  if (dateOnly.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // 2️⃣ Yesterday → "Yesterday"
  if (dateOnly.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // 3️⃣ Last 7 days → show weekday
  const diffInDays = Math.floor(
    (today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffInDays > 0 && diffInDays < 7) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dateOnly.getDay()];
  }

  // 4️⃣ Else → MM/DD/YYYY
  return `${
    dateOnly.getMonth() + 1
  }/${dateOnly.getDate()}/${dateOnly.getFullYear()}`;
}
