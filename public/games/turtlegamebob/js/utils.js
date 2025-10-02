// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random float between min and max
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Random choice from array
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Distance between two points
function distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Angle between two points (in radians)
function angleBetween(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Linear interpolation
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Generate unique ID
let idCounter = 0;
function generateId() {
    return `id_${Date.now()}_${idCounter++}`;
}

// Check if two rectangles overlap (AABB collision)
function rectOverlap(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}

// Check if point is in rectangle
function pointInRect(point, rect) {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
}

// Normalize vector
function normalize(vec) {
    const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: vec.x / len, y: vec.y / len };
}

// Vector magnitude
function magnitude(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

// Degree to radian
function degToRad(deg) {
    return deg * Math.PI / 180;
}

// Radian to degree
function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

