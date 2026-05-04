"use strict";

function notFound(req, res) {
    res.status(404).json({ detail: `Not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const detail = err.detail || err.message || "Internal server error";
    if (status >= 500) {
        // eslint-disable-next-line no-console
        console.error(`[err] ${req.method} ${req.path}`, err);
    }
    res.status(status).json({ detail });
}

function asyncH(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

class HttpError extends Error {
    constructor(status, detail) {
        super(detail);
        this.status = status;
        this.detail = detail;
    }
}

module.exports = { notFound, errorHandler, asyncH, HttpError };
