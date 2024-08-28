'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { AiOutlineUser, AiOutlineLogout } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchUserProfile } from '@/redux/slices/userSlice';

export default function ProfileMenu() {
    const dispatch = useDispatch<AppDispatch>();
    const menuRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const { profile, profilePicture } = useSelector((state: RootState) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (session?.user?.username && session?.user?.email) {
            dispatch(fetchUserProfile({ username: session.user.username, email: session.user.email }));
        }
    }, [session?.user, dispatch]);

    const toggleMenu = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleSignOut = useCallback(async () => {
        await signOut();
        router.replace("/sign-in");
    }, [router]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeMenu]);

    const renderProfileImage = (src: string | null) => (
        <div className="overflow-hidden w-10 h-10 rounded-full border-2 border-primary-500">
            <Image
                src={src || ''}
                alt="Profile image"
                width={40}
                height={40}
                className="object-cover"
            />
        </div>
    );

    return (
        <div className="relative">
            <button onClick={toggleMenu} className="text-primary-600">
                {profilePicture ? renderProfileImage(profilePicture) : <FaUserCircle size={35} />}
                {/* <span className="hidden md:block font-semibold">{profile?.user?.username || 'Profile'}</span> */}
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-72 z-20 p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                >
                    <div className="flex items-center gap-4">
                        {profilePicture ? renderProfileImage(profilePicture) : <FaUserCircle size={40} className="text-primary-600" />}
                        <div>
                            <p className="font-semibold text-gray-800 text-lg">{profile?.user?.username}</p>
                            <p className="text-sm text-gray-500">{profile?.user?.email}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link href="/dashboard/profile">
                            <div
                                onClick={closeMenu}
                                className="flex items-center space-x-3 hover:bg-gray-100 text-primary-700 px-3 py-2 rounded-lg cursor-pointer transition-all"
                            >
                                <AiOutlineUser size={20} />
                                <span className="font-medium">My Profile</span>
                            </div>
                        </Link>
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full text-left space-x-3 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
                            >
                                <AiOutlineLogout size={20} />
                                <span className="font-medium">Log out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}