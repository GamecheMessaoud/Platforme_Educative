const bcrypt = require('bcryptjs');

async function test() {
    console.log('Testing bcrypt...');
    const start = Date.now();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Password123!', salt);
    console.log('Hash produced in', Date.now() - start, 'ms');
    console.log('Hash:', hash);

    const match = await bcrypt.compare('Password123!', hash);
    console.log('Match:', match);
}

test();
