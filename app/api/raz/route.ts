import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function DELETE() {
  await prisma.passager.updateMany({ where: { efface: false }, data: { efface: true } })
  await prisma.chauffeur.updateMany({ where: { special: false, efface: false }, data: { efface: true } })
  return NextResponse.json({ ok: true })
}
