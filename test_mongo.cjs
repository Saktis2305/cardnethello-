const { MongoClient } = require('mongodb');

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("Connecting...");
    setTimeout(() => {
      console.log("Forced abort after 6s. Hang detected. Are we connected?", typeof client);
      process.exit(1);
    }, 6000);
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log("Instance created... waiting for connect()");
    await client.connect();
    console.log("Connected directly!");
    const contacts = await client.db("cardnet").collection("contacts").find({}).toArray();
    console.log("Found contacts directly:", contacts.length);
  } catch (err) {
    console.log("Error caught directly:", err.message);
  }
}
run();
