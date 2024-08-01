// src/ChatArea.jsx
/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useSubscription } from "@apollo/client"
import { SEND_MESSAGE } from "../graphql/mutations/SendMessage"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import {
  GetMessagesForChatroomQuery,
  GetUsersOfChatroomQuery,
  LiveUsersInChatroomSubscription,
  Message,
  NewMessageSubscription,
  SendMessageMutation,
  User,
  UserStartedTypingSubscription,
  UserStoppedTypingSubscription,
} from "../gql/graphql"
import { useDropzone } from "react-dropzone"
import { NEW_MESSAGE_SUBSCRIPTION } from "../graphql/subscriptions/NewMessage"
import { GET_MESSAGES_FOR_CHATROOM } from "../graphql/queries/GetMessagesForChatroom"
import { useUserStore } from "../stores/userStore"
import { USER_STARTED_TYPING_SUBSCRIPTION } from "../graphql/subscriptions/UserStartedTyping"
import { USER_STOPPED_TYPING_SUBSCRIPTION } from "../graphql/subscriptions/UserStopedTyping"
import { LIVE_USERS_SUBSCRIPTION } from "../graphql/subscriptions/LiveUsers"
import { ENTER_CHATROOM } from "../graphql/mutations/EnterChatroom"
import { LEAVE_CHATROOM } from "../graphql/mutations/LeaveChatroom"
import { GET_USERS_OF_CHATROOM } from "../graphql/queries/GetUsersOfChatroom"
import { USER_STARTED_TYPING_MUTATION } from "../graphql/mutations/UserStartedTypingMutation"
import { USER_STOPPED_TYPING_MUTATION } from "../graphql/mutations/UserStoppedTypingMutation"
import { GET_CHATROOMS_FOR_USER } from "../graphql/queries/GetChatroomsForUser"
import MessageBubble from './MessageBubble';
import OverlappingAvtar from './OverlappingAvtar';
import { DELETE_MESSAGE } from '../graphql/mutations/DeleteMessage';

