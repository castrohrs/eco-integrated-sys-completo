
import React, { useState } from 'react';
import AppShell from './components/AppShell';
import FeatureTabs from './components/FeatureTabs';
import LandingPage from './components/LandingPage';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/AuthPage';


const App: React.FC = () => {
    const { currentUser } = useAuth();
    const [showLanding, setShowLanding] = useState(true);

    // Reset landing page when logging out (currentUser becomes null)
    React.useEffect(() => {
        if (!currentUser) {
            setShowLanding(true);
        }
    }, [currentUser]);

    const handleEnter = () => {
        setShowLanding(false);
    };

    const handleReturnToLanding = () => {
        setShowLanding(true);
    };

    if (showLanding) {
        return <LandingPage onEnter={handleEnter} />;
    }

    if (!currentUser) {
        return <AuthPage />;
    }

    return (
        <div className="flex min-h-screen">
            <AppShell onReturnToLanding={handleReturnToLanding}>
                <FeatureTabs />
            </AppShell>
        </div>
    );
};

export default App;