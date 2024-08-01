/* eslint-disable */
import React, { useState } from "react"
import { useGeneralStore } from "../stores/generalStores"
import { useUserStore } from "../stores/userStore"
import { useForm } from "@mantine/form"
import { useMutation } from "@apollo/client"
import { UPDATE_PROFILE } from "../graphql/mutations/UpdateUserProfile"
import { motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import {
    Avatar,
    Button,
    FileInput,
    Group,
    TextInput,
} from "@mantine/core"
import { IconEditCircle } from "@tabler/icons-react"
function ProfileSettings() {
    const isProfileSettingsModalOpen = useGeneralStore(
        (state) => state.isProfileSettingsModalOpen
    )
    const toggleProfileSettingsModal = useGeneralStore(
        (state) => state.toggleProfileSettingsModal
    )
    const profileImage = useUserStore((state) => state.avatarUrl)
    const updateProfileImage = useUserStore((state) => state.updateProfileImage)
    const fullname = useUserStore((state) => state.fullname)
    const updateUsername = useUserStore((state) => state.updateUsername)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const imagePreview = imageFile ? URL.createObjectURL(imageFile) : null
    const fileInputRef = React.useRef<HTMLButtonElement>(null)
    const form = useForm({
        initialValues: {
            fullname: fullname,
            profileImage: profileImage,
        },
        validate: {
            fullname: (value: string) =>
                value.trim().length >= 3
                    ? null
                    : "Username must be at least 3 characters",
        },
    })
    const [updateProfile] = useMutation(UPDATE_PROFILE, {
        variables: {
            fullname: form.values.fullname,
            file: imageFile,
        },
        onCompleted: (data) => {
            updateProfileImage(data.updateProfile.avatarUrl)
            updateUsername(data.updateProfile.fullname)
        },
    })
    const handleSave = async () => {
        if (form.validate().hasErrors) return
        await updateProfile().then(() => {
            toggleProfileSettingsModal()
        })
    }
    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className={`fixed inset-0 z-50 flex items-center justify-center ${!isProfileSettingsModalOpen ? 'hidden' : ''}`}
            >
                <div className="bg-white p-4 rounded-lg shadow-lg relative flex flex-col items-start">
                    <MdClose
                        className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700"
                        size={24}
                        onClick={toggleProfileSettingsModal}
                    />
                    <h2 className="text-xl font-bold mb-2 text-gray-600">Profile Settings</h2>
                    <form onSubmit={form.onSubmit(() => handleSave())}>
                        <Group
                            pos="relative"
                            w={100}
                            h={100}
                            style={{ cursor: 'pointer' }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Avatar
                                src={imagePreview || profileImage || null}
                                alt="Profile"
                                h={100}
                                w={100}
                                radius={100}
                            />
                            <IconEditCircle
                                color="black"
                                size={20}
                                style={{
                                    position: 'absolute',
                                    top: 50,
                                    right: -10,
                                    background: 'white',
                                    border: '1px solid black',
                                    padding: 5,
                                    borderRadius: '50%',
                                }}
                            />
                            <FileInput
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                pos={"absolute"}
                                accept="image/*"
                                placeholder="Upload new image"
                                onChange={(file) => setImageFile(file)}
                            />
                        </Group>
                        <TextInput
                            style={{ marginTop: 20 }}
                            label="Username"
                            {...form.getInputProps('fullname')}
                            onChange={(event) => {
                                form.setFieldValue("fullname", event.currentTarget.value)
                            }}
                            error={form.errors.fullname}
                        />
                        <div className="flex gap-4 mt-4">
                            <Button onClick={handleSave} type="submit">Save</Button>
                            <Button onClick={toggleProfileSettingsModal} variant="link">Cancel</Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </>
    )
}
export default ProfileSettings;