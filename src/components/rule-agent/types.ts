// Types for rule-agent components

export interface Fact {
    id: number;
    name: string;
    description: string;
    category: string;
    value: string;
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
}

export interface Rule {
    id: number;
    name: string;
    condition: string;
    action: string;
    priority: number;
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
}

export interface Failure {
    id: number;
    name: string;
    description: string;
    // category: string;
    // severity: "low" | "medium" | "high" | "critical";
    // status: "active" | "inactive";
    // createdAt: string;
    // updatedAt: string;
}

export type TabType = "facts" | "failures";

export interface Tab {
    id: TabType;
    name: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    permissionRequired?: string;
}
