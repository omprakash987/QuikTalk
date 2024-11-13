"use client"

import { useState, FormEvent } from 'react';
import axiosInstance from '@/lib/axios';
import { Tweet } from '@/types/tweet';

interface Props {
  onTweetCreated: (tweet: Tweet) => void;
}

const TweetForm: React.FC<Props> = ({ onTweetCreated }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content);
      images.forEach((image) => formData.append('images', image));

      const response = await axiosInstance.post<Tweet>('/tweets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onTweetCreated(response.data);
      setContent('');
      setImages([]);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create tweet');
    }
  };

  return (
    <div className=' flex justify-center items-center mt-2'>
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md max-w-2xl mx-auto ">
      <textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={280}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setImages(Array.from(e.target.files || []))}
        className="mt-2 mb-2 w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-500 file:text-white
                   hover:file:bg-blue-600"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
        Tweet
      </button>
    </form>
    </div>
  );
};

export default TweetForm;
