/* eslint-disable */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGeneralStore } from "../stores/generalStores"
import { useForm } from "@mantine/form"
import { useUserStore } from "../stores/userStore"
import { GraphQLErrorExtensions } from "graphql"
import { useMutation } from "@apollo/client"
import { RegisterUserMutation } from "../gql/graphql"
import { REGISTER_USER } from "../graphql/mutations/Register"
function SignUp() {
    const form = useForm({
        initialValues: {
            fullname: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validate: {
            fullname: (value: string) =>
                value.trim().length >= 3
                    ? null
                    : "Username must be at least 3 characters",
            email: (value: string) =>
                value.includes("@") ? null : "Invalid email",
            password: (value: string) =>
                value.trim().length >= 3
                    ? null
                    : "Password must be at least 3 characters",
            confirmPassword: (value: string, values) =>
                value.trim().length >= 3 && value === values.password
                    ? null
                    : "Passwords do not match",
        },
    })
    const setUser = useUserStore((state) => state.setUser)
    const setIsLoginOpen = useGeneralStore((state) => state.toggleLoginPage)

    const [errors, setErrors] = useState<GraphQLErrorExtensions>({})

    const [registerUser, { loading }] =
        useMutation<RegisterUserMutation>(REGISTER_USER)

    const handleRegister = async () => {
        setErrors({})
        await registerUser({
            variables: {
                email: form.values.email,
                password: form.values.password,
                fullname: form.values.fullname,
                confirmPassword: form.values.confirmPassword,
            },
            onCompleted: (data) => {
                setErrors({})
                if (data?.register.user)
                    setUser({
                        id: data?.register.user.id,
                        email: data?.register.user.email,
                        fullname: data?.register.user.fullname,
                    })
                setIsLoginOpen()
            },
        }).catch((err) => {
            console.log(err.graphQLErrors, "ERROR")
            setErrors(err.graphQLErrors[0].extensions)
            useGeneralStore.setState({ isLoginPageOpen: true })
        })
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-300">Create an Account</h2>
            <form className="space-y-4"
                onSubmit={form.onSubmit(() => {
                    handleRegister()
                })}
            >
                <div>
                    <label className="block text-gray-300">Full Name</label>
                    <motion.input
                        whileFocus={{ scale: 1.05, borderColor: '#4f46e5' }}
                        type="text"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                        placeholder="Enter your full name"
                        {...form.getInputProps("fullname")}
                    />
                </div>
                <div>
                    <label className="block text-gray-300">Email</label>
                    <motion.input
                        whileFocus={{ scale: 1.05, borderColor: '#4f46e5' }}
                        type="email"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                        placeholder="Enter your email"
                        {...form.getInputProps("email")}
                    />
                </div>
                <div>
                    <label className="block text-gray-300">Password</label>
                    <motion.input
                        whileFocus={{ scale: 1.05, borderColor: '#4f46e5' }}
                        type="password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                        placeholder="Enter your password"
                        {...form.getInputProps("password")}
                    />
                </div>
                <div>
                    <label className="block text-gray-300">Confirm Password</label>
                    <motion.input
                        whileFocus={{ scale: 1.05, borderColor: '#4f46e5' }}
                        type="password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                        placeholder="Confirm password"
                        {...form.getInputProps("confirmPassword")}
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 rounded-md shadow-md border-2 border-transparent transition duration-400 text-white"
                    style={{
                        background: 'transparent',
                        borderImage: 'linear-gradient(90deg, #ff7f50, #ff1493, #1e90ff, #32cd32) 1',
                        borderImageSlice: 1,
                    }}
                    disabled={loading}
                    onClick={handleRegister}
                    type="submit"
                >
                    Sign Up
                </motion.button>
            </form>
            {errors && errors.code ? (
                <div className="text-red-500 mt-4 text-center">
                    Invalid credentials. Please try again.
                </div>
            ) : <></>}
        </>
    )
}

export default SignUp
