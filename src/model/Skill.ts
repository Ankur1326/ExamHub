import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISkill extends Document {
    name: string;
    shortDescription: string;
    isActive: boolean;
    sectionId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    sectionDetails: {
        name: string;
        createdAt: Date;
    };
}

const SkillSchema: Schema<ISkill> = new mongoose.Schema(
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
        },
        sectionDetails: {
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

const Skill = (mongoose.models.Skill as mongoose.Model<ISkill>) || mongoose.model<ISkill>("Skill", SkillSchema);

export default Skill;