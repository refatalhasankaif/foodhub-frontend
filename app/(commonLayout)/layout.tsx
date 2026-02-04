
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col w-full">

            <Navbar></Navbar>
            <main className="flex-1 min-h-screen w-full">
                {children}
            </main>

            <Footer />
        </div>
    );
}
