import dbConnect from "@/lib/dbConnect";
import Question from "@/model/Question";
import Section from "@/model/Section";
// import { getSession } from "next-auth/react";

export async function GET(request: Request) {
    await dbConnect();

    // const session = await getSession({ request })

    // if (!session) {
    //     return Response.json(
    //         {
    //             success: false,
    //             message: "Unauthorized. Please log in."
    //         },
    //         {
    //             status: 401
    //         }
    //     );
    // }

    // Check if the user has admin role
    // if (session.user?.role !== "admin") {
    //     return res.status(403).json({ error: "Forbidden. You do not have permission to perform this action." });
    // }

    const url = new URL(request.url)
    const currentPage = parseInt(url.searchParams.get("currentPage") || "1", 10);
    const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "5", 10)
    const fetchAll = url.searchParams.get("fetchAll") === 'true'

    const code = url.searchParams.get("code") || "";
    const question = url.searchParams.get("question") || "";
    const type = url.searchParams.get("type") || "";
    const sectionName = url.searchParams.get("sectionName") || "";
    const skillName = url.searchParams.get("skillName") || "";
    const topicName = url.searchParams.get("topicName") || "";
    const isActive = url.searchParams.get("isActive")

    try {
        console.log(isActive, currentPage, itemsPerPage, fetchAll, code, question, type, sectionName, skillName, topicName);

        let filter: any = {};

        // If `isActive` is provided, add it to the filter
        if (isActive !== null) {
            const isActiveBoolean = isActive === 'true';
            filter = { isActive: isActiveBoolean };
        }
        // Filter by `name` if provided (case-insensitive, partial match)
        if (question) {
            filter.question = { $regex: question, $options: "i" };
        }
        if (code) {
            filter.questionCode = { $regex: code, $options: "i" };
        }
        if (type) {
            filter.questionType = { $regex: type, $options: "i" };
        }
        if (sectionName) {
            filter.sectionName = { $regex: sectionName, $options: "i" } // add sectionName in database
        }
        if (skillName) {
            filter.skill = { $regex: skillName, $options: "i" }
        }
        if (topicName) {
            filter.topic = { $regex: topicName, $options: "i" }
        }

        let questions;
        let totalQuestions;

        if (fetchAll) {
            questions = await Question.find(filter).exec();
            totalQuestions = questions.length;
        } else {
            // Apply pagination when fetchAll is false or not provided
            const skip = (currentPage - 1) * itemsPerPage;
            const limit = itemsPerPage;

            questions = await Question.find(filter).skip(skip).limit(limit).exec();
            totalQuestions = await Question.countDocuments(filter).exec();
        }

        if (!questions) {
            return Response.json(
                {
                    success: false,
                    message: "Questions not found"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Questions fetched successfully",
                data: {
                    questions,
                    totalQuestions,
                    currentPage,
                    totalPages: Math.ceil(totalQuestions / itemsPerPage)
                }
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while fetching questions: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while fetching questions",
                error
            },
            {
                status: 500
            }
        );
    }
}