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

// Main Configuration Document Interface
interface IConfiguration extends Document {
    documentType: string;
    questionTypes?: IQuestionType[];
    questionCategories?: IQuestionCategory[];
    // appSettings?: IAppSettings; // Include when AppSettings schema is defined
}

const configurationSchema = new Schema<IConfiguration>({
    documentType: {
        type: String,
        required: true,
        unique: true,
    },
    questionTypes: {
        type: [QuestionTypeSchema],
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