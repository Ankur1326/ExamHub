import { useEffect, useRef } from "react";

interface ModalContainerProps {
  title: string;
  isVisible: boolean;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large'| 'very_large';
  children: React.ReactNode;
}

const sizeClass = {
  small: 'max-w-sm',
  medium: 'max-w-2xl',
  large: 'max-w-4xl',
  very_large: 'max-w-6xl'
};

const ModalContainer: React.FC<ModalContainerProps> = ({ title, isVisible, onClose, size = 'medium', children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div ref={modalRef} className={`bg-white dark:bg-bg_secondary rounded-lg shadow-lg w-full transition-all duration-200 ease-in-out ${sizeClass[size]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="flex justify-between items-center py-2 px-4 border-b dark:border-border_secondary">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            &times;
          </button>
        </div>
        <div className="p-3 space-y-6 overflow-y-auto" style={{ maxHeight: '85vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer