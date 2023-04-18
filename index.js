const fetch = require("node-fetch");
const express = require("express");

const app = express();

app.use(express.json());

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
        client_id: "",
        client_secret: "",
        grant_type: "authorization_code",
        code: "",
        refresh_token: "",
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
