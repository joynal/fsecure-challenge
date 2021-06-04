import dotenv from 'dotenv';

dotenv.config();

export const env: string = process.env.NODE_ENV;

export const awsAccessKeyId: string = process.env.AWS_ACCESS_KEY_ID;
export const awsSecretAccessKey: string = process.env.AWS_SECRET_KEY;
export const awsRegion: string = process.env.AWS_REGION;

export const streamName: string = process.env.STREAM_NAME;

export const sqsUrl: string = process.env.SQS_QUEUE_URL;
export const sqsVisibilityTimeout: number = parseInt(process.env.SQS_VISIBILITY_TIMEOUT, 10);
export const sqsNumberOfMessages: number = parseInt(process.env.SQS_NUMBER_OF_MESSAGES, 10);

export const kinesisUrl: string = process.env.KINESIS_URL;
