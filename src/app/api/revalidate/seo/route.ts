import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

const TAG_PATTERN = /^(project|project-reviews)-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(request: Request) {
  const secret = process.env.NEXT_REVALIDATION_SECRET;
  const authorization = request.headers.get('authorization');
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as { tags?: unknown } | null;
  const tags = Array.isArray(payload?.tags)
    ? payload.tags.filter((tag): tag is string => typeof tag === 'string' && TAG_PATTERN.test(tag))
    : [];

  if (tags.length === 0) {
    return NextResponse.json({ success: false, message: 'No valid tags supplied' }, { status: 422 });
  }

  tags.forEach((tag) => revalidateTag(tag, 'max'));
  return NextResponse.json({ success: true, tags });
}
