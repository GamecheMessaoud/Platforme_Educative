import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

console.log('Initializing PostgreSQL Pool...');
// Append uselibpqcompat so pg uses standard libpq SSL semantics
// (avoids deprecation warning when sslmode=require is in the connection string)
const pool = new Pool({ 
    connectionString: connectionString + '&uselibpqcompat=true',
    max: 3,              // Neon free tier has limited concurrent connections
    idleTimeoutMillis: 0, // Don't kill idle connections — Neon handles this serverless-side
    connectionTimeoutMillis: 10000, // 10s — gives Neon time to wake up from sleep
});
console.log('PostgreSQL Pool initialized.');

console.log('Initializing Prisma Pg Adapter...');
const adapter = new PrismaPg(pool);
console.log('Prisma Pg Adapter initialized.');

// Use the adapter for Prisma Client
console.log('Creating Prisma Client with Adapter...');
export const prisma = new PrismaClient({ adapter });
console.log('Prisma Client instance created.');

export const connectDB = async () => {
    try {
        console.log('Calling prisma.$connect()...');
        await prisma.$connect();
        console.log('✅ PostgreSQL connected successfully via Prisma Adapter');
    } catch (error) {
        console.error('❌ Failed to connect to PostgreSQL', error);
        process.exit(1);
    }
};
