import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AnekdoterService } from './anekdoter.service';
import { BoobsService } from './boobs.service';
import { SentimentService } from './sentiment/sentiment.service';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot()],
  controllers: [],
  providers: [AnekdoterService, BoobsService, SentimentService],
})
export class AnekdoterModule {}
