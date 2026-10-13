'use client'
import { SessionProvider } from "next-auth/react"
import React from 'react'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            {children}
        </>
    )
}

export default AuthProvider