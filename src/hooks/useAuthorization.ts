import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { StatusEnum } from "../types/general";

export const useAuthorization = () => {
    const { user, isAuthenticated } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminRole = async () => {
            console.log(
                "🔐 useAuthorization: Checking admin role for user:",
                user
            );

            if (!isAuthenticated || !user) {
                console.log(
                    "🔐 useAuthorization: User not authenticated or no user data"
                );
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }

            try {
                console.log(
                    "🔐 useAuthorization: Getting users with roles to find current user"
                );

                if (user.roles) {
                    const isAdminUser = user.roles.some(
                        (role) =>
                            role.name === "admin" &&
                            role.status === StatusEnum.ACTIVE
                    );
                    console.log(
                        "🔐 useAuthorization: Is admin result:",
                        isAdminUser
                    );
                    setIsAdmin(isAdminUser);
                } else {
                    console.log("🔐 useAuthorization: User not has roles");
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error(
                    "🔐 useAuthorization: Error checking admin role:",
                    error
                );
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminRole();
    }, [isAuthenticated, user]);

    return {
        isAdmin,
        isLoading,
        user,
        isAuthenticated,
    };
};
