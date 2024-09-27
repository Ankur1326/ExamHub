import mongoose from 'mongoose';
import { Schema, model, Document, Types } from 'mongoose';

interface ITag extends Document {
    tagId: Types.ObjectId;
}

enum DifficultyLevel {
    VERY_EASY = 'Very Easy',
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard',
    VERY_HARD = 'Very Hard',
}

enum VideoType {
    MP4 = 'mp4',
    YOUTUBE = 'youtube',
    VIMEO = 'vimeo',
}

enum QuestionType {
    MCQ_SINGLE = 'Multiple Choice Single Answer',
    MCQ_MULTIPLE = 'Multiple Choice Multiple Answers',
    TRUE_FALSE = 'True or False',
    SHORT_ANSWER = 'Short Answer',
    MATCH_FOLLOWING = 'Match the Following',
    SEQUENCE = 'Ordering/Sequence',
    FILL_BLANKS = 'Fill in the Blanks',
}

interface IQuestion extends Document {
    questionCode: string;
    questionType: QuestionType;
    question: string;
    options?: string[]; // Optional for non-MCQ types
    correctOptions?: number[]; // Can hold single or multiple correct options
    matchPairs?: { left: string, right: string[] }[]; // For "Match the Following"
    sequenceOrder?: string[]; // For "Ordering/Sequence"
    trueFalseAnswer?: boolean; // For True/False
    shortAnswer?: string; // For Short Answer
    fillInTheBlanks?: string[]; // For Fill in the Blanks
    sectionId?: Types.ObjectId;
    skillId?: Types.ObjectId;
    topicId?: Types.ObjectId
    tags?: Types.ObjectId[] | ITag[];
    difficultyLevel: DifficultyLevel;
    defaultMarks: number;
    defaultTimeToSolve: number; // in seconds
    isActive: boolean;
    solution: string;
    enableSolutionVideo: boolean;
    solutionVideoType?: VideoType;
    solutionVideoLink?: string;
    hint?: string;
}

const QuestionSchema = new Schema<IQuestion>({
    questionCode: {
        type: String,
        unique: true,
    },
    questionType: {
        type: String,
        enum: QuestionType,
        required: true,
    },
    question: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        type: [String],
        required: function () {
            return this.questionType === QuestionType.MCQ_SINGLE || this.questionType === QuestionType.MCQ_MULTIPLE;
        },
    },
    correctOptions: {
        type: [Number],
        required: function () {
            return this.questionType === QuestionType.MCQ_SINGLE || this.questionType === QuestionType.MCQ_MULTIPLE;
        },
        validate: {
            validator: function (correctOptions: number[]) {
                // Check if options exist and if correctOptions indexes are valid
                return this.options?.every((option, index) => correctOptions.every(co => co >= 0 && co < index)) ?? false;
            },
            message: 'Correct options must correspond to valid option indices',
        },
    },
    matchPairs: {
        type: [{
            left: String,
            right: [String],
        }],
        required: function () {
            return this.questionType === QuestionType.MATCH_FOLLOWING;
        },
    },
    sequenceOrder: {
        type: [String],
        required: function () {
            return this.questionType === QuestionType.SEQUENCE;
        },
    },
    trueFalseAnswer: {
        type: Boolean,
        required: function () {
            return this.questionType === QuestionType.TRUE_FALSE;
        },
    },
    shortAnswer: {
        type: String,
        required: function () {
            return this.questionType === QuestionType.SHORT_ANSWER;
        },
    },
    fillInTheBlanks: {
        type: [String],
        required: function () {
            return this.questionType === QuestionType.FILL_BLANKS;
        },
    },
    sectionId: {
        type: Types.ObjectId,
        ref: "Section"
    },
    skillId: {
        type: Types.ObjectId,
        ref: 'Skill',
    },
    topicId: {
        type: Types.ObjectId,
        ref: 'Topic',
    },
    tags: [{
        type: Types.ObjectId,
        ref: 'Tag',
    }],
    difficultyLevel: {
        type: String,
        enum: DifficultyLevel,
        default: DifficultyLevel.MEDIUM,
    },
    defaultMarks: {
        type: Number,
        default: 1,
    },
    defaultTimeToSolve: {
        type: Number,
        default: 60, // Default 60 seconds
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    solution: {
        type: String,
        required: false,
        trim: true,
    },
    enableSolutionVideo: {
        type: Boolean,
        default: false,
    },
    solutionVideoType: {
        type: String,
        enum: VideoType,
        required: function () {
            return this.enableSolutionVideo;
        },
    },
    solutionVideoLink: {
        type: String,
        required: function () {
            return this.enableSolutionVideo;
        },
        validate: {
            validator: function (link: string) {
                return this.enableSolutionVideo ? link.trim().length > 0 : true;
            },
            message: 'Solution video link must be provided if the solution video is enabled',
        },
    },
    hint: {
        type: String,
        required: false,
        trim: true,
    },
}, {
    timestamps: true, // Add createdAt and updatedAt timestamps
});

// Function to generate a random alphanumeric string
const generateRandomString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
};

// Function to generate unique question code
const generateQuestionCode = (questionType: QuestionType) => {
    const randomString = generateRandomString(11); // Generates an 11-character string
    const getQuestionCode = (questionType: string) => {
        switch (questionType) {
            case 'Multiple Choice Single Answer':
                return "MSA";
            case 'Multiple Choice Multiple Answers':
                return "MMA";
            case 'True or False':
                return "TOF"
            case 'Short Answer':
                return "SAQ"
            case 'Match the Following':
                return "MTF"
            case 'Ordering/Sequence':
                return "ORD"
            case 'Fill in the Blanks':
                return "FIB"
            default:
                return ""
        }
    }
    console.log("questionCode : ", getQuestionCode(questionType));

    return `Q_${getQuestionCode(questionType)}_${randomString}`;
};

// Pre-save hook to generate a question code before saving the document
QuestionSchema.pre<IQuestion>('save', function (next) {
    if (!this.questionCode) {
        this.questionCode = generateQuestionCode(this.questionType);
    }
    next();
});

const Question = (mongoose.models.Question as mongoose.Model<IQuestion>) || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question
export { QuestionType }