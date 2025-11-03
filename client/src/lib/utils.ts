/**
 * Utility Functions
 * 
 * Provides utility functions used throughout the client application.
 * 
 * @fileoverview
 * This file contains:
 * - CSS class name merging utility (cn function)
 * - Other shared utility functions
 * 
 * @author Lindsey Stead
 * @module client/lib/utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges CSS class names with Tailwind CSS conflict resolution.
 * 
 * This utility combines clsx (conditional class names) with tailwind-merge
 * (Tailwind class conflict resolution). When multiple Tailwind classes conflict
 * (e.g., "p-4" and "p-8"), only the last one is kept.
 * 
 * @param inputs - Variable number of class name arguments (strings, objects, arrays)
 * @returns {string} Merged and deduplicated class name string
 * 
 * @example
 * // Basic usage
 * cn("text-red-500", "text-blue-500") // Returns "text-blue-500" (conflict resolved)
 * 
 * // Conditional classes
 * cn("base-class", isActive && "active-class", isDisabled && "disabled-class")
 * 
 * // Combining arrays and objects
 * cn(["class1", "class2"], { "class3": true, "class4": false })
 */
export function cn(...inputs: ClassValue[]) {
  // First, use clsx to merge all class names (handles conditionals, arrays, objects)
  // Then, use twMerge to resolve Tailwind class conflicts (keeps last conflicting class)
  return twMerge(clsx(inputs))
}
