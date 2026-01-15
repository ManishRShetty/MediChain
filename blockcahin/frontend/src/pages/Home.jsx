// Home.jsx
import React from 'react';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { useNavigate } from 'react-router-dom';
export default function Home() {
  const authHeader = useAuthHeader();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/add-data');
  };
  const nClick = () => {
    navigate('/view-data');
  };
  const nodeClick = () => {
    navigate('/addnode');
  };
  const viewNode = () => {
    navigate('/view-node');
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="flex space-x-4">
        <button
          className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleClick}
        >
          Add Data
        </button>
        <button   className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
          onClick={nClick}>
          View data
        </button>
        <button   className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
          onClick={nodeClick}>
          Add node
        </button>
        <button   className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
          onClick={viewNode}>
          View node
        </button>
       
      </div>
    </div>
  );
}
