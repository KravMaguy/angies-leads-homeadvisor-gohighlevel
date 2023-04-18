import fetch from "node-fetch";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express(); // Create an instance of the app object

app.use(express.json()); // Use the express.json() middleware

app.post("/angies-list/webhook", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      leadSource,
      primaryPhone,
      secondaryPhone,
      email,
      address,
      city,
      stateProvince,
      postalCode,
      trade_type,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !leadSource ||
      !primaryPhone ||
      !email ||
      !address ||
      !city ||
      !stateProvince ||
      !postalCode ||
      !trade_type
    ) {
      throw new Error("Incomplete lead data");
    }

    const contact = {
      firstName,
      lastName,
      leadSource,
      primaryPhone,
      secondaryPhone,
      email,
      address,
      city,
      stateProvince,
      postalCode,
      trade_type,
    };

    // Generate authorization token
    const authUrl = "https://services.leadconnectorhq.com/oauth/token";
    const authOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code: process.env.CODE,
        refresh_token: process.env.REFRESH_TOKEN,
      }),
    };

    const authResponse = await fetch(authUrl, authOptions);
    const authData = await authResponse.json();
    const authToken = authData.access_token;

    // Create contact in GHL system
    const createContactUrl = "https://services.leadconnectorhq.com/contacts/";
    const createContactOptions = {
      method: "POST",
      headers: {
        Authorization: authToken,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(contact),
    };

    const createContactResponse = await fetch(
      createContactUrl,
      createContactOptions
    );
    const createContactData = await createContactResponse.json();
    // e.g. send notifications, trigger workflows, or perform other integrations
    console.log("Contact created successfully:", createContactData);
    res.json({ status: "success", message: "Contact created successfully" });
  } catch (err) {
    console.error(err);
    // Send error res back to Angie's List
    res
      .status(500)
      .json({ status: "error", message: "Failed to create contact" });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
