interface TableHeaderProps {
    headings: string[];  // Array of heading labels
  }
  
  const TableLabelHeader: React.FC<TableHeaderProps> = ({ headings }) => {
    return (
      <thead className="bg-white dark:bg-bg_secondary">
        <tr>
          {headings.map((heading, index) => (
            <th
              key={index}
              className="py-3 px-4 text-left text-sm font-semibold text-gray-400 border-r border-gray-100 dark:border-border_secondary"
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>
    );
  };
  
  export default TableLabelHeader;
  