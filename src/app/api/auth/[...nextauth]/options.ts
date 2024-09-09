import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()
                // console.log(" credentials -> ", credentials);
                // console.log("credentials.identi -> ", credentials.identifier);

                try {
                    const user = await User.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ]
                    })
                    // console.log("user -> ", user);

                    if (!user) {
                        throw new Error("User Not found");
                    }
                    if (!user.isVerified) {
                        throw new Error('Please verified your account first before login')
                    }

                    const isPasswordCorrect = await user.comparePassword(credentials.password.trim());

                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error('Incorrect Password')
                    }

                } catch (err: any) {
                    throw new Error(err);
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            async profile(profile: any): Promise<any> {
                await dbConnect();
                // Find or create the user in your database
                try {
                    let user = await User.findOne({ email: profile.email });

                    if (!user) {
                        throw new Error("User not found");
                    }
                    if (!user.isVerified) {
                        throw new Error('Please verify your account first before login');
                    }

                    return {
                        id: user?._id,
                        email: user.email,
                        username: user.username,
                        isVerified: user.isVerified,
                    };
                } catch (err: any) {
                    throw new Error(err.message)
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.username = user.username;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.username = token.username;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/sign-in',
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}