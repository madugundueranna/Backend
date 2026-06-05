require("dotenv").config();
const mongoose = require("mongoose");

const About       = require("./Models/Content/AboutModel");
const Career      = require("./Models/Content/CareerModel");
const BlogPost    = require("./Models/Content/BlogPostModel");
const Press       = require("./Models/Content/PressModel");
const HelpFAQ     = require("./Models/Content/HelpFAQModel");
const ContactInfo = require("./Models/Content/ContactInfoModel");

async function seed() {
  await mongoose.connect(process.env.DATABASE);
  console.log("Connected to MongoDB");

  // ── About ──────────────────────────────────────────────────────────────────
  await About.deleteMany({});
  await About.create({
    heroTagline: "We're a Bangalore-born startup on a mission to transform how India discovers, books, and experiences live events — one QR code at a time.",
    storyParagraphs: [
      "QREventix was founded in 2023 after our co-founders experienced firsthand the chaos of paper tickets, long queues, and sold-out events with no digital paper trail. We set out to build a platform that combines the discoverability of a modern marketplace with instant, tamper-proof QR ticketing.",
      "From our first 100 events in Bangalore to over 10,000 events across 50+ cities, we've helped millions of attendees walk through the door — contactlessly, effortlessly, and confidently.",
      "Today QREventix powers everything from rooftop gigs and indie art exhibitions to stadium concerts and multi-day tech conferences. Our obsession with reliability means our QR validation works even in offline mode — so the show always goes on.",
    ],
    values: [
      { icon: "FiTarget", title: "Our Mission",      body: "To democratise event discovery and ticketing across India by making it instant, paperless, and secure — powered by QR technology." },
      { icon: "FiEye",    title: "Our Vision",       body: "A future where every event — from a rooftop gig to a stadium concert — is discoverable, bookable, and verifiable in seconds." },
      { icon: "FiUsers",  title: "Community First",  body: "We grow alongside the organisers and attendees who use our platform, listening to their needs to shape every feature we ship." },
      { icon: "FiAward",  title: "Quality & Trust",  body: "Every event on QREventix is verified before going live. We hold ourselves to the highest standards of reliability and transparency." },
    ],
    team: [
      { name: "Arjun Mehta",   role: "Co-Founder & CEO",     city: "Bangalore", bio: "Ex-Ola engineer obsessed with live events and scalable systems." },
      { name: "Priya Sharma",  role: "Co-Founder & CTO",     city: "Mumbai",    bio: "Full-stack architect who has shipped products used by 10M+ users." },
      { name: "Rahul Nair",    role: "Head of Product",      city: "Hyderabad", bio: "Former PM at Swiggy; brings product intuition honed across consumer apps." },
      { name: "Anjali Reddy",  role: "Head of Partnerships", city: "Chennai",   bio: "Built the venue network that powers 40% of our events." },
      { name: "Vikram Singh",  role: "Lead Engineer",        city: "Pune",      bio: "Node.js performance wizard who keeps our APIs sub-100ms." },
      { name: "Meera Kapoor",  role: "Head of Design",       city: "Bangalore", bio: "Crafts experiences that feel obvious in hindsight." },
    ],
    stats: [
      { number: "10,000+", label: "Events Listed"    },
      { number: "2M+",     label: "Tickets Issued"   },
      { number: "50+",     label: "Cities Covered"   },
      { number: "500+",    label: "Event Organisers" },
    ],
  });
  console.log("✓ About seeded");

  // ── Careers ────────────────────────────────────────────────────────────────
  await Career.deleteMany({});
  await Career.insertMany([
    {
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Bangalore (Hybrid)",
      type: "Full-time",
      description: "Own end-to-end features across our React + Node.js stack. You'll architect new capabilities and mentor junior engineers.",
    },
    {
      title: "Product Designer (UI/UX)",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Shape the end-to-end experience for millions of event attendees. You'll own design from concept to shipped product.",
    },
    {
      title: "Growth Marketing Manager",
      department: "Marketing",
      location: "Bangalore",
      type: "Full-time",
      description: "Drive attendee and organiser acquisition through data-led campaigns across paid, organic, and partnership channels.",
    },
    {
      title: "Customer Success Specialist",
      department: "Support",
      location: "Remote",
      type: "Full-time",
      description: "Be the first point of contact for our event organisers, helping them get the most out of the QREventix platform.",
    },
    {
      title: "Backend Engineer – Payments",
      department: "Engineering",
      location: "Bangalore (Hybrid)",
      type: "Full-time",
      description: "Build and scale our payment infrastructure including Razorpay integrations, refunds, and reconciliation systems.",
    },
    {
      title: "Business Development Executive",
      department: "Partnerships",
      location: "Mumbai",
      type: "Full-time",
      description: "Identify, pitch, and close partnerships with major event venues, promoters, and corporate clients across India.",
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Own our AWS infrastructure, CI/CD pipelines, and monitoring stack. Help us achieve 99.99% uptime on event nights.",
    },
    {
      title: "Data Analyst",
      department: "Analytics",
      location: "Bangalore",
      type: "Full-time",
      description: "Turn our event and ticketing data into insights that drive product and marketing decisions. Strong SQL + Python skills required.",
    },
  ]);
  console.log("✓ Careers seeded");

  // ── Blog Posts ─────────────────────────────────────────────────────────────
  await BlogPost.deleteMany({});
  await BlogPost.insertMany([
    {
      title: "How QR Ticketing Is Transforming Live Events in India",
      slug: "qr-ticketing-transforming-live-events-india",
      excerpt: "From sold-out concerts to corporate conferences, QR-based check-in is replacing paper tickets — here's how it works and why it matters.",
      content: `<p>India's live events industry is in the middle of a quiet revolution. Walk into any major concert, tech conference, or food festival today, and you're as likely to see attendees flashing phone screens as paper slips.</p>
<h2>Why paper tickets fail</h2>
<p>Paper tickets are expensive to print, easy to forge, and impossible to track in real time. When an event sells out and resellers enter the picture, organisers lose visibility entirely.</p>
<h2>How QR ticketing solves this</h2>
<p>A QR code is a unique, cryptographically signed token. When scanned at the gate, our system verifies the token against the database in under 200ms — online or offline. Duplicates are flagged instantly.</p>
<h2>What the numbers say</h2>
<p>Events that switched to QR-only entry on QREventix reported a 40% reduction in gate queue times and a near-zero counterfeit rate. Organisers can also see live attendance dashboards — something physically impossible with paper.</p>
<p>The shift is irreversible. India's event-goers have smartphones and expect digital-first experiences. QR ticketing isn't a novelty anymore — it's the baseline.</p>`,
      author: "Priya Sharma",
      date: "15 May 2026",
      category: "Technology",
      readTime: "5 min read",
      coverImage: { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", publicId: "" },
    },
    {
      title: "Top 10 Music Festivals to Attend in India This Summer",
      slug: "top-10-music-festivals-india-summer-2026",
      excerpt: "From the beaches of Goa to the hills of Shimla, India's summer festival calendar is packed. Here are the events you can't miss.",
      content: `<p>Summer in India used to mean avoiding the outdoors. Not anymore. A new generation of festival organisers has turned the hottest months into peak event season, using late-evening slots, misting stations, and curated lineups to keep attendees coming back.</p>
<h2>1. Sunburn Arena – Goa</h2>
<p>India's biggest EDM festival returns with a headline set from a Grammy-winning act. Tickets sell out in hours, so book early.</p>
<h2>2. Magnetic Fields – Alsisar Mahal, Rajasthan</h2>
<p>An intimate electronic music experience set in a 17th-century fort. Limited capacity means every ticket is precious.</p>
<h2>3. NH7 Weekender – Pune</h2>
<p>The "happiest music festival" consistently delivers across genres — from indie folk to hip-hop — on multiple stages.</p>
<p>…and seven more curated picks inside. Find them all on QREventix, with tickets bookable in one tap.</p>`,
      author: "Rahul Nair",
      date: "10 May 2026",
      category: "Events",
      readTime: "7 min read",
      coverImage: { url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80", publicId: "" },
    },
    {
      title: "How to Sell Out Your Event in 48 Hours: An Organiser's Guide",
      slug: "sell-out-event-48-hours-organisers-guide",
      excerpt: "We analysed 500+ events on QREventix and found patterns that separate the sell-outs from the half-empty venues.",
      content: `<p>After analysing over 500 events listed on QREventix in the past year, our data team identified the seven variables that most reliably predict a sell-out within 48 hours of listing.</p>
<h2>1. Launch on a Tuesday or Wednesday</h2>
<p>Events listed mid-week consistently outperform weekend launches by 34%. The theory: people plan weekend activities during the week, not on weekends themselves.</p>
<h2>2. Price the first tier 20–30% below your floor</h2>
<p>Early-bird pricing creates urgency and social proof. Once the first tier sells out, the FOMO effect does the rest.</p>
<h2>3. Use all four image slots</h2>
<p>Events with four gallery images see 2.3× more clicks from the browse page than events with a single cover photo.</p>
<h2>4. Write a 150-word minimum description</h2>
<p>Short descriptions signal low effort to potential attendees. The sweet spot is 150–300 words with at least one concrete detail (performer name, venue capacity, what's included in the ticket).</p>`,
      author: "Anjali Reddy",
      date: "2 May 2026",
      category: "Organiser Tips",
      readTime: "8 min read",
      coverImage: { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", publicId: "" },
    },
    {
      title: "The Rise of Tech Conferences in Tier 2 Cities",
      slug: "tech-conferences-tier-2-cities-india",
      excerpt: "Pune, Jaipur, and Kochi are quietly becoming hotspots for developer meetups and startup summits. Here's what's driving the shift.",
      content: `<p>For years, India's tech conference circuit was synonymous with Bangalore, Mumbai, and Delhi. That's changing fast.</p>
<h2>The talent is moving</h2>
<p>Remote work during the pandemic dispersed tech talent across India. Developers in Jaipur and Kochi no longer need to relocate to attend world-class events — so organisers are bringing events to them.</p>
<h2>Lower costs, higher ROI for organisers</h2>
<p>Venue costs in Tier 2 cities are 40–60% lower than metro alternatives. Sponsors get better brand recall in less-cluttered markets.</p>
<h2>What QREventix data shows</h2>
<p>Events in Tier 2 cities on our platform grew 180% year-on-year. Pune leads the pack, followed by Kochi and Indore. Average ticket sell-through rates are actually higher in these cities — attendees are more committed.</p>`,
      author: "Vikram Singh",
      date: "25 Apr 2026",
      category: "Industry",
      readTime: "6 min read",
      coverImage: { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", publicId: "" },
    },
    {
      title: "Contactless Check-In: What Attendees Actually Think",
      slug: "contactless-check-in-attendee-survey-2026",
      excerpt: "We surveyed 5,000 attendees about their QR check-in experience. The results were overwhelmingly positive — with a few surprises.",
      content: `<p>In March 2026, we surveyed 5,000 QREventix attendees across 12 cities about their gate experience. Here's what they told us.</p>
<h2>94% preferred QR over paper</h2>
<p>The number one reason: "I can't lose my phone." Second: "I don't have to print anything." Convenience is the killer feature.</p>
<h2>The offline concern</h2>
<p>28% of respondents said they worried about what happens if there's no network at the venue. This drove us to ship offline-mode validation in our scanner app — the QR is verified locally if the connection drops.</p>
<h2>Average gate time dropped from 4.2 to 1.8 minutes</h2>
<p>Across 50 events that tracked gate throughput, switching to QR-only entry cut average wait time by 57%. Stadium-scale events benefited most.</p>`,
      author: "Meera Kapoor",
      date: "18 Apr 2026",
      category: "Research",
      readTime: "4 min read",
      coverImage: { url: "https://images.unsplash.com/photo-1511795409834-432f7b1728b2?w=800&q=80", publicId: "" },
    },
    {
      title: "Introducing Multi-Tier Ticketing on QREventix",
      slug: "introducing-multi-tier-ticketing-qreventix",
      excerpt: "Organisers can now offer General, Premium, and VIP tiers with different prices and perks — all managed from one dashboard.",
      content: `<p>Today we're shipping one of our most-requested features: multi-tier ticketing. Organisers can now create up to five ticket tiers per event, each with its own price, capacity, and perk description.</p>
<h2>How it works</h2>
<p>From your Organiser Dashboard, open any event and navigate to the Ticket Tiers tab. Add a tier, set the price and capacity, write a short perk description (e.g., "Front-row access + artist meet & greet"), and save. Tiers are displayed to attendees in order of price, lowest first.</p>
<h2>Dynamic capacity management</h2>
<p>If a VIP tier sells out, the system automatically removes it from the booking flow without any action required from the organiser. Remaining capacity is always accurate in real time.</p>
<h2>What's next</h2>
<p>Group booking discounts, corporate invoice ticketing, and complimentary ticket allocation for sponsors are all on our roadmap for Q3 2026.</p>`,
      author: "Arjun Mehta",
      date: "5 Apr 2026",
      category: "Product",
      readTime: "3 min read",
      coverImage: { url: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80", publicId: "" },
    },
    {
      title: "Building Accessible Events: A Practical Checklist",
      slug: "building-accessible-events-checklist",
      excerpt: "Accessibility isn't just good ethics — it expands your audience. Here's a checklist every event organiser should bookmark.",
      content: `<p>One in eight Indians lives with some form of disability. Yet most event venues and ticketing flows are designed with a narrow set of attendees in mind. Here's how to do better.</p>
<h2>Venue checklist</h2>
<ul><li>Wheelchair-accessible entry and seating</li><li>Accessible toilets clearly signposted</li><li>Reserved viewing areas with unobstructed sightlines</li><li>Induction loops for hearing aid users at spoken-word events</li></ul>
<h2>Ticketing checklist</h2>
<ul><li>Companion ticket at reduced or zero cost</li><li>Accessibility notes field during booking so staff can prepare</li><li>Confirmation email in plain text (not image-heavy PDFs)</li></ul>
<h2>On QREventix</h2>
<p>You can now mark an event as "Accessibility-Friendly" in your dashboard. Events with this badge average 12% higher conversion rates — attendees trust that you've thought about everyone.</p>`,
      author: "Anjali Reddy",
      date: "20 Mar 2026",
      category: "Organiser Tips",
      readTime: "6 min read",
      coverImage: { url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80", publicId: "" },
    },
  ]);
  console.log("✓ Blog posts seeded");

  // ── Press ──────────────────────────────────────────────────────────────────
  await Press.deleteMany({});
  await Press.insertMany([
    {
      publication: "Economic Times",
      headline: "QREventix raises ₹12 Cr seed round to digitise India's live-events industry",
      summary: "The Bangalore-based startup secured funding from Blume Ventures and Nexus Venture Partners to accelerate expansion into 30 new cities.",
      date: "March 2026",
      logo: "ET",
      logoColor: "bg-orange-100 text-orange-700",
      link: "",
    },
    {
      publication: "YourStory",
      headline: "How this Bangalore startup is making paper tickets extinct with QR technology",
      summary: "A deep-dive into QREventix's product journey, from first event to 10,000 listings and the technology choices that got them there.",
      date: "February 2026",
      logo: "YS",
      logoColor: "bg-blue-100 text-blue-700",
      link: "",
    },
    {
      publication: "Inc42",
      headline: "QREventix crosses 1 million tickets milestone just 10 months after launch",
      summary: "The platform hit the milestone faster than any comparable ticketing startup in India, driven by strong word-of-mouth from organisers.",
      date: "January 2026",
      logo: "I42",
      logoColor: "bg-green-100 text-green-700",
      link: "",
    },
    {
      publication: "TechCrunch India",
      headline: "QREventix is the infrastructure play India's event ecosystem has been waiting for",
      summary: "An analysis of why QREventix's API-first approach positions it as the Stripe of live-event ticketing in South Asia.",
      date: "November 2025",
      logo: "TC",
      logoColor: "bg-rose-100 text-rose-700",
      link: "",
    },
    {
      publication: "Business Standard",
      headline: "Contactless entry at live events is now mainstream — and QREventix led the charge",
      summary: "An industry report on the shift to digital ticketing post-pandemic, featuring QREventix as the fastest-growing platform.",
      date: "October 2025",
      logo: "BS",
      logoColor: "bg-indigo-100 text-indigo-700",
      link: "",
    },
    {
      publication: "Mint",
      headline: "Meet the founders turning every event ticket into a verifiable digital asset",
      summary: "A founder profile on Arjun Mehta and Priya Sharma, covering the origin story of QREventix and their vision for the next five years.",
      date: "August 2025",
      logo: "MI",
      logoColor: "bg-teal-100 text-teal-700",
      link: "",
    },
  ]);
  console.log("✓ Press seeded");

  // ── Help FAQs ──────────────────────────────────────────────────────────────
  await HelpFAQ.deleteMany({});
  await HelpFAQ.insertMany([
    // Tickets & Booking
    { category: "Tickets & Booking", order: 1, question: "How do I book a ticket on QREventix?", answer: "Browse events, click on one you like, and press 'Book Now'. Select your ticket tier, complete payment (if paid), and your QR ticket will be instantly available in your dashboard." },
    { category: "Tickets & Booking", order: 2, question: "Where can I find my tickets after booking?", answer: "All your tickets are in the 'My Tickets' section of your dashboard. You can also download each QR ticket as a PNG image for offline use." },
    { category: "Tickets & Booking", order: 3, question: "Can I book tickets without creating an account?", answer: "You need a free QREventix account to book and hold tickets. Registration takes under a minute with your email or Google account." },
    { category: "Tickets & Booking", order: 4, question: "How do I use my QR ticket at the venue?", answer: "Open your ticket from the dashboard and display the QR code to the venue's scanner. Alternatively, download and print the ticket PNG for entry." },
    { category: "Tickets & Booking", order: 5, question: "Can I transfer my ticket to someone else?", answer: "Ticket transfers are currently not supported directly on the platform. Contact the event organiser for any transfer requests." },
    // Payments & Refunds
    { category: "Payments & Refunds", order: 1, question: "What payment methods are accepted?", answer: "We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and major digital wallets via our Razorpay payment gateway." },
    { category: "Payments & Refunds", order: 2, question: "Is it safe to enter my payment details?", answer: "Yes. All payments are processed through Razorpay, a PCI-DSS Level 1 compliant payment gateway. QREventix never stores your card details." },
    { category: "Payments & Refunds", order: 3, question: "How do I get a refund if an event is cancelled?", answer: "If an organiser cancels an event, refunds are processed automatically within 5–7 business days to your original payment method. You'll receive a confirmation email." },
    { category: "Payments & Refunds", order: 4, question: "I paid but haven't received my ticket — what do I do?", answer: "First check your 'My Tickets' dashboard. If the ticket isn't there within 15 minutes, contact us at support@qreventix.in with your payment reference." },
    // For Event Organisers
    { category: "For Event Organisers", order: 1, question: "How do I list my event on QREventix?", answer: "Register as an Organiser, then use the 'Add Event' dashboard to fill in your event details, upload images, set ticket tiers, and submit for review. Approved events go live within 24 hours." },
    { category: "For Event Organisers", order: 2, question: "What commission does QREventix charge?", answer: "QREventix charges a platform fee of 5% on each ticket sold. Free events are listed at no cost. Pricing details are available in the Organiser dashboard." },
    { category: "For Event Organisers", order: 3, question: "When do I receive payouts from ticket sales?", answer: "Payouts are processed within 3–5 business days after the event date. You'll receive funds directly to your registered bank account." },
    { category: "For Event Organisers", order: 4, question: "Can I edit my event after publishing?", answer: "Yes — title, description, images, and venue details can be updated at any time. Changes to pricing or capacity may require re-approval." },
    // Account & Privacy
    { category: "Account & Privacy", order: 1, question: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page, enter your email, and follow the link we send you. The link expires in 1 hour." },
    { category: "Account & Privacy", order: 2, question: "Can I delete my account?", answer: "Yes. Go to Account Settings → Danger Zone → Delete Account. Note: account deletion is irreversible and removes all your booking history." },
    { category: "Account & Privacy", order: 3, question: "How does QREventix use my data?", answer: "We use your data only to provide and improve the QREventix service. We never sell personal data to third parties. Read our full Privacy Policy for details." },
  ]);
  console.log("✓ Help FAQs seeded");

  // ── Contact Info ───────────────────────────────────────────────────────────
  await ContactInfo.deleteMany({});
  await ContactInfo.create({
    address: "No. 12, Brigade Road, Bangalore – 560025, Karnataka",
    phone: "+91 80 4120 5000",
    phoneHours: "Mon – Fri, 10 AM – 7 PM IST",
    email: "support@qreventix.in",
    emailResponseTime: "Response within 24 hours",
    pressEmail: "press@qreventix.in",
    partnershipsEmail: "partnerships@qreventix.in",
  });
  console.log("✓ Contact info seeded");

  console.log("\nAll content seeded successfully.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
