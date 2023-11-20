import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

export async function downloadFromS3(file_key: string): Promise<string | null> {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
    });

    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      },
      region: 'eu-west-2',
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    };

    const obj = await s3.getObject(params).promise();

    const file_name = `/temp/andrew-${Date.now().toString()}.pdf`;

    fs.writeFileSync(file_name, obj.Body as Buffer);

    return file_name;
  } catch (error) {
    console.error(error);
    return null;
  }
}
