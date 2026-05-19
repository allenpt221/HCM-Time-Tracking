import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const TIMEZONES = [
  { label: "Asia/Manila — PHT (UTC+8)",        value: "Asia/Manila" },
  { label: "Asia/Singapore — SGT (UTC+8)",     value: "Asia/Singapore" },
  { label: "Asia/Kuala_Lumpur — MYT (UTC+8)",  value: "Asia/Kuala_Lumpur" },
  { label: "Asia/Hong_Kong — HKT (UTC+8)",     value: "Asia/Hong_Kong" },
  { label: "Asia/Taipei — CST (UTC+8)",        value: "Asia/Taipei" },
  { label: "Asia/Shanghai — CST (UTC+8)",      value: "Asia/Shanghai" },
  { label: "Asia/Tokyo — JST (UTC+9)",         value: "Asia/Tokyo" },
  { label: "Asia/Seoul — KST (UTC+9)",         value: "Asia/Seoul" },
  { label: "Asia/Jakarta — WIB (UTC+7)",       value: "Asia/Jakarta" },
  { label: "Asia/Bangkok — ICT (UTC+7)",       value: "Asia/Bangkok" },
  { label: "Asia/Ho_Chi_Minh — ICT (UTC+7)",  value: "Asia/Ho_Chi_Minh" },
  { label: "Asia/Kolkata — IST (UTC+5:30)",    value: "Asia/Kolkata" },
  { label: "Asia/Dubai — GST (UTC+4)",         value: "Asia/Dubai" },
  { label: "Australia/Sydney — AEDT (UTC+11)", value: "Australia/Sydney" },
  { label: "Pacific/Auckland — NZST (UTC+12)",value: "Pacific/Auckland" },
  { label: "Europe/London — GMT (UTC+0)",      value: "Europe/London" },
  { label: "Europe/Paris — CET (UTC+1)",       value: "Europe/Paris" },
  { label: "America/New_York — EST (UTC-5)",   value: "America/New_York" },
  { label: "America/Chicago — CST (UTC-6)",    value: "America/Chicago" },
  { label: "America/Denver — MST (UTC-7)",     value: "America/Denver" },
  { label: "America/Los_Angeles — PST (UTC-8)",value: "America/Los_Angeles" },
  { label: "UTC",                              value: "UTC" },
]