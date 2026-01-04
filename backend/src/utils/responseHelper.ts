export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
}

export function successResponse<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return {
        statusCode,
        message,
        data,
    };
}

export function errorResponse(message = 'Error', statusCode = 400): ApiResponse<null> {
    return {
        statusCode,
        message,
        data: null,
    };
}
