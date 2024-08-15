import { z } from "zod"

export const signInSchema = z.object({
    // this identifier can be username , email 
    identifier: z.string(),
    password: z.string()
})