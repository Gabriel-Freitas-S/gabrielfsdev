const crypto = require('crypto');

async function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const iterations = 100000; // Cloudflare Workers limit
    const keyLength = 32;

    const hash = await new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
        });
    });

    const saltHex = salt.toString('hex');
    const hashHex = hash.toString('hex');
    return `pbkdf2:${iterations}:${saltHex}:${hashHex}`;
}

const password = process.argv[2] || 'admin123';
console.log(`Generating hash for password: ${password}`);

hashPassword(password).then(hash => {
    console.log('\n--- HASH FOR D1 ---');
    console.log(hash);
    console.log('-------------------\n');
});
