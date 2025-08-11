const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixNewUser() {
  try {
    console.log('🔍 Finding new saadrehman user and fixing subscription...\n');

    // Get all users to find the new saadrehman account
    const users = await prisma.user.findMany();
    
    console.log('Available users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (Clerk ID: ${user.clerkId})`);
    });

    // Find the saadrehman user
    const saadrehmanUser = users.find(user => user.email.includes('saadrehman'));
    
    if (!saadrehmanUser) {
      console.log('❌ No saadrehman user found!');
      return;
    }

    console.log(`\n🎯 Found saadrehman user: ${saadrehmanUser.email}`);
    console.log(`   User ID: ${saadrehmanUser.id}`);
    console.log(`   Clerk ID: ${saadrehmanUser.clerkId}`);
    
    // Get the subscription
    const subscription = await prisma.subscription.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!subscription) {
      console.log('❌ No active subscription found!');
      return;
    }

    console.log(`\n💳 Found subscription: ${subscription.id}`);
    console.log(`   Current User ID: ${subscription.userId}`);
    console.log(`   Status: ${subscription.status}`);

    // Update the subscription to use the new saadrehman user
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        userId: saadrehmanUser.id,
      }
    });

    console.log('\n✅ Subscription updated successfully!');
    console.log(`   New User ID: ${updatedSubscription.userId}`);
    console.log(`   User Email: ${saadrehmanUser.email}`);
    console.log(`   Status: ${updatedSubscription.status}`);
    
    console.log('\n🔄 Now refresh your dashboard - it should show your active subscription!');
    console.log('   The "Premium Feature" message should disappear.');

  } catch (error) {
    console.error('Error fixing subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNewUser();
