import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { chauffeurId } = await req.json()

  const chauffeur = await prisma.chauffeur.findUnique({
    where: { id: chauffeurId },
    include: { _count: { select: { passagers: true } } },
  })
  if (!chauffeur) return NextResponse.json({ error: 'Chauffeur introuvable' }, { status: 404 })
  if (chauffeur._count.passagers >= chauffeur.capacite) {
    return NextResponse.json({ error: 'Voiture pleine' }, { status: 400 })
  }

  const passager = await prisma.passager.update({
    where: { id: parseInt(id) },
    data: { chauffeurId },
  })
  return NextResponse.json(passager)
}
