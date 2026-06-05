require("dotenv").config();
const mongoose = require("mongoose");
const roleModel = require("./Models/Authentication/RoleModel");
const eventModel = require("./Models/Events/EventModel");
const ticketModel = require("./Models/Tickets/TicketModel");
require("./Config/DBConnect");

const seedData = async () => {
  try {
    // Wait for connection
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once("connected", resolve);
      }
    });

    console.log("Cleaning Database...");
    await roleModel.deleteMany({});
    await eventModel.deleteMany({});
    await ticketModel.deleteMany({});

    console.log("Creating Seed Users...");

    // Password hashing is done automatically by RoleModel's pre-save hook
    const adminUser = new roleModel({
      name: "Admin User",
      email: "admin@qreventix.com",
      password: "password123",
      role: "Admin",
      companyName: "QREventix Corp",
      mobileNumber: "9876543210",
      status: "Active",
    });

    const organizerUser = new roleModel({
      name: "John Organizer",
      email: "organizer@qreventix.com",
      password: "password123",
      role: "Organizer",
      companyName: "Grand Events Ltd",
      mobileNumber: "9876543211",
      isAgency: true,
      status: "Active",
    });

    const attendeeUser = new roleModel({
      name: "Jane Attendee",
      email: "attendee@qreventix.com",
      password: "password123",
      role: "User",
      companyName: "Freelancer",
      mobileNumber: "9876543212",
      status: "Active",
    });

    await adminUser.save();
    await organizerUser.save();
    await attendeeUser.save();

    console.log("Users created successfully!");

    console.log("Creating Seed Events...");
    const mockEvents = [
      {
        title: "Global Tech Summit 2026",
        type: "Conference",
        tag: "Trending",
        city: "Bangalore",
        location: "KTPO Convention Centre, Whitefield, Bangalore",
        venue: "KTPO Convention Centre",
        address: "Whitefield, Bangalore",
        pincode: "560066",
        googleMapsLink: "https://maps.google.com",
        date: "2026-06-15",
        time: "09:00 AM",
        endTime: "05:00 PM",
        price: 1499,
        priceLabel: "₹1,499",
        capacity: 500,
        registered: 412,
        expectedRegistrations: 500,
        status: "Active",
        views: 4820,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80",
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80",
          "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&q=80"
        ],
        amenities: ["Free Wi-Fi", "Lunch Included", "Networking Session", "Certificate", "Kit Bag"],
        description: "A premier technology conference bringing together innovators, engineers, and leaders from around the world to shape the future of technology.",
        tiers: [
          { label: "General Pass", price: 1499 },
          { label: "VIP Pass", price: 2999 }
        ],
        organizerId: organizerUser._id,
        organizerName: organizerUser.name,
        organizerContact: {
          name: organizerUser.name,
          mobile: organizerUser.mobileNumber,
          email: organizerUser.email,
          bestTime: "10:00 AM - 05:00 PM"
        }
      },
      {
        title: "Sunburn Music Festival 2026",
        type: "Music",
        tag: "Sold Out Soon",
        city: "Bangalore",
        location: "Whitefield Ground, Bangalore",
        venue: "Whitefield Ground",
        address: "Whitefield, Bangalore",
        pincode: "560066",
        googleMapsLink: "https://maps.google.com",
        date: "2026-06-22",
        time: "06:00 PM",
        endTime: "11:00 PM",
        price: 2499,
        priceLabel: "₹2,499",
        capacity: 2000,
        registered: 1850,
        expectedRegistrations: 2000,
        status: "Active",
        views: 9200,
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80"
        ],
        amenities: ["VIP Lounge", "Food Courts", "Live Streaming", "Merchandise", "Parking"],
        description: "Experience an electrifying night with top chart-topping artists and DJs at India's biggest music festival.",
        tiers: [
          { label: "General Pass", price: 2499 },
          { label: "VIP Pass", price: 5999 }
        ],
        organizerId: organizerUser._id,
        organizerName: organizerUser.name,
        organizerContact: {
          name: organizerUser.name,
          mobile: organizerUser.mobileNumber,
          email: organizerUser.email,
          bestTime: "12:00 PM - 06:00 PM"
        }
      },
      {
        title: "Bangalore Half Marathon 2026",
        type: "Sports",
        tag: "Free Entry",
        city: "Bangalore",
        location: "Cubbon Park, Bangalore",
        venue: "Cubbon Park",
        address: "Kasturba Road, Bangalore",
        pincode: "560001",
        googleMapsLink: "https://maps.google.com",
        date: "2026-07-05",
        time: "05:30 AM",
        endTime: "10:30 AM",
        price: 0,
        priceLabel: "Free",
        capacity: 1000,
        registered: 730,
        expectedRegistrations: 1000,
        status: "Active",
        views: 3100,
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80",
          "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&q=80",
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80"
        ],
        amenities: ["Water Stations", "Finisher Medal", "Timing Chip", "First Aid", "Certificate"],
        description: "Join thousands of runners on a scenic 21km run through the heart of Bangalore. Open to all fitness levels.",
        tiers: [
          { label: "Free Entry Pass", price: 0 }
        ],
        organizerId: organizerUser._id,
        organizerName: organizerUser.name,
        organizerContact: {
          name: organizerUser.name,
          mobile: organizerUser.mobileNumber,
          email: organizerUser.email,
          bestTime: "09:00 AM - 04:00 PM"
        }
      },
      {
        title: "Standup Comedy Night",
        type: "Comedy",
        tag: "Hot Pick",
        city: "Mumbai",
        location: "The Comedy Club, Bandra, Mumbai",
        venue: "The Comedy Club",
        address: "Bandra, Mumbai",
        pincode: "400050",
        googleMapsLink: "https://maps.google.com",
        date: "2026-06-18",
        time: "08:00 PM",
        endTime: "10:30 PM",
        price: 799,
        priceLabel: "₹799",
        capacity: 300,
        registered: 240,
        expectedRegistrations: 300,
        status: "Active",
        views: 2800,
        image: "https://images.unsplash.com/photo-1585699324551-f6c309eed262?w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=400&q=80",
          "https://images.unsplash.com/photo-1572097662697-e4e45d9d0a25?w=400&q=80"
        ],
        amenities: ["2 Drinks Included", "VIP Seating", "Meet & Greet"],
        description: "A hilarious evening of standup comedy featuring India's top comedians. Laugh until it hurts!",
        tiers: [
          { label: "General Admission", price: 799 },
          { label: "VIP Sofa Front-Row", price: 1599 }
        ],
        organizerId: organizerUser._id,
        organizerName: organizerUser.name,
        organizerContact: {
          name: organizerUser.name,
          mobile: organizerUser.mobileNumber,
          email: organizerUser.email,
          bestTime: "02:00 PM - 08:00 PM"
        }
      },
      {
        title: "Modern Art Exhibition",
        type: "Arts",
        tag: "New",
        city: "Chennai",
        location: "Alliance Française, Nungambakkam, Chennai",
        venue: "Alliance Française",
        address: "Nungambakkam, Chennai",
        pincode: "600006",
        googleMapsLink: "https://maps.google.com",
        date: "2026-07-10",
        time: "11:00 AM",
        endTime: "07:00 PM",
        price: 299,
        priceLabel: "₹299",
        capacity: 200,
        registered: 85,
        expectedRegistrations: 200,
        status: "Active",
        views: 1240,
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1578926078693-59ec614a4f19?w=400&q=80",
          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80"
        ],
        amenities: ["Guided Tour", "Artist Interaction", "Refreshments"],
        description: "A curated exhibition showcasing the finest contemporary art from 50+ artists across South India.",
        tiers: [
          { label: "Standard Pass", price: 299 }
        ],
        organizerId: organizerUser._id,
        organizerName: organizerUser.name,
        organizerContact: {
          name: organizerUser.name,
          mobile: organizerUser.mobileNumber,
          email: organizerUser.email,
          bestTime: "10:00 AM - 04:00 PM"
        }
      },
      {
        title: "AI & Future of Work Seminar",
        type: "Tech",
        tag: "Early Bird",
        city: "Hyderabad",
        location: "HICC, Madhapur, Hyderabad",
        venue: "HICC",
        address: "Madhapur, Hyderabad",
        pincode: "500081",
        googleMapsLink: "https://maps.google.com",
        date: "2026-06-28",
        time: "10:00 AM",
        endTime: "04:00 PM",
        price: 999,
        priceLabel: "₹999",
        capacity: 400,
        registered: 210,
        expectedRegistrations: 400,
        status: "Active",
        views: 3450,
        image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1526378800651-e2f1e496f903?w=400&q=80",
          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80"
        ],
        amenities: ["Free Wi-Fi", "Lunch Included", "Networking", "Recording Access"],
        description: "Explore how Artificial Intelligence is reshaping the workplace with keynotes from industry leaders.",
        tiers: [
          { label: "Delegate Ticket", price: 999 },
          { label: "Corporate VIP (5 Pax)", price: 3999 }
        ],
        organizerId: organizerUser._id,
        organizerName: organizerUser.name,
        organizerContact: {
          name: organizerUser.name,
          mobile: organizerUser.mobileNumber,
          email: organizerUser.email,
          bestTime: "09:00 AM - 05:00 PM"
        }
      }
    ];

    await eventModel.insertMany(mockEvents);
    console.log("Mock Events created successfully!");

    console.log("Database Seeded Successfully! 🌱");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed ❌", error);
    process.exit(1);
  }
};

seedData();
