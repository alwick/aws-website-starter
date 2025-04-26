import * as cdk from 'aws-cdk-lib';
import {
  Distribution,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket, BlockPublicAccess, BucketAccessControl,  } from 'aws-cdk-lib/aws-s3';

import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.createDistribution('wickidcool-web-bucket-2025');
  }

  private createBucket = async (bucketName: string): Promise<Bucket> => {
    try {
      // Create a private S3 bucket
      const bucket = new Bucket(this, bucketName, {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        accessControl: BucketAccessControl.PRIVATE,
        enforceSSL: true,
      });

      return bucket;
    } catch (error) {
      console.error("Error creating bucket:", error);
      throw error;
    }
  };

  private createDistribution = async (bucketName: string) => {
    const bucket = await this.createBucket(bucketName);
    if (bucket) {
      // Create CloudFront distribution with S3 origin using OAI
      const response = new Distribution(this, 'MyDistribution', {
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(bucket),
        },
        defaultRootObject: 'index.html'
      });
      console.log(
        "CloudFront Distribution created:",
        response
      );
    }
  }
}
