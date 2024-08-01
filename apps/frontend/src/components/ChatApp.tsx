// src/ChatApp.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatBackground from './ChatBackground';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import RoomList from './RoomList';
import ProfileSettings from './ProfileSetting';
import ProtectedRoutes from './ProtectedRoute/ProtectedRoutes';
import AddChatroom from './AddChatroom';

const ChatApp = () => {
    return (
        <ProtectedRoutes>
            <ChatBackground>
                <Router>
                    <div className="flex h-screen w-full">
                        <Sidebar />
                        <div className="flex flex-col flex-1">
                            <Routes>
                                <Route path="/" element={<RoomList />} />
                                <Route path="/:roomId" element={<ChatArea />} />
                            </Routes>
                        </div>
                    </div>
                    <ProfileSettings />
                    <AddChatroom />
                </Router>
            </ChatBackground>
        </ProtectedRoutes>
    );
};

export default ChatApp;
