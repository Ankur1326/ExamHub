'use client'
import { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";
import KtIcon from "@/components/KtIcon";
import TableLabelHeader from "@/components/TableLabelHeader";
import CopyButton from "@/components/CopyButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import axios from "axios";
import toast from "react-hot-toast";
import Alert from "@/components/Alert";

type Option = {
    text: string;
    isCorrect: boolean;
};

type Pair = {
    left: string,
    right: string,
}

type Question = {
    questionType?: string;
    question?: string;
    options?: Option[];
    pairs?: Pair[];
    sequences?: string[];
    trueFalseAnswer?: boolean | null;
    correctAnswer?: string;
    defaultMarks?: number;
    defaultTimeToSolve?: number;
    difficultyLevel?: string;
    hint?: string;
    solution?: string;
};


const questionTypes = [
    { name: "Multiple Choice Single Answer", acceptableCode: "MSA" },
    { name: "Multiple Choice Multiple Answers", acceptableCode: "MMA" },
    { name: "True or False", acceptableCode: "TOF" },
    { name: "Short Answer", acceptableCode: "SAQ" },
    { name: "Match the Following", acceptableCode: "MTF" },
    { name: "Ordering/Sequence", acceptableCode: "ORD" },
    { name: "Fill in the Blanks", acceptableCode: "FIB" },
];

const difficultyLevels = [
    { name: "Very Easy", acceptableCode: "VERYEASY" },
    { name: "Easy", acceptableCode: "EASY" },
    { name: "Medium", acceptableCode: "MEDIUM" },
    { name: "High", acceptableCode: "HIGH" },
    { name: "Very High", acceptableCode: "VERYHIGH" },
];

const ImportQuestions = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showPreview, setShowPreview] = useState(false); // For showing question preview
    // const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    const [uploadSummary, setUploadSummary] = useState<{
        successfulQuestions: number;
        failedQuestions: { question: Question; reason: string }[];
    } | null>(null);


    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setSelectedFile(file);
        handleFile(file);
    }, []);


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        // accept: [".xlsx", ".xls"],
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"]
        }
    });


    const handleFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

            const parsedQuestions: any = sheetData.slice(1).map((row) => {

                const correctAnswer = row[7] || ""; // Assume correct answer is in column 7
                const correctIndices = correctAnswer.toString().split(',').map(num => Number(num) - 1);; // subtract 1 to match index (0-based)

                // MCQ
                if (row[0] === 'MSA' || row[0] === 'MMA' || row[0] === 'SAQ') {
                    const options: Option[] = [];
                    // Parse options dynamically
                    for (let i = 2; i <= 6; i++) {
                        if (row[i]) {
                            // Add options with `isCorrect` initially set to false
                            options.push({ text: row[i].toString(), isCorrect: false });
                        }
                    }

                    // Update `isCorrect` for each option based on the correct indices
                    correctIndices.forEach((index: any) => {
                        if (options[index]) {
                            options[index].isCorrect = true;
                        }
                    });

                    return {
                        questionType: row[0] || "",
                        question: row[1] || "",
                        options: options,
                        defaultMarks: row[8] || "",
                        defaultTimeToSolve: row[9] || "",
                        difficultyLevel: row[10] || "",
                        hint: row[11] || "",
                        solution: row[12] || "",
                    };
                } else if (row[0] === 'MTF') { // Match the following
                    const pairs: Pair[] = []
                    for (let i = 2; i <= 6; i++) {
                        if (row[i]) {
                            const pair: any = row[i].toString().split(',')
                            pairs.push({ left: pair[0], right: pair[1] })
                        }
                    }
                    return {
                        questionType: row[0] || "",
                        question: row[1] || "",
                        pairs: pairs,
                        defaultMarks: row[8] || "",
                        defaultTimeToSolve: row[9] || "",
                        difficultyLevel: row[10] || "",
                        hint: row[11] || "",
                        solution: row[12] || "",
                    };
                } else if (row[0] === 'TOF') { // true / false
                    const trueFalseQuestionAns = row[Number(correctAnswer) + 1] === 'TRUE' ? true : row[Number(correctAnswer) + 1] === 'FALSE' ? false : ''
                    console.log("trueFalseQuestionAns : ", trueFalseQuestionAns);


                    return {
                        questionType: row[0] || "",
                        question: row[1] || "",
                        trueFalseAnswer: trueFalseQuestionAns,
                        defaultMarks: row[8] || "",
                        defaultTimeToSolve: row[9] || "",
                        difficultyLevel: row[10] || "",
                        hint: row[11] || "",
                        solution: row[12] || "",
                    };
                } else if (row[0] === 'ORD') { // true / false
                    const sequences: string[] = [];
                    // Parse options dynamically
                    for (let i = 2; i <= 6; i++) {
                        if (row[i]) {
                            sequences.push(row[i].toString());
                        }
                    }
                    return {
                        questionType: row[0] || "",
                        question: row[1] || "",
                        sequences,
                        defaultMarks: row[8] || "",
                        defaultTimeToSolve: row[9] || "",
                        difficultyLevel: row[10] || "",
                        hint: row[11] || "",
                        solution: row[12] || "",
                    };
                } else if (row[0] === 'FIB') {
                    return {
                        questionType: row[0] || "",
                        question: row[1] || "",
                        defaultMarks: row[8] || "",
                        defaultTimeToSolve: row[9] || "",
                        difficultyLevel: row[10] || "",
                        hint: row[11] || "",
                        solution: row[12] || "",
                    };
                } else {
                    console.log("Invalid question Type");
                }

            });

            setQuestions(parsedQuestions);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setQuestions([]);
    };

    // Function to download sample file (you can set this to an actual path or create one dynamically)
    const handleDownloadSample = () => {
        const link = document.createElement("a");
        link.href = "/path/to/sample-file.xlsx"; // Replace with the actual path of your sample file
        link.download = "sample-questions.xlsx";
        link.click();
    };

    const handleUpload = async () => {
        if (!(questions.length > 0)) {
            toast.error("Please select a file")
            return null
        }
        setUploading(true);
        setUploadSummary(null);
        const config = {
            onUploadProgress: function (progressEvent: any) {
                const percentCompleted = (progressEvent.loaded / progressEvent.total) * 100
                console.log("percentCompleted : ", percentCompleted);
                setProgress(percentCompleted)

                if (percentCompleted === 100) {
                    setUploading(false)
                }
            }
        }
        try {
            const response = await axios.post("/api/admin/question/bulk-upload", { questions }, config);
            console.log("response : ", response);

            if (response.data.success) {
                const successfulQuestions = response.data.questions.filter((q: any) => q.status === 'fulfilled');
                const failedQuestions = response.data.questions.filter((q: any) => q.status === 'rejected');

                setUploadSummary({
                    successfulQuestions: successfulQuestions.length,
                    failedQuestions: failedQuestions.map((q: any) => ({
                        question: q.questionData,
                        reason: q.reason || "Unknown error",
                    })),
                });

                setShowSuccessAlert(true);
                if (failedQuestions.length > 0) {
                    setShowErrorAlert(true);
                }

                // toast.success(`${successfulQuestions.length} questions uploaded successfully`);

                if (failedQuestions.length > 0) {
                    // toast.error(`${failedQuestions.length} questions failed to upload. Check console for details.`);
                    // console.error("Failed Questions:", failedQuestions);
                }
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploading(false)
        }
    }


    return (
        <div className="space-y-8 p-6 bg-white dark:bg-bg_secondary shadow-sm rounded-md">

            {/* Upload Summary */}
            {uploadSummary && (
                <div className="">

                    {
                        uploadSummary.successfulQuestions && showSuccessAlert &&
                        <Alert type="success" onClose={() => setShowSuccessAlert(false)} message={`${uploadSummary.successfulQuestions} questions uploaded successfully`} />
                    }
                    {uploadSummary.failedQuestions.length > 0 && showErrorAlert && (
                        <div>
                            <Alert type="error" onClose={() => setShowErrorAlert(false)}
                                message={`${uploadSummary.failedQuestions.length} questions failed to upload:`} description={
                                    uploadSummary.failedQuestions.map((item, index) => (
                                        <li key={index}>
                                            <strong>Question:</strong> {item.question?.question || 'Unknown question'} <br />
                                            <strong>Reason:</strong> {item.reason}
                                        </li>
                                    ))
                                } />
                        </div>
                    )}
                </div>
            )}

            {/* File Upload and Sample File */}
            <div className="flex items-center w-full text-center">
                <div className="flex flex-col items-end gap-4 w-1/2 m-auto">

                    {/* Upload Progress Bar */}
                    {/* {
                        uploading &&
                        <ProgressBar progress={progress} />
                    } */}

                    {/* Download Sample File Button */}
                    <div className="">
                        <button
                            onClick={handleDownloadSample}
                            className="flex gap-1 items-center text-blue-400 text-sm hover:underline transition duration-200"
                        >
                            <KtIcon size={25} className="text-blue-400" filePath="/media/icons/duotune/files/fil017.svg" />
                            <span>
                                Download Sample File (.xlsx)
                            </span>
                        </button>
                    </div>

                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed flex flex-col gap-2 items-center justify-center w-full py-14 rounded-md cursor-pointer transition-colors duration-200 dark:border-border_secondary dark:hover:border-hover_border ${isDragActive ? "border-gray-400 dark:bg-gray-800" : "border-gray-200 dark:bg-gray-900"
                            } hover:border-gray-300`}
                    >
                        {
                            selectedFile ? (
                                <KtIcon size={40} className="text-green-400" filePath="/media/icons/duotune/arrows/arr016.svg" />
                            ) : (
                                <KtIcon size={40} className="text-blue-400" filePath="/media/icons/duotune/arrows/arr045.svg" />
                            )
                        }

                        {
                            selectedFile ? (
                                <div className="flex flex-col items-center gap-2 text-sm text-gray-300">
                                    <span>Selected File: {selectedFile.name}</span>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="text-red-500 flex items-center hover:text-red-700"
                                    >
                                        <FaTrash size={16} />
                                        <span className="ml-2">Delete</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center flex flex-col gap-3 items-center">
                                    <input {...getInputProps()} />
                                    <p className="font-semibold text-sm text-gray-300">Drag & Drop or Choose a file to upload</p>
                                    <p className="text-xs text-gray-500">Only .xlsx or .xls files</p>
                                </div>
                            )
                        }
                    </div>

                    {/* Upload Button */}
                    <button
                        disabled={uploading}
                        onClick={handleUpload}
                        className="bg-blue_button text-white text-xs font-semibold py-2 px-6 rounded-sm hover:bg-blue_hover_button transition duration-200"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>

                    {
                        selectedFile && (
                            <div className="w-full text-start">
                                <button
                                    className="dark:bg-gray-800 text-xs font-semibold bg-blue-50 text-blue-600 dark:text-blue-400 py-2 px-6 rounded-sm dark:hover:bg-gray-700 transition duration-200"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    {showPreview ? "Hide Preview" : "Preview"}
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>

            {/* Preview Questions Button */}
            {questions.length > 0 && (
                showPreview && (
                    <div className="mt-4 bg-white shadow-sm p-4 rounded-md dark:bg-bg_primary">
                        <h3 className="font-semibold text-lg mb-2 dark:text-text_secondary">Parsed Questions</h3>
                        <table className="w-full border dark:border-[#2d2d2d] dark:text-text_secondary dark:bg-bg_secondary rounded-lg text-sm">
                            <TableLabelHeader headings={["Question Type", "Question", "Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Correct Answer", "Default Marks", "Default Time To Solve", "Difficulty",]} />
                            <tbody>
                                {questions.map((question, index) => (
                                    <tr key={index} className="border-gray-100 border-t hover:bg-gray-50 dark:border-border_secondary dark:hover:bg-hover_secondary">
                                        <td className="py-3 px-3 text-sm border-r border-gray-100 dark:border-border_secondary">
                                            <CopyButton text={question?.questionType || ""} />
                                        </td>
                                        <td className="py-3 px-3 text-sm border-r border-gray-100 dark:border-border_secondary">{question.question}</td>
                                        {
                                            [0, 1, 2, 3, 4].map((index) => {
                                                return (
                                                    <td className="py-3 px-3 border-r text-sm border-gray-100 dark:border-border_secondary">
                                                        {
                                                            question.options ?
                                                                <div className="flex gap-1">
                                                                    <span>{question?.options[index]?.text}</span>
                                                                    <span className="">{
                                                                        question?.options[index]?.isCorrect
                                                                            ? <KtIcon size={16} className="text-green-400" filePath="/media/icons/duotune/arrows/arr016.svg" />
                                                                            :
                                                                            ""}</span>
                                                                </div>
                                                                :
                                                                question?.pairs ?
                                                                    <div className="flex gap-1">
                                                                        <span>{question?.pairs[index].left}</span> ,
                                                                        <span>{question?.pairs[index].right}</span>
                                                                    </div>
                                                                    :
                                                                    question?.sequences ?
                                                                        <div className="flex gap-1">
                                                                            <span>{question?.sequences[index]}</span>
                                                                        </div>
                                                                        : ""

                                                        }
                                                    </td>
                                                )
                                            })
                                        }
                                        <td className="py-3 px-3 text-sm border-r border-gray-100 dark:border-border_secondary">{question?.correctAnswer ? question?.correctAnswer : question?.trueFalseAnswer?.toString()}</td>
                                        <td className="py-3 px-3 text-sm border-r border-gray-100 dark:border-border_secondary">{question.defaultMarks}</td>
                                        <td className="py-3 px-3 text-sm border-r border-gray-100 dark:border-border_secondary">{question.defaultTimeToSolve}</td>
                                        <td className="py-3 px-3 text-sm border-gray-100 dark:border-border_secondary">{question.difficultyLevel}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Question Types & Difficulty Levels */}
            <div className="grid grid-cols-2 gap-8">
                {/* Question Types */}
                <div>
                    <p className="text-sm font-semibold mb-2">Question Types</p>
                    <table className="w-full border dark:border-[#2d2d2d] dark:text-text_secondary dark:bg-bg_secondary border-gray-200 rounded-lg">
                        <TableLabelHeader headings={["Name", "Acceptable Code"]} />
                        <tbody>
                            {questionTypes.map((type, index) => (
                                <tr key={index} className="border-gray-100 border-t hover:bg-gray-50 dark:border-border_secondary dark:hover:bg-hover_secondary">
                                    <td className="py-2 px-4 text-sm">{type.name}</td>
                                    <td className="py-2 px-4">
                                        <CopyButton text={type.acceptableCode} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Difficulty Levels */}
                <div>
                    <p className="text-sm font-semibold mb-2">Difficulty Levels</p>
                    <table className="w-full border dark:border-[#2d2d2d] dark:text-text_secondary dark:bg-bg_secondary rounded-lg">
                        <TableLabelHeader headings={["Name", "Acceptable Code"]} />
                        <tbody>
                            {difficultyLevels.map((level, index) => (
                                <tr key={index} className="border-gray-100 border-t hover:bg-gray-50 dark:border-border_secondary dark:hover:bg-hover_secondary">
                                    <td className="py-2 px-4 text-sm">{level.name}</td>
                                    <td className="py-2 px-4">
                                        <CopyButton text={level.acceptableCode} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
};

const ProgressBar = ({ progress }: any) => {
    return (
        <div className="w-full bg-[#e0e0df] dark:bg-gray-500 rounded-md mb-4">
            <div
                className="bg-green-500 dark:bg-green-500 h-2 rounded-md "
                style={{
                    width: `${progress}%`,
                    transition: 'width 0.5s'
                }}
            />
        </div>
    );
};


export default ImportQuestions;
