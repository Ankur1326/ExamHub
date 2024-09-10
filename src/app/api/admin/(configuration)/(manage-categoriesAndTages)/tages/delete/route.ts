import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";

export async function DELETE(request: Request) {
    await dbConnect();

    try {
        const data = await request.json();

        const tagId = data._id

        if (!tagId) {
            return Response.json(
                {
                    success: false,
                    message: "tagId is required."
                },
                {
                    status: 400
                }
            );
        }

        // Find the document and pull the tag with the specified _id
        const configuration = await ConfigurationModel.findOneAndUpdate(
            { documentType: 'questionTags' },
            { $pull: { questionTags: { _id: tagId } } },
            { new: true }
        );

        // console.log(configuration);


        if (!configuration) {
            return Response.json(
                {
                    success: false,
                    message: "Tag not found or configuration not found."
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Tag deleted successfully",
                data: configuration,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.error("Error while deleting the tag: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while deleting the tag",
                error
            },
            {
                status: 500
            }
        );
    }
}
