'use client';

import { useAuth } from '@clerk/nextjs';

export default function Home() {
    //This page is to test Clerk authentication, and get Token
    const { getToken } = useAuth();

    return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-scaleIn" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥑</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--mint)' }}>CalPal</div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Get User Info and Token Test Page!!</div>
                <button
                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 mt-4 cursor-pointer font-medium"
                    onClick={async () => {
                        const token = await getToken();
                        console.log(token);
                    }}>
                    Get User Token, Click Me!
                </button>
            </div>
        </div>
    );
}
