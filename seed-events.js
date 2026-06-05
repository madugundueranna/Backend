// Backend/seed-events.js
// Run: node seed-events.js   (or: npm run seed:events)
// Prerequisites: run seed:cities and seed:categories first.
// Idempotency: if 50+ Cloudinary-backed events already exist, exits unchanged.
// Re-run safety: if < 50 such events exist (partial run), removes them and re-seeds.

require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const Event = require("./Models/Events/EventModel");
const Role = require("./Models/Authentication/RoleModel");
const City = require("./Models/Cities/CityModel");
const Category = require("./Models/EventCategories/EventCategoryModel");
const Counter = require("./Models/Counters/CounterModel");
require("./Config/DBConnect");

// ─── Cloudinary config (credentials from .env) ───────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Sample organisers to create if none exist in the database ───────────────
const ORGANIZER_SEEDS = [
  { name: "Priya Sharma",  email: "priya.events@qreventix-seed.com",  companyName: "Priya Events Co.",            mobileNumber: "9876501001" },
  { name: "Rahul Menon",   email: "rahul.sounds@qreventix-seed.com",  companyName: "Sounds of India Productions", mobileNumber: "9876501002" },
  { name: "Anjali Singh",  email: "anjali.fit@qreventix-seed.com",    companyName: "FitLife India Pvt Ltd",       mobileNumber: "9876501003" },
  { name: "Vikram Reddy",  email: "vikram.city@qreventix-seed.com",   companyName: "City Moments Experiences",    mobileNumber: "9876501004" },
  { name: "Meera Nair",    email: "meera.spark@qreventix-seed.com",   companyName: "Spark Creative Agency",       mobileNumber: "9876501005" },
];

