'use client'

import { ApiResponse } from "@/types/ApiResponse"
import axios, { AxiosError } from "axios"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import toast from "react-hot-toast"
import Link from "next/link"

function Page() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setCheckingUsername] = useState(false)
    const [isSubmiting, setSubmiting] = useState(false)
    const [selectedRole, setSelectedRole] = useState('student')

    const debounced = useDebounceCallback(setUsername, 300)
    const router = useRouter()

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username) {
                setCheckingUsername(true)
                setUsernameMessage('')
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    setUsernameMessage(response.data.message)
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ?? "Error checking username"
                    );
                } finally {
                    setCheckingUsername(false)
                }
            }
        }
        checkUsernameUnique()
    }, [username])

    const onSubmit = async (e: any) => {
        e.preventDefault()
        setSubmiting(true)

        if (!username || !email || !password || !selectedRole) {
            toast.error("All fields required")
            setSubmiting(false)
            return
        }
        if (password !== confirmPassword) {
            toast.error("Password not matched")
            setSubmiting(false)
            return
        }

        try {
            const response = await axios.post("/api/sign-up", { username, email, password, role: selectedRole });

            // toast.success(response.data.message)
            if (response.data.success) {
                toast.success(response.data.message, {
                    style: {
                        border: '1px solid #713200',
                        padding: '16px',
                        color: '#713200',
                    },
                    iconTheme: {
                        primary: '#713200',
                        secondary: '#FFFAEE',
                    },
                });

                router.replace(`/verify/${username}`);
            }

        } catch (error) {
            console.error("error in sign up of user", error);
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.message;

            // toast({
            //     title: "SignUP failed",
            //     description: errorMessage,
            //     variant: "destructive",
            // });
        } finally {
            setSubmiting(false);
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/media/auth/bg10.jpeg')" }}>
            <div className="absolute inset-0 bg-black opacity-0"></div>

            <div className="relative z-10 bg-white p-10 px-14 rounded-lg shadow-md w-[450px] mb-3">
                <h2 className="text-2xl text-gray-700 font-bold text-center select-none">Sign up</h2>
                <div className="text-center text-gray-400 text-sm mb-8 select-none">
                    Already have an Account? <Link href="/sign-in" className="text-blue-500">Sign in</Link>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Username</label>
                        <input
                            type="username"
                            onChange={(e) => debounced(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded text-black text-sm hover:border-gray-300 focus:outline-none focus:border-blue-500 bg-gray-50"
                            placeholder="username"
                        />
                        {isCheckingUsername &&
                            <Loader2 className="animate-spin" color="#2563EB" width={17} />
                        }
                        {!isCheckingUsername && usernameMessage && (
                            <p
                                className={`text-sm ${usernameMessage === "username is available"
                                    ? "text-green-500"
                                    : "text-red-500"
                                    }`}
                            >
                                {usernameMessage}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded text-black text-sm hover:border-gray-300 focus:outline-none focus:border-blue-500 bg-gray-50"
                            placeholder="email@email.com"
                        />
                    </div>
                    <div className="mb-4 relative">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
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
                            className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500"
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? <Eye width={15} /> : <EyeOff width={15} />}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded hover:border-gray-300 focus:outline-none focus:border-blue-500 bg-gray-50 text-black text-sm"
                            placeholder="Enter Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500"
                            aria-label="Toggle password visibility"
                        >
                            {showConfirmPassword ? <Eye width={15} /> : <EyeOff width={15} />}
                        </button>


                    </div>
                    <span className="mb-4 text-[13px] text-red-500">
                        {password !== confirmPassword ? "Not Metch" : ""}
                    </span>

                    <div className="flex flex-row items-center mb-5 mt-5 gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="student"
                                checked={selectedRole === 'student'}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-800 select-none">Student</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="instructor"
                                checked={selectedRole === 'instructor'}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-800 select-none">Instructor</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="admin"
                                checked={selectedRole === 'admin'}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-800 select-none">Admin</span>
                        </label>
                    </div>
                    {
                        isSubmiting ? (
                            <div className="flex flex-row items-center justify-center gap-2 w-full bg-blue-400 text-white py-2 px-4 rounded">
                                <Loader2 className="animate-spin" color="#fff" width={20} />
                                <span>Please wait</span>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer"
                            >
                                Sign Up
                            </button>
                        )
                    }
                </form>
            </div>
        </div>
    )
}

export default Page