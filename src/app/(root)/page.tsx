
"use client"
import TweetForm from '@/components/tweetForm';
import TweetFeed from '@/components/tweetFeed';
import { Tweet } from '@/types/tweet';
import { useState } from 'react';

const HomePage: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);

  const handleNewTweet = (tweet: Tweet) => {
    setTweets((prev) => [tweet, ...prev]);
  };

  return (
    <div>
      <TweetForm onTweetCreated={handleNewTweet} />
      <TweetFeed />
    </div>
  );
};

export default HomePage;