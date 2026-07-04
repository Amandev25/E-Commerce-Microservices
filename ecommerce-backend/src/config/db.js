import mongoose from 'mongoose';
import dns from 'node:dns';
import config from './env.js';

// Some networks (public Wi-Fi, certain ISPs, VPNs) run a DNS resolver that refuses
// the SRV lookups a `mongodb+srv://` URI requires. That surfaces as:
//   "querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net"
// even though the cluster is perfectly reachable. Prepending public resolvers makes
// Node try Google/Cloudflare first, then fall back to the system's own DNS servers.
const publicDns = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
dns.setServers([...new Set([...publicDns, ...dns.getServers()])]);

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // stop the app if the database won't connect
  }
};

export default connectDB;