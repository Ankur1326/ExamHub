import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import ProfileClient from "@/components/dashboard/Profile";

export default async function Profile() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return <div>Please sign in to view your profile.</div>;
    }

    const { username, email } = session.user;
    try {
        return <ProfileClient username={username} email={email} />;
    } catch (error: any) {
        console.log(error);

        return <div>Error: {error.message}</div>;
    }
}
