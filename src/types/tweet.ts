// types/tweet.ts
export interface Author {
    id: string;
    name: string;
    username: string;
    avatar: string;
  }
  
  export interface Tweet {
    id: string;
    content: string;
    images: string[];
    author: Author;
    _count: {
      likes: number;
      retweets: number;
      comments: number;
    };
    createdAt: string;
  }

  // types/tweet.ts
export interface Comment {
    id: string;
    content: string;
    user: {
      id: string;
      name: string;
      username: string;
      avatar: string;
    };
    createdAt: string;
  }
  
  export interface SingleTweetResponse {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      username: string;
      avatar: string;
    };
    comments: Comment[];
    images: string[];
    _count: {
      likes: number;
      retweets: number;
      comments: number;
    };
  }
  
  
  export interface APIResponse {
    tweets: Tweet[];
    nextCursor: string | null;
  }
  

