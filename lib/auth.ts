import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
  providers:
    githubClientId && githubClientSecret
      ? [
          GitHubProvider({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          }),
        ]
      : [],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      if (profile && typeof profile === 'object' && 'login' in profile) {
        const login = profile.login;
        if (typeof login === 'string') {
          token.login = login;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.sub === 'string') {
          session.user.id = token.sub;
        }
        if (typeof token.login === 'string') {
          session.user.login = token.login;
        }
      }

      if (typeof token.accessToken === 'string') {
        session.accessToken = token.accessToken;
      }

      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
