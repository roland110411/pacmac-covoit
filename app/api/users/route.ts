import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const { name, email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  const user = await prisma.user.create({ data: { name, email } })
  return NextResponse.json(user, { status: 201 })
}
