import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { resolve } from 'path';
import UserModel from '@/model/User';

// Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResult {
    public_id: string,
    [key: string]: any
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (
        !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        return NextResponse.json({ error: "Cloudinary credentials not found" }, { status: 500 })
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "exam-hub" },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result as CloudinaryUploadResult)
                    }
                )
                uploadStream.end(buffer)
            }
        )

        const user = await UserModel.findOne({
            username: session?.user?.username, email: session?.user?.email
        })

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            );
        }
        
        user.profilePicture = result.secure_url
        await user.save()
        
        return NextResponse.json({ publicId: result.public_id, secureUrl: result.secure_url }, { status: 200 })

    } catch (error) {
        console.log("Upload image failed : ", error);
        return NextResponse.json({ error: "Upload image failed" }, { status: 500 })

    }

}