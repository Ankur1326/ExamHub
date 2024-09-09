import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";

export async function GET(request: Request) {
    await dbConnect();

    const url = new URL(request.url);
    const isActive = url.searchParams.get("isActive");
    const page = parseInt(url.searchParams.get("page") || "1", 10);  // Default to page 1 if not provided
    const tagsPerPage = parseInt(url.searchParams.get("tagsPerPage") || "5", 10); // Default to 5 items per page
    
    try {
        // Calculate the number of items to skip
        const skip = (page - 1) * tagsPerPage;

         // Fetch the total number of tags for pagination purposes
         const totalTagsCount = await ConfigurationModel.aggregate([
            { $match: { documentType: 'questionTags' } },
            { $project: { totalTags: { $size: "$questionTags" } } }
        ]);

        const totalTags = totalTagsCount?.[0]?.totalTags || 0;

        // Fetch the configuration document with optional filter on questionTags
        const configuration = await ConfigurationModel.findOne(
            { documentType: 'questionTags' },
            { questionTags: { $slice: [skip, tagsPerPage] } }
        );
        
        // Fetch the configuration document with optional filter on questionTags
        const questionTags = configuration?.questionTags || [];

        if (isActive === 'true') {
            const activeQuestionTags = questionTags?.filter(questionTag => questionTag.isActive === true)

            return Response.json(
                {
                    success: true,
                    message: "Active Question types fetched successfully",
                    data: activeQuestionTags,
                    pagination: {
                        totalTags,
                        currentPage: page,
                        tagsPerPage,
                        totalPage: Math.ceil(totalTags / tagsPerPage)
                    }
                },
                {
                    status: 200
                }
            );
        } else {
            // console.log("questionTypes : ", questionTypes);
            return Response.json(
                {
                    success: true,
                    message: "All Question types fetched successfully",
                    data: questionTags,
                    pagination: {
                        totalTags,
                        currentPage: page,
                        tagsPerPage,
                        totalPage: Math.ceil(totalTags / tagsPerPage)
                    }
                },
                {
                    status: 200
                }
            );
        }

    } catch (error) {
        console.log("Error while fetching question tags: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while fetching question tags",
                error
            },
            {
                status: 500
            }
        );
    }

}