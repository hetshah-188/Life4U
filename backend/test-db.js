import sequelize from './config/database.js';

const test = async () => {
    try {
        console.log('Testing connection to PostgreSQL...');
        await sequelize.authenticate();
        console.log('✅ Connection Succeeded!');
        process.exit(0);
    } catch (e) {
        console.error('❌ Connection Failed:', e.message);
        process.exit(1);
    }
};

test();