const ChatArea = () => {
  const [messageContent, setMessageContent] = useState("")
  const [sendMessage] = useMutation<SendMessageMutation>(SEND_MESSAGE)
  const [DeleteMessage] = useMutation<SendMessageMutation>(DELETE_MESSAGE)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]

      if (file) {
        setSelectedFile(file)
      }
    },
    //
  })
  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null
  const { roomId } = useParams<{ roomId: string }>()
  console.log(roomId, "id")
  const user = useUserStore((state) => state)
  const { data: typingData } = useSubscription<UserStartedTypingSubscription>(
    USER_STARTED_TYPING_SUBSCRIPTION,
    {
      variables: {
        chatroomId: parseInt(roomId!),
        userId: user.id,
      },
    }
  )
  const { data: stoppedTypingData } =
    useSubscription<UserStoppedTypingSubscription>(
      USER_STOPPED_TYPING_SUBSCRIPTION,
      {
        variables: { chatroomId: parseInt(roomId!), userId: user.id },
      }
    )
  const [userStartedTypingMutation] = useMutation(
    USER_STARTED_TYPING_MUTATION,
    {
      onCompleted: () => {
        console.log("User started typing")
      },
      variables: { chatroomId: parseInt(roomId!) },
    }
  )
  const [userStoppedTypingMutation] = useMutation(
    USER_STOPPED_TYPING_MUTATION,
    {
      onCompleted: () => {
        console.log("User stopped typing")
      },
      variables: { chatroomId: parseInt(roomId!) },
    }
  )
  const [typingUsers, setTypingUsers] = useState<User[]>([])

  useEffect(() => {
    const user = typingData?.userStartedTyping
    if (user && user.id) {
      setTypingUsers((prevUsers) => {
        if (!prevUsers.find((u) => u.id === user.id)) {
          return [...prevUsers, user]
        }
        return prevUsers
      })
    }
  }, [typingData])
  const typingTimeoutsRef = React.useRef<{ [key: number]: NodeJS.Timeout }>({})
  useEffect(() => {
    const user = stoppedTypingData?.userStoppedTyping
    if (user && user.id) {
      clearTimeout(typingTimeoutsRef.current[user.id])
      setTypingUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id))
    }
  }, [stoppedTypingData])
  const userId = useUserStore((state) => state.id)
  const handleUserStartedTyping = async () => {
    await userStartedTypingMutation()
    if (userId && typingTimeoutsRef.current[userId]) {
      clearTimeout(typingTimeoutsRef.current[userId])
    }
    if (userId) {
      typingTimeoutsRef.current[userId] = setTimeout(async () => {
        setTypingUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== userId)
        )
        await userStoppedTypingMutation()
      }, 2000)
    }
  }
  const { data: liveUsersData, loading: liveUsersLoading } =
    useSubscription<LiveUsersInChatroomSubscription>(LIVE_USERS_SUBSCRIPTION, {
      variables: {
        chatroomId: parseInt(roomId!),
      },
    })

 

 
  const [enterChatroom] = useMutation(ENTER_CHATROOM)
  const [leaveChatroom] = useMutation(LEAVE_CHATROOM)
  const chatroomId = parseInt(roomId!)
  const handleEnter = async () => {
    console.log(chatroomId, "handle Error")
    await enterChatroom({ variables: { chatroomId } })

      .then((response) => {
        if (response.data.enterChatroom) {
          console.log("Successfully entered chatroom!")
        }
      })
      .catch((error) => {
        console.error("Error entering chatroom:", error)
      })
  }

  const handleLeave = async () => {
    await leaveChatroom({ variables: { chatroomId } })
      .then((response) => {
        if (response.data.leaveChatroom) {
          console.log("Successfully left chatroom!")
        }
      })
      .catch((error) => {
        console.error("Error leaving chatroom:", error)
      })
  }
  const [isUserPartOfChatroom, setIsUserPartOfChatroom] =
    useState<() => boolean | undefined>()

  const { data: dataUsersOfChatroom } = useQuery<GetUsersOfChatroomQuery>(
    GET_USERS_OF_CHATROOM,
    {
      variables: {
        chatroomId: chatroomId,
      },
    }
  )
  useEffect(() => {
    if (dataUsersOfChatroom?.getUsersOfChatroom) {
      setIsUserPartOfChatroom(() =>
        dataUsersOfChatroom?.getUsersOfChatroom.some((user) => user.id === userId)
      )
    }
  }, [dataUsersOfChatroom?.getUsersOfChatroom, userId])

  useEffect(() => {
    handleEnter();
    return () => {
      handleLeave();
    };
  }, [chatroomId]);

  useEffect(() => {
    handleEnter()
    if (liveUsersData?.liveUsersInChatroom) {
      setIsUserPartOfChatroom(() =>
        dataUsersOfChatroom?.getUsersOfChatroom.some(
          (user) => user.id === userId
        )
      )
    }
  }, [chatroomId, dataUsersOfChatroom?.getUsersOfChatroom])

  useEffect(() => {
    window.addEventListener("beforeunload", handleLeave)
    return () => {
      window.removeEventListener("beforeunload", handleLeave)
    }
  }, [])

  useEffect(() => {
    handleEnter()
    return () => {
      handleLeave()
    }
  }, [chatroomId])
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null)

  const { data, loading } = useQuery<GetMessagesForChatroomQuery>(
    GET_MESSAGES_FOR_CHATROOM,
    {
      variables: {
        chatroomId: chatroomId,
      },
    }
  )
  const [messages, setMessages] = useState<Message[]>([])
  useEffect(() => {
    if (data?.getMessagesForChatroom) {
      setMessages(data.getMessagesForChatroom)
    }
  }, [data?.getMessagesForChatroom])
  const handleSendMessage = async () => {
    await sendMessage({
      variables: {
        chatroomId: chatroomId,
        content: messageContent,
        image: selectedFile,
      },
      refetchQueries: [
        {
          query: GET_CHATROOMS_FOR_USER,
          variables: {
            userId: userId,
          },
        },
      ],
    })
    setMessageContent("")
    setSelectedFile(null)
  }
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      console.log("Scrolling to bottom")
      const scrollElement = scrollAreaRef.current
      console.log(scrollElement.scrollHeight, scrollElement.clientHeight)
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      })
    }
  }
  useEffect(() => {
    if (data?.getMessagesForChatroom) {
      const uniqueMessages = Array.from(
        new Set(data.getMessagesForChatroom.map((m) => m.id))
      ).map((id) => data.getMessagesForChatroom.find((m) => m.id === id))
      setMessages(uniqueMessages as Message[])
      scrollToBottom()
    }
  }, [data?.getMessagesForChatroom])

  const { data: dataSub } = useSubscription<NewMessageSubscription>(
    NEW_MESSAGE_SUBSCRIPTION,
    {
      variables: { chatroomId },
    }
  )

  useEffect(() => {
    scrollToBottom()
    if (dataSub?.newMessage) {
      if (!messages.find((m) => m.id === dataSub.newMessage?.id)) {
        setMessages((prevMessages) => [...prevMessages, dataSub.newMessage!])
      }
    }
  }, [dataSub?.newMessage, messages])

  const handleDeleteMessage = async (messageId: string) => {
    await DeleteMessage({
      variables: {
        messageId: parseInt(messageId),
        chatroomId: chatroomId
      },
      onCompleted: () => {
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.id !== messageId)
        );
      },
    });
  };
  return (

    <div className={`flex  w-full ml-0 h-svh  justify-center`}>
      {!liveUsersLoading && isUserPartOfChatroom ? (
        <div className="card border shadow-xl p-0 w-full">
          <div className="flex flex-col relative h-full w-full">
            <div className="flex flex-col bg-indigo-500 bg-opacity-60">
              <div className="flex flex-row justify-around items-center my-2">
                <div className="flex flex-col items-start">
                  <span className="mb-2 text-gray-100 italic">Chat with</span>
                  {dataUsersOfChatroom?.getUsersOfChatroom && (
                    <OverlappingAvtar users={dataUsersOfChatroom.getUsersOfChatroom} />
                  )}
                </div>
                <div className="flex flex-col justify-around items-start">
                  <div className="w-40">
                    <span className="mb-2 text-gray-100 italic">Live users</span>
                    {liveUsersData?.liveUsersInChatroom?.map((user) => (
                      <div key={user?.id} className="relative w-6 h-6 my-2 flex items-center">
                        {user?.avatarUrl ? (
                          <img
                            className="rounded-full w-6 h-6 object-cover"
                            src={user.avatarUrl}
                          />
                        ) : (
                          <div className="relative w-10 h-10">
                            <motion.div
                              className="w-10 h-10 rounded-full overflow-hidden shadow-2xl bg-green-700"
                              initial={{ opacity: 1 }}
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <div className="flex items-center justify-center w-full h-full">
                                {user?.fullname.charAt(0)}
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-start items-start">
                  <span className="text-green-400 italic">
                    {typingUsers.map((user) => user.fullname).join(", ")} {typingUsers.length > 0 ? "is typing..." : ""}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-gray-200 italic">
                  Chatroom 
                </span>
              </div>
            </div>
            <motion.div
              ref={scrollAreaRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 2 }}
              transition={{ duration: 0.5 }}
              className="overflow-y-auto h-full p-4 bg-gray-200"
            >
              {loading && <p>Loading...</p>}
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <MessageBubble
                    key={message.id}
                    message={message}
                    currentUserId={userId || 0}
                    
                  />
                  {
                    message?.user?.id === userId &&
                    <div className="text-right mt-2">
                      <p
                        className="text-m text-red-600 underline cursor-pointer "
                        onClick={() => message.id && handleDeleteMessage(message.id)}
                      >
                        Delete
                      </p>
                    </div>
                  }
                </div>

              ))}
            </motion.div>
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="mt-4"
            >
              <div className="w-full flex flex-row items-center justify-center p-4 border-t border-gray-300">
                <div className="flex w-full mx-4 px-4 items-center justify-center">
                  <div {...getRootProps()} className="flex items-center">
                    {selectedFile && (
                      <img
                        className="mr-4 w-12 h-12 object-cover rounded-md"
                        src={previewUrl ? previewUrl : undefined}
                        alt="Preview"
                      />
                    )}
                    <button
                      type="button"
                      className="flex items-center justify-center w-12 p-0 h-10 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                    >
                      <FaImage style={{ color: 'white' }} className="w-5 h-5" />
                    </button>
                    <input {...getInputProps()} />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="relative">
                      <textarea
                        onKeyDown={handleUserStartedTyping}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-10 p-0 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                      >
                        <FaPaperPlane style={{ color: 'white' }} className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="p-4 bg-white shadow-md rounded-md">
            <span className="text-xl text-gray-500 italic">Joining the chatroom...</span>
          </div>
        </div>
      )}
    </div>
  );
};


export default ChatArea;
