'use client'
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

function page() {
    const router = useRouter();
    const params = useParams();
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [seconds, setSeconds] = useState(120);
    // const [isOtpSent, setOtpSent] = useState(false);
    const [isLoading, setLoading] = useState(false)

    // useEffect(() => {
    //     if (seconds > 0) {
    //         const timer = setInterval(() => setSeconds(seconds - 1), 1000);
    //         return () => clearInterval(timer);
    //     }
    // }, [seconds]);

    const handleChange = (element: any, index: any) => {
        if (isNaN(element.value)) return;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const onSubmit = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`/api/verify-code`, {
                username: params.username,
                code: otp,
            })
            if (response.data.success) {
                toast.success("Success");
                router.replace("/sign-in");
            }

        } catch (error) {
            console.error("error in sign up of user", error);
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.message;
            toast.error("Verification failed");
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/media/auth/bg10.jpeg')" }}>
            <div className="absolute inset-0 bg-black opacity-0"></div>
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg z-20 absolute">
                <div className="flex justify-center mb-3">
                    <Image src="/media/svg/misc/smartphone-2.svg" alt="Phone Icon" width={20} height={30} className="w-16 h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800">Verify your email</h2>
                <p className="text-center text-gray-600">Enter the verification code we sent to <br />
                    {/* ******{email.slice(-4)} */}
                </p>
                <div className="flex justify-center space-x-2 mt-4">
                    {otp.map((data, index) => (
                        <input
                            className="w-12 h-12 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#3699FF] text-2xl text-black"
                            type="text"
                            name="otp"
                            maxLength={1} // Corrected attribute
                            key={index}
                            value={data}
                            onChange={e => handleChange(e.target, index)}
                            onFocus={e => e.target.select()}
                        />
                    ))}
                </div>
                <div className="flex justify-center mt-4">
                    {/* {seconds > 0 && <p className="text-gray-600">Didn’t receive a code? ({seconds}s)</p>} */}
                </div>
                <div className='flex justify-center'>
                    {/* <button
                        // onClick={() => setStep((prev) => prev - 1)}
                        className="max-w-fit px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-600 flex items-center"
                    >
                        Skip
                    </button> */}
                    <div
                        onClick={() => onSubmit()}
                        className="max-w-fit px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-600 flex items-center cursor-pointer"
                    >
                        {
                            isLoading ? (
                                <div className="flex gap-2">
                                    <Loader2 className="animate-spin" color="#fff" width={20} />
                                    <span>Please wait</span>
                                </div>
                            ) : "Verify and Continue"
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page;
