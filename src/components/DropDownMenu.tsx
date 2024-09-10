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
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, isOpen, onClose }) => {
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
        <div ref={menuRef} className="absolute left-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10">
            <ul className="py-1">
                {items.map((item) => (
                    <li
                        key={item.id}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
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
