import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/db";
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.post("/api/identity", async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;
    console.log(email, phoneNumber);

    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          {
            email,
          },
          {
            phoneNumber,
          },
        ],
      },
    });
    console.log(contacts);

    // No contact Exists
    if (contacts.length === 0) {
      const contact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });

      res.status(200).json({
        contact: {
          primaryContactId: contact.id,
          emails: [contact.email],
          phoneNumbers: [contact.phoneNumber],
          secondaryContactIds: [],
        },
      });

      return;
    }

    // Last case where we have to Transition from Primary to Secondary
    const contactWithEmail = contacts.find(
      (contact) =>
        contact.email === email && contact.linkPrecedence === "primary"
    );
    const contactWithPhoneNumber = contacts.find(
      (contact) =>
        contact.phoneNumber === phoneNumber &&
        contact.linkPrecedence === "primary"
    );

    if (contactWithEmail && contactWithPhoneNumber) {
      await prisma.contact.update({
        where: {
          id: contactWithPhoneNumber.id,
        },
        data: {
          linkPrecedence: "secondary",
          linkedContactId: contactWithEmail.id,
        },
      });

      res.status(200).json({
        contacts: {
          primaryContactId: contactWithEmail.id,
          emails: [contactWithEmail.email, contactWithPhoneNumber.email],
          phoneNumbers: [
            contactWithEmail.phoneNumber,
            contactWithPhoneNumber.phoneNumber,
          ],
          secondaryContactIds: [contactWithPhoneNumber.id],
        },
      });

      return;
    }

    // If Phone number is same but the email is different and the contact is secondary and there is only one contact available in database

    if (contacts.length === 1 && contacts[0].linkPrecedence === "secondary") {
      if (
        phoneNumber === contacts[0].phoneNumber &&
        email !== contacts[0].email
      ) {
        const newContact = await prisma.contact.create({
          data: {
            email,
            phoneNumber,
            linkPrecedence: "primary",
          },
        });

        res.status(200).json({
          contacts: {
            primaryContactId: newContact.id,
            emails: [contacts[0].email, newContact.email],
            phoneNumbers: [phoneNumber],
            secondaryContactIds: [contacts[0].id],
          },
        });

        return;
      } else if (
        phoneNumber !== contacts[0].phoneNumber &&
        email === contacts[0].email
      ) {
        const newContact = await prisma.contact.create({
          data: {
            email,
            phoneNumber,
            linkPrecedence: "primary",
          },
        });

        res.status(200).json({
          contacts: {
            primaryContactId: newContact.id,
            emails: [email],
            phoneNumbers: [contacts[0].phoneNumber, newContact.phoneNumber],
            secondaryContactIds: [contacts[0].id],
          },
        });

        return;
      }
    }

    // if primary contact of the user already exists create secondary contact
    // if contacts are available that means I have to create a secondary contacts
    // Case 1 - If both email and phoneNumber already exists
    // TODO: Check the case if user can create account using phoneNumber only and email only.
    // TODO: Reduce DB calls
    let isEmailExist = false;
    let isPhoneNumberExists = false;
    let primaryContactId;
    const emails = new Set(); // created set to store only unique values
    const phoneNumbers = new Set();
    let secondaryContactIds: number[] = [];

    contacts.forEach((contact) => {
      if (contact.email === email) {
        isEmailExist = true;
      }

      if (contact.phoneNumber === phoneNumber) {
        isPhoneNumberExists = true;
      }

      if (contact.linkPrecedence === "primary") {
        primaryContactId = contact.id;
      }

      if (contact.email) {
        emails.add(contact.email);
      }

      if (contact.phoneNumber) {
        phoneNumbers.add(contact.phoneNumber);
      }

      if (contact.linkPrecedence === "secondary") {
        secondaryContactIds.push(contact.id);
      }
    });

    console.log(
      "details:",
      isEmailExist,
      isPhoneNumberExists,
      primaryContactId
    );

    if (isEmailExist && isPhoneNumberExists) {
      res.status(200).json({
        contacts: {
          primaryContactId,
          emails: [...emails],
          phoneNumbers: [...phoneNumbers],
          secondaryContactIds,
        },
      });
      return;
    }

    // Case 2: Email not exists
    // Added these extra conditions in If because if user doesn't send either of email or password in the payload then you should not create add a row in database.
    if (!isEmailExist && isPhoneNumberExists) {
      // This check is for, if user doesn't send email in payload.
      if (email !== undefined) {
        emails.add(email);
      }

      let contact;
      if (email !== undefined) {
        contact = await prisma.contact.create({
          data: {
            email,
            phoneNumber,
            linkedContactId: primaryContactId,
            linkPrecedence: "secondary",
          },
        });
        secondaryContactIds.push(contact.id);
      }
      res.status(200).json({
        contacts: {
          primaryContactId,
          emails: [...emails],
          phoneNumbers: [...phoneNumbers],
          secondaryContactIds,
        },
      });
      return;
    }

    // Added these extra conditions in If because if user doesn't send either of email or password in the payload then you should not create add a row in database.
    if (isEmailExist && !isPhoneNumberExists) {
      if (phoneNumber !== undefined) {
        phoneNumbers.add(phoneNumber);
      }

      let contact;
      if (phoneNumber !== undefined) {
        contact = await prisma.contact.create({
          data: {
            email,
            phoneNumber,
            linkedContactId: primaryContactId,
            linkPrecedence: "secondary",
          },
        });
        secondaryContactIds.push(contact.id);
      }

      res.status(200).json({
        contacts: {
          primaryContactId,
          emails: [emails.forEach((email) => emails)],
          phoneNumbers,
          secondaryContactIds,
        },
      });
      return;
    }

    res.send("hello");
    return;
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => console.log(`Server started on PORT:${PORT}`));
