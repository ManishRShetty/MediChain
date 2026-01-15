import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../Constants/Constants';

export default function ViewNode() {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get(`${backendUrl}/api/v1/nodes/all`)
            .then(response => {
                console.log(response.data);
                setData(response.data || []); // Ensure data is set to an empty array if undefined
            })
            .catch(error => {
                console.error('Error fetching nodes:', error);
                // Handle error, e.g., show an error message to the user
            });
    }, []); // Empty dependency array means this effect runs once after mount

    return (
        <div className='h-screen'>
            <h1>Nodes</h1>
            <div className='flex flex-wrap'>
                {data.map(node => (
                    <div key={node.id} className='bg-gray-200 p-4 m-4 rounded-lg'>
                        <h1>Port Number: {node.portNumber}</h1>
                        <p>Node URL: {node.nodeUrl}</p>
                        <p>Public key: {node.public_key}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
