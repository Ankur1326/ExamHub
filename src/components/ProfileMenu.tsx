import { useEffect, useRef, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa'; // You can replace with the avatar
import { AiOutlineUser, AiOutlineSetting } from 'react-icons/ai';
import { MdLanguage } from 'react-icons/md';
import { BiMoon } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function ProfileMenu({ logout }: any) {
    const menuRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user;

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const router = useRouter()

    const handlesignout = () => {
        signOut()
        router.replace("/sign-in")
    }

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef?.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div className="relative">
            <button onClick={toggleMenu} className="">
                {
                    user?.image ? <Image src={user?.image} alt='user' /> : <FaUserCircle size={35} className="text-gray-600" />
                }
            </button>

            {isOpen && (
                <div ref={menuRef} className="absolute right-0 w-64 bg-white rounded-lg shadow-lg border p-4">
                    <div className="flex items-center space-x-3">
                        {
                            user?.image ? <Image src={user?.image} alt='user' /> : <FaUserCircle size={35} className="text-gray-600" />
                        }
                        <div>
                            <p className="font-semibold text-gray-900">{user?.username}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        {/* <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pro</span>  */}
                    </div>
                    <div className="mt-4">
                        <div className="space-y-2">
                            {/* <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-2 rounded-lg">
                                <AiOutlineUser className="text-gray-600" />
                                <span>Public Profile</span>
                            </a> */}
                            <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-2 rounded-lg">
                                <AiOutlineUser className="text-gray-600" />
                                <span>My Profile</span>
                            </a>
                            {/* <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-2 rounded-lg">
                                <AiOutlineSetting className="text-gray-600" />
                                <span>My Account</span>
                            </a>
                            <a href="#" className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-2 rounded-lg">
                                <AiOutlineSetting className="text-gray-600" />
                                <span>Dev Forum</span>
                            </a>
                            <a href="#" className="flex items-center justify-between hover:bg-gray-100 px-2 py-2 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <MdLanguage className="text-gray-600" />
                                    <span>Language</span>
                                </div>
                                <span className="text-sm text-gray-600">English</span>
                            </a> */}
                            {/* <div className="flex items-center justify-between hover:bg-gray-100 px-2 py-2 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <BiMoon className="text-gray-600" />
                                    <span>Dark Mode</span>
                                </div>
                                <input type="checkbox" className="toggle-checkbox" />
                            </div> */}
                        </div>
                        <div className="mt-4 border-t pt-4">
                            <button onClick={handlesignout} className="w-full text-left text-red-600 hover:bg-gray-100 px-2 py-2 rounded-lg">Log out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
