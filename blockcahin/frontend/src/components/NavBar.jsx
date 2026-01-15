import React from "react";
import { useNavigate } from "react-router-dom";

export default function NavBar(props) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <>
      {/* Main navigation bar */}
      <div className="navbar bg-base-100 flex justify-between items-center px-4 py-2">
        <div className="flex-1">
          {/* Logo or brand */}
          <a href="/" className="btn btn-ghost text-xl">
            Private BlockChain
          </a>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle relative"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600 cursor-pointer"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a2 2 0 01-1.732-1h3.464A2 2 0 0110 18zm-1-3a3 3 0 113-3 3 3 0 01-3 3z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M10 2a3 3 0 00-3 3v.4a5 5 0 00-4 4.9L2 17a1 1 0 001 1h14a1 1 0 001-1l-.005-7.7a5 5 0 00-4-4.9V5a3 3 0 00-3-3zm1 11.94V18H9v-4.06A4 4 0 0110 13a4 4 0 011 0 4 4 0 011-1.06z"
                  clipRule="evenodd"
                />
              </svg>
              {/* Notification badge */}
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                8
              </span>
            </div>
            {/* Notification dropdown content */}
            <div className="dropdown-content mt-3 z-[1] w-52 bg-base-100 shadow rounded-box">
              <div className="card-body">
                <span className="font-bold text-lg">8 Items</span>
                <span className="text-info">Subtotal: $999</span>
                <div className="card-actions">
                  <button className="btn btn-primary btn-block" onClick={handleClick}>
                    View notification
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User avatar dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="User Avatar"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                />
              </div>
            </div>
            {/* User avatar dropdown content */}
            <ul className="dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional information */}
      <ul className="menu menu-horizontal bg-base-200 overflow-x-auto">
        <li>
          <a>Port : { props.portNumber}</a>
        </li>
        <li>
          <a>Node URL: {props.nodeUrl}</a>
        </li>
        <li className="">
          <a>
            Public Key: {props.PublicKey}
          </a>
        </li>
      </ul>
    </>
  );
}
