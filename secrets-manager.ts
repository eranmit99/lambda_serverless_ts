import AWS from 'aws-sdk';
import * as fs from 'fs';

const appName = process.env.APP_NAME!;
const env = process.env.NODE_ENV;
const secretName = env === 'production' ? appName : `${appName}-${env}`;
const region = process.env.AWS_DEFAULT_REGION!;

export async function getAwsSecret(region: string, secretName: string) {
  const client = new AWS.SecretsManager({ region });
  const data = await client.getSecretValue({ SecretId: secretName }).promise();
  let secrets: string;
  if (data?.SecretString) {
    secrets = data.SecretString;
  } else if (data?.SecretBinary) {
    const secretBinaryBuffer = Buffer.from(
      data.SecretBinary as string,
      'base64'
    );

    secrets = secretBinaryBuffer.toString('ascii');
  } else throw new Error('invalid string');
  const formatedSecrets = Object.entries(JSON.parse(secrets)).reduce(
    (s, [key, val]) => {
      s += `${key}=${val}\n`;
      return s;
    },
    ''
  );
  fs.writeFileSync('.env', formatedSecrets);
}

void getAwsSecret(region, secretName);
