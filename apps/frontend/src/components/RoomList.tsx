import React from "react";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useGeneralStore } from "../stores/generalStores";
import { useUserStore } from "../stores/userStore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GetChatroomsForUserQuery } from "../gql/graphql";
import { GET_CHATROOMS_FOR_USER } from "../graphql/queries/GetChatroomsForUser";
import { DELETE_CHATROOM } from "../graphql/mutations/DeleteChatroom";
import { useMutation, useQuery } from "@apollo/client";
import OverlappingAvatars from "./OverlappingAvtar";

function RoomList() {
  const toggleCreateRoomModal = useGeneralStore(
    (state) => state.toggleCreateRoomModal
  );
  const userId = useUserStore((state) => state.id);

  const { data, loading } = useQuery<GetChatroomsForUserQuery>(
    GET_CHATROOMS_FOR_USER,
    {
      variables: {
        userId: userId,
      },
    }
  );

  const [activeRoomId, setActiveRoomId] = React.useState<number | null>(
    parseInt(useParams<{ id: string }>().id || "0")
  );
  const navigate = useNavigate();

  const [deleteChatroom] = useMutation(DELETE_CHATROOM, {
    variables: {
      chatroomId: activeRoomId,
    },
    refetchQueries: [
      {
        query: GET_CHATROOMS_FOR_USER,
        variables: {
          userId: userId,
        },
      },
    ],
    onCompleted: () => {
      navigate("/");
    },
  });

  return (
    <div className="flex flex-col flex-1 h-full bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-4 shadow-lg">
    <div className="ml-24 mb-4">
      <button
        onClick={toggleCreateRoomModal}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition transform hover:scale-105"
      >
        <IconPlus className="mr-2" /> Create a room
      </button>
    </div>
    <div className="flex flex-col items-center w-full">
      <div className="w-full room-Card">
        <div className="flex flex-col space-y-6 overflow-y-scroll max-h-[75vh]">
          {loading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin mr-3 border-t-2 border-b-2 border-blue-500 rounded-full w-6 h-6"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          )}
          {data?.getChatroomsForUser.map((chatroom) => (
            <Link
              to={`/${chatroom.id}`}
              key={chatroom.id}
              onClick={() => setActiveRoomId(parseInt(chatroom.id || "0"))}
              className={`relative p-8 rounded-lg shadow-lg transition transform  cursor-pointer bg-white ${
                activeRoomId === parseInt(chatroom.id || "0")
                  ? "border-gradient-active"
                  : "border-gradient"
              }`}
            >
              <div className="flex items-center">
                <div className="mr-4">
                  {chatroom.users && (
                    <OverlappingAvatars users={chatroom.users} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {chatroom.name}
                  </h3>
                  {chatroom.messages && chatroom.messages.length > 0 ? (
                    <div className="text-sm text-gray-700">
                      <p>{chatroom.messages[0].content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          chatroom.messages[0].createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No Messages</p>
                  )}
                </div>
                {chatroom?.users && chatroom.users[0].id === userId && (
                  <button
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteChatroom();
                    }}
                  >
                    <IconX size={16} />
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}

export default RoomList;
