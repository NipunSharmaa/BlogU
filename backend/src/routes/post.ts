import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, decode, verify } from 'hono/jwt'



export const blogRouter = new Hono<{
    Bindings:{
      DATABASE_URL: string;
      JWT_SECRET: string
    },
    Variables:{
      userId: string
    }
    }>()

    blogRouter.use("/*",async (c,next)=>{
      const authHeader= c.req.header("authorization")

      if(!authHeader || !authHeader.startsWith("Bearer ")){
        c.status(403);
        return c.json({message: "Missing auth headers"});
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = await verify(token, c.env.JWT_SECRET)

        c.set("userId", decoded.id)
        await next()
    }catch(error){
         c.status(403);
         return c.json({message: `Some error occured: ${error}`});
    }
})

blogRouter.post('/', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const authorId = c.get("userId");

    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId
      }
    });

    
    return c.json({
      id: blog.id
    });
  } catch (e) {
    console.error(e);
    c.status(401);
    return c.json({
      error: 'Internal server error' 
    });
  }
});
  
  blogRouter.put('/', async (c) => {
    const body= await c.req.json(); 
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());

  const blog= await prisma.blog.update({
    where:{
       id: body.id
    },
    data :{
         title:body.title,
         content: body.content,
       
    }
  })

    return c.json({
    id: blog.id
    })
  })
  
  blogRouter.get('/bulk', async(c) => {
   
   try { const prisma= new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blogs= await prisma.blog.findMany({
      select:{
        content:true,
        title:true,
        id:true,
        author :{
          select:{
            name:true
          }
        }
      }
    });
    c.status(200);
    return c.json({
      blogs
    })
  }catch(e){
    console.log(e);
    c.status(401);
    return c.json({
      message:"Unable to load the page"
    })
  }
  })

  
  blogRouter.get('/:id', async (c) => {
    const id= c.req.param("id"); 
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  try{
    const blog= await prisma.blog.findFirst({
      where :{
         id:id
      },
      select :{
        id:true,
        title:true,
        content:true,
        author:{
          select:{
            name:true
          }
        }

      }
    })
  
      return c.json({
       blog
      })
    }
    catch(err){
      c.status(411);
      return c.json({
      message:"unable to update the blog"
      })
    }
  }) 

  
 
  
  