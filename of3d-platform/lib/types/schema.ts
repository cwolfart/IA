export type Role = 'CLIENT' | 'DESIGNER' | 'ADMIN';

export type ProjectStatus =
    | 'DRAFT'
    | 'MATCHING'
    | 'IN_PROGRESS'
    | 'REVIEW'
    | 'COMPLETED'
    | 'CANCELLED';

export type StageStatus =
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'REVIEW'
    | 'APPROVED';

export interface User {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: Role;
    createdAt: number; // Timestamp
    updatedAt: number; // Timestamp

    // Designer specific
    levelId?: number;
    academyId?: string;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    status: ProjectStatus;
    createdAt: number;
    updatedAt: number;

    clientId: string;
    designerId?: string;
    imageUrl?: string;
    progress?: number;
    currentStageName?: string;
}

export interface ProjectStage {
    id: string;
    projectId: string;
    stageNumber: number;
    name: string;
    status: StageStatus;
    assetsUrl?: string; // Main/Active image
    images?: string[]; // All images for this stage
    createdAt: number;
    updatedAt: number;
}

export interface Review {
    id: string;
    projectId: string; // Added for easier querying
    stageId: string;
    authorId: string; // Renamed from reviewerId for consistency
    text: string;
    x: number;
    y: number;
    resolved: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    read: boolean;
    link?: string;
    createdAt: number;
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
    description: string;
    amount: number;
}

export interface Invoice {
    id: string;
    projectId: string;
    userId: string; // Client ID
    number: string; // INV-001
    amount: number;
    status: InvoiceStatus;
    dueDate: number;
    items: InvoiceItem[];
    createdAt: number;
    updatedAt: number;
}

export interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    method: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PIX';
    status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
    createdAt: number;
}
