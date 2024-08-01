// src/PopupModal.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdClose } from 'react-icons/md'; // Import the MdClose icon
const PopupModal = ({ opened, onClose }: { opened: boolean, onClose: () => void }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    if (copiedEmail && copiedPassword) {
      setTimeout(() => {
        setCopiedEmail(false);
        setCopiedPassword(false);
        onClose();
      }, 1500); // Close modal after 1.5 seconds
    }
  }, [copiedEmail, copiedPassword, onClose]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('user@gmail.com');
    setCopiedEmail(true);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText('12345678');
    setCopiedPassword(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.6, delay: 1.5, ease: 'easeInOut' }}
      className={`fixed top-4 right-4 z-50 ${!opened ? 'hidden' : ''}`}
    >
      <div className="bg-white p-4 rounded-lg shadow-lg relative flex flex-col items-start">
        {/* Close icon */}
        <MdClose
          className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700"
          size={24}
          onClick={onClose}
        />

        <h2 className="text-xl font-bold mb-2 text-gray-600">Welcome!</h2>
        <p className="mb-2 font-semibold text-gray-500">Do not waste your time on signup. Copy this:</p>
        <p className="mb-2 font-bold text-gray-500 text-center ml-36">Email</p>
        <div className="flex items-center mb-2">
          <span className="ml-2 text-gray-500 font-bold px-5">user@gmail.com</span>
          <button
            onClick={handleCopyEmail}
            className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md ${copiedEmail ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            disabled={copiedEmail}
          >
            {copiedEmail ? 'Copied!' : 'Copy Email'}
          </button>

        </div>
        <p className="mb-2 font-bold mt-4 text-gray-500 ml-36">Password</p>
        <div className="flex items-center mb-2">
          <span className="ml-2 text-gray-500 font-bold px-5">12345678</span>
          <button
            onClick={handleCopyPassword}
            className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md ${copiedPassword ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            disabled={copiedPassword}
          >
            {copiedPassword ? 'Copied!' : 'Copy Password'}
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default PopupModal;
