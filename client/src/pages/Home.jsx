
import React from 'react';

const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-yellow-50 py-12">
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-4 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
        Welcome to Vahan Bazar
      </h1>
      <p className="text-lg text-blue-700 mb-6">Your one-stop marketplace for new and used vehicles. Browse, compare, and book your dream ride today!</p>
      <img src="/vite.svg" alt="Car" className="mx-auto w-32 h-32 mb-4" />
      <div className="flex justify-center gap-4 mt-4">
        <a href="/models" className="bg-blue-900 text-yellow-400 px-5 py-2 rounded font-semibold hover:bg-blue-700 transition">Browse Models</a>
        <a href="/listings" className="bg-yellow-400 text-blue-900 px-5 py-2 rounded font-semibold hover:bg-yellow-300 transition">View Listings</a>
      </div>
    </div>
  </div>
);

export default Home;
