'use client'
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SearchDropdownProps {
    label: string;
    placeholder: string;
    fetchResults: (searchQuery: string, fetchAll: boolean) => Promise<any>;
    onSelect: (selectedItem: any) => void;
    sectionName: string;
    required: boolean;
}

const SearchDropdown = ({
    label,
    placeholder,
    fetchResults,
    onSelect,
    sectionName,
    required
}: SearchDropdownProps) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(true);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [initialClick, setInitialClick] = useState<boolean>(false)
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sectionName) {
            setSearchQuery(sectionName); // Set the search query to the sectionName when editing
        }
    }, [sectionName]);

    // Handle selecting an item from the dropdown
    const handleSelect = (item: any) => {
        onSelect(item);
        setSearchQuery(item.name);
        setShowDropdown(false);
        setSearchResults([]);
    };


    // Fetch results based on search query
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (initialClick && searchQuery === "") {
                setLoading(true);
                await fetchResults("", true).then((data) => {
                    setSearchResults(data);
                    setShowDropdown(true);
                });
                setLoading(false);
            } else if (searchQuery && showDropdown && initialClick) { // only fetch when user has clicked or typed
                setLoading(true);
                await fetchResults(searchQuery, false).then((data) => {
                    setSearchResults(data);
                    setShowDropdown(true);
                });
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fetchResults, initialClick]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);  // Close dropdown if clicking outside
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // Cleanup the event listener
        };
    }, []);


    return (
        <div className="mb-4 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}  {/* Required indicator */}
            </label>
            <div className='relative flex items-center'>
                <input
                    type="text"
                    value={searchQuery}
                    required={required}
                    onFocus={(e) => {
                        if (searchQuery !== "") setInitialClick(true);
                    }}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setInitialClick(true); // Set this to true only when typing starts
                        setShowDropdown(true);
                    }}
                    placeholder={placeholder}
                    className="border p-2 rounded-md w-full"
                />
                {
                    isLoading &&
                    <span className='absolute right-2'>
                        <Loader2 className='animate-spin text-gray-600' />
                    </span>
                }
            </div>
            {/* Dropdown for search results */}
            {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-300 max-h-48 overflow-auto w-full">
                    {searchResults.map((result) => (
                        <div
                            key={result.id}
                            className="cursor-pointer text-sm px-2 py-1 hover:bg-gray-100"
                            onClick={() => handleSelect(result)}
                        >
                            {result.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
