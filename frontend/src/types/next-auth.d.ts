// Module augmentation for Auth.js (NextAuth v5) — Roadmap Phase 2.
// Adds the CARIA claims (role / studentId / program) and the FastAPI bearer token
// (`backendToken`) to the session, user, and JWT shapes.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    role?: string;
    backendToken?: string;
    user?: {
      role?: string;
      studentId?: string;
      program?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    studentId?: string;
    program?: string;
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    studentId?: string;
    program?: string;
    backendToken?: string;
  }
}
