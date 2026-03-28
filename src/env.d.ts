/// <reference types="astro/client" />

// Extend Astro's Locals interface for middleware auth
declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email?: string;
      user_metadata?: Record<string, any>;
    };
    role?: string;
  }
}
