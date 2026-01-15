import React from 'react';

export default function Notifications() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
      <div className="max-w-2xl w-full">
        <div className="card mb-4 rounded-lg">
          <div className="card-body bg-base-200 p-4 flex items-center justify-between rounded-t-lg">
            <div className="collapse">
              <div className="collapse-title text-xl font-medium">
                Click to open this one and close others
                <button className="btn btn-success ml-10" >Approve</button>
              <button className="btn btn-error ml-2">Cancel</button>
              </div>
            </div>
            
          </div>
        </div>
        <div className="card mb-4 rounded-lg">
          <div className="card-body bg-base-200 p-4 flex items-center justify-between rounded-t-lg">
            <div className="collapse">
              <div className="collapse-title text-xl font-medium">
                Click to open this one and close others
                <button className="btn btn-success ml-10" >Approve</button>
              <button className="btn btn-error ml-2">Cancel</button>
              </div>
            </div>
            
            
         
          </div>
        </div>
        <div className="card mb-4 rounded-lg">
          <div className="card-body bg-base-200 p-4 flex items-center justify-between rounded-t-lg">
            <div className="collapse">
              <div className="collapse-title text-xl font-medium">
                Click to open this one and close others
                <button className="btn btn-success ml-10" >Approve</button>
              <button className="btn btn-error ml-2">Cancel</button>
              </div>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );
}
