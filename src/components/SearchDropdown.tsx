'use client'
import { useEffect, useState } from 'react';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(true);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

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
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery === "") {
                if (initialFetchDone) {
                    fetchResults("", true).then((data) => {
                        setSearchResults(data); // Fetch all active items when query is empty
                    });
                }
            } else if (searchQuery && showDropdown) {
                fetchResults(searchQuery, true).then((data) => {
                    setSearchResults(data); // Fetch results based on search query
                });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, showDropdown, fetchResults, initialFetchDone]);

    return (
        <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}  {/* Required indicator */}
            </label>
            <input
                type="text"
                value={searchQuery}
                required={required}
                onFocus={(e) => {
                    fetchResults("", true).then((data) =>
                        setSearchResults(data));
                }}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true); // Show dropdown when typing
                }}
                placeholder={placeholder}
                className="border p-2 rounded-md w-full"
            />
            {/* Dropdown for search results */}
            {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-auto w-full">
                    {searchResults.map((result) => (
                        <div
                            key={result.id}
                            className="cursor-pointer p-2 hover:bg-gray-100"
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
