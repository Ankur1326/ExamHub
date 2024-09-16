import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopic extends Document {
    name: string;
    shortDescription: string;
    isActive: boolean;
    sectionId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SkillSchema: Schema<ITopic> = new mongoose.Schema(
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
        sectionId: {
            type: Schema.Types.ObjectId,
            ref: "Section"
        }
    },
    {
        timestamps: true,
    }
)

const Skill = (mongoose.models.Skill as mongoose.Model<ISkill>) || mongoose.model<ISkill>("Section", SkillSchema);

export default Skill;