import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3 = new S3({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async uploadFile(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
    const key = `${uuid()}-${filename}`;
    console.log("BUCKET NAME", process.env.AWS_S3_BUCKET!)
    const result = await this.s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Body: buffer,
        Key: key,
        ContentType: mimetype,
      })
      .promise();

    return result.Location; // public URL
  }
}
