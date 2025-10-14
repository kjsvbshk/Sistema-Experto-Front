export const StatusEnum = {
    ACTIVE: "active",
    DESACTIVE: "desactive",
} as const;

export type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];
