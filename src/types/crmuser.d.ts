export interface CRMUser {
    id: number;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role_id: string;
    is_active: boolean;
    is_deleted: boolean;
    deleted_at: Date | null;
}