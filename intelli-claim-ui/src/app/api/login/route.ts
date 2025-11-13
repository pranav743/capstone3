import { NextResponse } from 'next/server';
import { AuthManager } from '@/Auth/AuthManager';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required.' },
                { status: 400 }
            );
        }

        // Attempt login using AuthManager
        const authManager = AuthManager.getInstance();
        try {
            await authManager.login(username, password);
            return NextResponse.redirect(new URL('/add-claim', request.url));
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid credentials : ' + error },
                { status: 401 }
            );
        }

    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body : ' + error },
            { status: 400 }
        );
    }
}
