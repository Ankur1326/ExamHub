import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";

interface QuestionType {
    name: string;
    shortDescription?: string;
    code?: string;
    _id?: string;
    isActive: boolean;
    defaultTimeToSolve: Number;
    defaultMarks: Number;
}

export async function PUT(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { _id, shortDescription, isActive, defaultTimeToSolve, defaultMarks } = body; // Destructure the fields from request body

        console.log(_id, shortDescription, isActive, defaultTimeToSolve, defaultMarks);


        // Validate the required fields
        if (!_id) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Question type _id is required.",
                }),
                { status: 400 }
            );
        }

        // Find and update the question type based on its code
        const updatedConfiguration: any = await ConfigurationModel.findOneAndUpdate(
            {
                documentType: 'questionTypes',
                "questionTypes._id": _id // Find the specific question type by its code
            },
            {
                $set: {
                    "questionTypes.$.shortDesc": shortDescription, // Update short description
                    "questionTypes.$.isActive": isActive, // Update active status
                    "questionTypes.$.defaultTimeToSolve": defaultTimeToSolve, // Update time to solve
                    "questionTypes.$.defaultMarks": defaultMarks, // Update default marks
                }
            },
            { new: true }  // Return the updated document
        );

        // If update fails (e.g., no question type with the provided code)
        if (!updatedConfiguration) {
            return Response.json(
                {
                    success: false,
                    message: "Question type not found.",
                },
                { status: 404 }
            );
        }

        console.log("updatedConfiguration.questionTypes : ", updatedConfiguration.questionTypes);

        const updatedQuestionType = updatedConfiguration.questionTypes.find((qt: QuestionType) => qt._id == _id)

        console.log("updatedQuestionType : ", updatedQuestionType);
        


        // Return success response with the updated question type
        return Response.json(
            {
                success: true,
                message: "Question type updated successfully.",
                data: updatedQuestionType,
            },
            { status: 200 }
        )

    } catch (error: any) {
        console.error("Error updating question type: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while updating question type.",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
