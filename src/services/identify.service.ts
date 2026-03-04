import prisma from "../utils/prisma";

export const identifyService = async (
  email: string | null,
  phoneNumber: string | null
) => {

  // Step 1: Find existing contacts with matching email or phone
  const existingContacts = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean) as any,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Step 2: If no contacts exist → create primary
  if (existingContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary",
      },
    });

    return {
      contact: {
        primaryContactId: newContact.id,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: [],
      },
    };
  }

  // Step 3: Find primary contact
  const primaryContacts = existingContacts.filter(
  (c) => c.linkPrecedence === "primary"
);

// Sort by createdAt to find oldest
primaryContacts.sort(
  (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
);

let primaryContact = primaryContacts[0] || existingContacts[0];


// Step 4: Convert other primaries into secondary
for (const contact of primaryContacts) {
  if (contact.id !== primaryContact.id) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        linkPrecedence: "secondary",
        linkedId: primaryContact.id
      }
    });
  }
}

  // Step 4: Fetch all linked contacts
  const linkedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryContact.id },
        { linkedId: primaryContact.id },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Step 5: Check if incoming info already exists
  const emailExists = linkedContacts.some((c) => c.email === email);
  const phoneExists = linkedContacts.some(
    (c) => c.phoneNumber === phoneNumber
  );

  // Step 6: Create secondary contact if new info appears
  if ((email && !emailExists) || (phoneNumber && !phoneExists)) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: "secondary",
      },
    });
  }

  // Step 7: Fetch updated contacts
  const updatedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryContact.id },
        { linkedId: primaryContact.id },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const emails: string[] = [];
  const phoneNumbers: string[] = [];
  const secondaryContactIds: number[] = [];

  updatedContacts.forEach((contact) => {
    if (contact.email && !emails.includes(contact.email)) {
      emails.push(contact.email);
    }

    if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
      phoneNumbers.push(contact.phoneNumber);
    }

    if (contact.linkPrecedence === "secondary") {
      secondaryContactIds.push(contact.id);
    }
  });

  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
};