
/* eslint-disable */
import { useEffect, ReactNode } from "react"
import { useUserStore } from "../../stores/userStore"
import { useGeneralStore } from "../../stores/generalStores"
import AuroraHero from '../AuroraHero';
const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
    const userId = useUserStore((state) => state.id)
    const toggleLoginPage = useGeneralStore((state) => state.toggleLoginPage)
    useEffect(() => {
        if (!userId) {
            toggleLoginPage();
        }
    }, [toggleLoginPage, userId]);

    if (userId) {
        return children;
    }
    return <AuroraHero />;
}
export default ProtectedRoutes
