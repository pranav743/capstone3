import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/Auth/AuthManager';
import { apiClient } from '@/app/api/client';
import axios from 'axios';

const authManager = AuthManager.getInstance();

export interface Claim {
    id: number;
    policyNumber: string;
    claimantName: string;
    claimAmount: number;
    fraudStatus: string;
    status: string;
    createdDate: string;
}

const dummyClaims: Claim[] = [
    {
        id: 1,
        policyNumber: 'POL123455',
        claimantName: 'Mary',
        claimAmount: 10000.0,
        fraudStatus: 'Accept',
        status: 'Validated',
        createdDate: '2025-11-16T17:18:48.414203'
    },
    {
        id: 2,
        policyNumber: 'POL654321',
        claimantName: 'John',
        claimAmount: 8000.0,
        fraudStatus: 'Reject',
        status: 'Pending',
        createdDate: '2025-10-10T10:00:00.000000'
    },
    {
        id: 3,
        policyNumber: 'POL987654',
        claimantName: 'Alice',
        claimAmount: 5000.0,
        fraudStatus: 'Review',
        status: 'Validated',
        createdDate: '2025-09-05T12:30:00.000000'
    },
    {
        id: 4,
        policyNumber: 'POL456789',
        claimantName: 'Bob',
        claimAmount: 15000.0,
        fraudStatus: 'Accept',
        status: 'Pending',
        createdDate: '2025-08-20T09:15:00.000000'
    }
];

export async function GET(req: NextRequest) {
    const page = Number(req.nextUrl.searchParams.get('page')) || 0;
    const pageSize = Number(req.nextUrl.searchParams.get('pageSize')) || 10;
    const isUserLoggedIn = authManager.isAuthenticated(req);
    
    if (!isUserLoggedIn) {
        const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        authManager.logout(req, res);
        return res;
    }
    
    const roles = authManager.getUserRoles(req);
    console.log("User Roles:", roles);

    try {
        // Try to fetch from backend API
        const searchParams = req.nextUrl.searchParams.toString();
        const url = searchParams ? `/claims?${searchParams}` : '/claims';
        console.log('Fetching:', url);
        
        const apiRes = NextResponse.json({}, { status: 200 });
        const serverResponse = await apiClient.get(url, { request: req, response: apiRes }, {
            timeout: 5000
        });
        
        return NextResponse.json(serverResponse.data, { status: 200 });
        
    } catch (error) {
        console.error('Backend API error, falling back to dummy data:', error);
        // Fallback to dummy data
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pagedData = dummyClaims.slice(start, end);

        const response = {
            data: pagedData,
            totalRecords: dummyClaims.length,
            totalPages: Math.ceil(dummyClaims.length / pageSize),
            currentPage: page,
            pageSize: pageSize,
        };
        console.log("Fallback response data:", response);
        return NextResponse.json(response, { status: 200 });
    }
}

export type CreateClaimRequest = {
    policyNumber: string;
    claimantName: string;
    claimAmount: number;
}

export async function POST(req: NextRequest) {
    const isUserLoggedIn = authManager.isAuthenticated(req);
    
    if (!isUserLoggedIn) {
        const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        authManager.logout(req, res);
        return res;
    }
    
    try {
        const body: CreateClaimRequest = await req.json();
        const apiRes = NextResponse.json({}, { status: 200 });
        const serverResponse = await apiClient.post('/claims', body, { request: req, response: apiRes });
        return NextResponse.json(serverResponse.data, { status: 200 });
    } catch (error) {
        console.error('Failed to create claim:', error);
        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(
                { error: 'Failed to create claim', details: error.response.data },
                { status: error.response.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create claim' },
            { status: 500 }
        );
    }
}