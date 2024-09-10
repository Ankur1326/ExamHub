import axios from 'axios';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type ForgotPasswordProps = {
    onClose: () => void;
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onClose }): JSX.Element => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(true);
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [seconds, setSeconds] = useState(120);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (seconds > 0 && isOtpSent) {
            const timer = setInterval(() => setSeconds(seconds - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [seconds, isOtpSent]);

    const handleChange = (element: any, index: number) => {
        if (isNaN(element.value)) return;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleNextStep = () => {
        setStep((prevStep) => prevStep + 1);
    };


    const handleSendOtp = async () => {
        if (!email) {
            // alert("Enter email to send otp")
            toast.error("email is requred")
            return;
        }
        try {
            setLoading(true)
            const response = await axios.post('/api/send-email', { email, type: "OTP for Reset Password" });
            if (response.status === 200) {
                setIsOtpSent(true);
                setSeconds(60);
                handleNextStep() // go to next step
                toast.success("OTP sent successfully. Check your email.")
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Error sending OTP. Please try again.');
        } finally {
            setLoading(false)
        }
    };

    const handleVerifyOtpClick = async () => {
        setLoading(true)
        const otpString = otp.join('');
        if (!otpString) {
            toast.error("Please enter the OTP");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post('/api/verify-otp', { email, otp: otpString });
            if (response.status === 200) {
                handleNextStep()
                // alert('OTP verified successfully');
                toast.success("OTP verified successfully")

            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            toast.error('Error verifying OTP. Please try again.');
        } finally {
            setLoading(false)
        }
    };

    const handleSubmitNewPassword = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        if (newPassword !== confirmPassword) {
            toast.error("New Password and Confirm Password not matched")
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post(`/api/forgot-password`, { email, password: newPassword })
            // console.log("response : ", response);
            if (response.status === 200) {
                handleNextStep()
                toast.success("Password updated successfully")
            }
        } catch (error) {
            // console.error('Error updating password:', error);
            toast.error('Error updating password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        setSeconds(60)
        handleSendOtp();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
            {
                step === 1 && (
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-black">
                        <h2 className="text-2xl font-bold text-center mb-4">Your Email</h2>
                        <p className="text-center mb-4">Enter your email to reset password</p>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@email.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#3699FF]"
                        />
                        {message && <p className="mt-2 text-green-600">{message}</p>}
                        {error && <p className="mt-2 text-red-600">{error}</p>}

                        <button
                            onClick={handleSendOtp}
                            className="w-full mt-4 px-4 py-2 text-white bg-[#3699FF] rounded-md hover:bg-[#2f89e3] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[#2f89e3]"
                        >
                            {loading ? <div className='flex gap-2 items-center justify-center'>
                                <Loader2 className="animate-spin" width={18} />
                                please wait
                            </div> : 'Send OTP'}
                        </button>
                        <button
                            onClick={() => onClose()}
                            className="w-full mt-2 px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            {step === 2 && (
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                    {/* <div className="flex justify-center mb-3">
                        <img src="/phone-icon.png" alt="Phone Icon" className="w-16 h-16" />
                    </div> */}
                    <h2 className="text-2xl font-bold text-center text-gray-800">Verify your email</h2>
                    <p className="text-center text-gray-600">Enter the verification code we sent to <br /> ******{email.slice(-4)}</p>
                    <div className="flex justify-center space-x-2 mt-4">
                        {otp.map((data, index) => (
                            <input
                                className="w-12 h-12 text-center text-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#3699FF] text-2xl"
                                type="text"
                                name="otp"
                                maxLength={1}
                                key={index}
                                value={data}
                                required
                                onChange={e => handleChange(e.target, index)}
                                onFocus={e => e.target.select()}
                            />
                        ))}
                    </div>
                    <div className="flex justify-center mt-4">
                        {seconds > 0 ? (
                            <p className="text-gray-600">Didn’t receive a code? ({seconds}s)</p>
                        ) : (
                            <button onClick={handleResend} className="text-blue-600 hover:underline focus:outline-none">
                                Resend
                            </button>
                        )}
                    </div>
                    <div className='flex justify-between'>
                        <button
                            onClick={() => setStep((prev) => prev - 1)}
                            className="max-w-fit px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-600 flex items-center"
                        >
                            <ArrowLeft className="mr-2" />
                            Back
                        </button>
                        {
                            loading ? <div className='max-w-fit px-4 py-2 mt-4 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-green-600 flex gap-2 items-center'>
                                <Loader2 className="animate-spin" color="#fff" width={20} />
                                <span>Please wait</span>
                            </div>
                                :
                                <button onClick={handleVerifyOtpClick} className='max-w-fit px-4 py-2 mt-4 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-green-600 flex items-center'>
                                    <CheckCircle className="mr-2" />
                                    Verify and Continue
                                </button>
                        }
                    </div>
                </div>
            )}

            {
                step === 3 && (
                    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>
                        <p className="text-center text-gray-600">Enter your new password</p>
                        <div className="relative">
                            <label htmlFor="new-password" className="text-start block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="new-password"
                                className="w-full px-3 py-2 mt-1 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#3699FF]"
                                placeholder="Enter a new password"
                                value={newPassword}
                                required
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <Eye width={15} /> : <EyeOff width={15} />}
                            </button>
                        </div>
                        <div className="relative">
                            <label htmlFor="confirm-password" className="text-start block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirm-password"
                                required
                                className="w-full px-3 py-2 mt-1 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#3699FF]"
                                placeholder="Re-enter a new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <Eye width={15} /> : <EyeOff width={15} />}
                            </button>
                        </div>
                        <div className='flex items-center justify-between'>
                            <button
                                type='button'
                                onClick={() => onClose()}
                                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-300"
                            >
                                Cancel
                            </button>
                            {
                                loading ? (
                                    <div className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                                        <Loader2 className="animate-spin" color="#fff" width={20} />
                                        <span>Please wait</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmitNewPassword}
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                                        Submit
                                    </button>
                                )
                            }
                        </div>
                    </div>
                )}
            {
                step === 4 && (
                    <div className='w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg flex flex-col items-center'>
                        <h2 className="text-2xl font-bold text-center text-gray-800">Your password is changed</h2>
                        <p className="text-center text-gray-600">Your password has been successfully updated Your account s security is our priority</p>
                        <button
                            onClick={() => onClose()}
                            className="max-w-fit px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-600 flex items-center"
                        >
                            Sign in
                        </button>
                    </div>
                )}
        </div>
    );
}

export default ForgotPassword;
