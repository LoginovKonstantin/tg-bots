import { Module } from '@nestjs/common';
import { SentimentService } from './sentiment.service';
import { ConfigModule } from '@nestjs/config';
import { AnekdoterService } from '../anekdoter.service';

@Module({
  providers: [SentimentService, AnekdoterService],
  imports: [ConfigModule],
  exports: [SentimentService],
})
export class SentimentModule {}
