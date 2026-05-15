import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function getGoogleAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) {
    throw new Error("No Google access token found. Please re-authenticate.");
  }

  // Refresh if expired
  if (account.expires_at && account.expires_at * 1000 < Date.now()) {
    if (!account.refresh_token) {
      throw new Error("Token expired and no refresh token available.");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: account.refresh_token });

    const { credentials } = await oauth2Client.refreshAccessToken();

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: credentials.access_token ?? account.access_token,
        expires_at: credentials.expiry_date
          ? Math.floor(credentials.expiry_date / 1000)
          : account.expires_at,
      },
    });

    return credentials.access_token!;
  }

  return account.access_token;
}

export async function getBloggerClient(userId: string) {
  const accessToken = await getGoogleAccessToken(userId);
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.blogger({ version: "v3", auth });
}

export interface BlogInfo {
  id: string;
  name: string;
  url: string;
  description?: string;
}

export async function listUserBlogs(userId: string): Promise<BlogInfo[]> {
  const blogger = await getBloggerClient(userId);
  const response = await blogger.blogs.listByUser({ userId: "self" });
  return (response.data.items ?? []).map((b) => ({
    id: b.id!,
    name: b.name!,
    url: b.url!,
    description: b.description ?? undefined,
  }));
}

export interface PublishPostOptions {
  blogId: string;
  title: string;
  htmlContent: string;
  labels?: string[];
  isDraft?: boolean;
}

export interface PublishedPost {
  id: string;
  url: string;
  publishedAt: string;
}

export async function publishToBlogger(
  userId: string,
  options: PublishPostOptions
): Promise<PublishedPost> {
  const blogger = await getBloggerClient(userId);

  const response = await blogger.posts.insert({
    blogId: options.blogId,
    isDraft: options.isDraft ?? false,
    requestBody: {
      title: options.title,
      content: options.htmlContent,
      labels: options.labels ?? [],
    },
  });

  return {
    id: response.data.id!,
    url: response.data.url!,
    publishedAt: response.data.published ?? new Date().toISOString(),
  };
}

export async function testBloggerConnection(userId: string): Promise<{ ok: boolean; blogs: BlogInfo[] }> {
  try {
    const blogs = await listUserBlogs(userId);
    return { ok: true, blogs };
  } catch (error) {
    return { ok: false, blogs: [] };
  }
}
