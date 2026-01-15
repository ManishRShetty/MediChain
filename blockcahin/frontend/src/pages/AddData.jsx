import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../Constants/Constants';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import toast from 'react-hot-toast';

export default function AddData() {
  const authHeader = useAuthHeader();
  const [formData, setFormData] = useState({
    title: '',
    data: '',
    permission: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const addData = async () => {
    try {
      const formDatas = {
        title: formData.title,
        data: formData.data,
        access_list: [formData.permission],
        
      };
      const response = await axios.post(
        `${backendUrl}/api/v1/transaction/make-transaction`,
        formDatas,
        {
          headers: {
            Authorization: authHeader.split(' ')[1],
          },
        }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
      }
      setFormData({ title: '', data: '', permission: '' });
    } catch (error) {
      console.error('Error making transaction:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
      <div className="max-w-2xl w-full p-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <h1 className="text-xl">Make Transaction</h1>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="input input-bordered w-full max-w-xs my-2"
        /><br />
        <textarea
          name="data"
          value={formData.data}
          onChange={handleChange}
          className="mb-4 w-full p-4 font-normal text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="10"
          placeholder="Enter the data."
        ></textarea>
        <input
          type="text"
          name="permission"
          value={formData.permission}
          onChange={handleChange}
          placeholder="Permission"
          className="input input-bordered w-full max-w-xs my-2"
        /><br />
        <button
          onClick={addData}
          className="inline-flex items-center px-4 py-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Add
        </button>
      </div>
    </div>
  );
}

