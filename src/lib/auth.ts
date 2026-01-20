import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/infra/db/prisma";
import type { AuthProvider } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider: AuthProvider;
      email?: string | null;
      profileName?: string | null;
    };
  }
}

const KakaoProvider = {
  id: "kakao",
  name: "Kakao",
  type: "oauth" as const,
  authorization: {
    url: "https://kauth.kakao.com/oauth/authorize",
    params: { scope: "profile_nickname account_email" },
  },
  token: "https://kauth.kakao.com/oauth/token",
  userinfo: "https://kapi.kakao.com/v2/user/me",
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  client: {
    token_endpoint_auth_method: "client_secret_post",
  },
  checks: ["state"] as ("state" | "pkce" | "none")[],
  profile(profile: {
    id: number;
    kakao_account?: { email?: string; profile?: { nickname?: string } };
  }) {
    return {
      id: String(profile.id),
      email: profile.kakao_account?.email,
      name: profile.kakao_account?.profile?.nickname,
    };
  },
};

const NaverProvider = {
  id: "naver",
  name: "Naver",
  type: "oauth" as const,
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
    params: { response_type: "code" },
  },
  token: "https://nid.naver.com/oauth2.0/token",
  userinfo: "https://openapi.naver.com/v1/nid/me",
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  profile(profile: { response: { id: string; email?: string; nickname?: string } }) {
    return {
      id: profile.response.id,
      email: profile.response.email,
      name: profile.response.nickname,
    };
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  providers: [
    KakaoProvider,
    NaverProvider,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.provider || !user.id) return false;

      const providerMap: Record<string, AuthProvider> = {
        kakao: "KAKAO",
        naver: "NAVER",
        google: "GOOGLE",
      };

      const authProvider = providerMap[account.provider];
      if (!authProvider) return false;

      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            provider_providerUserId: {
              provider: authProvider,
              providerUserId: user.id,
            },
          },
        });

        if (existingUser) {
          if (existingUser.isBanned) {
            return false;
          }
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLoginAt: new Date() },
          });
        } else {
          await prisma.user.create({
            data: {
              provider: authProvider,
              providerUserId: user.id,
              email: user.email,
              profileName: user.name,
              lastLoginAt: new Date(),
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        const providerMap: Record<string, AuthProvider> = {
          kakao: "KAKAO",
          naver: "NAVER",
          google: "GOOGLE",
        };

        const authProvider = providerMap[account.provider!];
        const dbUser = await prisma.user.findUnique({
          where: {
            provider_providerUserId: {
              provider: authProvider,
              providerUserId: user.id!,
            },
          },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.provider = dbUser.provider;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.provider = token.provider as AuthProvider;
      }
      return session;
    },
  },
  pages: {
    signIn: "/tester/login",
    error: "/tester/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
});
