import React, { useState } from 'react';
import { backendUrl } from '../Constants/Constants';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import toast from 'react-hot-toast';
import axios from 'axios';
export default function AddNode() {
    const [formData, setFormData] = useState({
        PortNumber: '',
        PublicKey: '',
        nodeUrl: ''
    });
    const authHeader = useAuthHeader();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();


        
            axios.post(`${backendUrl}/api/v1/nodes/add-node`, formData, {
                headers: {
                    Authorization: authHeader.split(' ')[1],
                },
            }).then((response) => {
                console.log(response);
                toast.success(response.data.message);
            }
            ).catch((error) => {
                console.error(error);
                toast.error('Error adding node');
            }).finally(() => {
                setFormData({
                    PortNumber: '',
                    PublicKey: '',
                    nodeUrl: ''
                });
            });

           
       
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
            <div className="max-w-2xl w-full p-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="PortNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PortNumber:</label>
                        <input
                            type="text"
                            id="PortNumber"
                            name="PortNumber"
                            value={formData.PortNumber}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 font-normal text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter PortNumber"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="PublicKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PublicKey:</label>
                        <input
                            type="text"
                            id="PublicKey"
                            name="PublicKey"
                            value={formData.PublicKey}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 font-normal text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter PublicKey"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="nodeUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Node URL:</label>
                        <input
                            type="text"
                            id="nodeUrl"
                            name="nodeUrl"
                            value={formData.nodeUrl}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 font-normal text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter other field"
                            required
                        />
                    </div>
                    <button type="submit" className="inline-flex items-center px-4 py-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
}
