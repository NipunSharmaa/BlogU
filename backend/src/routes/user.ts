import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, decode, verify } from 'hono/jwt'
import { signupschema, signinschema } from "@nipun1211/medium-common";

export const userRouter = new Hono<{
  Bindings:{
    DATABASE_URL: string;
    JWT_SECRET: string
  }
  }>()



userRouter.post('/signup',async (c) => {

  const body= await c.req.json(); 
  const {success}= signupschema.safeParse(body);

  if (!success){
    c.status(411);
    return c.json({
      message:"invalid credentials"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());

 try {
 const user= await prisma.user.create({
    data:{
      email: body.email,
      password: body.password,
      name: body.name
    }
  })
  c.status(200);
	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({
 jwt} );

 }catch(err){
  console.log(err);
   c.status(403);
  return c.json({
    message:"Unable to signup"
 })
}
})

userRouter.post('/signin',async (c) => {
  const body= await c.req.json(); 

  const {success}= signinschema.safeParse(body);

  if (!success){
    c.status(411);
    return c.json({
      message:"invalid credentials"
    })}
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());

 try {
 const user= await prisma.user.findFirst({
    where:{
      email: body.email,
      password: body.password
     
    }
  })

  if (!user){
    c.status(403);
    return c.json({
      message:"No user found with the given credentials"
    })
  }
  c.status(200);
	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.text( jwt );

 }catch(err){
  console.log(err);
   c.status(403);
  return c.text('Unable to signup')
 }

})


