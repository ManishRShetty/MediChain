import axios from 'axios';
import React, { useState } from 'react';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import toast from 'react-hot-toast';
import { backendUrl } from '../Constants/Constants';
import { useNavigate } from 'react-router-dom';
export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };
  const signin = useSignIn();
  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(isLogin?`${backendUrl}/api/v1/user/login-user`:`${backendUrl}/api/v1/user/add-user`, form);
      if (response.status === 200) {
        const { data } = response;
        signin({
          auth: {
            token: data.token,
            type: 'Bearer',
          },
          userState: {
            username: form.username
          }
        });
        navigate('/');
        toast.success('Login Success');
      }
    } catch (error) {
      toast.error(error.message);
    }

  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-700">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            onClick={submitForm}
            className={`w-full ${isLogin ? 'bg-blue-500' : 'bg-green-500'} text-white py-2 px-4 rounded-lg hover:${isLogin ? 'bg-blue-700' : 'bg-green-700'} transition duration-200`}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={toggleForm}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
