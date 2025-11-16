import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/Auth/AuthManager';
import { apiClient } from '@/app/api/client';

const authManager = AuthManager.getInstance();

export async function GET(req: NextRequest) {
    const isUserLoggedIn = authManager.isAuthenticated(req);
    
    if (!isUserLoggedIn) {
        const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        authManager.logout(req, res);
        return res;
    }
    
    try {
        // Example: Fetch user profile from backend
        const res = NextResponse.json({}, { status: 200 });
        const response = await apiClient.get('/user/profile', { request: req, response: res });
        
        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const isUserLoggedIn = authManager.isAuthenticated(req);
    
    if (!isUserLoggedIn) {
        const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        authManager.logout(req, res);
        return res;
    }
    
    try {
        const body = await req.json();
        
        // Example: Update user profile
        const res = NextResponse.json({}, { status: 200 });
        const response = await apiClient.post('/user/profile', body, { request: req, response: res });
        
        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return NextResponse.json(
            { error: 'Failed to update user profile' },
            { status: 500 }
        );
    }
}