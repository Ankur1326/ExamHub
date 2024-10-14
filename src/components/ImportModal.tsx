import ModalContainer from "./ModalContainer";
import { useCallback, useState } from "react";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";

interface ImportModalProps {
    onClose: () => void;
    isVisible: boolean;
}

type Question = {
    questionType: string;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5: string;
    correctAnswer: string;
    defaultMarks: string;
    defaultTimeToSolve: string;
    difficultyLevel: string;
    hint: string;
    solution: string;
};

const ImportModal = ({ onClose, isVisible }: ImportModalProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        handleFile(file);
        setSelectedFile(file); // Save the selected file
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: [".xlsx", ".xls"],
    });

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

            // Skip the header row and process each question
            const parsedQuestions: Question[] = sheetData.slice(1).map((row) => ({
                questionType: row[0] || "",
                question: row[1] || "",
                option1: row[2] || "",
                option2: row[3] || "",
                option3: row[4] || "",
                option4: row[5] || "",
                option5: row[6] || "",
                correctAnswer: row[7] || "",
                defaultMarks: row[8] || "",
                defaultTimeToSolve: row[9] || "",
                difficultyLevel: row[10] || "",
                hint: row[11] || "",
                solution: row[12] || "",
            }));

            setQuestions(parsedQuestions);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setQuestions([]); // Clear parsed questions
    };

    return (
        <ModalContainer title='Import Question' isVisible={isVisible} onClose={onClose} size='large'>
            <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-800">
                {/* Drag and Drop Area */}
                <div
                    {...getRootProps()}
                    style={{
                        border: "2px dashed #0087F7",
                        padding: "20px",
                        textAlign: "center",
                        marginBottom: "20px",
                    }}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Drop the file here...</p>
                    ) : (
                        <p>Drag and drop an .xlsx file here, or click to select one</p>
                    )}
                </div>

                {/* File Input (Fallback for file selection) */}
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            handleFile(file);
                            setSelectedFile(file);
                        }
                    }}
                    style={{ marginBottom: "20px" }}
                />

                {/* Selected File and Delete Button */}
                {selectedFile && (
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                        <p style={{ marginRight: "10px" }}>Selected File: {selectedFile.name}</p>
                        <button
                            onClick={handleRemoveFile}
                            style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "red",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <FaTrash size={20} />
                            <span style={{ marginLeft: "5px" }}>Delete File</span>
                        </button>
                    </div>
                )}

                {/* Display Parsed Questions */}
                {questions.length > 0 && (
                    <div>
                        <h2>Parsed Questions</h2>
                        <ul>
                            {questions.map((q, index) => (
                                <li key={index}>
                                    <strong>{q.questionType}</strong> - {q.question}
                                    <ul>
                                        <li>Option 1: {q.option1}</li>
                                        <li>Option 2: {q.option2}</li>
                                        <li>Option 3: {q.option3}</li>
                                        <li>Option 4: {q.option4}</li>
                                        <li>Option 5: {q.option5}</li>
                                        <li>Correct Answer: {q.correctAnswer}</li>
                                        <li>Default Marks: {q.defaultMarks}</li>
                                        <li>Time to Solve: {q.defaultTimeToSolve} seconds</li>
                                        <li>Difficulty Level: {q.difficultyLevel}</li>
                                        <li>Hint: {q.hint}</li>
                                        <li>Solution: {q.solution}</li>
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ModalContainer >
    )
}

export default ImportModal