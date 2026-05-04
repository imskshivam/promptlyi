"use strict";

function utcNow() {
    return new Date();
}

function iso(date) {
    return (date instanceof Date ? date : new Date(date)).toISOString();
}

function startOfMonthIso() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function ymd(d) {
    return d.toISOString().slice(0, 10);
}

function yearMonth(d) {
    return d.toISOString().slice(0, 7);
}

function yearWeek(d) {
    // ISO week-ish; matches Python's %Y-W%U approximation
    const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const diff = (d - start) / 86400000;
    const week = Math.floor((diff + start.getUTCDay()) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

module.exports = { utcNow, iso, startOfMonthIso, clamp, ymd, yearMonth, yearWeek };
