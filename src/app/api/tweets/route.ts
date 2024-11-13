// app/api/tweets/route.ts
import { NextRequest, NextResponse } from 'next/server';


import { uploadToS3 } from '@/lib/s3';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'
const prisma = new PrismaClient(); 


export async function POST(request: NextRequest) {
    const usertoken = request.cookies.get('user_token')?.value || "";
    let userId = "";
  try {

    const decodedToken = jwt.verify(usertoken, process.env.JWT_SECRET as string);
    userId = (decodedToken as any).id;
   
   

    const formData = await request.formData();
    const content = formData.get('content') as string;
    const images = formData.getAll('images') as File[];

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet content is required' },
        { status: 400 }
      );
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Tweet content must be 280 characters or less' },
        { status: 400 }
      );
    }

    // Upload images to S3
    const imageUrls: string[] = [];
    if (images.length > 0) {
      if (images.length > 4) {
        return NextResponse.json(
          { error: 'Maximum 4 images allowed' },
          { status: 400 }
        );
      }

      for (const image of images) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const fileName = `tweets/${userId}/${Date.now()}-${image.name}`;
        const imageUrl = await uploadToS3(buffer, fileName, image.type);
        imageUrls.push(imageUrl);
      }
    }

    // Create tweet
    const tweet = await prisma.tweet.create({
      data: {
        content,
        images: imageUrls,
        authorId:userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            retweets: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(tweet, { status: 201 });
  } catch (error) {
    console.error('Tweet creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create tweet' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = 20;

    const tweets = await prisma.tweet.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            retweets: true,
            comments: true,
          },
        },
      },
    });

    const nextCursor = tweets.length === limit ? tweets[tweets.length - 1].id : null;

    return NextResponse.json({
      tweets,
      nextCursor,
    });
  } catch (error) {
    console.error('Tweet fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
}