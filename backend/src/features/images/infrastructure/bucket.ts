import { S3Client } from "bun";
import { env } from "../../../global/config/env.config";

const bucketClient = new S3Client({
   accessKeyId: env.BUCKET_ACCESS_KEY_ID,
   secretAccessKey: env.BUCKET_SECRET_ACCESS_KEY,
   bucket: env.BUCKET_NAME,
   endpoint: env.BUCKET_URL,
});

export default bucketClient;