// ─── Raw event definitions ────────────────────────────────────────────────────
// orgIndex → index into organizers array (modulo total organizer count at runtime)
const RAW_EVENTS = [
  // ── Mumbai (5 events) ────────────────────────────────────────────────────
  {
    city: "Mumbai", category: "Music",
    title: "Sunburn Arena Mumbai 2026",
    tag: "Trending",
    venue: "NESCO Exhibition Centre", address: "Goregaon East, Mumbai", pincode: "400063",
    date: "2026-08-15", time: "06:00 PM", endTime: "11:00 PM",
    price: 2999, capacity: 3000, registered: 2400, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    description: "India's biggest electronic music festival returns to Mumbai with world-class DJs and immersive light shows.",
    tiers: [{ label: "General", price: 2999 }, { label: "VIP", price: 6999 }],
    amenities: ["VIP Lounge", "Food Courts", "Live Streaming", "Merchandise", "Parking"],
    bestTime: "12:00 PM - 06:00 PM", orgIndex: 1,
  },
  {
    city: "Mumbai", category: "Technology",
    title: "Mumbai Tech Summit 2026",
    tag: "Early Bird",
    venue: "Bombay Exhibition Centre", address: "Goregaon, Mumbai", pincode: "400063",
    date: "2026-09-10", time: "09:00 AM", endTime: "06:00 PM",
    price: 1499, capacity: 800, registered: 310, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    description: "A two-day technology summit featuring keynotes from leading CTOs, startup showcases, and hands-on product demos.",
    tiers: [{ label: "Delegate", price: 1499 }, { label: "Corporate (5 Pax)", price: 5999 }],
    amenities: ["Free Wi-Fi", "Lunch Included", "Networking", "Certificate", "Kit Bag"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },
  {
    city: "Mumbai", category: "Comedy",
    title: "LOL Comedy Night Bandra",
    tag: "Hot Pick",
    venue: "The Comedy Club", address: "Linking Road, Bandra West, Mumbai", pincode: "400050",
    date: "2026-07-12", time: "08:00 PM", endTime: "10:30 PM",
    price: 799, capacity: 250, registered: 190, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800&q=80",
    description: "An electrifying standup comedy night featuring India's top three comedians with surprise guest appearances.",
    tiers: [{ label: "General", price: 799 }, { label: "VIP Front Row", price: 1599 }],
    amenities: ["2 Drinks Included", "VIP Seating", "Meet & Greet"],
    bestTime: "03:00 PM - 08:00 PM", orgIndex: 3,
  },
  {
    city: "Mumbai", category: "Fashion",
    title: "Lakme Fashion Week Grand Finale",
    tag: "Trending",
    venue: "Jio World Convention Centre", address: "BKC, Mumbai", pincode: "400051",
    date: "2026-10-03", time: "05:00 PM", endTime: "09:00 PM",
    price: 3499, capacity: 1200, registered: 980, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    description: "The grandest runway show of the year with India's top designers presenting their autumn-winter 2026 collections.",
    tiers: [{ label: "Standard", price: 3499 }, { label: "Front Row VIP", price: 8999 }],
    amenities: ["Complimentary Champagne", "Goodie Bag", "After Party Access"],
    bestTime: "01:00 PM - 06:00 PM", orgIndex: 4,
  },
  {
    city: "Mumbai", category: "Conference",
    title: "India Digital Media Conference 2026",
    tag: "New",
    venue: "ITC Grand Central", address: "Parel, Mumbai", pincode: "400012",
    date: "2026-11-20", time: "09:30 AM", endTime: "05:30 PM",
    price: 1199, capacity: 400, registered: 220, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    description: "Annual gathering of media professionals, publishers, and creators exploring the future of digital content.",
    tiers: [{ label: "Professional", price: 1199 }],
    amenities: ["Lunch", "Coffee Breaks", "Networking Session", "Recording Access"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },

  // ── Delhi (3 events) ─────────────────────────────────────────────────────
  {
    city: "Delhi", category: "Business",
    title: "India Business Expo 2026",
    tag: "Trending",
    venue: "Pragati Maidan", address: "Bhairon Road, New Delhi", pincode: "110001",
    date: "2026-09-25", time: "10:00 AM", endTime: "06:00 PM",
    price: 999, capacity: 2000, registered: 750, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    description: "India's premier B2B exposition bringing together entrepreneurs, investors, and industry leaders across all sectors.",
    tiers: [{ label: "Visitor Pass", price: 999 }, { label: "Exhibitor Booth", price: 24999 }],
    amenities: ["Free Wi-Fi", "Business Lounge", "Investor Pitching Zone"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },
  {
    city: "Delhi", category: "Networking",
    title: "Delhi Startup Ecosystem Mixer",
    tag: "Free Entry",
    venue: "91springboard Nehru Place", address: "Nehru Place, New Delhi", pincode: "110019",
    date: "2026-07-18", time: "06:00 PM", endTime: "09:00 PM",
    price: 0, capacity: 200, registered: 145, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    description: "A relaxed evening mixer for Delhi's startup community — founders, investors, and tech enthusiasts welcome.",
    tiers: [{ label: "Free Entry", price: 0 }],
    amenities: ["Snacks & Drinks", "Speed Networking", "Pitch Slam"],
    bestTime: "02:00 PM - 06:00 PM", orgIndex: 0,
  },
  {
    city: "Delhi", category: "Gaming",
    title: "DXD Esports Championship Delhi",
    tag: "Trending",
    venue: "NSIC Exhibition Complex", address: "Okhla Industrial Estate, New Delhi", pincode: "110020",
    date: "2026-08-22", time: "11:00 AM", endTime: "08:00 PM",
    price: 499, capacity: 1500, registered: 820, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    description: "North India's biggest esports championship featuring BGMI, Valorant, and FIFA tournaments with a ₹10 lakh prize pool.",
    tiers: [{ label: "Spectator Pass", price: 499 }, { label: "Team Registration", price: 2000 }],
    amenities: ["Gaming Zones", "Food Court", "Prize Distribution", "Live Commentary"],
    bestTime: "10:00 AM - 06:00 PM", orgIndex: 4,
  },

  // ── Bengaluru (4 events) ─────────────────────────────────────────────────
  {
    city: "Bengaluru", category: "Technology",
    title: "Bangalore AI Hackathon 2026",
    tag: "Early Bird",
    venue: "KTPO Convention Centre", address: "Whitefield, Bengaluru", pincode: "560066",
    date: "2026-07-26", time: "08:00 AM", endTime: "08:00 PM",
    price: 599, capacity: 600, registered: 445, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    description: "A 12-hour AI hackathon for engineers and data scientists to build real-world AI solutions and win cash prizes.",
    tiers: [{ label: "Solo Hacker", price: 599 }, { label: "Team (4 Pax)", price: 1999 }],
    amenities: ["Free Wi-Fi", "Meals & Snacks", "Mentors", "Cloud Credits", "Certificate"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },
  {
    city: "Bengaluru", category: "Workshop",
    title: "Full-Stack Dev Bootcamp — React & Node",
    tag: "Hot Pick",
    venue: "Koramangala Community Hall", address: "Koramangala 5th Block, Bengaluru", pincode: "560034",
    date: "2026-06-28", time: "09:00 AM", endTime: "05:00 PM",
    price: 1999, capacity: 60, registered: 52, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    description: "An intensive one-day workshop covering the full MERN stack with live project building and code reviews.",
    tiers: [{ label: "Workshop Seat", price: 1999 }],
    amenities: ["Laptop Required", "Materials Provided", "Lunch Included", "Certificate"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },
  {
    city: "Bengaluru", category: "Conference",
    title: "SaaS Leaders Summit Bengaluru",
    tag: "Trending",
    venue: "The Leela Palace", address: "Airport Road, Bengaluru", pincode: "560008",
    date: "2026-09-05", time: "09:00 AM", endTime: "07:00 PM",
    price: 3999, capacity: 350, registered: 200, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    description: "India's premier SaaS conference bringing together product leaders, VCs, and enterprise decision-makers.",
    tiers: [{ label: "Standard", price: 3999 }, { label: "VIP (incl. dinner)", price: 7999 }],
    amenities: ["Networking Dinner", "Workshop Access", "Recordings", "Goodie Bag"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },
  {
    city: "Bengaluru", category: "Seminar",
    title: "Product Management Seminar — Zero to PM",
    tag: "New",
    venue: "WeWork Galaxy", address: "Residency Road, Bengaluru", pincode: "560025",
    date: "2026-12-14", time: "10:00 AM", endTime: "02:00 PM",
    price: 799, capacity: 120, registered: 45, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
    description: "A compact half-day seminar for aspiring product managers covering roadmapping, user research, and prioritisation.",
    tiers: [{ label: "General Seat", price: 799 }],
    amenities: ["Study Materials", "Q&A Session", "Certificate"],
    bestTime: "09:00 AM - 01:00 PM", orgIndex: 0,
  },

  // ── Hyderabad (3 events) ─────────────────────────────────────────────────
  {
    city: "Hyderabad", category: "Technology",
    title: "CyberSec Summit Hyderabad 2026",
    tag: "Early Bird",
    venue: "HICC", address: "Madhapur, Hyderabad", pincode: "500081",
    date: "2026-08-08", time: "09:30 AM", endTime: "05:30 PM",
    price: 1299, capacity: 500, registered: 280, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    description: "A focused conference on cybersecurity threats, defensive strategies, and ethical hacking for IT professionals.",
    tiers: [{ label: "Professional", price: 1299 }, { label: "Student", price: 499 }],
    amenities: ["CTF Competition", "Lunch Included", "Certificate", "Networking"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },
  {
    city: "Hyderabad", category: "Business",
    title: "Deccan Entrepreneurs Forum Q3 2026",
    tag: "New",
    venue: "T-Hub", address: "IIIT Hyderabad Campus, Gachibowli", pincode: "500032",
    date: "2026-07-30", time: "05:30 PM", endTime: "08:30 PM",
    price: 0, capacity: 300, registered: 210, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
    description: "Quarterly gathering of Telangana's business leaders — panel discussions, startup demos, and open networking.",
    tiers: [{ label: "Free Entry", price: 0 }],
    amenities: ["Snacks", "Pitch Zone", "Investor Q&A"],
    bestTime: "02:00 PM - 06:00 PM", orgIndex: 0,
  },
  {
    city: "Hyderabad", category: "Festival",
    title: "Hyderabad Food & Music Carnival",
    tag: "Trending",
    venue: "Peoples Plaza", address: "Necklace Road, Hyderabad", pincode: "500004",
    date: "2026-10-18", time: "04:00 PM", endTime: "10:00 PM",
    price: 299, capacity: 5000, registered: 1800, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    description: "A three-day outdoor carnival celebrating Hyderabad's culinary heritage with live music, food stalls, and cultural shows.",
    tiers: [{ label: "Day Pass", price: 299 }, { label: "3-Day Pass", price: 699 }],
    amenities: ["100+ Food Stalls", "Live Performances", "Kids Zone", "Free Parking"],
    bestTime: "02:00 PM - 09:00 PM", orgIndex: 3,
  },

  // ── Chennai (3 events) ───────────────────────────────────────────────────
  {
    city: "Chennai", category: "Music",
    title: "Margazhi Carnatic Music Nite 2026",
    tag: "New",
    venue: "Music Academy", address: "TTK Road, Alwarpet, Chennai", pincode: "600018",
    date: "2026-12-21", time: "07:00 PM", endTime: "10:00 PM",
    price: 500, capacity: 800, registered: 310, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    description: "An evening of classical Carnatic music featuring celebrated vocalists and instrumentalists during the Margazhi season.",
    tiers: [{ label: "Gallery", price: 500 }, { label: "First Class", price: 1200 }],
    amenities: ["Air Conditioned", "Complimentary Programme Booklet"],
    bestTime: "02:00 PM - 06:00 PM", orgIndex: 1,
  },
  {
    city: "Chennai", category: "Arts & Culture",
    title: "Chennai Heritage Art Walk 2026",
    tag: "Free Entry",
    venue: "Georgetown Heritage Zone", address: "Georgetown, Chennai", pincode: "600001",
    date: "2026-07-06", time: "07:00 AM", endTime: "10:00 AM",
    price: 0, capacity: 150, registered: 95, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    description: "A guided heritage walk through Chennai's historic Georgetown quarter featuring street murals, colonial architecture, and local art.",
    tiers: [{ label: "Free Spot", price: 0 }],
    amenities: ["Expert Guide", "Refreshments", "Photo Spots"],
    bestTime: "06:00 AM - 09:00 AM", orgIndex: 1,
  },
  {
    city: "Chennai", category: "Family & Kids",
    title: "Little Explorers Kids Carnival",
    tag: "Hot Pick",
    venue: "VGP Universal Kingdom", address: "ECR, Chennai", pincode: "600041",
    date: "2026-08-10", time: "10:00 AM", endTime: "06:00 PM",
    price: 349, capacity: 1000, registered: 520, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80",
    description: "A fun-filled day for families with science experiments, craft workshops, puppet shows, and adventure zones for kids.",
    tiers: [{ label: "Child (under 12)", price: 349 }, { label: "Adult", price: 199 }],
    amenities: ["Science Zone", "Art Corner", "Food Stalls", "First Aid"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 3,
  },

  // ── Kolkata (3 events) ───────────────────────────────────────────────────
  {
    city: "Kolkata", category: "Theatre",
    title: "Tagore Tribute Drama Festival",
    tag: "New",
    venue: "Rabindra Sadan", address: "Cathedral Road, Kolkata", pincode: "700071",
    date: "2026-08-07", time: "06:30 PM", endTime: "09:30 PM",
    price: 350, capacity: 600, registered: 400, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    description: "Three evenings of powerful theatrical performances celebrating the life and works of Rabindranath Tagore.",
    tiers: [{ label: "Gallery", price: 350 }, { label: "Orchestra", price: 750 }],
    amenities: ["Air Conditioned", "Programme Book", "Parking Available"],
    bestTime: "02:00 PM - 06:00 PM", orgIndex: 1,
  },
  {
    city: "Kolkata", category: "Film & Media",
    title: "Kolkata Short Film Showcase 2026",
    tag: "New",
    venue: "Nandan Film Centre", address: "AJC Bose Road, Kolkata", pincode: "700017",
    date: "2026-09-19", time: "02:00 PM", endTime: "08:00 PM",
    price: 199, capacity: 400, registered: 180, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    description: "A curated screening of 20 award-winning short films from across India followed by director Q&A sessions.",
    tiers: [{ label: "Film Pass", price: 199 }],
    amenities: ["Director Meet", "Refreshments", "Festival Catalogue"],
    bestTime: "12:00 PM - 05:00 PM", orgIndex: 4,
  },
  {
    city: "Kolkata", category: "Family & Kids",
    title: "Kolkata Science & Wonder Fair 2026",
    tag: "Hot Pick",
    venue: "Birla Industrial & Technological Museum", address: "Gurusaday Road, Kolkata", pincode: "700019",
    date: "2026-10-25", time: "10:00 AM", endTime: "05:00 PM",
    price: 150, capacity: 800, registered: 520, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800&q=80",
    description: "Interactive science fair for children featuring robotics demos, astronomy talks, and STEM hands-on stations.",
    tiers: [{ label: "Child", price: 150 }, { label: "Adult", price: 100 }],
    amenities: ["Interactive Exhibits", "Souvenir", "Guided Tour"],
    bestTime: "09:00 AM - 04:00 PM", orgIndex: 3,
  },

  // ── Pune (3 events) ──────────────────────────────────────────────────────
  {
    city: "Pune", category: "Sports",
    title: "Pune Half Marathon 2026",
    tag: "Free Entry",
    venue: "Shivajinagar Race Start Point", address: "FC Road, Shivajinagar, Pune", pincode: "411004",
    date: "2026-07-19", time: "05:30 AM", endTime: "10:00 AM",
    price: 0, capacity: 1500, registered: 980, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
    description: "A scenic 21km run through Pune's heritage streets open to all fitness levels. Register and race for free.",
    tiers: [{ label: "Free Entry", price: 0 }],
    amenities: ["Finisher Medal", "Timing Chip", "Water Stations", "First Aid", "Certificate"],
    bestTime: "04:00 AM - 07:00 AM", orgIndex: 2,
  },
  {
    city: "Pune", category: "Health & Wellness",
    title: "Ashtanga Yoga Retreat — Weekend Immersion",
    tag: "Hot Pick",
    venue: "Osho International Meditation Resort", address: "Koregaon Park, Pune", pincode: "411001",
    date: "2026-06-21", time: "06:00 AM", endTime: "05:00 PM",
    price: 2499, capacity: 80, registered: 60, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
    description: "A transformative two-day yoga and mindfulness retreat with internationally certified instructors.",
    tiers: [{ label: "Resident (incl. stay)", price: 4999 }, { label: "Day Participant", price: 2499 }],
    amenities: ["Sattvic Meals", "Meditation Sessions", "Yoga Mat Provided", "Certificate"],
    bestTime: "08:00 AM - 05:00 PM", orgIndex: 2,
  },
  {
    city: "Pune", category: "Education",
    title: "STEM Education Innovation Summit 2026",
    tag: "New",
    venue: "Symbiosis International University", address: "Viman Nagar, Pune", pincode: "411014",
    date: "2026-11-08", time: "09:00 AM", endTime: "04:00 PM",
    price: 499, capacity: 300, registered: 120, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    description: "Educators, policymakers, and edtech founders come together to reimagine STEM learning for India's schools.",
    tiers: [{ label: "Educator Pass", price: 499 }],
    amenities: ["Workshop Sessions", "Study Materials", "Certificate of Participation"],
    bestTime: "09:00 AM - 04:00 PM", orgIndex: 0,
  },

  // ── Ahmedabad (2 events) ─────────────────────────────────────────────────
  {
    city: "Ahmedabad", category: "Festival",
    title: "Navratri Night — Ahmedabad Garba Festival",
    tag: "Trending",
    venue: "GMDC Grounds", address: "Bodakdev, Ahmedabad", pincode: "380054",
    date: "2026-10-10", time: "08:00 PM", endTime: "02:00 AM",
    price: 599, capacity: 10000, registered: 7500, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    description: "Experience Navratri like never before — nine nights of traditional Garba, folk dances, and Gujarati cultural performances.",
    tiers: [{ label: "Night Pass", price: 599 }, { label: "9-Night Pass", price: 3999 }],
    amenities: ["Traditional Attire Rental", "Food Stalls", "Cultural Stage", "Parking"],
    bestTime: "06:00 PM - 11:00 PM", orgIndex: 3,
  },
  {
    city: "Ahmedabad", category: "Food & Drink",
    title: "Ahmedabad Street Food Festival",
    tag: "Hot Pick",
    venue: "Riverfront Park, Sabarmati", address: "Sabarmati Riverfront, Ahmedabad", pincode: "380004",
    date: "2026-06-14", time: "05:00 PM", endTime: "10:00 PM",
    price: 99, capacity: 3000, registered: 2100, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
    description: "Ahmedabad's tastiest street food under one roof — dhokla, fafda, jalebi, khandvi, and 80+ other Gujarati delights.",
    tiers: [{ label: "Entry Pass", price: 99 }],
    amenities: ["100+ Stalls", "Live Music", "Cooking Demos", "Family Zone"],
    bestTime: "03:00 PM - 09:00 PM", orgIndex: 3,
  },

  // ── Jaipur (2 events) ────────────────────────────────────────────────────
  {
    city: "Jaipur", category: "Festival",
    title: "Jaipur Literature & Culture Fest 2026",
    tag: "Trending",
    venue: "Diggi Palace", address: "Sansar Chandra Road, Jaipur", pincode: "302004",
    date: "2026-11-28", time: "09:00 AM", endTime: "07:00 PM",
    price: 0, capacity: 5000, registered: 3200, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
    description: "The world's largest free literary festival returns with 200+ speakers, authors, and artists across five stages.",
    tiers: [{ label: "Free Entry", price: 0 }],
    amenities: ["Author Signings", "Book Stalls", "Heritage Tours", "Cultural Performances"],
    bestTime: "09:00 AM - 06:00 PM", orgIndex: 1,
  },
  {
    city: "Jaipur", category: "Arts & Culture",
    title: "Pink City Contemporary Art Exhibition",
    tag: "New",
    venue: "Jawahar Kala Kendra", address: "Jawahar Lal Nehru Marg, Jaipur", pincode: "302004",
    date: "2026-10-05", time: "10:00 AM", endTime: "07:00 PM",
    price: 200, capacity: 500, registered: 180, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    description: "A week-long exhibition showcasing Rajasthan's contemporary art scene alongside works from national artists.",
    tiers: [{ label: "General Pass", price: 200 }],
    amenities: ["Guided Tour", "Artist Interaction", "Café On-site"],
    bestTime: "10:00 AM - 05:00 PM", orgIndex: 1,
  },

  // ── Lucknow (2 events) ───────────────────────────────────────────────────
  {
    city: "Lucknow", category: "Music",
    title: "Lucknow Jazz & Blues Night",
    tag: "New",
    venue: "Gomti Nagar Cultural Complex", address: "Gomti Nagar, Lucknow", pincode: "226010",
    date: "2026-08-29", time: "07:00 PM", endTime: "11:00 PM",
    price: 699, capacity: 400, registered: 230, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    description: "An enchanting evening of jazz and blues music featuring local and visiting artists in a beautifully lit open-air setting.",
    tiers: [{ label: "Regular", price: 699 }, { label: "Table for 4", price: 2399 }],
    amenities: ["Bar Available", "Snacks", "Live Band"],
    bestTime: "03:00 PM - 07:00 PM", orgIndex: 1,
  },
  {
    city: "Lucknow", category: "Food & Drink",
    title: "Awadhi Culinary Heritage Experience",
    tag: "Hot Pick",
    venue: "Hazratganj Cultural Courtyard", address: "Hazratganj, Lucknow", pincode: "226001",
    date: "2026-07-04", time: "12:00 PM", endTime: "04:00 PM",
    price: 999, capacity: 200, registered: 155, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    description: "A curated tasting journey through Awadhi cuisine — biryani, korma, galouti kebab — with master-chef guided insights.",
    tiers: [{ label: "Tasting Pass", price: 999 }],
    amenities: ["Chef Talk", "Cooking Demo", "Recipe Booklet"],
    bestTime: "11:00 AM - 03:00 PM", orgIndex: 3,
  },

  // ── Visakhapatnam (2 events) ─────────────────────────────────────────────
  {
    city: "Visakhapatnam", category: "Sports",
    title: "Vizag Beach Volleyball Championship",
    tag: "Free Entry",
    venue: "RK Beach Volleyball Courts", address: "RK Beach Road, Visakhapatnam", pincode: "530002",
    date: "2026-06-27", time: "07:00 AM", endTime: "05:00 PM",
    price: 0, capacity: 500, registered: 340, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    description: "Annual beach volleyball championship on Vizag's famous RK Beach with open and pro categories. Spectators welcome free.",
    tiers: [{ label: "Team Registration", price: 1500 }, { label: "Spectator", price: 0 }],
    amenities: ["Waterfront Venue", "Changing Rooms", "Refreshments", "Prize Ceremony"],
    bestTime: "06:00 AM - 04:00 PM", orgIndex: 2,
  },
  {
    city: "Visakhapatnam", category: "Health & Wellness",
    title: "Sunrise Yoga & Wellness at Kailasagiri",
    tag: "New",
    venue: "Kailasagiri Park Amphitheatre", address: "Kailasagiri Hill, Visakhapatnam", pincode: "530023",
    date: "2026-12-07", time: "05:30 AM", endTime: "08:30 AM",
    price: 299, capacity: 200, registered: 80, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    description: "Begin the day with ocean-view sunrise yoga, pranayama, and guided meditation at Visakhapatnam's hilltop park.",
    tiers: [{ label: "Morning Pass", price: 299 }],
    amenities: ["Yoga Mat Provided", "Herbal Tea", "Nature Walk"],
    bestTime: "04:00 AM - 08:00 AM", orgIndex: 2,
  },

  // ── Vijayawada (2 events) ────────────────────────────────────────────────
  {
    city: "Vijayawada", category: "Charity & Fundraising",
    title: "Krishna River Clean-Up Drive & Gala",
    tag: "Free Entry",
    venue: "Prakasam Barrage Grounds", address: "Bandar Road, Vijayawada", pincode: "520002",
    date: "2026-06-21", time: "07:00 AM", endTime: "02:00 PM",
    price: 0, capacity: 1000, registered: 620, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    description: "Community river clean-up drive followed by an awareness gala featuring local performers and environmental speakers.",
    tiers: [{ label: "Volunteer Registration", price: 0 }],
    amenities: ["Cleaning Kits", "Breakfast", "Volunteer T-Shirt", "Certificate"],
    bestTime: "06:00 AM - 12:00 PM", orgIndex: 3,
  },
  {
    city: "Vijayawada", category: "Music",
    title: "Telugu Folk Music Festival 2026",
    tag: "Trending",
    venue: "Tummalapalli Kalakshetram", address: "Patamata, Vijayawada", pincode: "520007",
    date: "2026-10-14", time: "05:00 PM", endTime: "09:00 PM",
    price: 199, capacity: 1200, registered: 520, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
    description: "Celebrating tradition with a vibrant showcase of Telugu folk music, Oggukatha, and Burrakatha performances.",
    tiers: [{ label: "General", price: 199 }],
    amenities: ["Folk Art Stalls", "Traditional Food", "Open-air Seating"],
    bestTime: "02:00 PM - 07:00 PM", orgIndex: 1,
  },

  // ── Tirupati (2 events) ──────────────────────────────────────────────────
  {
    city: "Tirupati", category: "Charity & Fundraising",
    title: "Tirupati Bala Vikasa Charity Gala 2026",
    tag: "New",
    venue: "Bhagya Nagar Community Hall", address: "RTC Colony, Tirupati", pincode: "517501",
    date: "2026-08-16", time: "06:00 PM", endTime: "09:30 PM",
    price: 499, capacity: 300, registered: 190, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
    description: "Annual charity gala raising funds for underprivileged children's education through cultural performances and a dinner auction.",
    tiers: [{ label: "Gala Ticket", price: 499 }, { label: "Patron Table (10)", price: 9999 }],
    amenities: ["Dinner Included", "Cultural Performances", "Auction", "Tax Receipt"],
    bestTime: "02:00 PM - 06:00 PM", orgIndex: 3,
  },
  {
    city: "Tirupati", category: "Education",
    title: "Digital Literacy Awareness Workshop 2026",
    tag: "Free Entry",
    venue: "SVIMS Conference Hall", address: "Alipiri Road, Tirupati", pincode: "517507",
    date: "2026-09-28", time: "10:00 AM", endTime: "01:00 PM",
    price: 0, capacity: 200, registered: 120, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    description: "A free workshop teaching digital safety, online banking, and basic computing skills to first-time internet users.",
    tiers: [{ label: "Free Registration", price: 0 }],
    amenities: ["Free Handouts", "Certificate", "Refreshments"],
    bestTime: "09:00 AM - 01:00 PM", orgIndex: 0,
  },

  // ── Kurnool (2 events) ───────────────────────────────────────────────────
  {
    city: "Kurnool", category: "Sports",
    title: "AP State Kabaddi Championship 2026",
    tag: "Free Entry",
    venue: "SPMVV Indoor Stadium", address: "Banganapalle Road, Kurnool", pincode: "518002",
    date: "2026-09-12", time: "09:00 AM", endTime: "07:00 PM",
    price: 0, capacity: 2000, registered: 1500, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80",
    description: "Andhra Pradesh's biggest state-level Kabaddi championship with teams from all 13 districts competing for the title.",
    tiers: [{ label: "Free Entry", price: 0 }],
    amenities: ["Free Entry", "Live Commentary", "Refreshments", "Prize Ceremony"],
    bestTime: "08:00 AM - 06:00 PM", orgIndex: 2,
  },
  {
    city: "Kurnool", category: "Gaming",
    title: "Kurnool Gaming Expo & Esports League",
    tag: "Hot Pick",
    venue: "Kurnool District Library Auditorium", address: "Station Road, Kurnool", pincode: "518001",
    date: "2026-07-05", time: "10:00 AM", endTime: "07:00 PM",
    price: 149, capacity: 500, registered: 310, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    description: "One-day gaming expo featuring mobile and PC gaming tournaments, cosplay contest, and gaming product showcases.",
    tiers: [{ label: "Entry Pass", price: 149 }, { label: "Tournament Slot", price: 499 }],
    amenities: ["Gaming Zones", "Cosplay Contest", "Food Stalls", "Prizes"],
    bestTime: "09:00 AM - 06:00 PM", orgIndex: 4,
  },

  // ── Indore (2 events) ────────────────────────────────────────────────────
  {
    city: "Indore", category: "Business",
    title: "Indore Commerce & Trade Summit 2026",
    tag: "Early Bird",
    venue: "Brilliant Convention Centre", address: "AB Road, Indore", pincode: "452001",
    date: "2026-09-18", time: "09:30 AM", endTime: "05:00 PM",
    price: 899, capacity: 600, registered: 340, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    description: "Central India's leading commerce summit focused on MSME growth, export opportunities, and fintech innovation.",
    tiers: [{ label: "Delegate", price: 899 }, { label: "Exhibitor", price: 12999 }],
    amenities: ["Lunch", "Exhibition Halls", "B2B Matchmaking", "Certificate"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },
  {
    city: "Indore", category: "Workshop",
    title: "Digital Marketing Mastery Workshop",
    tag: "Hot Pick",
    venue: "Prestige Institute of Management", address: "1 Scheme 54, Indore", pincode: "452010",
    date: "2026-11-15", time: "09:00 AM", endTime: "05:00 PM",
    price: 1299, capacity: 100, registered: 40, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    description: "Hands-on full-day workshop covering SEO, Google Ads, Meta marketing, and analytics with live campaign building.",
    tiers: [{ label: "Workshop Seat", price: 1299 }],
    amenities: ["Lunch", "Study Materials", "3-Month Mentorship", "Certificate"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },

  // ── Bhopal (2 events) ────────────────────────────────────────────────────
  {
    city: "Bhopal", category: "Seminar",
    title: "Environmental Science & Climate Seminar 2026",
    tag: "Free Entry",
    venue: "Barkatullah University", address: "Hoshangabad Road, Bhopal", pincode: "462026",
    date: "2026-06-05", time: "10:00 AM", endTime: "04:00 PM",
    price: 0, capacity: 350, registered: 280, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    description: "A seminar series on climate change, biodiversity loss, and green urban planning for students and researchers.",
    tiers: [{ label: "Free Registration", price: 0 }],
    amenities: ["Academic Papers", "Certificate", "Panel Discussion"],
    bestTime: "09:00 AM - 03:00 PM", orgIndex: 0,
  },
  {
    city: "Bhopal", category: "Theatre",
    title: "Bhopal Classical Dance & Drama Festival 2026",
    tag: "New",
    venue: "Bharat Bhavan", address: "Shamla Hills, Bhopal", pincode: "462013",
    date: "2026-12-12", time: "06:00 PM", endTime: "09:30 PM",
    price: 300, capacity: 700, registered: 210, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    description: "A prestigious three-night festival celebrating Indian classical dance forms — Bharatanatyam, Kathak, and Odissi.",
    tiers: [{ label: "General", price: 300 }, { label: "Balcony", price: 700 }],
    amenities: ["Air Conditioned", "Programme Brochure", "Parking"],
    bestTime: "02:00 PM - 06:00 PM", orgIndex: 1,
  },

  // ── Nagpur (2 events) ────────────────────────────────────────────────────
  {
    city: "Nagpur", category: "Sports",
    title: "Nagpur Marathon 10K — Orange City Run",
    tag: "Free Entry",
    venue: "Futala Lake Starting Point", address: "Wardha Road, Nagpur", pincode: "440015",
    date: "2026-07-25", time: "06:00 AM", endTime: "10:00 AM",
    price: 0, capacity: 2000, registered: 1400, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    description: "Nagpur's annual 10K community run around picturesque Futala Lake — flat route, beginner-friendly, and free for all.",
    tiers: [{ label: "Free Entry", price: 0 }],
    amenities: ["Finisher Medal", "T-Shirt (Registered)", "Hydration Stations", "Timing"],
    bestTime: "05:00 AM - 08:00 AM", orgIndex: 2,
  },
  {
    city: "Nagpur", category: "Comedy",
    title: "Nagpur Standup Showcase Vol. 5",
    tag: "Hot Pick",
    venue: "Centre Point Hotel Auditorium", address: "Wardha Road, Nagpur", pincode: "440015",
    date: "2026-10-11", time: "08:00 PM", endTime: "10:30 PM",
    price: 599, capacity: 300, registered: 180, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800&q=80",
    description: "Four standups, two hours of non-stop laughter. Nagpur's most popular comedy night is back with an all-new set.",
    tiers: [{ label: "General", price: 599 }, { label: "VIP", price: 999 }],
    amenities: ["2 Complimentary Drinks", "VIP Seating", "Selfie Booth"],
    bestTime: "03:00 PM - 08:00 PM", orgIndex: 3,
  },

  // ── Coimbatore (2 events) ────────────────────────────────────────────────
  {
    city: "Coimbatore", category: "Technology",
    title: "Coimbatore Tech Innovators Meet 2026",
    tag: "New",
    venue: "PSG College of Technology Auditorium", address: "Peelamedu, Coimbatore", pincode: "641004",
    date: "2026-08-01", time: "09:00 AM", endTime: "05:00 PM",
    price: 399, capacity: 400, registered: 210, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    description: "A full-day tech meet for engineers and innovators featuring product demos, startup pitches, and industry panels.",
    tiers: [{ label: "Student", price: 199 }, { label: "Professional", price: 399 }],
    amenities: ["Free Wi-Fi", "Lunch", "Certificate", "Pitch Competition"],
    bestTime: "09:00 AM - 05:00 PM", orgIndex: 0,
  },
  {
    city: "Coimbatore", category: "Health & Wellness",
    title: "Corporate Wellness Day — Fit & Focused 2026",
    tag: "New",
    venue: "Codissia Trade Fair Complex", address: "Avinashi Road, Coimbatore", pincode: "641014",
    date: "2026-09-06", time: "08:00 AM", endTime: "05:00 PM",
    price: 1499, capacity: 250, registered: 110, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    description: "A corporate wellness day with ergonomics sessions, mindfulness workshops, and team fitness challenges for enterprises.",
    tiers: [{ label: "Individual Pass", price: 1499 }, { label: "Corporate (10 Pax)", price: 11999 }],
    amenities: ["Yoga Session", "Nutritionist Consult", "Healthy Lunch", "Wellness Kit"],
    bestTime: "08:00 AM - 05:00 PM", orgIndex: 2,
  },

  // ── Kochi (2 events) ─────────────────────────────────────────────────────
  {
    city: "Kochi", category: "Film & Media",
    title: "Kerala Short Film Showcase 2026",
    tag: "New",
    venue: "Sree Theatres", address: "MG Road, Ernakulam, Kochi", pincode: "682016",
    date: "2026-10-24", time: "03:00 PM", endTime: "08:00 PM",
    price: 249, capacity: 350, registered: 160, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    description: "A festival celebrating Kerala's vibrant short film scene with 25 screenings, jury awards, and filmmaker forums.",
    tiers: [{ label: "Film Pass", price: 249 }],
    amenities: ["Jury Awards", "Director Q&A", "Kerala Snacks", "Festival Catalogue"],
    bestTime: "01:00 PM - 06:00 PM", orgIndex: 4,
  },
  {
    city: "Kochi", category: "Food & Drink",
    title: "Spice Routes — Kerala Culinary Festival",
    tag: "Trending",
    venue: "Fort Kochi Heritage Square", address: "Fort Kochi, Kochi", pincode: "682001",
    date: "2026-11-14", time: "11:00 AM", endTime: "09:00 PM",
    price: 149, capacity: 2000, registered: 900, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
    description: "A two-day culinary festival celebrating Kerala's legendary spice trade with live cooking, tastings, and heritage walks.",
    tiers: [{ label: "Day Pass", price: 149 }, { label: "Weekend Pass", price: 249 }],
    amenities: ["50+ Food Stalls", "Spice Market", "Cooking Demos", "Heritage Walk"],
    bestTime: "10:00 AM - 06:00 PM", orgIndex: 3,
  },

  // ── Chandigarh (2 events) ────────────────────────────────────────────────
  {
    city: "Chandigarh", category: "Networking",
    title: "Chandigarh Entrepreneurs Network Q3",
    tag: "New",
    venue: "Sector 17 Plaza Community Centre", address: "Sector 17, Chandigarh", pincode: "160017",
    date: "2026-06-26", time: "06:00 PM", endTime: "09:00 PM",
    price: 0, capacity: 150, registered: 95, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    description: "Quarterly networking evening for Chandigarh's growing startup and entrepreneur community. Speakers, pitches, and cocktails.",
    tiers: [{ label: "Free Entry", price: 0 }],
    amenities: ["Drinks & Snacks", "Pitch Slam", "B2B Meetup"],
    bestTime: "02:00 PM - 06:00 PM", orgIndex: 0,
  },
  {
    city: "Chandigarh", category: "Fashion",
    title: "Chandigarh Fashion Week Spring 2026",
    tag: "Trending",
    venue: "Hotel Mountview Banquet", address: "Sector 10, Chandigarh", pincode: "160011",
    date: "2026-09-05", time: "05:00 PM", endTime: "09:00 PM",
    price: 999, capacity: 400, registered: 180, status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    description: "Chandigarh's premier fashion event showcasing spring collections from North India's top emerging and established designers.",
    tiers: [{ label: "Standard", price: 999 }, { label: "Front Row", price: 2999 }],
    amenities: ["Welcome Drink", "Goodie Bag", "After Party"],
    bestTime: "01:00 PM - 06:00 PM", orgIndex: 4,
  },
];

// ─── Upload a public image URL to Cloudinary ─────────────────────────────────
async function uploadBanner(imageUrl) {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: "qreventix",
    resource_type: "image",
    quality: "auto",
  });
  return { url: result.secure_url, publicId: result.public_id };
}

// ─── Fetch existing organisers or create sample ones ─────────────────────────
async function getOrCreateOrganizers() {
  let orgs = await Role.find({ role: "Organizer" })
    .select("_id name email mobileNumber")
    .lean();

  if (orgs.length > 0) {
    console.log(`Found ${orgs.length} existing organiser(s) — assigning events to them.`);
    return orgs;
  }

  console.log("No organisers found. Creating 5 sample organiser accounts...");
  const created = [];
  for (const data of ORGANIZER_SEEDS) {
    const org = new Role({
      ...data,
      password: "Password@Seed2026",
      role: "Organizer",
      isAgency: true,
      status: "Active",
    });
    await org.save();
    created.push({ _id: org._id, name: org.name, email: org.email, mobileNumber: org.mobileNumber });
    console.log(`  Created organiser: ${org.name} <${org.email}>`);
  }
  return created;
}

// ─── Resolve city and category name → DB document maps ───────────────────────
async function buildLookupMaps() {
  const cities = await City.find({}, "_id name");
  const categories = await Category.find({}, "_id name");

  const cityMap = {};
  cities.forEach((c) => { cityMap[c.name.toLowerCase()] = c; });

  const catMap = {};
  categories.forEach((c) => { catMap[c.name.toLowerCase()] = c; });

  return { cityMap, catMap };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seedEvents() {
  const db = process.env.DATABASE;
  if (!db) { console.error("DATABASE env variable is not set."); process.exit(1); }

  // Wait for connection initiated by DBConnect.js
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) resolve();
    else mongoose.connection.once("connected", resolve);
  });

  console.log("\n=== QREventix — 50 Event Seeder ===\n");

  // Idempotency: count events that already have a Cloudinary image stored
  const existing = await Event.countDocuments({ "image.publicId": { $exists: true, $ne: "" } });
  if (existing >= 50) {
    console.log(`Already have ${existing} Cloudinary-backed events. Nothing to seed.`);
    process.exit(0);
  }
  if (existing > 0) {
    const del = await Event.deleteMany({ "image.publicId": { $exists: true, $ne: "" } });
    console.log(`Removed ${del.deletedCount} partially seeded events. Re-seeding cleanly.\n`);
  }

  // Resolve city/category FK maps and validate all names exist
  const { cityMap, catMap } = await buildLookupMaps();
  const missing = [];
  for (const e of RAW_EVENTS) {
    if (!cityMap[e.city.toLowerCase()])     missing.push(`city: "${e.city}"`);
    if (!catMap[e.category.toLowerCase()]) missing.push(`category: "${e.category}"`);
  }
  if (missing.length) {
    console.error("Missing entries (run seed:cities and seed:categories first):");
    [...new Set(missing)].forEach((m) => console.error(`  ${m}`));
    process.exit(1);
  }

  const organizers = await getOrCreateOrganizers();
  const total = RAW_EVENTS.length;
  let successCount = 0;
  let failCount = 0;

  console.log(`\nSeeding ${total} events...\n`);

  for (let i = 0; i < total; i++) {
    const t = RAW_EVENTS[i];
    const label = `[${String(i + 1).padStart(2, "0")}/${total}]`;
    const org = organizers[t.orgIndex % organizers.length];

    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "event" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const eventId = `EVT-${counter.seq}`;

      process.stdout.write(`${label} Uploading banner for "${t.title}"... `);
      const image = await uploadBanner(t.imageUrl);
      process.stdout.write("uploaded.\n");

      const cityDoc = cityMap[t.city.toLowerCase()];
      const catDoc  = catMap[t.category.toLowerCase()];

      const event = new Event({
        eventId,
        title:    t.title,
        type:     t.category,
        tag:      t.tag || "",
        city:     t.city,
        cityId:   cityDoc._id,
        categoryId: catDoc._id,
        location: `${t.venue}, ${t.city}`,
        venue:    t.venue,
        address:  t.address,
        pincode:  t.pincode,
        googleMapsLink: "https://maps.google.com",
        date:     t.date,
        time:     t.time,
        endTime:  t.endTime,
        price:    t.price,
        priceLabel: t.price > 0 ? `₹${t.price.toLocaleString("en-IN")}` : "Free",
        capacity:  t.capacity,
        registered: t.registered,
        expectedRegistrations: t.capacity,
        status:   t.status || "Active",
        views:    Math.floor(Math.random() * 5000) + 200,
        image,          // { url, publicId } from Cloudinary
        gallery: [],
        amenities: t.amenities || [],
        description: t.description,
        tiers:    t.tiers || [],
        organizerId: org._id,
        organizerName: org.name,
        organizerContact: {
          name:     org.name,
          mobile:   org.mobileNumber,
          email:    org.email,
          bestTime: t.bestTime || "10:00 AM - 05:00 PM",
        },
      });

      await event.save();
      console.log(`  ✅ [${eventId}] "${t.title}" saved. (organiser: ${org.name})`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ "${t.title}" FAILED: ${err.message}`);
      failCount++;
    }
  }

  const line = "=".repeat(55);
  console.log(`\n${line}`);
  console.log("SEED COMPLETE");
  console.log(`  Succeeded : ${successCount}`);
  console.log(`  Failed    : ${failCount}`);
  console.log(`  Total     : ${total}`);
  if (successCount > 0) {
    const titles = RAW_EVENTS.slice(0, successCount).map((e) => e.city);
    const uniqueCities = [...new Set(titles)].length;
    console.log(`  Cities    : ${uniqueCities}`);
  }
  console.log(`${line}\n`);

  process.exit(failCount > 0 ? 1 : 0);
}

seedEvents().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
