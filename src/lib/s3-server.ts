import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import AWS from 'aws-sdk';
import PDFDocument from 'pdfkit';
import path from "path";
import fs from "fs";

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

    const directoryPath = path.join(__dirname, "tmp"); // Create directory path
    fs.mkdirSync(directoryPath, { recursive: true }); // Create the directory if it doesn't exist

    const file_name = path.join(
      directoryPath,
      `user${Date.now().toString()}.pdf`,
    );


    const doc = new PDFDocument();
    
    const stream = doc.pipe(createWriteStream(file_name));
  
    stream.write(Body);
    
    doc.end();
  
    return file_name;
  } catch (error) {
    console.error(error);
    return null;
  }
}
