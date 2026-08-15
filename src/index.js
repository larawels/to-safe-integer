function toSafeInteger(value, fallback = 0) {
    // Fallback muss selbst ein gültiger Integer sein, sonst wird 0 draus
    if (!Number.isInteger(fallback)) fallback = 0;

    if (value === null || value === undefined) return fallback;

    const type = typeof value;

    switch (type) {
        case 'number':
            if (Number.isNaN(value)) return fallback;
            if (!Number.isFinite(value)) {
                return value > 0 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
            }
            return Math.trunc(value) || 0;

        case 'boolean':
            return value ? 1 : 0;

        case 'bigint': {
            const MAX = BigInt(Number.MAX_SAFE_INTEGER);
            const MIN = BigInt(Number.MIN_SAFE_INTEGER);
            if (value > MAX) return Number.MAX_SAFE_INTEGER;
            if (value < MIN) return Number.MIN_SAFE_INTEGER;
            return Number(value);
        }

        case 'string': {
            const trimmed = value.trim();
            if (trimmed === '') return fallback;

            // PHP-Style: führende Ziffernfolge extrahieren.
            // "42px55" -> 42, "px42" -> fallback (kein führender Ziffer-Start), "-42abc" -> -42
            const match = trimmed.match(/^-?\d+/);
            if (match) {
                const num = parseInt(match[0], 10);
                return Number.isNaN(num) ? fallback : num;
            }
            return fallback;
        }

        case 'object':
            if (Array.isArray(value)) {
                // Einzelwertiges Array wie [42] -> 42 (analog zu Number([42]))
                if (value.length === 1) return toSafeInteger(value[0], fallback);
                return fallback;
            }
            if (value instanceof Date) {
                const time = value.getTime();
                return Number.isNaN(time) ? fallback : Math.trunc(time);
            }
            try {
                const primitive = Number(value);
                if (!Number.isNaN(primitive) && Number.isFinite(primitive)) {
                    return Math.trunc(primitive);
                }
            } catch (e) {
                // fällt durch zum Fallback
            }
            return fallback;

        default:
            return fallback;
    }
}

module.exports = toSafeInteger;
module.exports.toSafeInteger = toSafeInteger;