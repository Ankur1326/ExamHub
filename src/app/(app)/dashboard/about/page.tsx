import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

const About = async () => {
    const session = await getServerSession(authOptions);

    console.log("Session:", session);

    const username = session?.user?.username;
    const email = session?.user?.email;
    const isVerified = session?.user?.isVerified;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold">User Profile</h2>
            <p>Username: {username || 'N/A'}</p>
            <p>Email: {email || 'N/A'}</p>
            <p>Verified: {isVerified ? "Yes" : "No"}</p>
        </div>
    );
}

export default About;
