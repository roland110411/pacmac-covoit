import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const orphelins = await prisma.passager.findMany({
    where: { chauffeurId: null, efface: false },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(orphelins)
}

export async function DELETE(req: NextRequest) {
  const { passagerId } = await req.json()
  await prisma.passager.delete({ where: { id: passagerId } })
  return NextResponse.json({ ok: true })
}
