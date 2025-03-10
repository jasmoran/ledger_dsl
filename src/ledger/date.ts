const FORMAT = Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  calendar: "gregory",
});

export function formatDate(date: Date): string {
  return FORMAT.format(date).replace(/\//g, "-");
}
