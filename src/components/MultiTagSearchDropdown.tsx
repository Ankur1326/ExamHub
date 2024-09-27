'use client'
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SearchDropdownProps {
    label: string;
    placeholder: string;
    fetchResults: (searchQuery: string, fetchAll: boolean) => Promise<any>;
    onSelect: (selectedTags: any[]) => void;
    required: boolean;
    selectedTags: any[];
}

const MultiTagSearchDropdown = ({
    label,
    placeholder,
    fetchResults,
    onSelect,
    required,
    selectedTags: propSelectedTags // Initialize from prop
}: SearchDropdownProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedTags, setSelectedTags] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [initialClick, setInitialClick] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedTags(propSelectedTags || []); // Update state when prop changes
    }, [propSelectedTags]);
    
    // console.log("selectedTags : ", selectedTags);
    // Handle selecting a tag from the dropdown
    const handleSelect = (tag: any) => {
        if (!selectedTags.some((t) => t._id === tag._id)) { // Prevent duplicate tags
            const updatedTags = [...selectedTags, { _id: tag._id, name: tag.name }];
            setSelectedTags(updatedTags);
            onSelect(updatedTags); // Call onSelect with updated selected tags
        }
        setSearchQuery('');
        setShowDropdown(false);
        setSearchResults([]);
    };

    // Remove a selected tag
    const handleRemoveTag = (tagId: any) => {
        const updatedTags = selectedTags.filter((tag) => tag._id !== tagId);
        setSelectedTags(updatedTags);
        onSelect(updatedTags); // Call onSelect with updated selected tags
    };

    // Fetch results based on search query
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery === "" && initialClick) {
                setLoading(true)
                await fetchResults("", true).then((data) => {
                    setSearchResults(data)
                    setShowDropdown(true);
                    setInitialClick(false)
                })
                setLoading(false)
            }
            else if (searchQuery) {
                setLoading(true);
                await fetchResults(searchQuery, true).then((data) => {
                    setSearchResults(data); // Fetch results based on search query
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

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                        <div key={tag._id} className="flex items-center bg-gray-200 px-2 py-1 rounded-md">
                            <span className="text-sm text-gray-700">{tag.name}</span>
                            <button
                                onClick={() => handleRemoveTag(tag._id)}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={searchQuery}
                    required={required}
                    onFocus={() => setInitialClick(true)}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setInitialClick(true)
                    }}
                    placeholder={placeholder}
                    className="border p-2 rounded-md w-full"
                />
                {isLoading && (
                    <span className="absolute right-2">
                        <Loader2 className="animate-spin text-gray-600" />
                    </span>
                )}
            </div>

            {/* Dropdown for search results */}
            {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-auto w-full">
                    {searchResults.map((result) => (
                        <div
                            key={result._id}
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

export default MultiTagSearchDropdown;
