interface SearchBarProps {
    filterQuery: {
        name: string;
        isActive: boolean | null;
    };
    placeHolder: string;
    setFilterQuery: (query: { name: string; isActive: boolean | null }) => void;
}

const SearchBar = ({ filterQuery, setFilterQuery, placeHolder }: SearchBarProps) => {
    return (
        <input
            type="text"
            value={filterQuery.name}
            onChange={(e) => setFilterQuery({ ...filterQuery, name: e.target.value })}
            className="border px-4 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300"
            placeholder={placeHolder}
        />
    );
};

export default SearchBar;
