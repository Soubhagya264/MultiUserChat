import React from "react";
import { User } from "../gql/graphql";

interface OverlappingAvatarsProps {
  users: User[];
}

const OverlappingAvatars: React.FC<OverlappingAvatarsProps> = ({ users }) => {
  const remainingUsers = users.length > 3 ? users.slice(3) : [];
  const remainingNames = remainingUsers.map((user) => user.fullname).join(", ");

  return (
    <div className="flex items-center space-x-2">
      {users.slice(0, 3).map((user) => (
        <div key={user.id} className="relative tooltip-wrapper">
          <div className="w-10 h-10 rounded-full overflow-hidden  bg-gray-500">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullname} className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-900 ring-2 bg-red-700 shadow-2xl">
                {user.fullname.charAt(0)}
              </div>
            )}
          </div>
          <div className="tooltip-content">{user.fullname}</div>
        </div>
      ))}
      {users.length > 3 && (
        <div className="relative tooltip-wrapper">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center">
            +{users.length - 3}
          </div>
          <div className="tooltip-content">{remainingNames}</div>
        </div>
      )}
    </div>
  );
};

export default OverlappingAvatars;
