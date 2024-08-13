import mongoose, { model, Schema, Document } from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

enum UserRole {
    Student = 'student',
    Admin = 'admin',
    Instructor = 'instructor',
}

interface IUser extends Document {
    username: string;
    password: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
    verifyCode: string;
    verifyCodeExpiry: Date;
    resetPasswordToken?:string;
    resetPasswordExpires?: Date;
    isApproved: boolean;
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is reqiured"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        // match: [, "Please use a valid email address"]
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        required: [true, "Role is required"],
    },
    verifyCode: {
        type: String,
        required: [true, "verify code is required"],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "verify code expiry is required"],
    },
    resetPasswordToken: {
        type: String,
        default: undefined,
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined,
    },
    isVerified: { // this field is toggle by admins
        type: Boolean,
        default: false,
    },
    isApproved: { // this field is toggle by admins
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Hash password before saving the user
userSchema.pre<IUser>('save', async function (next: any) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
});

userSchema.methods.generateAccessToken = function (): string {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (): string {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
        }
    )
}

// Method to compare passwords
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};


const User = (mongoose.models.User as mongoose.Model<IUser>) || model<IUser>('User', userSchema)
export default User