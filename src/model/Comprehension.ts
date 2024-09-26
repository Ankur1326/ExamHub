import mongoose, { Schema, Document } from "mongoose";

export interface ICompreshension extends Document {
    title: string;
    body: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CompreshensionSchema: Schema<ICompreshension> = new mongoose.Schema(
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

const Compreshension = (mongoose.models.Compreshension as mongoose.Model<ICompreshension>) || mongoose.model<ICompreshension>("Compreshension", CompreshensionSchema);

export default Compreshension;