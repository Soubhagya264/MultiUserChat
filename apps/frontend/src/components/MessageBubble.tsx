import React from "react";
import { Message } from "../gql/graphql";
import { motion } from "framer-motion";
interface MessageProps {
  message: Message;
  currentUserId: number;
  
}

const MessageBubble: React.FC<MessageProps> = ({ message, currentUserId }) => {
  if (!message?.user?.id) return null;
  const isSentByCurrentUser = message.user.id === currentUserId;
  console.log(message.imageUrl,"message.imageUrl")

  return (
    <div
      className={`flex items-center mb-2 ${isSentByCurrentUser ? "justify-end" : "justify-start"
        }`}
    >
      <div className="flex flex-col items-center">
        <div
          className={`p-3 rounded-lg  ${isSentByCurrentUser
              ? "bg-blue-600 text-white ml-2"
              : "bg-gray-600 text-white mr-2"
            }`}
        >
          {message.content}
          {message.imageUrl && (
            <img
              className="w-64 h-64 object-cover mt-2"
              src={"http://localhost:4000" + message.imageUrl}
              alt="Uploaded content"
            />
          )}
          <span
            className={`text-xs text-opacity-60 pl-1  m-1 ${isSentByCurrentUser ? "text-gray-300" : "text-gray-300"
              }`}
          >
            {new Date(message.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      {message.user.avatarUrl ? (
        <img
          className="rounded-full w-6 h-6 object-cover"
          src={message.user.avatarUrl}
        />
      ) : (
        <div className="relative w-10 h-10">
          <motion.div
            className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isSentByCurrentUser ? "bg-green-700" : "bg-red-600"}`}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            <div className="flex items-center justify-center w-full h-full">
              {message.user.fullname.charAt(0)}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
