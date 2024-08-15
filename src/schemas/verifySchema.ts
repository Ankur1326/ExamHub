import { z } from "zod"

// this is for 6 digit verification code send by email 

export const verifySchema = z.object({
    code: z.string().length(6, { message: "code should be of lenght 6" })
})