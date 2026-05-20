const uri = process.env.MONGODB_URI;
console.log("URI Format:", uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"));
