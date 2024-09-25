import dbConnect from "@/lib/dbConnect";
import Skill from "@/model/Skill";
import Section from "@/model/Section";
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
    const sectionName = url.searchParams.get("sectionName") || "";
    const currentPage = parseInt(url.searchParams.get("currentPage") || "1", 10);  // Default to page 1 if not provided
    const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "5", 10); // Default to 5 items per page
    const fetchAll = url.searchParams.get("fetchAll") === 'true'; // Check if fetchAll is true

    try {
        // console.log(name, isActive, sectionName, currentPage, itemsPerPage);

        let filter: any = {};

        // If `isActive` is provided, add it to the filter
        if (isActive !== null) {
            filter.isActive = isActive === "true";
        }

        // Filter by `name` if provided (case-insensitive, partial match)
        if (name) {
            filter.name = { $regex: name, $options: "i" };
        }

        let skills;
        let totalSkills;
        if (fetchAll) {
            skills = await Skill.find(filter).exec();
            totalSkills = skills.length;
        } else {
            if (sectionName) {
                const section = await Section.findOne({ name: { $regex: sectionName, $options: "i" } });

                if (!section) {
                    return Response.json(
                        {
                            success: false,
                            message: `No section found with the name "${sectionName}"`,
                        },
                        {
                            status: 404,
                        }
                    );
                }

                // console.log("section : ", section);

                // Add sectionId to the filter
                filter.sectionId = section._id;
            }

            const skip = (currentPage - 1) * itemsPerPage;
            const limit = itemsPerPage;

            skills = await Skill.aggregate([
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

            totalSkills = await Skill.countDocuments(filter);

            if (!skills.length) {
                return Response.json(
                    {
                        success: false,
                        message: "No skills found",
                    },
                    {
                        status: 404,
                    }
                );
            }
        }


        return Response.json(
            {
                success: true,
                message: "Skills fetched successfully",
                data: {
                    skills,
                    currentPage,
                    totalPages: Math.ceil(totalSkills / itemsPerPage),
                    totalSkills,
                },
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.log("Error while fetching sections: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while fetching sections",
                error
            },
            {
                status: 500
            }
        );
    }
}