import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";

// Read config from environment variables
const BUCKET = process.env.AWS_BUCKET_NAME!;
const REGION = process.env.AWS_REGION!;
const DIRECTORY = process.env.UPLOAD_DIR || "./dist";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadFile(filePath: string, key: string): Promise<void> {
  const fileContent = fs.readFileSync(filePath);
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileContent,
  });
  await s3.send(command);
  console.log(`Uploaded: ${key}`);
}

function getAllFiles(dir: string, base = dir): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, base));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

async function main() {
  const files = getAllFiles(DIRECTORY);
  for (const filePath of files) {
    // S3 keys should always use forward slashes
    const key = path.relative(DIRECTORY, filePath).split(path.sep).join("/");
    await uploadFile(filePath, key);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
