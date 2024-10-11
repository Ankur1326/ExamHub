import { Filter } from "lucide-react";
import KtIcon from "./KtIcon";

interface SearchFiltersProps {
    filterFields: React.ReactNode[];  // Array of filter fields to display
    onSearch: () => void;             // Function to trigger the search action
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filterFields, onSearch }) => {
    return (
        <thead className="bg-gray-100 dark:bg-[#282a31] ">
            <tr>
                {filterFields.map((filterField, index) => (
                    <th
                        key={index}
                        className="text-left px-2 py-2 text-xs font-medium text-gray-600 border-r border-white dark:border-border_secondary"
                    >
                        {filterField}
                    </th>
                ))}
                <th className="text-left py-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <button
                        onClick={onSearch}
                        className="flex items-center gap-2 bg-[#EFF6FF] dark:bg-gray-800 rounded-md border border-blue-200 dark:border-gray-700 table_input_border text-blue-500 dark:text-blue-400 px-2 py-[6px] text-xs hover:bg-blue_hover_button dark:hover:bg-blue-600 transition duration-200 ease-in-out hover:text-white dark:hover:text-gray-100 shadow-sm"
                    >
                        <KtIcon size={18} className="" filePath="/media/icons/duotune/general/gen031.svg" />
                        <span>Filters</span>
                    </button>
                </th>

            </tr>
        </thead>
    );
};

export default SearchFilters;
