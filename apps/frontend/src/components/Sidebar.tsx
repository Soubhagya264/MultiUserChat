// src/Sidebar.jsx
/* eslint-disable*/
import React from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import { Tooltip, UnstyledButton, Center, Stack ,Text } from '@mantine/core'; // Import Mantine components as needed
import { Link} from "react-router-dom";
import { IconUser, IconLogout, IconBrandMessenger,  IconMessageCircle } from '@tabler/icons-react';
import { useGeneralStore } from '../stores/generalStores';
import { useUserStore } from '../stores/userStore';
import { LOGOUT_USER } from '../graphql/mutations/Logout';
import { GetChatroomsForUserQuery } from '../gql/graphql';
import { GET_CHATROOMS_FOR_USER } from "../graphql/queries/GetChatroomsForUser";
const Sidebar = () => {
    const userId = useUserStore((state) => state.id);
    const user = useUserStore((state) => state);
    const setUser = useUserStore((state) => state.setUser);
    const toggleLoginPage = useGeneralStore((state) => state.toggleLoginPage);
    const toggleProfileSettingsModal = useGeneralStore((state) => state.toggleProfileSettingsModal);
    const { data} = useQuery<GetChatroomsForUserQuery>(
        GET_CHATROOMS_FOR_USER,
        {
            variables: {
                userId: userId,
            },
        }
    );
    const [logoutUser] = useMutation(LOGOUT_USER, {
        onCompleted: () => {
            toggleLoginPage();
        },
    });

    const handleLogout = async () => {
        await logoutUser();
        setUser({
            id: undefined,
            fullname: '',
            avatarUrl: null,
            email: '',
        });
    };
    interface NavbarLinkProps {
        icon: React.FC<any>
        label: string
        active?: boolean
        onClick?(): void
    }
    const NavbarLink = ({ icon: Icon, label, onClick }: NavbarLinkProps) => (
        <Tooltip label={label} position="top-start" offset={-30} transitionProps={{ duration: 0 }}>
            <UnstyledButton
                onClick={onClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    hover: '4px',
                    Stack: ' Center',
                    width: "60px",
                    backgroundColor: "dark-gray"
                }}
            >
                <Icon size="1.1rem" stroke={3} />
            </UnstyledButton>
        </Tooltip>
    );

 


    return (

        <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 1.2, type: 'spring', stiffness: 120 }}
            className="flex flex-col w-64 bg-indigo-500 bg-opacity-50 p-4 space-y-4 max-h-full"
        >
            <div className="flex ">
                <div className="flex-1">
                    <Center>
                        <IconBrandMessenger type="mark" size={30} />
                    </Center>
                </div>
                <div className="ml-auto">
                    <Stack >
                        {userId && (
                            <NavbarLink
                                icon={IconUser}
                                label={`Profile (${user.fullname})`}
                                onClick={toggleProfileSettingsModal}
                            />
                        )}
                        {userId && (
                            <NavbarLink icon={IconLogout} label="Logout" onClick={handleLogout} />
                        )}
                    </Stack>
                </div>

            </div>
            {data?.getChatroomsForUser.map((chatroom) => (
                <Link
                    to={`/${chatroom.id}`}
                    key={chatroom.id}
                >
                    <div className="space-y-4 mt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center p-2 text-white  rounded-lg hover:bg-slate-700 focus:outline-none"
                        >
                            <IconMessageCircle className="mr-2" size={20} />
                            <Text>{chatroom?.name}</Text>
                        </motion.button>
                    </div>
                </Link>
            ))}

        </motion.div>


    );
};

export default Sidebar;
