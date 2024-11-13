// app/api/tweets/[tweetId]/like.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const userToken = request.cookies.get('user_token')?.value || "";
  const tweetId = params.id;
  console.log('tweetId:', tweetId);

  try {
    const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET as string);
    const userId = (decodedToken as any).id;

    
    const existingLike = await prisma.like.findFirst({
      where: {
        tweetId,
        userId,
      },
    });

    if (existingLike) {
      
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    } else {
      
      await prisma.like.create({
        data: {
          tweetId,
          userId,
        },
      });
    }
    
    const likeCount = await prisma.like.count({
      where: {
        tweetId,
      },
    });

    return NextResponse.json({ likeCount }, { status: 200 });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}; 

// post comment:

export async function POST_comment(request: NextRequest, { params }: { params: { id: string } }) {
    const userToken = request.cookies.get('user_token')?.value || "";
    const tweetId = params.id;
  
    try {
      const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET as string);
      const userId = (decodedToken as any).id;
  
      const formData = await request.json();
      const content = formData.content;
  
      
      if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
      }
  
     
      const comment = await prisma.comment.create({
        data: {
          content,
          tweetId,
          userId,
        },
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } },
        },
      });
  
      return NextResponse.json(comment, { status: 201 });
    } catch (error) {
      console.error('Error adding comment:', error);
      return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
  }


  // get comments:

  export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const tweetId = params.id;
  
    try {
      const tweet = await prisma.tweet.findUnique({
        where: { id: tweetId },
        include: {
          author: { select: { id: true, name: true, username: true, avatar: true } },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { id: true, name: true, username: true, avatar: true } },
            },
          },
        },
      });
  
      if (!tweet) {
        return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
      }
  
      return NextResponse.json(tweet);
    } catch (error) {
      console.error('Error fetching tweet or comments:', error);
      return NextResponse.json({ error: 'Failed to fetch tweet or comments' }, { status: 500 });
    }
  }