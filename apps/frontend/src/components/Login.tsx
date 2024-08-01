/* eslint-disable*/

import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from "@mantine/form"
import { useMutation } from "@apollo/client"
import { LoginUserMutation} from "../gql/graphql"
import { LOGIN_USER } from "../graphql/mutations/Login"
import { useGeneralStore } from '../stores/generalStores';
import { useUserStore } from "../stores/userStore"
import { GraphQLErrorExtensions } from "graphql"
const Login = () => {
    const [loginUser] =
        useMutation<LoginUserMutation>(LOGIN_USER)
    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },
        validate: {
            email: (value: string) =>
                value.includes("@") ? null : "Invalid email",
            password: (value: string) =>
                value.trim().length >= 3
                    ? null
                    : "Password must be at least 3 characters",
        },
    })
    const setUser = useUserStore((state) => state.setUser)
    const setIsLoginOpen = useGeneralStore((state) => state.toggleLoginPage)

    const [errors, setErrors] = React.useState<GraphQLErrorExtensions>({})
    console.log(errors);

    const handleLogin = async () => {
        await loginUser({
            variables: {
                email: form.values.email,
                password: form.values.password,
            },
            onCompleted: (data) => {
                setErrors({})
                if (data?.login.user) {
                    setUser({
                        id: data?.login.user.id,
                        email: data?.login.user.email,
                        fullname: data?.login.user.fullname,
                        avatarUrl: data?.login.user.avatarUrl,
                    })
                    setIsLoginOpen()
                }
            },
        }).catch((err) => {
            setErrors(err.graphQLErrors[0].extensions)
            if (err.graphQLErrors[0].extensions?.invalidCredentials)
                useGeneralStore.setState({ isLoginPageOpen: true })
        })
    }
    return (
        <>

            <h2 className="text-3xl font-bold mb-6 text-center text-gray-300">Login Here</h2>
            <form className="space-y-4"
                onSubmit={form.onSubmit(() => {
                    handleLogin()
                })}
            >
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
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 rounded-md shadow-md border-2 border-transparent transition duration-400 text-white"
                    style={{
                        background: 'transparent',
                        borderImage: 'linear-gradient(90deg, #ff7f50, #ff1493, #1e90ff, #32cd32) 1',
                        borderImageSlice: 1,
                    }}
                >
                    Login
                </motion.button>
            </form>
            {errors && errors.code ? (
                <div className="text-red-500 mt-4 text-center">
                    Invalid credentials. Please try again.
                </div>
            ) : <></>}
        </>
    );
}

export default Login;
