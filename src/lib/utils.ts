import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatUSDC(amount: number): string {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount < 1 ? 2 : 0,
    maximumFractionDigits: 2
  })} USDC`;
}

export function shortAddress(address?: string): string {
  if (!address) {
    return "Not issued";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}
