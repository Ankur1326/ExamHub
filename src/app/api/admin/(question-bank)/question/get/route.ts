import dbConnect from "@/lib/dbConnect";
import Question from "@/model/Question";
import Section from "@/model/Section";
import Skill from "@/model/Skill";
import Topic from "@/model/Topic";
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

    const code = url.searchParams.get("questionCode") || "";
    const question = url.searchParams.get("question") || "";
    const type = url.searchParams.get("questionType") || "";
    const sectionName = url.searchParams.get("section") || "";
    const skillName = url.searchParams.get("skill") || "";
    const topicName = url.searchParams.get("topic") || "";
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
            const section = await Section.findOne({ name: { $regex: sectionName, $options: "i" } })
            filter.sectionId = section?._id
        }
        if (skillName) {
            const skill = await Skill.findOne({ name: { $regex: skillName, $options: "i" } })
            filter.skillId = skill?._id
        }
        if (topicName) {
            const topic = await Topic.findOne({ name: { $regex: topicName, $options: "i" } })
            filter.topicId = topic?._id
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

            questions = await Question.aggregate([
                {
                    $match: filter,
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
                {
                    $lookup: {
                        from: "sections",
                        localField: "sectionId",
                        foreignField: "_id",
                        as: "sectionDetails",
                    }
                },
                {
                    $lookup: {
                        from: "skills",
                        localField: "skillId",
                        foreignField: "_id",
                        as: "skillDetails",
                    }
                },
                {
                    $lookup: {
                        from: "topics",
                        localField: "topicId",
                        foreignField: "_id",
                        as: "topicDetails",
                    }
                },
                {
                    $project: {
                        questionCode: 1,
                        question: 1,
                        questionType: 1,
                        isActive: 1,
                        section: {
                            $ifNull: [{ $arrayElemAt: ["$sectionDetails.name", 0] }, null],
                        },
                        skill: {
                            $ifNull: [{ $arrayElemAt: ["$skillDetails.name", 0] }, null],
                        },
                        topic: {
                            $ifNull: [{ $arrayElemAt: ["$topicDetails.name", 0] }, null],
                        },
                    }
                }
            ])

            // questions = await Question.find(filter).skip(skip).limit(limit).exec();
            totalQuestions = await Question.countDocuments(filter).exec();
        }

        // console.log("Questions result: ", questions);

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