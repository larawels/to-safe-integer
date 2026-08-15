# to-safe-integer

Converts **any** JavaScript value into an integer, safely — never returns `NaN`, always falls back to a sensible default.

## Installation

```bash
npm install to-safe-integer
```

## Usage

```javascript
const toSafeInteger = require('to-safe-integer');

toSafeInteger(42);            // 42
toSafeInteger(42.9);          // 42 (truncated, not rounded)
toSafeInteger("42");          // 42
toSafeInteger("42px");        // 42 (PHP-style leading digit parsing)
toSafeInteger("px42");        // 0  (no leading digit, falls back)
toSafeInteger(null);          // 0
toSafeInteger(undefined);     // 0
toSafeInteger(true);          // 1
toSafeInteger(NaN);           // 0
toSafeInteger([42]);          // 42
toSafeInteger("abc", -1);     // -1 (custom fallback)
```

## Why not just `parseInt(value)`?

- `parseInt(null)` returns `NaN` — this library returns a safe fallback instead.
- `parseInt` doesn't clamp `Infinity` or oversized `BigInt` values to a safe range.
- String parsing follows a PHP-style convention: a leading digit sequence is extracted (`"42px"` → `42`), but a string that doesn't *start* with a digit falls back (`"px42"` → `0`), unlike scanning for digits anywhere in the string.

## API

### `toSafeInteger(value: any, fallback?: number = 0): number`

Takes any value and always returns a safe integer — never throws, never returns `NaN`.

- `fallback` — value returned when `value` can't be meaningfully converted. Must itself be an integer; otherwise it's silently reset to `0`.

## License

MIT © Toby Maxham