"use client";

import AboutUsSection from '@/components/about';
import Hero from '@/components/hero';
import HowItWorks from '@/components/HowItWorks';
import Slide from '@/components/slide';
import { authClient } from "@/lib/auth-client";

export default function Page() {
    const { data: session } =  authClient.useSession();
    console.log("Session:", session);

    
    return (
        <div>
            <Hero />
            <AboutUsSection></AboutUsSection>
            <Slide></Slide>
            <HowItWorks></HowItWorks>
        </div>
    );
}