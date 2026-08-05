import type {Response } from "express";


export const sendSuccess = (res:Response, data: unknown, message = "Success", statusCode = 200) => {
    const response = {
        success: true,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        data,
    };

    if (data !== null && data !== undefined) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
}

export const sendCreated = (res:Response, data: unknown, message = "Created", statusCode = 201) => {
    
    const response = {
        success: true,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        data,
    };

    if (data !== null && data !== undefined) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
}

export const sendError = (res:Response, message: 'Internal server error', statusCode = 500, errors?: string) => {
    const response = {
        success: false,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        ...(errors && { errors })
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
}

export const sendNoContent = (res:Response, message = "No Content", statusCode = 204) => {
    const response = {
        success: true,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
}