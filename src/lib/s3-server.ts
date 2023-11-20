import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import stream from "stream"; // Import stream module
import { join } from 'path';
import { tmpdir } from 'os'; 

export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new S3({
        region: "eu-west-2",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
      };

      const obj = await s3.getObject(params);

      let readableStream: stream.Readable;

      if (obj.Body instanceof Buffer) {
        // If obj.Body is a Buffer, convert it to a readable stream
        readableStream = stream.Readable.from([obj.Body]);
      } else if (obj.Body instanceof stream.Readable) {
        // If obj.Body is already a readable stream, use it directly
        readableStream = obj.Body;
      } else {
        reject(new Error("Object body is not a Readable stream"));
        return;
      }

      const file_name = join(tmpdir(), `${file_key}-${Date.now()}.pdf`);

      const file = fs.createWriteStream(file_name); // Create a write stream for the file

      file.on("open", function (_fd) {
        readableStream.pipe(file).on("finish", () => {
          resolve(file_name);
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

