import mongoose, { Schema, Document } from "mongoose";

export interface IComprehension extends Document {
    title: string;
    body: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ComprehensionSchema: Schema<IComprehension> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
        },
        body: {
            type: String,
            required: [true, "body is required"],
        },
        isActive: {
            type: Boolean,
            required: [true, "isActive status is required"],
            default: true
        },
    },
    {
        timestamps: true,
    }
)

const Comprehension = (mongoose.models.Comprehension as mongoose.Model<IComprehension>) || mongoose.model<IComprehension>("Comprehension", ComprehensionSchema);

export default Comprehension;