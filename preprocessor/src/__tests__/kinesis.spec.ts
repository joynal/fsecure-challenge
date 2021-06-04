import AWS from 'aws-sdk'
import awsHelper from '../aws';
import Kinesis from '../kinesis'

const aws: typeof AWS = awsHelper(
  'test',
  'test',
  'test',
);

const sampleEvent = {
  event_data: {
    source_ip: '192.168.0.1',
    destination_ip: '142.250.74.110',
    destination_port: '13210'
  },
  device_id: '0d91adc7-c471-4626-9de7-ec963f21c618',
  time_created: '2021-06-04T03:21:20.911Z',
  event_type: 'network_connection',
  event_id: '7758793c-a995-4ec9-ad12-b9d0d49782c8'
};

describe('Kinesis publish', () => {
  test('should return true if data published properly', async () => {
    const kinesis = new Kinesis(aws)

    const kinesisResponse = jest.fn().mockReturnValue(Promise.resolve({
      ShardId: 'shardId-000000000000',
      SequenceNumber: '49618831531012765371473665476622059136564775271404666882'
    }))

    const putRecord = jest.fn().mockImplementation(() => ({ promise: kinesisResponse }));
    kinesis.kinesis.putRecord = putRecord;

    const got = await kinesis.publish(sampleEvent, "test")

    expect(got).toBe(true)
  })


  test('should return false if data publish failed', async () => {
    const kinesis = new Kinesis(aws)

    const kinesisResponse = jest.fn().mockReturnValue(Promise.reject(new Error('InvalidArgumentException')))

    const putRecord = jest.fn().mockImplementation(() => ({ promise: kinesisResponse }));
    kinesis.kinesis.putRecord = putRecord;

    const got = await kinesis.publish(sampleEvent, "test", false)

    expect(got).toBe(false)
  })
})
