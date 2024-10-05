import dbConnect from "@/lib/dbConnect";
import Compreshension from "@/model/Comprehension";
import Question, { QuestionType } from "@/model/Question";
import Skill from "@/model/Skill";
import Tag from "@/model/Tag";
import Topic from "@/model/Topic";
import mongoose from "mongoose";
// import { getSession } from "next-auth/react";

export async function POST(request: Request) {
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

    try {
        const {
            step, // which step is being processed
            questionId,
            questionType,
            question,
            options,
            correctOptions,
            pairs,
            sequences,
            trueFalseAnswer,
            shortAnswer,
            fillInTheBlanks,
            // step 2
            skillName,
            topicName,
            tagNames,
            difficultyLevel,
            defaultMarks,
            defaultTimeToSolve,
            isActive,
            // strp 3
            solution,
            enableSolutionVideo,
            solutionVideoType,
            solutionVideoLink,
            hint,
            // step 4
            enableQuestionAttachment,
            attachmentType,
            comprehensionPassageId,
            selectedFormat,
            audioLink,
            videoType,
            videoLinkOrId,
        } = await request.json();

        console.log(' logged data',
            step,
            questionType,
            question,
            options,
            correctOptions,
            pairs,
            sequences,
            trueFalseAnswer,
            shortAnswer,
            fillInTheBlanks,
            skillName,
            topicName,
            tagNames,
            difficultyLevel,
            defaultMarks,
            defaultTimeToSolve,
            isActive,
            solution,
            enableSolutionVideo,
            solutionVideoType,
            solutionVideoLink,
            hint,
            questionId
            // enableQuestionAttachment,
            // attachmentType,
            // comprehensionPassageId,
            // selectedFormat,
            // audioLink,
            // videoType,
            // videoLinkOrId,
        );


        // Step 1: Create basic question details
        if (step === 1) {
            // Validate required fields
            if (!question) {
                return Response.json(
                    {
                        success: false,
                        message: "Question is required",
                    },
                    { status: 400 }
                );
            }

            // update 
            let savedQuestion;
            if (questionId) {
                savedQuestion = await Question.findByIdAndUpdate(
                    questionId,
                    {
                        questionType,
                        question,
                        options,
                        correctOptions,
                        pairs,
                        sequences,
                        trueFalseAnswer,
                        shortAnswer,
                        fillInTheBlanks,
                    },
                    { new: true } // Return the updated document
                );
                if (!savedQuestion) {
                    return Response.json(
                        {
                            success: false,
                            message: "Question not found",
                        },
                        { status: 404 }
                    );
                }
                return Response.json(
                    {
                        success: true,
                        message: "Step 1 completed. Question updated.",
                        questionId: savedQuestion._id, // return the updated ID for next step
                    },
                    { status: 200 }
                );
            } else {
                // Validate required fields
                if (!questionType) {
                    return Response.json(
                        {
                            success: false,
                            message: "Question type is required",
                        },
                        { status: 400 }
                    );
                }
                // Check if the questionType is valid
                if (!Object.values(QuestionType).includes(questionType)) {
                    return Response.json(
                        {
                            success: false,
                            message: `Invalid question type. Allowed types are: ${Object.values(QuestionType).join(", ")}`,
                        },
                        { status: 400 }
                    );
                }

                const newQuestion = new Question({
                    questionType,
                    question,
                    options,
                    correctOptions,
                    pairs,
                    sequences,
                    trueFalseAnswer,
                    shortAnswer,
                    fillInTheBlanks,
                });

                savedQuestion = await newQuestion.save();

                return Response.json(
                    {
                        success: true,
                        message: "Step 1 completed",
                        questionId: savedQuestion._id, // return the ID for the next step
                    },
                    { status: 201 }

                );
            }
        }

        // Step 2: Update question with skill, topic, tags, etc.
        if (step === 2) {
            console.log(step, questionId, skillName, difficultyLevel, defaultMarks, defaultTimeToSolve, topicName, tagNames);

            if (!questionId || !skillName || !difficultyLevel || !defaultMarks || !defaultTimeToSolve) {
                return Response.json(
                    {
                        success: false,
                        message: "Question ID is required",
                    },
                    { status: 400 }
                );
            }

            // Fetch skill, topic, and tags in parallel
            const [skill, tags] = await Promise.all([
                Skill.findOne({ name: skillName }),
                Tag.find({ name: { $in: tagNames } }) // Assuming you're searching for multiple tag names
            ]);

            // Conditionally fetch topic if topicName is provided
            let topic = null;
            if (topicName) {
                topic = await Topic.findOne({ name: topicName });
            }

            console.log("skill : ", skill);

            if (!skill) {
                return Response.json(
                    {
                        success: false,
                        message: "Invalid skill",
                    },
                    { status: 400 }
                );
            }

            // Extract tag IDs
            const tagIds = tags.map((tag: any) => new mongoose.Types.ObjectId(tag._id));

            // Prepare the update object
            const updateData: any = {
                sectionId: skill.sectionId,
                skillId: skill._id,
                tags: tagIds,
                difficultyLevel,
                defaultMarks,
                defaultTimeToSolve
            };

            // Conditionally add topicId if topic exists
            if (topic && topic._id) {
                updateData.topicId = topic._id;
            }

            // Update the question with the new information
            const updatedQuestion = await Question.findByIdAndUpdate(
                questionId,
                updateData,
                { new: true }
            );

            return Response.json(
                {
                    success: true,
                    message: "Step 2 completed",
                    updatedQuestion,
                },
                { status: 200 }
            );
        }

        // Step 3: Update question with solution details
        if (step === 3) {
            if (!questionId) {
                return Response.json(
                    {
                        success: false,
                        message: "Question ID is required for Step 3",
                    },
                    { status: 400 }
                );
            }

            const updatedQuestion = await Question.findByIdAndUpdate(
                questionId,
                {
                    solution,
                    enableSolutionVideo,
                    solutionVideoType,
                    solutionVideoLink,
                    hint,
                    isActive
                },
                { new: true }
            );

            return Response.json(
                {
                    success: true,
                    message: "Step 3 completed",
                    updatedQuestion,
                },
                { status: 200 }
            );
        }

        // Step 4: Finalize question
        if (step === 4) {
            if (!questionId) {
                return Response.json(
                    {
                        success: false,
                        message: "Question ID is required for Step 4",
                    },
                    { status: 400 }
                );
            }

            const updatedQuestion = await Question.findByIdAndUpdate(
                questionId,
                {
                    enableQuestionAttachment,
                    attachmentType,
                    comprehensionPassageId: comprehensionPassageId?.toString(),
                    selectedFormat,
                    audioLink,
                    videoType,
                    videoLinkOrId,
                },
                { new: true }
            );

            console.log('updatedQuestion : ', updatedQuestion);

            if (!updatedQuestion) {
                return Response.json(
                    {
                        success: false,
                        message: "failed"
                    },
                    {
                        status: 400
                    }
                )

            }

            return Response.json(
                {
                    success: true,
                    message: "Step 4 completed. Question is now finalized",
                    updatedQuestion,
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: false,
                message: "Invalid step or missing required data.",
            },
            { status: 400 }
        );

    } catch (error) {
        console.log("Error while creating new question : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating question",
                error
            },
            {
                status: 500
            }
        );
    }
}