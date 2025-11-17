"use client";

import { useRouter } from 'next/navigation';
import useUserInfo from '@/hooks/useUserInfo';
import React from 'react';

const Page = () => {
    const { userInfo } = useUserInfo();
    const router = useRouter();

    React.useEffect(() => {
        if (userInfo) {
            if (userInfo.roles?.includes('approver')) {
                router.replace('/admin/show-claim');
            } else if (userInfo.roles?.includes('user')) {
                router.replace('/user');
            }
        }
    }, [userInfo, router]);

    return null;
};

export default Page;