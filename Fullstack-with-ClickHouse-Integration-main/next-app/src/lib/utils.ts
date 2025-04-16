import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatString(s: string) {
  let r = "";
  const regex = new RegExp("[^\\d\\w]+");
  for (let i of s) {
    if (i == "_" || regex.test(i)) {
      r += " ";
    } else {
      r += i;
    }
  }
  return r;
}
