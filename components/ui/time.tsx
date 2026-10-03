import { formatDate, formatDateTime, formatTime } from "@/lib/format/date";

type TimeProps = { value: Date; format?: "date" | "time" | "datetime"; timeZone?: string; className?: string };

/** Every rendered time names its IANA zone and offset (manual 11.2). */
export function Time({ value, format = "date", timeZone, className }: TimeProps) {
  const text = format === "date" ? formatDate(value, timeZone) : format === "time" ? formatTime(value, timeZone) : formatDateTime(value, timeZone);
  return (
    <time dateTime={value.toISOString()} className={className}>
      {text}
    </time>
  );
}
