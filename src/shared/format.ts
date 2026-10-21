export function formatInr(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return value;
  }
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export function formatWhen(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
