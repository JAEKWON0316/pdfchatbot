import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));
    return NextResponse.json(files);
  } catch (error: unknown) {
    return NextResponse.json([]);
  }
}
