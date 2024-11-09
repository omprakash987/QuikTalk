import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



const prisma = new PrismaClient(); 

export async function POST(req:NextRequest,res:NextResponse){
   try {
    const body = await req.json(); 
    const {email,password} = body; 

    if(!email || !password){
        return NextResponse.json({error:"Required fields missing"},{status:400})
    }

    const user = await prisma.user.findFirst({
        where:{
            email
        }
    })
    if(!user){
        return NextResponse.json({error:"User already exists"},{status:400})
    }

    const isPasswordMatch = await bcrypt.compare(password,user.password);
    if(!isPasswordMatch){
        return NextResponse.json({error:"Invalid credentials"},{status:400})
    }

    const token =  jwt.sign({
        id:user.id,
        email:user.email,
    }, process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
)

    const response = NextResponse.json({
        message:"User logged in successfully",
        token:token
    })

response.cookies.set('user_token',token,{
    httpOnly:true,
}); 
return response

    
   } catch (error) {
    console.log(error); 
    return NextResponse.json( { error: 'Something went wrong' }, { status: 500 });
   }
    

}