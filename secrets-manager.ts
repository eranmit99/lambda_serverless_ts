import AWS from 'aws-sdk';
import * as fs from 'fs';

export async function getAwsSecret(
  region = 'us-east-2',
  secretName = 'no-fly-zone-alerts-blu-prod-secrets'
) {
  const client = new AWS.SecretsManager({ region });
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
  } else throw new Error('No valid string presented');
  const formatedSecrets = Object.entries(JSON.parse(secrets)).reduce((s, [key, val]) => {
    s += `${key}=${val}\n`;
    return s;
  }, '');
  fs.writeFileSync('.env', formatedSecrets);
}

void getAwsSecret();
