import dbConnect from "@/lib/dbConnect";
import Question from "@/model/Question";
// import { getSession } from "next-auth/react";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { questions } = await request.json();

        if (!questions || !Array.isArray(questions)) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid data format. Expected an array of questions."
                },
                { status: 400 }
            );
        }
        // console.log("questions : ", questions);

        const bulkOps = questions.map(async (questionData) => {
            const {
                questionType,
                question,
                options,
                pairs,
                sequences,
                trueFalseAnswer,
                difficultyLevel,
                defaultMarks,
                defaultTimeToSolve,
                hint,
                solution,
            } = questionData;

            // console.log('questionData : ', questionData);

            // Validate the required fields
            if (!question || !questionType) {
                throw new Error("Question and question type are required");
            }

            // Check if the question type is valid
            if (!['MSA', 'MMA', 'TOF', 'SAQ', 'MTF', 'ORD', 'FIB'].includes(questionType)) {
                // throw new Error(`${questionType} question type is not valid`);
                return {
                    status: "rejected",
                    reason: `${questionType} question type is not valid`,
                    questionData,
                };
            }

            // Check if the question type is valid
            if (!['VERYEASY', 'EASY', 'MEDIUM', 'HARD', 'VERYHARD'].includes(difficultyLevel)) {
                // throw new Error(`${difficultyLevel} difficulty level is not valid`);
                return {
                    status: "rejected",
                    reason: `${difficultyLevel} difficulty level is not valid`,
                    questionData,
                };
            }

            // Prepare question data
            const newQuestion = new Question({
                questionType,
                question,
                options,
                pairs,
                sequences,
                trueFalseAnswer,
                difficultyLevel,
                defaultMarks,
                defaultTimeToSolve,
                solution,
                hint,
            });

            if (!newQuestion) {
                return Response.json(
                    {
                        success: false,
                        message: "Question is not created"
                    },
                    { status: 400 }
                )

            }

            // console.log("newQuestion : ", newQuestion);

            try {
                const savedQuestion = await newQuestion.save(); // Save each question
                return { status: "fulfilled", value: savedQuestion };
            } catch (error: any) {
                // return { status: "rejected", reason: error.message };
                return {
                    status: "rejected",
                    reason: error.message,
                    questionData,
                };

            }

        });

        // Wait for all bulk operations to complete
        const results = await Promise.allSettled(bulkOps);

        console.log("results : ", results);

        // Filter out any operations that failed
        const successfulResults = results
            .filter(result => result.status === 'fulfilled')
            .map(result => (result as any).value);


        const failedResults = results
            .filter(result => result.status === 'rejected')
            .map(result => ({
                question: (result as any).reason.questionData,
                reason: (result as any).reason
            }));

        console.log("Successful results:", successfulResults);
        console.log("Failed results:", failedResults);

        // Check if any questions were successfully uploaded
        if (successfulResults.length > 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `${successfulResults.length} questions uploaded successfully.`,
                    questions: successfulResults,
                    failedQuestions: failedResults,
                }),
                { status: 201 }
            );

        } else {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No questions were uploaded successfully.",
                    failedQuestions: failedResults
                }),
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error during bulk question upload:", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error during bulk upload",
                error
            }),
            { status: 500 }
    }
}