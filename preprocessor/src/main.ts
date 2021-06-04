import { Consumer } from 'sqs-consumer';

import * as config from './config';
import processMessage from './processMessage'

const app = Consumer.create({
  queueUrl: config.sqsUrl,
  handleMessage: processMessage,
  batchSize: config.sqsNumberOfMessages,
  visibilityTimeout: config.sqsVisibilityTimeout,
  terminateVisibilityTimeout: true,
});

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();
