import Hero from '@/components/hero';
import { getSession } from '@/lib/auth-server';
import React from 'react';

export default async function Page() {
    const { data: session } = await getSession();
    
    console.log("Session:", session);
    
    return (
        <div>
            <Hero />
            

        </div>
    );
}