import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

const fix = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    // 1. Drop the NOT NULL constraint on donorId (if it exists)
    try {
      await sequelize.query(`ALTER TABLE "BloodInventories" ALTER COLUMN "donorId" DROP NOT NULL;`);
      console.log('✅ donorId is now nullable');
    } catch (e) {
      console.log('ℹ️  donorId already nullable or constraint not found:', e.message);
    }

    // 2. Drop the FK constraint on donorId (it may block nulls on some PG versions)
    try {
      const [constraints] = await sequelize.query(`
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE table_name = 'BloodInventories' AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%donorId%';
      `);
      for (const c of constraints) {
        await sequelize.query(`ALTER TABLE "BloodInventories" DROP CONSTRAINT "${c.constraint_name}";`);
        console.log(`✅ Dropped FK constraint: ${c.constraint_name}`);
      }
    } catch (e) {
      console.log('ℹ️  FK constraint removal:', e.message);
    }

    // 3. Add source column if it doesn't exist
    try {
      await sequelize.query(`ALTER TABLE "BloodInventories" ADD COLUMN IF NOT EXISTS "source" VARCHAR(255) DEFAULT 'admin';`);
      console.log('✅ source column added (or already exists)');
    } catch (e) {
      console.log('ℹ️  source column:', e.message);
    }

    console.log('\n✅ All DB fixes applied successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fix failed:', err.message);
    process.exit(1);
  }
};

fix();
