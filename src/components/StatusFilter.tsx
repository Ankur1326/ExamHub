import React from "react";

interface StatusFilterProps {
    filterQuery: any;
    setFilterQuery: (query: any) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ filterQuery, setFilterQuery }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        // Set isActive to `null` for "Both" or `boolean` for Active/Inactive
        const isActive = value === "" ? null : value === "true";

        setFilterQuery({ ...filterQuery, isActive });
    };

    return (
        <select
            value={filterQuery.isActive === null ? "" : String(filterQuery.isActive)}
            // defaultValue={null}
            // onChange={onChange}
            onChange={handleChange}
            className="border border-gray-300 text-xs rounded-md px-3 py-1 dark:border-border dark:hover:border-hover_border"
        >
            <option value="">Both</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
        </select>
    );
};

export default StatusFilter;
