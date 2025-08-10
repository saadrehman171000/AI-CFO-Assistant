import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId }
    })
    return user
  } catch (error) {
    console.error('Error looking up user by Clerk ID:', error)
    throw error
  }
}

export async function createUser(clerkId: string, email: string, firstName?: string, lastName?: string) {
  try {
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName
      }
    })
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function getOrCreateUser(clerkId: string, email: string, firstName?: string, lastName?: string) {
  try {
    let user = await getUserByClerkId(clerkId)

    if (!user) {
      user = await createUser(clerkId, email, firstName, lastName)
    }

    return user
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    throw error
  }
}
