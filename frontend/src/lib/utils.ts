import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const TIMEZONES = [
  { label: "Manila (PHT)", value: "Asia/Manila", offset: "+08:00" },
  { label: "Singapore (SGT)", value: "Asia/Singapore", offset: "+08:00" },
  { label: "Kuala Lumpur (MYT)", value: "Asia/Kuala_Lumpur", offset: "+08:00" },
  { label: "Hong Kong (HKT)", value: "Asia/Hong_Kong", offset: "+08:00" },
  { label: "Taipei (CST)", value: "Asia/Taipei", offset: "+08:00" },
  { label: "Shanghai (CST)", value: "Asia/Shanghai", offset: "+08:00" },

  { label: "Tokyo (JST)", value: "Asia/Tokyo", offset: "+09:00" },
  { label: "Seoul (KST)", value: "Asia/Seoul", offset: "+09:00" },

  { label: "Jakarta (WIB)", value: "Asia/Jakarta", offset: "+07:00" },
  { label: "Bangkok (ICT)", value: "Asia/Bangkok", offset: "+07:00" },
  { label: "Ho Chi Minh (ICT)", value: "Asia/Ho_Chi_Minh", offset: "+07:00" },

  { label: "Kolkata (IST)", value: "Asia/Kolkata", offset: "+05:30" },
  { label: "Dubai (GST)", value: "Asia/Dubai", offset: "+04:00" },

  { label: "Sydney (AEDT)", value: "Australia/Sydney", offset: "+11:00" },
  { label: "Auckland (NZST)", value: "Pacific/Auckland", offset: "+12:00" },

  { label: "London (GMT)", value: "Europe/London", offset: "+00:00" },
  { label: "Paris (CET)", value: "Europe/Paris", offset: "+01:00" },

  { label: "New York (EST)", value: "America/New_York", offset: "-05:00" },
  { label: "Chicago (CST)", value: "America/Chicago", offset: "-06:00" },
  { label: "Denver (MST)", value: "America/Denver", offset: "-07:00" },
  { label: "Los Angeles (PST)", value: "America/Los_Angeles", offset: "-08:00" },

  { label: "UTC", value: "UTC", offset: "+00:00" },
];