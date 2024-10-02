import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";
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

    const questionTypes = [
        {
            code: "MSA",
            name: "Multiple Choice Single Answer",
            shortDescription: "This question type is easy to set up and is the most frequent MCQ question in online exams. Users are allowed to pick just one answer from a list of given options.",
            isActive: true,
            defaultTimeToSolve: 60,
            defaultMarks: 1,
        },
        {
            code: "MMA",
            name: "Multiple Choice Multiple Answers",
            shortDescription: "Multiple Choice Multiple Answers type question allows users to select one or several answers from a list of given options.",
            isActive: true,
            defaultTimeToSolve: 60,
            defaultMarks: 1,

        },
        {
            code: "TOF",
            name: "True or False",
            shortDescription: "A true or false question consists of a statement that requires a true or false response. We can also format the options such as: Yes/No, Correct/Incorrect, and Agree/Disagree.",
            isActive: true,
            defaultTimeToSolve: 60,
            defaultMarks: 1,
        },
        {
            code: "SAQ",
            name: "Short Answer",
            shortDescription: "Short answer questions allow users to provide text or numeric answers. These responses will be validated against the provided possible answers.",
            isActive: true,
            defaultTimeToSolve: 60,
            defaultMarks: 1,
        },
        {
            code: "MTF",
            name: "Match the Following",
            shortDescription: "A matching question is two adjacent lists of related words, phrases, pictures, or symbols. Each item in one list is paired with at least one item in the other list.",
            isActive: true,
            defaultTimeToSolve: 60,
            defaultMarks: 1,
        },
        {
            code: "ORD",
            name: "Ordering/Sequence",
            shortDescription: "An ordering/sequence question consists of a scrambled list of related words, phrases, pictures, or symbols. The User needs to arrange them in a logical order/sequence.",
            isActive: true,
            defaultTimeToSolve: 60,
            defaultMarks: 1,
        },
        {
            code: "FIB",
            name: "Fill in the Blanks",
            shortDescription: "A Fill in the Blank question consists of a phrase, sentence, or paragraph with a blank space where a student provides the missing word or words.",
            isActive: true,
            defaultTimeToSolve: 60,
            defaultMarks: 1,
        }
    ];

    try {
        const configuration = await ConfigurationModel.findOneAndUpdate(
            { documentType: 'questionTypes' }, // Match the document type
            {
                $push: {
                    questionTypes: { $each: questionTypes }
                }
            },
            { new: true, upsert: true }
        );

        if (!configuration) {
            return Response.json(
                {
                    success: false,
                    message: "configuration not found"
                },
                {
                    status: 404
                }
            );
        }

        const createdQuestionTypes: any = configuration.questionTypes

        return Response.json(
            {
                success: true,
                message: "Question types added successfully",
                data: createdQuestionTypes
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