import mongoose, { Schema, Document } from "mongoose";

export interface ISection extends Document {
    name: string;
    shortDescription: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SectionSchema: Schema<ISection> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
            trim: true,         // Trims whitespace
            minlength: 2,
            maxlength: 100
        },
        shortDescription: {
            type: String,
            default: "",
            maxlength: 300
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

const Section = (mongoose.models.Section as mongoose.Model<ISection>) || mongoose.model<ISection>("Section", SectionSchema);

export default Section;