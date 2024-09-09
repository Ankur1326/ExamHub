'use client'
import ForgotPassword from "@/components/auth/ForgotPassword"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [isSubmiting, setSubmiting] = useState(false);
    const router = useRouter()
    const [isForgotPasswordModalShow, setForgotPasswordModalShow] = useState(false)

    const onSubmit = async (e: any) => {
        e.preventDefault();
        setSubmiting(true);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                identifier: identifier,
                password: password
            });

            if (result?.error) {
                toast.error(result?.error);
                console.log("result error -> ", result.error);
                console.log("result url-> ", result.url);
            }

            if (result?.ok) {
                const response = await fetch('/api/auth/session');
                const session = await response.json();
                const userRole = session?.user?.role;

                // Redirect based on user role
                if (userRole === 'admin') {
                    router.replace("/admin/dashboard");
                } else if (userRole === 'teacher') {
                    router.replace("/teacher/dashboard");
                } else if (userRole === 'student') {
                    router.replace("/student/dashboard");
                } else {
                    router.replace("/403");  // Unauthorized access page
                }
            }

        } catch (error) {
            console.error("Error during sign-in:", error);
            toast.error("An unexpected error occurred. Please try again later.");
        } finally {
            setSubmiting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const result = await signIn('google', {
                redirect: false,
            });

            console.log("result login with google : ", result);

            if (result?.error) {
                console.log(result?.error);
                console.log(result);
                router.push(`/sign-in?error=${encodeURIComponent(result.error)}`);
                toast.error(result?.error);
            } else if (result?.ok) {
                const response = await fetch('/api/auth/session');
                const session = await response.json();
                const userRole = session?.user?.role;

                // Redirect based on user role
                if (userRole === 'admin') {
                    router.replace("/admin/dashboard");
                } else if (userRole === 'teacher') {
                    router.replace("/teacher/dashboard");
                } else if (userRole === 'student') {
                    router.replace("/student/dashboard");
                } else {
                    router.replace("/403");  // Unauthorized access page
                }
            }
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            toast.error("An unexpected error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Get the error from URL query parameters
        const query = new URLSearchParams(window.location.search);
        const errorMessage = query.get("error");
        console.log(errorMessage);

        if (errorMessage) {
            // setError(errorMessage);
            toast.error(errorMessage); // Show the error using toast
        }
    }, []);

    const onClose = () => {
        setForgotPasswordModalShow(false)
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/media/auth/bg10.jpeg')" }}>
            <div className="absolute inset-0 bg-black opacity-0"></div>
            {
                isForgotPasswordModalShow && <ForgotPassword onClose={onClose} />
            }

            <div className="relative z-10 bg-white p-10 px-14 rounded-lg shadow-md w-[450px] mb-3 select-none">
                <h2 className="text-2xl text-gray-700 font-bold text-center">Sign in</h2>
                <div className="text-center text-gray-400 text-sm mb-8">
                    Create a new account? <Link href="/sign-up" className="text-blue-500">Sign up</Link>
                </div>

                <div className="flex justify-between mb-6">
                    <div onClick={handleGoogleSignIn} className="flex items-center justify-center w-1/2 border cursor-pointer text-gray-700 py-2 px-4 rounded mr-2 hover:shadow-md">
                        <Image src="/media/svg/brand-logos/google-icon.svg" alt="Google" width={15} height={15} className="mr-2" />
                        <span className="text-sm">
                            Use Google
                        </span>
                    </div>
                    <div className="flex items-center justify-center w-1/2 border cursor-pointer text-gray-700 py-2 px-4 rounded ml-2 hover:shadow-md">
                        <Image src="/media/svg/brand-logos/apple-black.svg" alt="Apple" width={15} height={15} className="mr-2 theme-light-show" />
                        <span className="text-sm">
                            Use Apple
                        </span>
                    </div>
                </div>
                <div className="flex justify-between gap-3 items-center mb-4 select-none">
                    <span className="w-1/2 border border-gray-100 h-0 rounded-full"></span>
                    <span className="text-gray-500 test-[2px]">OR</span>
                    <span className="w-1/2 border border-gray-100 h-0 rounded-full"></span>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Username/Email</label>
                        <input
                            type="text"
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded text-black text-sm hover:border-gray-300 focus:outline-none focus:border-blue-500 bg-gray-50"
                            placeholder="Enter Username or Email"
                        />
                    </div>
                    <div className="mb-9 relative">
                        <div className="flex items-center justify-between">
                            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                            <p onClick={() => setForgotPasswordModalShow(true)} className="text-blue-500 w-fit text-sm cursor-pointer hover:underline select-none">Forgot Password</p>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded hover:border-gray-300 focus:outline-none focus:border-blue-500 bg-gray-50 text-black text-sm"
                            placeholder="Enter Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 top-6 h-9 flex items-center pr-3 text-gray-500"
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? <Eye width={15} /> : <EyeOff width={15} />}
                        </button>

                    </div>
                    {
                        isSubmiting ? (
                            <div className="flex flex-row items-center justify-center gap-2 w-full bg-blue-400 text-white py-2 px-4 rounded">
                                <Loader2 className="animate-spin" color="#fff" width={20} />
                                <span>Please wait</span>
                            </div>
                        ) : (
                            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                                Sign In
                            </button>
                        )
                    }
                </form>
            </div>

        </div>
    )
}