"use client"

import { useSession } from "next-auth/react";

const Profile = () => {
    const { data: session, status } = useSession();
    const user = session?.user

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Profile Details</h2>
                <button className="bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 text-xs">Edit Profile</button>
            </div>
            <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileItem label="Username" value={user?.username} />
                    <ProfileItem label="Email" value={user?.email} isVerified={user?.isVerified} />
                    {/* <ProfileItem label="Role" value={user} isVerified={user?.isVerified} /> */}
                    {/* <ProfileItem label="Full Name" value="Max Smith" /> */}
                    <ProfileItem label="Company" value="Keenthemes" />
                    <ProfileItem label="Company Site" value="keenthemes.com" />
                    <ProfileItem label="Country" value="Germany" />
                    <ProfileItem label="Communication" value="Email, Phone" />
                    <ProfileItem label="Allow Changes" value="Yes" />
                </div>
            </div>
        </div>
    )
}

function ProfileItem({ label, value, isVerified, role, isApproved }: any) {
    return (
        <div className="flex items-center">
            <span className="text-gray-500 w-40">{label}</span>
            <span className="text-gray-900 font-medium">{value}</span>
            {isVerified && <span className="ml-2 text-sm bg-green-500 text-white py-1 px-2 rounded">Verified</span>}
        </div>
    );
}

export default Profile