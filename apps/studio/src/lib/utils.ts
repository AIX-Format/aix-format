import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import yaml from 'js-yaml'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseYamlLight(str: string): Record<string, unknown> {
  return yaml.load(str) as Record<string, unknown>;
}
