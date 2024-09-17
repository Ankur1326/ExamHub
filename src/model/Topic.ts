import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopic extends Document {
    name: string;
    shortDescription: string;
    isActive: boolean;
    skillId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    skillDetails: {
        name: string;
        createdAt: Date;
    };
}

const TopicSchema: Schema<ITopic> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            unique: true,
            trim: true,         // Trims whitespace
            minlength: 2,
            maxlength: 50
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
        skillId: {
            type: Schema.Types.ObjectId,
            ref: "skill"
        },
        skillDetails: {
            name: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                required: true
            }
        }
    },
    {
        timestamps: true,
    }
)

const Topic = (mongoose.models.Topic as mongoose.Model<ITopic>) || mongoose.model<ITopic>("Topic", TopicSchema);

export default Topic;