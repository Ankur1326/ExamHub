import { redirect } from "next/navigation";
import Link from "next/link";
import getUserDetails from "@/helpers/getUserDetails";

const Home = async () => {
    const session = await getUserDetails()
    // console.log("session : ", session);

    if (session?.user) {
        redirect(`/${session.user.role}/dashboard`)
    }

    return (
        <div className="min-h-screen flex">
          <div className="flex-1">
            {/* Main Content Area */}
            <header className="w-full flex justify-between p-4 bg-white shadow fixed top-0 left-0 right-0 z-10">
              <a href="#" className="text-xl font-bold mb-4 md:mb-0">
                Logo
              </a>
              <Link href="/sign-in">
                <button
                  className=""
                >
                  Login
                </button>
              </Link>
            </header>
            {/* <main className="mt-16">{children}</main> Add margin-top to prevent content from hiding under header */}
            <div className="w-full h-screen flex items-center justify-center ">
              <p className="text-3xl opacity-35">
                Public Page
              </p>
            </div>
          </div>
        </div>
      )
}

export default Home;