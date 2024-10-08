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
            <option value="">Select Q Type</option>
            <option value="Multiple Choice Single Answer">Multiple Choice Single Answer</option>
            <option value="Multiple Choice Multiple Answers">Multiple Choice Multiple Answers</option>
            <option value="True or False">True or False</option>
            <option value="Short Answer">Short Answer</option>
            <option value="Match the Following">Match the Following</option>
            <option value="Ordering/Sequence">Ordering/Sequence</option>
            <option value="Fill in the Blanks">Fill in the Blanks</option>
        </select>
    )
}

export default QuestionTypesDropdownSelector
