import dbConnect from "@/lib/dbConnect";
import Question from "@/model/Question";
import Skill from "@/model/Skill";
import Topic from "@/model/Topic";
import { Tag } from "lucide-react";
import mongoose from "mongoose";
// import { getSession } from "next-auth/react";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { selectedQuestions, updatedData } = await request.json();

        const { skillName, topicName, tagsName, isActive } = updatedData

        // Check if both required data exist
        if (!selectedQuestions || !updatedData) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid request: Missing data",
                },
                { status: 500 }
            )
        }

        // Ensure the selectedQuestions array has valid MongoDB ObjectIds
        const validIds = selectedQuestions.map((id: string) => new mongoose.Types.ObjectId(id));

        // Fetch skill, topic, and tags in parallel
        let skill;
        if (skillName) {
            skill = await Skill.findOne({ name: skillName })

        }

        let topic;
        if (topicName) {
            topic = await Topic.findOne({ name: topicName });
        }

        let tags;
        if (tagsName && tagsName.length > 0) {
            // Extract tag IDs
            tags = tagsName.map((item: any) => item?._id)
        }

        // Perform the bulk update operation
        const result: any = await Question.updateMany(
            { _id: { $in: validIds } }, // Match all selected questions by their IDs
            {
                $set:
                {
                    sectionId: skill?.sectionId || "",
                    skillId: skill?._id || "",
                    topicId: topic?._id || '',
                    tags: tags,
                    isActive
                }
            },      // Update with the new data
            { multi: true }
        );

        console.log("result : ", result);

        if (result.modifiedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "No questions were updated",
                },
                { status: 404 }
            )
        }
        
        const updatedQuestions = await Question.find({ _id: { $in: validIds } });

        // Successfully updated questions
        return Response.json(
            {
                success: false,
                message: `${result.modifiedCount} questions were successfully updated`,
                questions: updatedQuestions
            },
            { status: 500 }
        )

    } catch (error) {
        console.error("Error during bulk question upload:", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error during bulk upload",
                error
            },
            { status: 500 }
        )
    }
}