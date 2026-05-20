const dns = require('dns');

console.time("SRV Timeout");
dns.resolveSrv('_mongodb._tcp.cardnet.rpjfhdm.mongodb.net', (err, addresses) => {
  console.timeEnd("SRV Timeout");
  if (err) console.error("SRV Error:", err.message);
  else console.log("SRV Addresses:", addresses);
});

console.time("TXT Timeout");
dns.resolveTxt('cardnet.rpjfhdm.mongodb.net', (err, addresses) => {
  console.timeEnd("TXT Timeout");
  if (err) console.error("TXT Error:", err.message);
  else console.log("TXT Addresses:", addresses);
});
