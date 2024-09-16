import mongoose, { Schema } from 'mongoose';

interface IQuestionType extends Document {
    typeName: string;
    description?: string;
    code?: string;
    _id?: string;
    isActive: boolean;
}

interface IQuestionCategory extends Document {
    categoryName: string;
    description?: string;
    isActive: boolean;
}

interface IQuestionTags extends Document {
    tagName: string;
    isActive: boolean;
}

const QuestionTypeSchema = new Schema<IQuestionType>({
    typeName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: '',
    },
    code: {
        type: String,
        unique: true,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
})

// Define the schema for question categories
const QuestionCategorySchema = new Schema<IQuestionCategory>({
    categoryName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const questionTagSchema = new Schema<IQuestionTags>({
    tagName: {
        type: String,
        required: [true, "Tag Name is required"],
        unique: true,
        index: true,
    },
    isActive: {
        type: Boolean,
        required: [true, "isActive is required"],
        default: true,
    }
})


// Main Configuration Document Interface
interface IConfiguration extends Document {
    documentType: string;
    appTheme?: IQuestionType[];
    questionCategories?: IQuestionCategory[];
    questionTags?: IQuestionTags[];
    // appSettings?: IAppSettings; // Include when AppSettings schema is defined
}

const configurationSchema = new Schema<IConfiguration>({
    documentType: {
        type: String,
        required: true,
        unique: true,
    },
    appTheme: {
        type: [QuestionTypeSchema],
        default: undefined,
    },
    questionTags: {
        type: [questionTagSchema],
        default: undefined,
    },
    questionCategories: {
        type: [QuestionCategorySchema],
        default: undefined,
    },
    // appSettings: AppSettingsSchema,
}, { timestamps: true })

const ConfigurationModel = (mongoose.models.Configuration as mongoose.Model<IConfiguration>) || mongoose.model<IConfiguration>('Configuration', configurationSchema)

export default ConfigurationModel