'use client'
import FixedNoteInfo from '@/components/admin/FixedNoteInfo'
import ToggleSwitch from '@/components/admin/ToggleSwitch'
import DropdownMenu from '@/components/DropDownMenu'
import Select from '@/components/DropDownSelector'
import { EditOrCreateNewModalWrapper } from '@/components/EditOrCreateNewModalWrapper'
import Pagination from '@/components/Pagination'
import SectionHeader from '@/components/SectionHeader'
import TableLabelHeader from '@/components/TableLabelHeader'
import { fetchUsers, updateUser } from '@/redux/slices/configuration/user-managements/userManagementSlice'
import { AppDispatch, RootState } from '@/redux/store'
import { formatDate } from '@/utility/dateFormate'
import axios from 'axios'
import { UserRound } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import Skeleton from 'react-loading-skeleton'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'

function page() {
    const dispatch = useDispatch<AppDispatch>();
    const { totalPages, totalUsers, status, error } = useSelector((state: RootState) => state.users);
    const [loadingPage, setLoadingPage] = useState<boolean>(false)
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
    const [isModalVisible, setModalVisible] = useState<boolean>(false)
    const [role, setRole] = useState<string>("")
    const [isApproved, setIsApproved] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<any>("")
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [pagesCache, setPagesCache] = useState<Record<number, any[]>>({});

    const [filterQuery, setFilterQuery] = useState<{ username: string }>({
        username: "",
    });
    const [searchQuery, setSearchQuery] = useState<{ username: string }>({
        username: "",
    });

    const users = pagesCache[currentPage] || [];

    useEffect(() => {
        const fetchData = async () => {
            if (!pagesCache[currentPage]) {
                setLoadingPage(true);
                const response: any = await dispatch(fetchUsers({ ...searchQuery, currentPage, itemsPerPage }));
                if (typeof response.payload !== 'string' && response.payload?.users) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage]: response?.payload?.users,
                    }));
                } else {
                    console.error("Unexpected response format", response.payload);
                }
                console.log("response?.payload?.users : ", response?.payload?.users);

                setLoadingPage(false);
            }

            // Preload next and previous pages
            preloadAdjacentPages(currentPage, itemsPerPage);
        };

        const preloadAdjacentPages = async (currentPage: number, itemsPerPage: number) => {
            // Preload next page if it exists
            if (currentPage < totalPages && !pagesCache[currentPage + 1]) {
                const nextPageResponse: any = await dispatch(fetchUsers({ currentPage: currentPage + 1, itemsPerPage }));

                if (typeof nextPageResponse.payload !== 'string' && nextPageResponse.payload?.users) {
                    setPagesCache((prevCache) => ({
                        ...prevCache,
                        [currentPage + 1]: nextPageResponse?.payload?.users,
                    }));
                }
            }
        };

        fetchData();
    }, [dispatch, searchQuery, currentPage, itemsPerPage, pagesCache, totalPages]);


    const onEdit = (item: any) => {
        setSelectedUser(item)
        setRole(item?.role)
        setIsApproved(item?.isApproved)
        setModalVisible(true)
        setDropdownOpen(null)
    }

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) setCurrentPage(prevPage => prevPage + 1);
    }, [currentPage, totalPages]);

    const handlePreviousPage = useCallback(() => {
        if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
    }, [currentPage]);



    const handleItemsPerPageChange = (e: any) => {
        setPagesCache({})
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }

    const handleSave = async (e: any) => {
        e.preventDefault()

        const userData = { role, isApproved }
        
        setModalVisible(false);

        let response;
        if (selectedUser) {
            response = await dispatch(updateUser({ ...selectedUser, ...userData }));
        }

        // Wait for the response to resolve
        if (response && response.payload && typeof response.payload !== 'string') {
            // Update the state to show the new/updated item immediately
            const newUser = response.payload
            const updatedUsers = selectedUser
                ? users.map(item => item._id === selectedUser._id ? { ...item, ...newUser } : item)
                : [...users, response.payload]; // Add the new item to the list

            setPagesCache(prevCache => ({
                ...prevCache,
                [currentPage]: updatedUsers
            }));
        }

    }

    const menuItems = (item: any) => [
        // { id: item._id, label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onEdit(item) },
        { id: item._id, label: 'Edit', onClick: () => onEdit(item) },
        // { id: item._id, label: 'Delete', onClick: () => { } },
    ];

    const addUser = () => {

    }

    return (
        <div className='container mx-auto p-4 bg-white shadow-md dark:bg-bg_secondary'>
            {/* <SectionHeader title="Users List" buttonText="Add Users" onClick={() => addUser()} /> */}
            <h2 className="text-xl font-bold text-gray-500 dark:text-text_primary">Users List</h2>

            <table className="min-w-full  dark:text-text_secondary dark:bg-bg_secondary">
                <TableLabelHeader headings={["User", "Role", "isApproved", "Joined Date", "Action"]} />
                <tbody>
                    {!loadingPage ? (
                        users.length > 0 ? (
                            users.map((user: any) => (
                                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50 dark:hover:bg-hover_secondary dark:bg-bg_secondary dark:border-border_secondary" style={{}}>
                                    <td className="py-4 px-6 text-sm border-gray-200 dark:border-border_secondary">
                                        <div className='flex items-center gap-3 w-fit' >
                                            {
                                                user?.profilePicture ?
                                                    <div className='rounded-full overflow-hidden'>
                                                        <Image
                                                            src={user?.profilePicture || ''}
                                                            alt="Profile image"
                                                            width={55}
                                                            height={55}
                                                            className="rounded-full"
                                                        />
                                                    </div>
                                                    :
                                                    <div className='p-5 bg-gray-50 dark:bg-gray-700 text-gray-500 rounded-full'>
                                                        <UserRound size={20} />
                                                    </div>
                                            }
                                            <div className="flex flex-col">
                                                <span className="font-medium truncate ">{user?.fullName}</span>
                                                <span className="text-[#78829D] text-sm dark:text-slate-600">{user?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-[#78829D] text-sm border-gray-200  dark:border-border_secondary">
                                        {user?.role === 'admin' ? "Administrator" : user?.role}
                                    </td>
                                    <td className="py-3 px-4 border-gray-100 dark:border-border_secondary">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] font-semibold ${user.isApproved ? "bg-green-100 text-green-500 dark:bg-green-200 dark:text-green-600" : "bg-red-50 dark:bg-red-200 dark:text-red-600 text-red-400"}`}>
                                            {user.isApproved ? "Approved" : "Not Approved"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-[#78829D] font-medium border-gray-200  dark:border-border_secondary">
                                        {formatDate(user?.createdAt)}
                                    </td>
                                    <td className="py-3 px-4 text-sm relative w-fit">
                                        <button
                                            className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                            onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
                                        >
                                            <FiMoreVertical />
                                        </button>

                                        <DropdownMenu
                                            items={menuItems(user)}
                                            isOpen={dropdownOpen === user._id}
                                            onClose={() => setDropdownOpen(null)}
                                        />
                                    </td>
                                </tr>
                            ))
                        )
                            :
                            (
                                <tr>
                                    <td colSpan={2} className="text-center py-4 text-gray-500">No Users found</td>
                                </tr>
                            )
                    ) : (
                        Array.from({ length: 10 }).map((_, index) => (
                            <tr key={index} style={{ height: '45px' }}>
                                <td className="border-b py-[13.5px] px-6 text-sm border-gray-200 text-gray-700 dark:border-border_secondary">
                                    <div className='flex gap-3 items-center'>
                                        <Skeleton width={60} height={60} className='rounded-full' />
                                        <div className="flex flex-col">
                                            <Skeleton width={120} height={18} />
                                            <Skeleton width={180} height={11} />
                                        </div>
                                    </div>
                                </td>
                                <td className="border-b border-gray-200 py-[13.5px] px-6 text-sm text-gray-700 dark:border-border_secondary">
                                    <Skeleton width={160} height={18} />
                                </td>
                                <td className="border-b border-gray-200 py-[13.5px] px-6 text-sm text-gray-700 dark:border-border_secondary">
                                    <Skeleton width={120} height={18} />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200 dark:border-border_secondary"><Skeleton width={120} height={20} /></td>
                                <td className="px-4 py-2 border-b border-gray-200 dark:border-border_secondary"><Skeleton width={30} height={10} /></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalUsers}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handleItemPerPageChange={handleItemsPerPageChange}
            />

            <EditOrCreateNewModalWrapper
                title="Edit User"
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                size="small"
            >
                <div className='mb-4'>
                    <Select
                        label="Difficulty Level"
                        value={role}
                        options={['admin', 'instructor', 'student']}
                        setValue={setRole}
                        required
                    />
                </div>

                <FixedNoteInfo text="Once approved, this user will have full access to the system and can log in " />

                <div className=''>
                    <ToggleSwitch
                        enabled={isApproved}
                        onToggle={() => setIsApproved(!isApproved)}
                        label={`Change for approvel/decline`}
                    />
                    <span className={`px-2 py-1 rounded-sm text-[10px] font-semibold ${isApproved ? "bg-green-100 text-green-500" : "bg-red-50 text-red-400"}`}>
                        {isApproved ? "Approved" : "Not Approved"}
                    </span>
                </div>
            </EditOrCreateNewModalWrapper>
        </div>
    )
}

export default page
