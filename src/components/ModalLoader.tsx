import { Loader2 } from 'lucide-react';

const ModalLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
                <Loader2 className="animate-spin" width={18} />
            </div>
        </div>
    );
};

export default ModalLoader;
