import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div>
            <div className="h-screen bg-red-800 gap-3 text-white w-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl">Not Found</h2>
                <p>Could not find requested resource</p>
                <Button><Link href="/">Return Home</Link></Button>
            </div>
        </div>
    );
}
