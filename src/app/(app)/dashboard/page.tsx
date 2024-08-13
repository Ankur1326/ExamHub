"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function Dashboard() {
    const { data: session } = useSession();
    const user: User = session?.user;

    const router = useRouter()

    const handlesignout = () => {
        signOut()
        router.replace("/sign-in")
    }

    return (
        <div>
            <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                    <a href="#" className="text-xl font-bold mb-4 md:mb-0">
                        Logo
                    </a>
                    {session ? (
                        <>
                            <span className="mr-4">Welcome, {user?.username || user?.email}{" "} </span>
                            <div className="flex items-center gap-2 ">
                                <button
                                    onClick={handlesignout}
                                    className="w-full md:w-auto bg-red-100 rounded-sm text-black px-3 py-1"
                                >
                                    Logout
                                </button>

                                <div onClick={() => toast.error("Profile, Not Implemented")} className="w-8 h-8 bg-white rounded-full cursor-pointer"></div>
                            </div>

                        </>
                    ) : (
                        <Link href="/sign-in">
                            <button
                                className="w-full md:w-auto bg-slate-100 text-black px-3 py-1 rounded-sm"
                            >
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            </nav>
            <div className="w-full h-screen flex items-center justify-center ">
                <p className="text-3xl opacity-35">
                    Dashboard
                </p>
            </div>
        </div>
    );
}

export default Dashboard
