

"use client"
import { useState, useEffect } from 'react';
import { AiOutlineLike } from "react-icons/ai";
import axiosInstance from '@/lib/axios';
import { Tweet, APIResponse } from '@/types/tweet';
import { FaComment } from "react-icons/fa";
import { useRouter } from 'next/navigation';

const TweetFeed: React.FC = () => {
    const router = useRouter(); 
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTweets = async (cursor?: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get<APIResponse>('/tweets', {
        params: { cursor },
      });

      setTweets((prev) => [...prev, ...response.data.tweets]);
      setNextCursor(response.data.nextCursor);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch tweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleLike = async (id: string) => {
    try {
      const response = await axiosInstance.post(`/tweets/${id}`);
      const updatedLikeCount = response.data.likeCount;

      // Update the like count for the tweet
      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet.id === id
            ? { ...tweet, _count: { ...tweet._count, likes: updatedLikeCount } }
            : tweet
        )
      );

    } catch (error: any) {
      console.error('Failed to like tweet:', error);
    }
  };

  const handleComment  = (id:string)=>{
    router.push(`/home/${id}`)
  }

  return (
    <div className=" w-5/12 mx-auto p-4">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold">{tweet.author.name}</h3>
          <h4 className="text-gray-500">@{tweet.author.username}</h4>
          <p className="mt-2 text-gray-800">{tweet.content}</p>
          <div className="mt-2">
            {tweet.images.map((url, index) => (
              <img key={index} src={url} alt="Tweet image" className="w-full h-auto rounded-lg" />
            ))}
          </div>
          <p className="mt-2 text-gray-600">
          <button className='flex items-center' onClick={() => handleLike(tweet.id)}>
              <AiOutlineLike className='mt-2 mr-2' /> 
              <span>{tweet._count.likes}</span>
             
            </button>
            <button className=' flex items-center' onClick={()=>handleComment(tweet.id)}>
                <FaComment className='mt-2 mr-2' />
                <span>{tweet._count.comments}</span>
            </button>
          </p>
        </div>
      ))}
      {error && <p className="text-red-500">{error}</p>}
      {nextCursor && !loading && (
        <button onClick={() => fetchTweets(nextCursor)} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Load more
        </button>
      )}
      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
    </div>
  );
};

export default TweetFeed;
