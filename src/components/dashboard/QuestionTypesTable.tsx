import React, { useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

const QuestionTypesTable = ({ questionTypes }: any) => {
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const handleDropdownToggle = (index: any) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

    const handleEdit = (type: string) => {
        // Handle edit action here
        console.log("Edit:", type);
        setDropdownOpen(null);
    };

    const handleDelete = (type: string) => {
        // Handle delete action here
        console.log("Delete:", type);
        setDropdownOpen(null);
    };



    return (
        
    );
};

export default QuestionTypesTable;
