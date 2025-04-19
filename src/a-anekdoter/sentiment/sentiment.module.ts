import { Module } from '@nestjs/common';
import { SentimentService } from './sentiment.service';
import { ConfigModule } from '@nestjs/config';
import { AnekdoterService } from '../anekdoter.service';
import { BoobsService } from '../boobs.service';

@Module({
  providers: [SentimentService, AnekdoterService, BoobsService],
  imports: [ConfigModule],
  exports: [SentimentService],
})
export class SentimentModule {}
