interface SearchBarProps {
    filterQuery: any;
    placeHolder: string;
    fieldName: keyof SearchBarProps['filterQuery']; // Specify the field being updated
    setFilterQuery: (query: { name: string; sectionName: string; isActive: boolean | null }) => void;
    width?: number;
}

const SearchBar = ({ filterQuery, setFilterQuery, placeHolder, fieldName, width }: SearchBarProps) => {
    const inputValue =
        typeof filterQuery[fieldName] === 'boolean'
            ? filterQuery[fieldName] === true
                ? "true"
                : "false"
            : filterQuery[fieldName] || "";


    return (
        <input
            type="text"
            value={inputValue}
            onChange={(e) => setFilterQuery({ ...filterQuery, [fieldName]: e.target.value })}
            className={`w-[${width}px] border px-4 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300`}
            style={{ width: width ? `${width}px` : 'auto' }}
            placeholder={placeHolder}
        />
    );
};

export default SearchBar;
