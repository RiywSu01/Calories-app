import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client'; // Adjust import path based on your output folder
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if(!databaseUrl){
        throw new Error('DATABASE_URL environment variable is not set or missing.');
    }
    // 1. Initialize the native Postgres adapter
    const adapter = new PrismaPg({
      connectionString: databaseUrl as string,
    });

    // 2. Pass the adapter into the PrismaClient constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}