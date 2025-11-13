import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AuthManager } from '@/Auth/AuthManager';

const authManager = AuthManager.getInstance();

export interface Claim {
    id: string;
    policyNumber: string;
    status: string;
    claimAmount: number;
    dateOfClaim: string;
    description: string;
}

const dummyClaims: Claim[] = [
    {
        id: '1',
        policyNumber: 'POL123456',
        status: 'Pending',
        claimAmount: 1200.5,
        dateOfClaim: '2024-06-01',
        description: 'Accident damage to vehicle',
    },
    {
        id: '2',
        policyNumber: 'POL654321',
        status: 'Approved',
        claimAmount: 800.0,
        dateOfClaim: '2024-05-15',
        description: 'Water damage to property',
    },
    {
        id: '3',
        policyNumber: 'POL987654',
        status: 'Rejected',
        claimAmount: 500.75,
        dateOfClaim: '2024-04-20',
        description: 'Lost mobile phone',
    },
    {
        id: '4',
        policyNumber: 'POL456789',
        status: 'Pending',
        claimAmount: 1500.0,
        dateOfClaim: '2024-06-10',
        description: 'Theft of bicycle',
    }
];

export async function GET(req: NextRequest) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8082/api/claims';
    const searchParams = req.nextUrl.searchParams.toString();
    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const url = searchParams ? `${backendUrl}?${searchParams}` : backendUrl;
    const isUserLoggedIn = authManager.isAuthenticated();
    // if (!isUserLoggedIn) {
    //     authManager.logout();
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const roles = authManager.getUserRoles();
    console.log("User Roles:", roles);

    try {
        // const response = await fetch(url, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });

        // if (!response.ok) {
        //     return NextResponse.json({ error: 'Failed to fetch claims from backend' }, { status: response.status });
        // }

        // const data = await response.json();
        // Optionally process data here if needed
        const pageSize = 2;
        const dummyResponse = {
            data: dummyClaims.slice(pageSize*(page-1), pageSize*page),
            totalRecords : dummyClaims.length,
            totalPages: Math.ceil(dummyClaims.length / pageSize),
            currentPage: 1,
            pageSize: pageSize,
        }
        return NextResponse.json(dummyResponse, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}