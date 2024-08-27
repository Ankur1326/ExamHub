const ErrorMessage = ({ message }: any) => {
    return (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-lg mx-auto">
            <h2 className="font-bold text-lg">Error</h2>
            <p>{message || 'Something went wrong.'}</p>
        </div>
    );
}

export default ErrorMessage