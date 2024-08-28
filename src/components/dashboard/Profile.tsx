'use client';
import Image from "next/image";
import { FaUserAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import LoadingIndicator from "@/components/dashboard/LoadingIndicator";
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { formateDate } from "@/helpers/formateDate";
import { MdOutlineEdit } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile, updateUserProfile, uploadProfilePicture } from "@/redux/slices/userSlice";
import { BarLoader } from "react-spinners"
import { signIn } from "next-auth/react";
import { AppDispatch, RootState } from "@/redux/store";

const ProfileClient = ({ username, email }: any) => {
    const dispatch = useDispatch<AppDispatch>()
    const [loading, setLoading] = useState(false)
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState(false);

    const { profile, status, profilePicture, isUploading } = useSelector((state: RootState) => state?.user)

    useEffect(() => {
        dispatch(fetchUserProfile({ username, email }))
    }, [dispatch, username, email])

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile?.user?.username || '',
                fullName: profile?.user?.fullName || '',
                mobileNum: profile?.user?.mobileNum || '',
                address: profile?.user?.address || '',
                dateOfBirth: profile?.user?.dateOfBirth || '',
                gender: profile?.user?.gender || '',
                profilePicture: profile?.user?.profilePicture || '',
                additionalFields: profile?.user?.additionalFields || [{ label: '', value: '' }],
            });
        }
    }, [profile]);

    const [formData, setFormData] = useState({
        username: profile?.user?.username || '',
        fullName: profile?.user?.fullName || '',
        mobileNum: profile?.user?.mobileNum || '',
        address: profile?.user?.address || '',
        dateOfBirth: profile?.user?.dateOfBirth || '',
        gender: profile?.user?.gender || '',
        profilePicture: profile?.user?.profilePicture || '',
        additionalFields: profile?.user?.additionalFields || [{ label: '', value: '' }],
    });

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true)
        try {
            const userId = profile?.user?._id
            // Make an API call to update the user's profile
            // const response = await updateUserProfile({ formData, userId })
            dispatch(updateUserProfile({ formData, userId }))

            // Manually refresh the session
            await signIn('credentials', {
                redirect: false,
                identifier: profile?.user?.username,
            });

            setIsEditing(false)

        } catch (error) {
            toast.error("Error")
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false)
        }
    };

    const handleGenderChange = (e: any) => {
        setFormData((prevData) => ({
            ...prevData,
            gender: e.target.value,
        }));
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event?.target?.files?.[0];
        if (!file) return;

        try {
            // Dispatch the thunk action to upload the image
            const resultAction = dispatch(uploadProfilePicture(file));

            if (uploadProfilePicture.fulfilled.match(resultAction)) {

            } else {

            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error("Error uploading image");
        }
    };


    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    if (!profile) {
        return <LoadingIndicator />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    Profile Details
                    <span className="text-white bg-green-400 px-2 py-1 rounded-lg text-xs ml-2">
                        {profile?.user?.role}
                    </span>

                </h2>
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 text-xs"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col">
                        <label className="text-gray-500 w-40">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-500 w-40">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-500 w-40">Mobile Number</label>
                        <input
                            type="text"
                            name="mobileNum"
                            value={formData.mobileNum}
                            onChange={handleInputChange}
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-500 w-40">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData?.address}
                            onChange={handleInputChange}
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-500 w-40">Date of birth</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formateDate(formData?.dateOfBirth)}
                            onChange={handleInputChange}
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-500 w-40">Gender</label>
                        <div className="flex gap-4">
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={handleGenderChange}
                                    className="mr-2"
                                />
                                Male
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={handleGenderChange}
                                    className="mr-2"
                                />
                                Female
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="other"
                                    checked={formData.gender === 'other'}
                                    onChange={handleGenderChange}
                                    className="mr-2"
                                />
                                Other
                            </label>
                        </div>
                    </div>

                    {/* {showNewField && (
                        <div className="flex flex-col md:col-span-2">
                            <label className="text-gray-500">New Field</label>
                            <input
                                type="text"
                                placeholder="Field Label"
                                value={newField.label}
                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                className="p-2 border rounded mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Field Value"
                                value={newField.value}
                                onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                                className="p-2 border rounded"
                            />
                        </div>
                    )} */}

                    <button type="submit" className="bg-green-500 text-white py-1 px-4 rounded-lg">
                        {
                            loading ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <Loader2 className="animate-spin" color="#fff" width={20} />
                                    <span>Please wait...</span>
                                </div>
                            ) :
                                <span>
                                    Save Changes
                                </span>
                        }

                    </button>
                    {/* <div className="md:col-span-2 flex justify-between">
                        <button
                            type="button"
                            className="bg-gray-500 text-white py-1 px-4 rounded-lg"
                            onClick={() => setShowNewField(true)}
                        >
                            Add New Field
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 text-white py-1 px-4 rounded-lg"
                            onClick={addNewField}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <Loader2 className="animate-spin" color="#fff" width={20} />
                                    <span>Please wait...</span>
                                </div>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div> */}
                </form>
            ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden border-4 border-primary-500">
                        <div
                            className="relative w-full h-full group"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {profilePicture ? (
                                <Image
                                    src={profilePicture}
                                    alt="Profile image"
                                    layout="fill"
                                    objectFit="cover"
                                    className="transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex justify-center items-center w-full h-full bg-gray-100 shadow-inner">
                                    <FaUserAlt className="text-gray-300 w-20 h-20" />
                                </div>
                            )}

                            {isHovered && (
                                <button
                                    className="absolute top-2 right-2 bg-primary-600 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 ease-in-out"
                                    onClick={() => document.getElementById('fileInput')?.click()}
                                >
                                    <MdOutlineEdit />
                                </button>
                            )}

                            {isUploading && (
                                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80">
                                    <BarLoader color="#2563EB" width={120} />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>

                    <div className="w-full md:w-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                        <ProfileItem label="Username" value={profile?.user?.username} />
                        <ProfileItem label="Email" value={profile?.user?.email} isVerified={profile?.user?.isVerified} />
                        <ProfileItem label="Full Name" value={profile?.user?.fullName || "N/A"} />
                        <ProfileItem label="Approved?" value={profile?.user?.isApproved ? "Yes" : "No"} />
                        <ProfileItem label="Mobile" value={profile?.user?.mobileNum || "N/A"} />
                        <ProfileItem label="Address" value={profile?.user?.address || "N/A"} />
                        <ProfileItem label="Date of Birth" value={profile?.user?.dateOfBirth ? formateDate(profile?.user?.dateOfBirth) : "N/A"} />
                        <ProfileItem label="Gender" value={profile?.user?.gender || "N/A"} />

                        {profile?.user?.additionalFields?.length > 0 && (
                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-primary-600 font-bold mb-3">Additional Information</h3>
                                <ul className="list-disc list-inside text-gray-600 pl-4">
                                    {profile?.user.additionalFields.map((field: any, index: number) => (
                                        <li key={index} className="text-sm">
                                            {field.label}: <span className="font-medium">{field.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProfileItem = ({ label, value, isVerified }: any) => (
    <div className="flex items-center">
        <span className="text-gray-500 w-40">{label}</span>
        <span className="text-gray-900 font-medium">{value}</span>
        {isVerified !== undefined && (
            <span
                className={`ml-2 px-2 py-1 rounded-lg text-xs text-white ${isVerified ? "bg-green-500" : "bg-red-500"
                    }`}
            >
                {isVerified ? "Verified" : "Not Verified"}
            </span>
        )}
    </div>
);
export default ProfileClient;
