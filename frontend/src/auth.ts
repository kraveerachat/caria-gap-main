/**
 * Auth.js (NextAuth v5) configuration — Roadmap Phase 2 (frontend).
 *
 * NextAuth owns login; FastAPI is a resource server. The token FastAPI validates
 * is a FastAPI-minted HS256 JWT (NextAuth's own session cookie is encrypted and
 * not readable by the backend), so we carry that backend token inside the
 * NextAuth session as `backendToken` and send it as `Authorization: Bearer ...`.
 *
 * SUT Student-ID login needs no external credentials: the Credentials provider's
 * authorize() calls the backend `/api/v1/auth/verify-student`. Google/Facebook are
 * added only when their client id/secret env vars are present, so missing OAuth
 * credentials never break the build or the SUT-ID flow.
 *
 * NOTE: OAuth (Google/Facebook) users still need a backend token. That requires a
 * small FastAPI `/auth/exchange` endpoint (mint a backend JWT from the verified
 * OAuth email) wired in the jwt callback — left as a TODO until OAuth creds land.
 */

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

const providers: Provider[] = [
  Credentials({
    id: "sut-student",
    name: "SUT Student ID",
    credentials: {
      student_id: { label: "Student ID", type: "text" },
      name: { label: "Name", type: "text" },
      program: { label: "Program", type: "text" },
    },
    async authorize(creds) {
      const studentId = creds?.student_id;
      if (!studentId || typeof studentId !== "string") return null;
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          name: creds?.name ?? null,
          program: creds?.program ?? null,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const u = data.user;
      return {
        id: u.sub,
        name: u.name ?? u.sub,
        email: `${u.sub}@students.sut.ac.th`,
        role: u.role,
        studentId: u.student_id,
        program: u.program,
        backendToken: data.token,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  // Required for self-hosted / non-Vercel deploys (and `next start`): Auth.js v5
  // otherwise rejects requests with UntrustedHost. Vercel infers the host itself.
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.studentId = user.studentId;
        token.program = user.program;
        token.backendToken = user.backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      // token fields are typed `unknown` in v5 beta despite augmentation; coerce.
      session.role = token.role as string | undefined;
      session.backendToken = token.backendToken as string | undefined;
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.studentId = token.studentId as string | undefined;
        session.user.program = token.program as string | undefined;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
