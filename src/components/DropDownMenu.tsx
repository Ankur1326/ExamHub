import React, { useEffect, useRef } from 'react';

interface DropdownMenuItem {
    id: string;
    label: string;
    onClick: (id: string) => void;
}

interface DropdownMenuProps {
    items: DropdownMenuItem[];
    isOpen: boolean;
    onClose: () => void;
    width?: number;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, width = 36, isOpen, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div ref={menuRef} className={`absolute left-0 mt-2 w-${width} bg-white rounded-md shadow-lg z-10 dark:bg-bg_primary`}>
            <ul className="py-1">
                {items.map((item) => (
                    <li
                        key={item.id}
                        className="block px-3 py-1 text-gray-800 dark:text-text_secondary hover:bg-gray-100 dark:hover:bg-hover_secondary cursor-pointer"
                        onClick={() => item.onClick(item.id)}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DropdownMenu;
