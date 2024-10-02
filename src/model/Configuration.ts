import mongoose, { Schema } from 'mongoose';

interface IQuestionType extends Document {
    name: string;
    shortDescription?: string;
    code?: string;
    _id?: string;
    isActive: boolean;
    defaultTimeToSolve: number;
    defaultMarks: number;
}

const QuestionTypeSchema = new Schema<IQuestionType>({
    name: {
        type: String,
        required: true
    },
    shortDescription: {
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
    defaultTimeToSolve: {
        type: Number,
        default: 60
    },
    defaultMarks: {
        type: Number,
        default: 1
    },
})

// Main Configuration Document Interface
interface IConfiguration extends Document {
    documentType: string;
    questionTypes?: IQuestionType[];
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
    // appSettings: AppSettingsSchema,
}, { timestamps: true })

const ConfigurationModel = (mongoose.models.Configuration as mongoose.Model<IConfiguration>) || mongoose.model<IConfiguration>('Configuration', configurationSchema)

export default ConfigurationModel