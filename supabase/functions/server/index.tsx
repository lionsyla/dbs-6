import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f79deb15/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-f79deb15/signup", async (c) => {
  try {
    const { name, email, phone, password } = await c.req.json();

    if (!name || !email || !phone || !password) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        phone 
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Sign up error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${email} - verification email sent`);
    
    // Initialize user points and stats
    await kv.set(`user:${data.user.id}:points`, 0);
    await kv.set(`user:${data.user.id}:visits`, 0);
    await kv.set(`user:${data.user.id}:bookings`, []);
    await kv.set(`user:${data.user.id}:points-history`, []);
    
    return c.json({ 
      success: true,
      requiresVerification: true,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error: any) {
    console.error(`Sign up error: ${error.message}`);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Get user stats (points, visits, bookings)
app.get("/make-server-f79deb15/user-stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.error('No access token provided to user-stats endpoint');
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      console.error(`Authorization error in user-stats: ${error?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`Fetching stats for user ${user.id}`);

    // Get stats or initialize if not exists
    let points = await kv.get(`user:${user.id}:points`);
    let visits = await kv.get(`user:${user.id}:visits`);
    let bookings = await kv.get(`user:${user.id}:bookings`);
    let pointsHistory = await kv.get(`user:${user.id}:points-history`);
    
    // Initialize if data doesn't exist (for existing users who signed up before points system)
    if (points === null || points === undefined) {
      console.log(`Initializing points for user ${user.id}`);
      points = 0;
      await kv.set(`user:${user.id}:points`, 0);
    }
    if (visits === null || visits === undefined) {
      console.log(`Initializing visits for user ${user.id}`);
      visits = 0;
      await kv.set(`user:${user.id}:visits`, 0);
    }
    if (!bookings) {
      console.log(`Initializing bookings for user ${user.id}`);
      bookings = [];
      await kv.set(`user:${user.id}:bookings`, []);
    }
    if (!pointsHistory) {
      console.log(`Initializing points history for user ${user.id}`);
      pointsHistory = [];
      await kv.set(`user:${user.id}:points-history`, []);
    }

    console.log(`Returning stats for user ${user.id}: ${points} points, ${visits} visits, ${bookings.length} bookings`);

    return c.json({
      points,
      visits,
      bookings,
      pointsHistory
    });
  } catch (error: any) {
    console.error(`Error fetching user stats: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    return c.json({ error: 'Failed to fetch user stats' }, 500);
  }
});

// Create a booking and award points
app.post("/make-server-f79deb15/bookings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { service, barber, date, time, price, duration } = await c.req.json();

    if (!service || !barber || !date || !time || !price) {
      return c.json({ error: 'All booking fields are required' }, 400);
    }

    // Create booking object
    const booking = {
      id: crypto.randomUUID(),
      service,
      barber,
      date,
      time,
      price,
      duration,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };

    // Get current bookings
    const bookings = await kv.get(`user:${user.id}:bookings`) || [];
    bookings.push(booking);
    await kv.set(`user:${user.id}:bookings`, bookings);

    // Award points equal to dollar amount (e.g., $45 = 45 points)
    const pointsToAward = parseInt(price.replace('$', ''));
    const currentPoints = await kv.get(`user:${user.id}:points`) || 0;
    const newPoints = currentPoints + pointsToAward;
    await kv.set(`user:${user.id}:points`, newPoints);

    // Increment visits
    const currentVisits = await kv.get(`user:${user.id}:visits`) || 0;
    await kv.set(`user:${user.id}:visits`, currentVisits + 1);

    // Add points transaction to history
    const pointsHistory = await kv.get(`user:${user.id}:points-history`) || [];
    pointsHistory.push({
      id: crypto.randomUUID(),
      type: 'earned',
      points: pointsToAward,
      description: `Booked ${service}`,
      date: new Date().toISOString()
    });
    await kv.set(`user:${user.id}:points-history`, pointsHistory);

    console.log(`Booking created for user ${user.id}: ${service} - ${pointsToAward} points awarded`);

    return c.json({
      success: true,
      booking,
      pointsAwarded: pointsToAward,
      totalPoints: newPoints
    });
  } catch (error: any) {
    console.error(`Error creating booking: ${error.message}`);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Redeem points for discount
app.post("/make-server-f79deb15/redeem-points", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { pointsToRedeem, description } = await c.req.json();

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return c.json({ error: 'Invalid points amount' }, 400);
    }

    const currentPoints = await kv.get(`user:${user.id}:points`) || 0;

    if (currentPoints < pointsToRedeem) {
      return c.json({ error: 'Insufficient points' }, 400);
    }

    // Deduct points
    const newPoints = currentPoints - pointsToRedeem;
    await kv.set(`user:${user.id}:points`, newPoints);

    // Add redemption to history
    const pointsHistory = await kv.get(`user:${user.id}:points-history`) || [];
    pointsHistory.push({
      id: crypto.randomUUID(),
      type: 'redeemed',
      points: -pointsToRedeem,
      description: description || 'Points redeemed',
      date: new Date().toISOString()
    });
    await kv.set(`user:${user.id}:points-history`, pointsHistory);

    console.log(`User ${user.id} redeemed ${pointsToRedeem} points`);

    // Calculate discount (100 points = $10 off)
    const discountAmount = (pointsToRedeem / 100) * 10;

    return c.json({
      success: true,
      pointsRedeemed: pointsToRedeem,
      discountAmount,
      remainingPoints: newPoints
    });
  } catch (error: any) {
    console.error(`Error redeeming points: ${error.message}`);
    return c.json({ error: 'Failed to redeem points' }, 500);
  }
});

Deno.serve(app.fetch);