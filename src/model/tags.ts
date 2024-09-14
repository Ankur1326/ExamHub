import mongoose, { Schema, Document } from "mongoose";

export interface ITag extends Document {
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TagSchema: Schema<ITag> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
            trim: true,         // Trims whitespace
            minlength: 2,
            maxlength: 100
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

const Tag = (mongoose.models.Tag as mongoose.Model<ITag>) || mongoose.model<ITag>("Tag", TagSchema);

export default Tag;