'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { AiOutlineUser } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '@/redux/slices/userSlice';

export default function ProfileMenu() {
    const dispatch = useDispatch();
    const menuRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const { profile, profilePicture } = useSelector((state: any) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (session?.user) {
            dispatch(fetchUserProfile({ username: session.user.username, email: session.user.email }));
        }
    }, [session?.user, dispatch]); // Depend on session.user to avoid unnecessary dispatches

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
        <div className="overflow-hidden w-10 h-10 rounded-full border border-gray-300">
            <Image
                src={src}
                alt="Profile image"
                width={40}
                height={40}
                className="object-cover"
            />
        </div>
    );

    return (
        <div className="relative">
            <button onClick={toggleMenu} className="flex items-center">
                {profilePicture ? renderProfileImage(profilePicture) : <FaUserCircle size={35} className="text-gray-600" />}
            </button>

            {isOpen && (
                <div ref={menuRef} className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-3 z-10">
                    <div className="flex items-center gap-2">
                        {profilePicture ? renderProfileImage(profilePicture) : <FaUserCircle size={35} className="text-gray-600" />}
                        <div>
                            <p className="font-semibold text-gray-900">{profile?.user?.username}</p>
                            <p className="text-sm text-gray-500">{profile?.user?.email}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link href="/dashboard/profile">
                            <div onClick={closeMenu} className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-2 rounded-lg cursor-pointer">
                                <AiOutlineUser className="text-gray-600" />
                                <span>My Profile</span>
                            </div>
                        </Link>
                        <div className="mt-4 border-t pt-4">
                            <button onClick={handleSignOut} className="w-full text-left text-red-600 hover:bg-gray-100 px-2 py-2 rounded-lg">
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
