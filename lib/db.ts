import { PrismaClient } from '@prisma/client'

interface ClerkUser {
  id: string
  emailAddresses?: Array<{
    emailAddress: string
  }>
  firstName?: string | null
  lastName?: string | null
}

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

export async function getOrCreateUser(clerkUser: ClerkUser) {
  try {
    // Extract the Clerk user ID from the user object
    const clerkId = clerkUser.id
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || ''
    const firstName = clerkUser.firstName || ''
    const lastName = clerkUser.lastName || ''

    if (!clerkId) {
      throw new Error('Invalid Clerk user: missing ID')
    }

    // First try to find user by Clerk ID
    let user = await getUserByClerkId(clerkId)

    if (!user) {
      // If no user found by Clerk ID, check if email exists
      const existingUserByEmail = await prisma.user.findFirst({
        where: { email }
      })

      if (existingUserByEmail) {
        // Update existing user with new Clerk ID
        user = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: { 
            clerkId,
            firstName: firstName || existingUserByEmail.firstName,
            lastName: lastName || existingUserByEmail.lastName
          }
        })
      } else {
        // Create new user
        user = await createUser(clerkId, email, firstName, lastName)
      }
    }

    return user
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    throw error
  }
}
