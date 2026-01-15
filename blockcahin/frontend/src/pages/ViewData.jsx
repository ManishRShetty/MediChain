import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../Constants/Constants';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';

export default function ViewData() {
    const [data, setData] = useState([]);

    const authHeader = useAuthHeader();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/v1/transaction/all`, { headers: { Authorization: authHeader.split(' ')[1] } });
                const sortedData = response.data.sort((a, b) => a.index - b.index);
                setData(sortedData);
                console.log(sortedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [authHeader]);
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
            <div className="max-w-2xl w-full">
                {data.map((item, index) => (
                    <div key={index} className="card mb-4 rounded-lg">
                        <div className="card-body bg-base-200 p-4 flex items-center justify-between rounded-t-lg my-3 mt-0">
                            <div className="collapse">

                                <p>index: {item.index}</p>
                                <p>timestamp: {item.timestamp}</p>
                                <p>previous Hash: {item.previousHash}</p>
                                <p>Hash: {item.hash}</p>
                                <p>Transactions</p>
                                <ul className='bg-white'>
                                    {item.transactions.map((transaction, idx) => (
                                        <li key={idx}>
                                            <p>Title: {transaction.title}</p>
                                            <p>Timestamp: {transaction.timestamp}</p>
                                            <p>data: {JSON.stringify(transaction.data)}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
