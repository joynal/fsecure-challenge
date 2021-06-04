import { v4 } from 'uuid';
import AWS from 'aws-sdk';

import Kinesis from './kinesis';
import { error } from './logger';

import awsHelper from './aws';
import * as config from './config';

import { Submission, EventAlias, EventMeta } from './types';

const aws: typeof AWS = awsHelper(
  config.awsAccessKeyId,
  config.awsSecretAccessKey,
  config.awsRegion,
);

const kinesis = new Kinesis(aws);

const processEvents = async (events: EventAlias[], eventMeta: EventMeta, PartitionKey: string) => {
  // parallelly process events
  await Promise.all(
    events.map(async (event: EventAlias) => {
      await kinesis.publish({ event_data: event, ...eventMeta, event_id: v4() }, PartitionKey);
    }),
  );
};

export default async (message: AWS.SQS.Message) => {
  try {
    // decode from base64
    const submission: Submission = JSON.parse(Buffer.from(message.Body, 'base64').toString('utf8'));

    const eventMeta = {
      device_id: submission.device_id,
      time_created: new Date().toISOString(),
    };

    const PartitionKey = v4();

    // if submission has new process events
    if (submission?.events?.new_process) {
      await processEvents(
        submission.events.new_process,
        {
          ...eventMeta,
          event_type: 'new_process',
        },
        PartitionKey,
      );
    }

    // if submission has network events
    if (submission?.events?.network_connection) {
      await processEvents(
        submission.events.network_connection,
        {
          ...eventMeta,
          event_type: 'network_connection',
        },
        PartitionKey,
      );
    }
  } catch (err) {
    error("messaging processing failed", err);
  }
};
