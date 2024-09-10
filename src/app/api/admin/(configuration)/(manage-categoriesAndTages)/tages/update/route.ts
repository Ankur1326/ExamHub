import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";

export async function PATCH(request: Request) {
    await dbConnect();

    try {
        const { tagId, tagName, isActive } = await request.json();
        // console.log(tagId, tagName, isActive);
        

        if (!tagId || (!tagName && isActive === undefined)) {
            return Response.json(
                {
                    success: false,
                    message: "tagId, and at least one of name or isActive are required."
                },
                {
                    status: 400
                }
            );
        }

        const configuration = await ConfigurationModel.findOneAndUpdate(
            {
                documentType: 'questionTags',
                "questionTags._id": tagId
            },
            {
                $set: {
                    "questionTags.$.tagName": tagName,
                    "questionTags.$.isActive": isActive
                }
            },
            { new: true }
        );

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

        const updatedTag = configuration?.questionTags?.filter((item:any) => item?._id == tagId) || []

        // console.log("updatedTag : ", updatedTag);

        return Response.json(
            {
                success: true,
                message: "Tag updated successfully",
                data: updatedTag[0]
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while updating the tag: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while updating the tag",
                error
            },
            {
                status: 500
            }
        );

    }


}