import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";
const region = process.env.S3_REGION ?? "us-east-1";
const bucket = process.env.S3_BUCKET ?? "nexg-media";
const CDN = (process.env.CDN_URL ?? `${endpoint}/${bucket}`).replace(/\/$/, "");

export const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
  },
  forcePathStyle: true,
});

export type ImageVariant = "thumb" | "small" | "medium" | "large" | "original";

export function publicUrl(key: string) {
  return `${CDN}/${key}`;
}

// Variant convention: <entity>/<id>/<variant>/<filename>
export function variantKey(entity: string, id: string, variant: ImageVariant, filename: string) {
  return `${entity}/${id}/${variant}/${filename}`;
}

export async function presignUpload(key: string, contentType = "image/jpeg", expiresIn = 3600) {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return { url, key, publicUrl: publicUrl(key) };
}
