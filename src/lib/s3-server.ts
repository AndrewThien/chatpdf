import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';  
import AWS from 'aws-sdk';

export async function downloadFromS3(fileKey: string) Promise<string> {

  try {

    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY 
    });

    const s3 = new AWS.S3({
      params: { Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME }, 
      region: 'eu-west-2'
    });

    const obj = await s3.getObject({ Key: fileKey }).promise();

    const fileName = join(tmpdir(), `${fileKey}-${Date.now()}.pdf`);

    const stream = createWriteStream(fileName);

    stream.write(obj.Body); 

    stream.end();

    return fileName;

  } catch (error) {
   console.error(error);
   return null;
  }

}