'use client'


import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import React from 'react'



export default function SignInPage(){
    const router = useRouter()
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [email,setEmail] = useState(''); 
    const [password,setPassword] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault(); 
        setError(''); 
        setLoading(true);
       try{
      
        
        const response = await axios.post(`/api/signin`,{
            email,password
        })
       
        console.log("response data : ", response.data) ; 
        router.push('/Home')
       }
       catch(err){
           console.log("error : ", err); 

       }    
        
    }

    return(
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div>
                    <h2 className=' mt-6 text-center text-3xl font-extrabold text-gray-900'>
                        Sign In
                    </h2>
                </div>
                <form className=' mt-8 space-y-6' onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm space-y-4">
                <div>
             
              <input
               type='email'
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
               
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                required
                type='password'
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
               
              />
            </div>
                </div>
                <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
                </form>
            </div>
            

        </div>
    )
}