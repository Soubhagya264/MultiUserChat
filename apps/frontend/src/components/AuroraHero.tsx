/* eslint-disable*/
import { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion';
import Login from './Login';
import SignUp from './SignUp';
import PopupModal from './PopupModal';

const AuroraHero = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const colors = ['#c2ff51', '#DD335C', '#13FFAA', '#892fff'];
  const color = useMotionValue(colors[0]);
  const backgroundImage = useMotionTemplate`radial-gradient(130% 145% at 50% 0%, #020617 50%, ${color})`;
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    animate(color, colors, {
      ease: 'easeInOut',
      duration: 10,
      repeat: Infinity,
      repeatType: 'mirror'
    });

    setTimeout(() => {
      setModalOpen(true);
    }, 1500);
  }, []);

  const closeModal = () => {
    setModalOpen(false);
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <>
      {modalOpen && <PopupModal opened={modalOpen} onClose={closeModal} />}
      <motion.section
        style={{ backgroundImage }}
        className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ backgroundPosition: '200% center' }}
            animate={{ backgroundPosition: '0% center' }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-yellow-800"
          >
            Welcome to MultiUser Chat App
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="mt-2 text-lg"
          >
            Connect, Chat, and Collaborate with Ease
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          {isSignUp ? <SignUp /> : <Login />}
          <div className="text-center mt-4">
            <button onClick={toggleForm} className="text-blue-500 hover:underline focus:outline-none bg-transparent border-none">
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>
      </motion.section>
    </>
  );
};

export default AuroraHero;
