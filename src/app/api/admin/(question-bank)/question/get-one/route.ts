import dbConnect from "@/lib/dbConnect";
import Question from "@/model/Question";
import { Types } from 'mongoose';
// import { getSession } from "next-auth/react";

export async function GET(request: Request) {
    await dbConnect();

    const url = new URL(request.url)
    const questionId = url.searchParams.get("questionId") || "";

    try {
        console.log(questionId);

        if (!questionId) {
            return Response.json(
                {
                    success: true,
                    message: "Question Id is required"
                },
                {
                    status: 409
                }
            )
        }

        // MongoDB aggregation pipeline to fetch the question along with sectionName, skillName, and topicName
        const question = await Question.aggregate([
            {
                $match: { _id: new Types.ObjectId(questionId) } // Match the question by questionId
            },
            {
                $lookup: {
                    from: "skills", // The collection name for skills
                    localField: "skillId", // The field in the Question schema
                    foreignField: "_id", // The field in the Skill schema
                    as: "skillDetails", // The name of the array field for the joined data
                }
            },
            {
                $lookup: {
                    from: "topics", // The collection name for topics
                    localField: "topicId", // The field in the Question schema
                    foreignField: "_id", // The field in the Topic schema
                    as: "topicDetails", // The name of the array field for the joined data
                }
            },
            {
                $lookup: {
                    from: "tags", // The collection name for tags
                    localField: "tags", // The field in the Question schema (assuming 'tags' is an array of tag IDs)
                    foreignField: "_id", // The field in the Tag schema
                    as: "tagDetails", // The name of the array field for the joined data
                }
            },
            {
                $lookup: {
                    from: "comprehensions",
                    localField: "comprehensionPassageId",
                    foreignField: "_id",
                    as: "comprehensionPassage"
                }
            },
            {
                $project: {
                    _id: 1,
                    questionType: 1,
                    question: 1, // Add any other fields you want to return from the Question model
                    options: 1,
                    correctOptions: 1,
                    matchPairs: 1,
                    sequenceOrder: 1,
                    fillInTheBlanks: 1,
                    difficultyLevel: 1,
                    defaultMarks: 1,
                    defaultTimeToSolve: 1,
                    isActive: 1,
                    solution: 1,
                    enableSolutionVideo: 1,
                    solutionVideoType: 1,
                    solutionVideoLink: 1,
                    hint: 1,
                    skillName: { $arrayElemAt: ["$skillDetails.name", 0] },
                    topicName: { $arrayElemAt: ["$topicDetails.name", 0] },
                    tagDetails: {
                        $map: {
                            input: "$tagDetails",
                            as: "tag",
                            in: {
                                _id: "$$tag._id",
                                name: "$$tag.name"
                            }
                        }
                    }, // Assuming tagDetails is an array
                    enableQuestionAttachment: 1,
                    comprehensionPassage: 1,
                    attachmentType: 1,
                    selectedFormat: 1,
                    audioLink: 1,
                    videoType: 1,
                    videoLinkOrId: 1,
                }
            }
        ]);

        if (!question) {
            return Response.json(
                {
                    success: true,
                    message: "Question not found",
                },
                {
                    status: 404
                }
            )
        }
        return Response.json(
            {
                success: true,
                message: "Question fetched successfully",
                data: question[0],
            },
            {
                status: 200
            }
        )
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