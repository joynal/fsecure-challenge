import awsService from 'aws-sdk';

export default (accessKeyId: string, secretAccessKey: string, region: string) => {
  awsService.config.update({
    accessKeyId,
    secretAccessKey,
    region,
  });

  return awsService;
};
