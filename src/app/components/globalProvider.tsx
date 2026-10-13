/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CustomSnackbar from './toast';

const GlobalProvider = ({ children }: any) => {
    const queryClient = new QueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <CustomSnackbar />
        </QueryClientProvider>
    )
}
export default GlobalProvider;