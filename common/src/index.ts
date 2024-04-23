import {z} from 'zod'


export const signupschema= z.object({
email: z.string().email(),
password: z.string().min(6),
name: z.string().optional()
  })



  export const signinschema= z.object({
    email: z.string().email(),
    password: z.string().min(6)
      })
    
    
  export const createBlogSchema= z.object({
    title: z.string(),
    content: z.string()
  })    

  
  export const updateBlogSchema= z.object({
    title: z.string(),
    content: z.string(),
    id:z.string()
  })

  
  export type signupschema= z.infer<typeof signupschema>
  export type signinschema= z.infer<typeof signinschema>
  export type createBlogSchema= z.infer<typeof createBlogSchema>
  export type updateBlogSchema= z.infer<typeof updateBlogSchema>
