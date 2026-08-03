import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() //Makes PrismaService available everywhere, other module do not need to import it.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export it so other modules can use the database
})
export class PrismaModule {}