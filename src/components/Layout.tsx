import React, { useEffect } from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encodedData = params.get('data');

        if (encodedData) {
            try {
                const decoded = decodeURIComponent(encodedData);
                const parsed = JSON.parse(decoded);
                const newBranchId = parsed?.metadata?.branchId;

                if (newBranchId) {

                    localStorage.removeItem('branchId');

                    localStorage.setItem('branchId', newBranchId);

                    console.log('branchId updated in localStorage:', newBranchId);
                }
            } catch (error) {
                console.error('Error decoding branchId from URL:', error);
            }
        }
    }, []);


    return (
        <div className="min-h-screen flex flex-col bg-gray-50 w-full">
            <header className="sticky top-0 bg-[#1e7cc3] text-white p-4 shadow-md z-10">
                <div className="container mx-auto flex items-center">
                    <img src="/logo.svg" alt="MaxMoney Logo" className="h-8 mr-2" />
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8 max-w-[1400px]">
                {children}
            </main>
            <footer className="sticky bottom-0 bg-gray-100 py-4 text-center text-gray-600 text-sm shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-10">
                <div className="container mx-auto">
                    <p>© {new Date().getFullYear()} MaxMoney. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
