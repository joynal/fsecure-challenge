import AWS from 'aws-sdk';

import { Event } from './types';

import * as config from './config';
import { log, error } from './logger';

export default class Kinesis {
  kinesis: AWS.Kinesis;

  constructor(aws: typeof AWS) {
    this.kinesis = new aws.Kinesis({ endpoint: config.kinesisUrl });
  }

  async publish(event: Event, PartitionKey: string, retry: boolean = true): Promise<boolean> {
    try {
      const payload = {
        Data: JSON.stringify(event),
        StreamName: config.streamName,
      };

      const res = await this.kinesis
        .putRecord({
          ...payload,
          PartitionKey,
        })
        .promise();

      log('sent to kinesis', res);

      return true;
    } catch (err) {
      // failed to publish, lets retry
      error('publish error:', err);

      if (retry) {
        await this.publish(event, PartitionKey);
      }

      return false;
    }
  }
}
