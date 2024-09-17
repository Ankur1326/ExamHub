interface SearchBarProps {
    filterQuery: {
        name: string;
        sectionName: string;
        skillName: string;
        isActive: boolean | null;
    };
    placeHolder: string;
    fieldName: keyof SearchBarProps['filterQuery']; // Specify the field being updated
    setFilterQuery: (query: { name: string; sectionName: string; isActive: boolean | null }) => void;
}

const SearchBar = ({ filterQuery, setFilterQuery, placeHolder, fieldName }: SearchBarProps) => {
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
            className="border px-4 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300"
            placeholder={placeHolder}
        />
    );
};

export default SearchBar;
