import React from 'react'

interface QuestionTypesDropdownSelectorProps {
    filterQuery: any
    setFilterQuery: (query: any) => void;
    width?: number
}

const QuestionTypesDropdownSelector: React.FC<QuestionTypesDropdownSelectorProps> = ({ filterQuery, setFilterQuery, width }) => {

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const questionType = e.target.value;

        setFilterQuery({ ...filterQuery, questionType });
    };

    return (
        <select
            value={filterQuery.questionType}
            // defaultValue={null}
            // onChange={onChange}
            onChange={handleChange}
            className="border border-gray-300 text-xs rounded-md px-2 py-1 dark:border-border dark:hover:border-hover_border"
            style={{ width: width ? `${width}px` : 'auto' }}
        >
            <option value="">All</option>
            <option value="MSA">Multiple Choice Single Answer</option>
            <option value="MMA">Multiple Choice Multiple Answers</option>
            <option value="TOF">True or False</option>
            <option value="SAQ">Short Answer</option>
            <option value="MTF">Match the Following</option>
            <option value="ORD">Ordering/Sequence</option>
            <option value="FIB">Fill in the Blanks</option>
        </select>
    )
}

export default QuestionTypesDropdownSelector
