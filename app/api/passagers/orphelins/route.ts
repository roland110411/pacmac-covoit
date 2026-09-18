import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const debut = new Date()
  debut.setHours(0, 0, 0, 0)
  const fin = new Date()
  fin.setHours(23, 59, 59, 999)

  const orphelins = await prisma.passager.findMany({
    where: { chauffeurId: null, createdAt: { gte: debut, lte: fin } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(orphelins)
}

export async function DELETE(req: NextRequest) {
  const { passagerId } = await req.json()
  await prisma.passager.delete({ where: { id: passagerId } })
  return NextResponse.json({ ok: true })
}
