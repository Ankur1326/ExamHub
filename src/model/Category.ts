import mongoose, { Schema, Document } from "mongoose";

// Define the Category interface, extending Mongoose's Document
export interface ICategory extends Document {
    name: string;
    isActive: boolean;
    description: string;
    content: string;     // CKEditor content, stored as HTML
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new mongoose.Schema(
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
        description: {
            type: String,
            trim: true,
            maxlength: 300      // Short description length limitation
        },
        content: {
            type: String, // Ckeditor
        }
    },
    {
        timestamps: true,     // Adds createdAt and updatedAt timestamps
    }
)

const Category = (mongoose.models.Category as mongoose.Model<ICategory>) || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;