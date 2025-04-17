import { Module } from '@nestjs/common';
import { SentimentService } from './sentiment.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [SentimentService],
  imports: [ConfigModule],
  exports: [SentimentService],
})
export class SentimentModule {}
