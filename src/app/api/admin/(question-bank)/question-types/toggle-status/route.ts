import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { id } = await request.json()
        console.log(id);

        if (!id) {
            return Response.json(
                {
                    success: false,
                    message: "QuestionTypeId are required."
                },
                {
                    status: 400
                }
            )
        }

        const configuration = await ConfigurationModel.findOne(
            { documentType: 'questionTypes' }, // Match the document type
        ).lean();;

        if (!configuration) {
            return Response.json(
                {
                    success: false,
                    message: "This configuration not found"
                },
                {
                    status: 404
                }
            );
        }

        // Toggle the isActive status of the specific questionType
        const updatedQuestionTypes = configuration.questionTypes?.map((questionType) => {
            if (questionType?._id?.toString() === id) {
                return {
                    ...questionType,
                    isActive: !questionType.isActive,
                };
            }
            return questionType;
        });

        // console.log("updatedQuestionTypes : ", updatedQuestionTypes);

        configuration.questionTypes = updatedQuestionTypes;
        // await configuration.save();
        // Update using `updateOne` instead of `save`
        await ConfigurationModel.updateOne(
            { documentType: 'questionTypes' },
            { $set: { questionTypes: updatedQuestionTypes } }
        );

        return Response.json(
            {
                success: true,
                message: "Question type status updated successfully",
                updatedQuestionTypes
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new question type : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new question type",
                error
            },
            {
                status: 500
            }
        );
    }
}