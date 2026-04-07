import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  /* ---------------------------------- */
  /* USERS                              */
  /* ---------------------------------- */

  const roles = [
    "Video Creator",
    "Content Creator",
    "Editor",
    "Graphic Designer",
    "Music Producer",
    "Photographer",
    "Animator",
    "Influencer",
    "Writer",
    "Podcast Host",
  ];

  const locations = [
    "Chennai",
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Pune",
    "Kochi",
  ];

  const users = [];

  for (let i = 1; i <= 25; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@creedlink.com`,
        password,
        fullName: `Creator ${i}`,
        username: `creator${i}`,
        role: roles[i % roles.length],
        bio: "Creative professional collaborating with brands and creators.",
        location: locations[i % locations.length],
        website: `https://creator${i}.com`,
        twitter: `https://twitter.com/creator${i}`,
        instagram: `https://instagram.com/creator${i}`,
        portfolio: `https://portfolio.com/creator${i}`,
        avatar: `https://i.pravatar.cc/150?img=${i}`,
        profileCompleted: i % 5 !== 0, // some incomplete profiles
      },
    });

    users.push(user);
  }

  console.log("Users created");

  /* ---------------------------------- */
  /* SKILLS                             */
  /* ---------------------------------- */

  const skillNames = [
    "Video Editing",
    "Script Writing",
    "UI Design",
    "Photography",
    "Brand Marketing",
    "Animation",
    "Music Production",
    "SEO",
    "Storytelling",
    "Podcast Editing",
  ];

  for (const user of users) {
    const skillCount = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < skillCount; i++) {
      await prisma.skill.create({
        data: {
          name: skillNames[Math.floor(Math.random() * skillNames.length)],
          userId: user.id,
        },
      });
    }
  }

  console.log("Skills created");

  /* ---------------------------------- */
  /* WORK PORTFOLIO                     */
  /* ---------------------------------- */

  const clients = [
    "Nike",
    "Adobe",
    "Spotify",
    "Netflix",
    "Amazon",
    "YouTube",
    "Meta",
    "Google",
  ];

  for (const user of users.slice(0, 15)) {
    for (let i = 0; i < 2; i++) {
      await prisma.work.create({
        data: {
          title: "Brand Campaign Project",
          client: clients[Math.floor(Math.random() * clients.length)],
          year: 2020 + Math.floor(Math.random() * 5),
          userId: user.id,
        },
      });
    }
  }

  console.log("Works created");

  /* ---------------------------------- */
  /* FOLLOW RELATIONSHIPS               */
  /* ---------------------------------- */

  for (let i = 0; i < 50; i++) {
    const follower = users[Math.floor(Math.random() * users.length)];
    const following = users[Math.floor(Math.random() * users.length)];

    if (follower.id === following.id) continue;

    try {
      await prisma.follow.create({
        data: {
          followerId: follower.id,
          followingId: following.id,
        },
      });
    } catch {}
  }

  console.log("Follows created");

  /* ---------------------------------- */
  /* AGREEMENTS                         */
  /* ---------------------------------- */

  const types = ["LICENSE", "COLLABORATION", "REVENUE_SHARE", "PARTNERSHIP"];

  const statuses = ["DRAFT", "SENT", "PENDING", "COMPLETED", "REJECTED"];

  for (let i = 1; i <= 30; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    let receiver = users[Math.floor(Math.random() * users.length)];

    if (sender.id === receiver.id) {
      receiver = users[(users.indexOf(sender) + 1) % users.length];
    }

    const senderSigned = Math.random() > 0.4;
    const receiverSigned = Math.random() > 0.5;

    await prisma.agreement.create({
      data: {
        agreementNumber: `CL-${1000 + i}`,
        title: `Creator Collaboration Agreement ${i}`,
        content: `
This agreement defines the collaboration between two creators.

Deliverables:
- 3 YouTube videos
- 2 Instagram reels

Payment:
Revenue share of 40%.

Duration:
3 months.
`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: types[Math.floor(Math.random() * types.length)],
        senderId: sender.id,
        receiverId: receiver.id,
        senderSigned,
        receiverSigned,
        senderSignature: senderSigned ? "signed_sender.png" : null,
        receiverSignature: receiverSigned ? "signed_receiver.png" : null,
        senderSignedAt: senderSigned ? new Date() : null,
        receiverSignedAt: receiverSigned ? new Date() : null,
        createdAt: new Date(
          2024 + Math.floor(Math.random() * 2),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28),
        ),
      },
    });
  }

  console.log("Agreements created");

  /* ---------------------------------- */
  /* RATINGS                            */
  /* ---------------------------------- */

  const agreements = await prisma.agreement.findMany();

  for (let i = 0; i < 15; i++) {
    const agreement = agreements[Math.floor(Math.random() * agreements.length)];

    const rater = users.find((u) => u.id !== agreement.senderId);

    if (!rater) continue;

    try {
      await prisma.rating.create({
        data: {
          rating: Math.floor(Math.random() * 5) + 1,
          review: "Great collaboration experience!",
          raterId: rater.id,
          receiverId: agreement.senderId,
          agreementId: agreement.id,
        },
      });
    } catch {}
  }

  console.log("Ratings created");

  console.log("Seeding finished");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
