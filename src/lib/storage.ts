import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";

export interface StorageAdapter {
  upload(file: Buffer, filename: string, contentType: string): Promise<string>;
  getUrl(key: string): string;
  delete(key: string): Promise<void>;
  read(key: string): Promise<Buffer>;
}

class LocalStorageAdapter implements StorageAdapter {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async upload(file: Buffer, filename: string, _contentType?: string): Promise<string> {
    const key = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const fullPath = path.join(this.basePath, key);
    await mkdir(this.basePath, { recursive: true });
    await writeFile(fullPath, file);
    return key;
  }

  getUrl(key: string): string {
    return `/api/files/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(path.join(this.basePath, key));
    } catch {
      // file may not exist
    }
  }

  async read(key: string): Promise<Buffer> {
    return readFile(path.join(this.basePath, key));
  }
}

class S3StorageAdapter implements StorageAdapter {
  private bucket: string;
  private endpoint: string;
  private region: string;
  private accessKey: string;
  private secretKey: string;
  private publicUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    this.endpoint = process.env.S3_ENDPOINT!;
    this.region = process.env.S3_REGION || "auto";
    this.accessKey = process.env.S3_ACCESS_KEY!;
    this.secretKey = process.env.S3_SECRET_KEY!;
    this.publicUrl = process.env.S3_PUBLIC_URL || this.endpoint;
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    const key = `audio/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
      },
      forcePathStyle: true,
    });

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );

    return key;
  }

  getUrl(key: string): string {
    return `${this.publicUrl}/${this.bucket}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
      },
      forcePathStyle: true,
    });
    await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async read(key: string): Promise<Buffer> {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
      },
      forcePathStyle: true,
    });
    const response = await client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) throw new Error("Failed to read file from S3");
    return Buffer.from(bytes);
  }
}

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (storageInstance) return storageInstance;

  const type = process.env.STORAGE_TYPE || "local";

  if (type === "s3") {
    storageInstance = new S3StorageAdapter();
  } else {
    storageInstance = new LocalStorageAdapter(
      process.env.STORAGE_LOCAL_PATH || "./uploads"
    );
  }

  return storageInstance;
}
