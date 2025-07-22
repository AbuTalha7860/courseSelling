import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../utils/utils';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [passwordMsg, setPasswordMsg] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user?.token;
      const res = await axios.put(
        `${BACKEND_URL}/user/update-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setPasswordMsg(res.data.message);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMsg(err.response?.data?.errors || 'Error updating password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Settings</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </form>
        <form onSubmit={handlePasswordChange} className="space-y-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Change Password</h3>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {passwordMsg && <div className="text-center text-sm text-green-600 font-semibold">{passwordMsg}</div>}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300"
          >
            Update Password
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Settings; 