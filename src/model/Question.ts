import mongoose from 'mongoose';
import { Schema, model, Document, Types } from 'mongoose';

interface ITag extends Document {
    tagId: Types.ObjectId;
}

enum DifficultyLevel {
    VERY_EASY = 'VERYEASY',
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
    VERY_HARD = 'VERYHARD',
}

enum VideoType {
    MP4 = 'mp4',
    YOUTUBE = 'youtube',
    VIMEO = 'vimeo',
}

enum AttachmentType {
    COMPREHENSION_PASSAGE = 'comprehensionPassage',
    AUDIO = 'audio',
    VIDEO = 'video',
}

enum QuestionType {
    MCQ_SINGLE = 'MSA',
    MCQ_MULTIPLE = 'MMA',
    TRUE_FALSE = 'TOF',
    SHORT_ANSWER = 'SAQ',
    MATCH_FOLLOWING = 'MTF',
    SEQUENCE = 'ORD',
    FILL_BLANKS = 'FIB',
}

interface IQuestion extends Document {
    // step 1
    questionCode: string;
    questionType: QuestionType;
    question: string;
    options?: { text: string, isCorrect: boolean }[]; // Optional for non-MCQ types
    pairs?: { left: string, right: string }[]; // For "Match the Following"
    sequences?: string[]; // For "Ordering/Sequence"
    trueFalseAnswer?: boolean; // For True/False
    shortAnswer?: number; // For Short Answer
    fillInTheBlanks?: string[]; // For Fill in the Blanks
    // step 2
    sectionId?: Types.ObjectId;
    skillId?: Types.ObjectId;
    topicId?: Types.ObjectId
    tags?: Types.ObjectId[] | ITag[];
    difficultyLevel?: DifficultyLevel;
    defaultMarks?: number;
    defaultTimeToSolve?: number; // in seconds
    isActive: boolean;
    // step3
    solution: string;
    enableSolutionVideo: boolean;
    solutionVideoType?: VideoType;
    solutionVideoLink?: string;
    hint?: string;
    // step 4
    enableQuestionAttachment?: boolean;
    attachmentType?: AttachmentType;
    comprehensionPassageId?: Types.ObjectId;
    audioType?: string;
    audioLink?: string;
    videoType?: string;
    videoLinkOrId?: string;
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
        type: [{ text: String, isCorrect: Boolean }]
        // required: function () {
        //     return this.questionType === QuestionType.MCQ_SINGLE || this.questionType === QuestionType.MCQ_MULTIPLE;
        // },
    },
    pairs: {
        type: [{
            left: String,
            right: String,
        }],
        // required: function () {
        //     return this.questionType === QuestionType.MATCH_FOLLOWING;
        // },
    },
    sequences: {
        type: [String],
        // required: function () {
        //     return this.questionType === QuestionType.SEQUENCE;
        // },
    },
    trueFalseAnswer: {
        type: Boolean,
        // required: function () {
        //     console.log("this : ", this );
        //     console.log("this.questionType : ", this.questionType );
        //     console.log("QuestionType.TRUE_FALSE : ", QuestionType.TRUE_FALSE );
        //     return this.questionType === QuestionType.TRUE_FALSE;
        // },
    },
    shortAnswer: {
        type: String,
        // required: function () {
        //     return this.questionType === QuestionType.SHORT_ANSWER;
        // },
    },
    fillInTheBlanks: {
        type: [String],
        // required: function () {
        //     return this.questionType === QuestionType.FILL_BLANKS;
        // },
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
        // required: function () {
        //     return this.enableSolutionVideo;
        // },
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
    enableQuestionAttachment: {
        type: Boolean,
        default: false,
    },
    attachmentType: {
        type: String,
        enum: AttachmentType,
    },
    comprehensionPassageId: {
        type: Types.ObjectId,
        ref: "Comprehension",
        // required: function () {
        //     return this.enableQuestionAttachment && this.attachmentType === AttachmentType.COMPREHENSION_PASSAGE
        // }
    },
    audioType: {
        type: String,
        // required: function () {
        //     return this.attachmentType === AttachmentType.AUDIO
        // }
    },
    audioLink: {
        type: String,
        // required: function () {
        //     return this.audioType
        // }
    },
    videoType: {
        type: String,
        // required: function () {
        //     return this.attachmentType === AttachmentType.VIDEO
        // }
    },
    videoLinkOrId: {
        type: String,
        // required: function () {
        //     return this.videoType
        // }
    }
}, {
    timestamps: true, // Add createdAt and updatedAt timestamps
});

// Function to generate a random alphanumeric string
const generateRandomString = (length: number): string =>
    Array.from({ length }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');

// Pre-save hook to generate a question code before saving the document
QuestionSchema.pre<IQuestion>('save', function (next) {
    if (!this.questionCode) {
        this.questionCode = `Q_${this.questionType}_${generateRandomString(8)}`;
    }
    next();
});
const Question = (mongoose.models.Question as mongoose.Model<IQuestion>) || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question
export { QuestionType }