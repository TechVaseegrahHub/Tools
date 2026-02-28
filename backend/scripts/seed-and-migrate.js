/**
 * One-time migration script:
 * 1. Creates a default Organization for existing data
 * 2. Stamps all existing Tools, Transactions, Categories, and Users with that orgId
 *
 * Usage: node scripts/seed-and-migrate.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

// Import models
import Organization from '../models/organization.model.js';
import Tool from '../models/tool.model.js';
import Transaction from '../models/transaction.model.js';
import Category from '../models/category.model.js';
import User from '../models/user.model.js';

const DEFAULT_ORG_NAME = 'Tech Vaseegrah';
const DEFAULT_ORG_SLUG = 'techvaseegrah';

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ─── Step 1: Create or find the default org ──────────────────────
    let org = await Organization.findOne({ slug: DEFAULT_ORG_SLUG });

    if (org) {
        console.log(`ℹ️  Default org already exists: "${org.name}" (${org._id})`);
    } else {
        org = await Organization.create({
            name: DEFAULT_ORG_NAME,
            slug: DEFAULT_ORG_SLUG,
            isActive: true,
        });
        console.log(`🏢 Created default org: "${org.name}" (${org._id})`);
    }

    const orgId = org._id;

    // ─── Step 2: Remove old unique indexes before migration ──────────
    // The old Tool schema had { toolId: 1 } as globally unique.
    // We are replacing it with { toolId: 1, orgId: 1 } — drop the old one first.
    try {
        await mongoose.connection.collection('tools').dropIndex('toolId_1');
        console.log('🗑️  Dropped old global toolId unique index');
    } catch (e) {
        console.log('ℹ️  No old toolId_1 index found (already removed or does not exist)');
    }

    // Same for categories: old { name: 1 } global unique becomes { name: 1, orgId: 1 }
    try {
        await mongoose.connection.collection('categories').dropIndex('name_1');
        console.log('🗑️  Dropped old global category name unique index');
    } catch (e) {
        console.log('ℹ️  No old name_1 index on categories (already removed or does not exist)');
    }

    // ─── Step 3: Stamp all existing docs with orgId ──────────────────
    const toolResult = await Tool.updateMany(
        { orgId: { $exists: false } },
        { $set: { orgId } }
    );
    console.log(`🔧 Migrated ${toolResult.modifiedCount} tools`);

    const transactionResult = await Transaction.updateMany(
        { orgId: { $exists: false } },
        { $set: { orgId } }
    );
    console.log(`🔄 Migrated ${transactionResult.modifiedCount} transactions`);

    const categoryResult = await Category.updateMany(
        { orgId: { $exists: false } },
        { $set: { orgId } }
    );
    console.log(`📂 Migrated ${categoryResult.modifiedCount} categories`);

    const userResult = await User.updateMany(
        { orgId: { $exists: false } },
        { $set: { orgId } }
    );
    console.log(`👤 Migrated ${userResult.modifiedCount} users`);

    // ─── Step 4: Print summary ───────────────────────────────────────
    console.log('\n✅ Migration complete!');
    console.log('─────────────────────────────────────────────');
    console.log(`Org Name  : ${org.name}`);
    console.log(`Org ID    : ${org._id}`);
    console.log(`Org Slug  : ${org.slug}`);
    console.log('─────────────────────────────────────────────');
    console.log('SuperAdmin login:');
    console.log(`  Email    : ${process.env.SUPER_ADMIN_EMAIL}`);
    console.log(`  Password : ${process.env.SUPER_ADMIN_PASSWORD}`);
    console.log('─────────────────────────────────────────────');
    console.log('Default Admin login (for this org):');
    console.log('  Email    : techvaseegrah@gmail.com');
    console.log('  Password : 0000');
    console.log('─────────────────────────────────────────────\n');

    await mongoose.connection.close();
}

run().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
