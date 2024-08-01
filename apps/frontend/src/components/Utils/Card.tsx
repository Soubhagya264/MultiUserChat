import React, { ReactNode } from "react";
import { motion } from "framer-motion";
interface CardProps {
    children: ReactNode;
    active?: boolean;
}

const Card: React.FC<CardProps> = ({ children, active = false }) => {
    return (
        <motion.div
            className={`w-full h-[300px] shadow-lg rounded-lg overflow-hidden p-4 ${active ? "bg-gray-400" : "bg-white"
                }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
};

export default Card;
