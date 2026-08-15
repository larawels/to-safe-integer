const assert = require('assert');
const toSafeInteger = require('../src/index.js');

let passed = 0;
let failed = 0;

function test(description, actual, expected) {
    try {
        assert.strictEqual(actual, expected);
        console.log(`✅ ${description}`);
        passed++;
    } catch (e) {
        console.error(`❌ ${description}`);
        console.error(`   erwartet: ${expected}, erhalten: ${actual}`);
        failed++;
    }
}

console.log('--- Numbers ---');
test('integer bleibt integer', toSafeInteger(42), 42);
test('negative integer', toSafeInteger(-42), -42);
test('float wird abgeschnitten (positiv)', toSafeInteger(42.7), 42);
test('float wird abgeschnitten (negativ)', toSafeInteger(-42.7), -42);
test('0 bleibt 0', toSafeInteger(0), 0);
test('-0 wird 0', toSafeInteger(-0), 0);
test('NaN -> fallback', toSafeInteger(NaN), 0);
test('Infinity -> MAX_SAFE_INTEGER', toSafeInteger(Infinity), Number.MAX_SAFE_INTEGER);
test('-Infinity -> MIN_SAFE_INTEGER', toSafeInteger(-Infinity), Number.MIN_SAFE_INTEGER);

console.log('\n--- null / undefined ---');
test('null -> fallback', toSafeInteger(null), 0);
test('undefined -> fallback', toSafeInteger(undefined), 0);
test('null mit custom fallback', toSafeInteger(null, -1), -1);
test('undefined mit custom fallback', toSafeInteger(undefined, 99), 99);

console.log('\n--- Booleans ---');
test('true -> 1', toSafeInteger(true), 1);
test('false -> 0', toSafeInteger(false), 0);

console.log('\n--- Strings (PHP-Style Parsing) ---');
test('reine Zahl als String', toSafeInteger('42'), 42);
test('negative Zahl als String', toSafeInteger('-42'), -42);
test('Float-String wird abgeschnitten', toSafeInteger('42.9'), 42);
test('String mit Leerzeichen', toSafeInteger('  42  '), 42);
test('Zahl gefolgt von Text', toSafeInteger('42px'), 42);
test('Zahl gefolgt von mehr Zahlen nach Text', toSafeInteger('42px55'), 42);
test('negative Zahl gefolgt von Text', toSafeInteger('-42abc'), -42);
test('Text vor Zahl -> fallback (kein führender Ziffer-Start)', toSafeInteger('px42'), 0);
test('leerer String -> fallback', toSafeInteger(''), 0);
test('nur Leerzeichen -> fallback', toSafeInteger('   '), 0);
test('reiner Text -> fallback', toSafeInteger('abc'), 0);
test('String mit custom fallback', toSafeInteger('abc', -1), -1);
test('Zahl mit Text und custom fallback bleibt geparst', toSafeInteger('42px', -1), 42);
test('Plus-Zeichen wird nicht erkannt -> fallback', toSafeInteger('+42'), 0);
test('Text mit Zahl in der Mitte -> fallback', toSafeInteger('Raum 404'), 0);
test('Hex-String wird nicht als Hex geparst', toSafeInteger('0x1A'), 0);
test('Wissenschaftliche Notation wird nicht als solche geparst', toSafeInteger('1e3'), 1);

console.log('\n--- BigInt ---');
test('kleiner BigInt', toSafeInteger(10n), 10);
test('negativer BigInt', toSafeInteger(-10n), -10);
test('BigInt über MAX_SAFE_INTEGER wird geclamped', toSafeInteger(10n ** 30n), Number.MAX_SAFE_INTEGER);
test('BigInt unter MIN_SAFE_INTEGER wird geclamped', toSafeInteger(-(10n ** 30n)), Number.MIN_SAFE_INTEGER);
test('BigInt genau MAX_SAFE_INTEGER', toSafeInteger(BigInt(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER);

console.log('\n--- Arrays ---');
test('Array mit einem Element', toSafeInteger([42]), 42);
test('Array mit einem String-Element', toSafeInteger(['42']), 42);
test('Array mit mehreren Elementen -> fallback', toSafeInteger([1, 2]), 0);
test('leeres Array -> fallback', toSafeInteger([]), 0);
test('verschachteltes Array mit einem Element', toSafeInteger([[42]]), 42);

console.log('\n--- Objects ---');
test('leeres Objekt -> fallback', toSafeInteger({}), 0);
test('Objekt mit valueOf', toSafeInteger({ valueOf: () => 42 }), 42);
test('Objekt mit valueOf(float)', toSafeInteger({ valueOf: () => 42.9 }), 42);
test('Objekt ohne sinnvolle Konvertierung -> fallback', toSafeInteger({ a: 1 }), 0);

console.log('\n--- Date ---');
test('gültiges Date -> timestamp', toSafeInteger(new Date(1000)), 1000);
test('Invalid Date -> fallback', toSafeInteger(new Date('invalid')), 0);

console.log('\n--- Symbol / Function ---');
test('Symbol -> fallback', toSafeInteger(Symbol('test')), 0);
test('Function -> fallback', toSafeInteger(function () {}), 0);

console.log('\n--- Custom Fallback Edge Cases ---');
test('ungültiger fallback wird selbst zu 0', toSafeInteger('abc', 'nicht-integer'), 0);
test('fallback als float wird zu 0', toSafeInteger('abc', 1.5), 0);
test('fallback 0 explizit', toSafeInteger(undefined, 0), 0);

console.log(`\n${passed} bestanden, ${failed} fehlgeschlagen`);
if (failed > 0) process.exit(1);