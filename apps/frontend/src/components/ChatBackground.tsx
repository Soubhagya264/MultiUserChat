// src/ChatBackground.jsx
import { useEffect, ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion';

const ChatBackground = ({ children }: { children: ReactNode }) => {
    const colors = ['#c2ff51', '#DD335C', '#13FFAA', '#892fff'];
    const color = useMotionValue(colors[0]);
    const backgroundImage = useMotionTemplate`radial-gradient(120% 130% at 50% 0%, #020617 50%, ${color})`;

    useEffect(() => {
        animate(color, colors, {
            ease: 'easeInOut',
            duration: 10,
            repeat: Infinity,
            repeatType: 'mirror'
        });
    }, [color, colors]);

    return (
        <motion.div
            style={{ backgroundImage }}
            className="relative flex flex-col items-center justify-center -mt-20 h-max
             overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
        >
            {children}
        </motion.div>
    );
};

export default ChatBackground;
