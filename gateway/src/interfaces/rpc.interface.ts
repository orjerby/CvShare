export interface RpcRes {
    response: {
        statusCode: number;
        message: string;
        error?: string;
    };
    status: number;
    message: string;
    name: string;
}
