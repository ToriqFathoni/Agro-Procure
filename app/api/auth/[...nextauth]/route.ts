import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import { Restaurant } from '@/models/Restaurant';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await connectToDatabase();
        
        const restaurant = await Restaurant.findOne({ email: credentials.email });
        
        if (!restaurant) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, restaurant.password);
        
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: restaurant._id.toString(),
          email: restaurant.email,
          name: restaurant.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development_only',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
