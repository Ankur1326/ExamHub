import dbConnect from "@/lib/dbConnect";
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
    const isActive = url.searchParams.get("isActive");
    const name = url.searchParams.get("name") || "";
    const skillName = url.searchParams.get("skillName") || "";
    const currentPage = parseInt(url.searchParams.get("currentPage") || "1", 10);  // Default to page 1 if not provided
    const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "5", 10); // Default to 5 items per page
    const fetchAll = url.searchParams.get("fetchAll") === 'true'; // Check if fetchAll is true

    try {
        // console.log(name, isActive, skillName, currentPage, itemsPerPage);

        let filter: any = {};

        // If `isActive` is provided, add it to the filter
        if (isActive !== null) {
            filter.isActive = isActive === "true";
        }

        // Filter by `name` if provided (case-insensitive, partial match)
        if (name) {
            filter.name = { $regex: name, $options: "i" };
        }

        let topics;
        let totalTopics;
        if (fetchAll) {
            topics = await Topic.find(filter).exec();
            totalTopics = topics.length;
        } else {
            if (skillName) {
                const skill = await Skill.findOne({ name: { $regex: skillName, $options: "i" } });

                if (!skill) {
                    return Response.json(
                        {
                            success: false,
                            message: `No skill found with the name "${skillName}"`,
                        },
                        {
                            status: 404,
                        }
                    );
                }
                // Add skillId to the filter
                filter.skillId = skill._id;
            }

        }

        const skip = (currentPage - 1) * itemsPerPage;
        const limit = itemsPerPage;

        topics = await Topic.aggregate([
            {
                $match: filter,
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        totalTopics = await Topic.countDocuments(filter);

        if (!topics.length) {
            return Response.json(
                {
                    success: false,
                    message: "No topics found",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Skills fetched successfully",
                data: {
                    topics,
                    currentPage,
                    totalPages: Math.ceil(totalTopics / itemsPerPage),
                    totalTopics,
                },
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.log("Error while fetching topics: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while fetching topics",
                error
            },
            {
                status: 500
            }
        );
    }
}