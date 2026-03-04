export const identifyService = async (
  email: string | null,
  phoneNumber: string | null
) => {
  return {
    contact: {
      primaryContactId: 0,
      emails: [],
      phoneNumbers: [],
      secondaryContactIds: [],
    },
  };
};