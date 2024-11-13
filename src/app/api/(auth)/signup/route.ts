// types/index.ts
export interface SignupFormData {
    email: string;
    username: string;
    password: string;
    name: string;
    bio: string;
    avatar?: File;
    coverImage?: File;
  }
  
  export interface User {
    id: string;
    email: string;
    username: string;
    name: string | null;
    bio: string | null;
    avatar: string | null;
    coverImage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
   
 
  import { NextResponse } from 'next/server';
  import {hash} from 'bcrypt'
   
  import { uploadToS3 } from '@/lib/s3';
import { PrismaClient } from '@prisma/client';


  const prisma = new PrismaClient(); 
  
  export async function POST(request: Request) {
    try {
      const formData = await request.formData();
      
      // Extract form fields
      const email = formData.get('email') as string;
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const name = formData.get('name') as string;
      const bio = formData.get('bio') as string;
      const avatar = formData.get('avatar') as File | null;
      const coverImage = formData.get('coverImage') as File | null;
  
      // Validate required fields
      if (!email || !username || !password) {
        return NextResponse.json(
          { error: 'Required fields missing' },
          { status: 400 }
        );
      }
  
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });
  
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email or username already exists' },
          { status: 400 }
        );
      }
  
      // Hash password
      const hashedPassword = await hash(password, 12);
  
      // Upload images to S3 if provided
      let avatarUrl: string | null = null;
      let coverImageUrl: string | null = null;
  
      if (avatar) {
        const buffer = Buffer.from(await avatar.arrayBuffer());
        const fileName = `avatars/${username}/${Date.now()}-${avatar.name}`;
        avatarUrl = await uploadToS3(buffer, fileName, avatar.type);
      }
  
      if (coverImage) {
        const buffer = Buffer.from(await coverImage.arrayBuffer());
        const fileName = `covers/${username}/${Date.now()}-${coverImage.name}`;
        coverImageUrl = await uploadToS3(buffer, fileName, coverImage.type);
      }
  
      // Create user in database
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          name,
          bio,
          avatar: avatarUrl,
          coverImage: coverImageUrl,
        },
      });
  
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
  
      return NextResponse.json(
        { user: userWithoutPassword },
        { status: 201 }
      );
    } catch (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }