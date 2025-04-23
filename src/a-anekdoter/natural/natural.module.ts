// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NaturalService } from './natural.service';

@Module({
  providers: [NaturalService],
  imports: [ConfigModule],
  exports: [NaturalService],
})
export class NaturalModule {}
