export interface User {
    _id: string;
    email: string;
    hashed_password: string;
    created_at: Date;
    updated_at: Date;
}
