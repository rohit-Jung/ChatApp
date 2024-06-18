import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function chatHrefConstructor(chatHref1: string, chatHref2: string) {
  const sortedHref = [chatHref1, chatHref2].sort();
  return `${sortedHref[0]}--${sortedHref[1]}`;
}
