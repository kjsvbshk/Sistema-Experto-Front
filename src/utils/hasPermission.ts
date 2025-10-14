export const hasPermission = (
    permissionRequired: string | string[] | undefined,
    userPermissions: string[] | undefined,
    isAdmin?: boolean
) => {
    if (isAdmin === true) return true;

    if (!userPermissions) return false;

    if (!permissionRequired) return true;

    if (Array.isArray(permissionRequired)) {
        return permissionRequired.some((permission: string) =>
            userPermissions?.includes(permission)
        );
    }

    return userPermissions?.includes(permissionRequired);
};
