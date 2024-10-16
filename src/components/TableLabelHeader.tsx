interface TableHeaderProps {
    headings: any;  // Array of heading labels
  }
  
  const TableLabelHeader: React.FC<TableHeaderProps> = ({ headings }) => {
    return (
      <thead className="bg-white dark:bg-bg_secondary">
        <tr>
          {headings.map((heading:string, index:number) => (
            <th
              key={index}
              className="py-3 px-4 text-left text-sm font-semibold text-[#99A1B7] border-r border-gray-100 dark:border-border_secondary"
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>
    );
  };
  
  export default TableLabelHeader;
  