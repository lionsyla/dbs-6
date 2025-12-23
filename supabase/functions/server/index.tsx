import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// ⚙️ EMPLOYEE MANAGEMENT - Add authorized employee emails here
const AUTHORIZED_EMPLOYEE_EMAILS = [
  // Add employee emails here, e.g.:
  // "manager@dardansbarbershop.com",
  // "staff@dardansbarbershop.com"
];

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

    // Check if email is in authorized employee list
    const isEmployee = AUTHORIZED_EMPLOYEE_EMAILS.includes(email.toLowerCase());

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        phone,
        role: isEmployee ? 'employee' : 'customer'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Sign up error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${email} - Role: ${isEmployee ? 'employee' : 'customer'}`);
    
    // Initialize user points and stats (only for customers)
    if (!isEmployee) {
      await kv.set(`user:${data.user.id}:points`, 0);
      await kv.set(`user:${data.user.id}:visits`, 0);
      await kv.set(`user:${data.user.id}:bookings`, []);
      await kv.set(`user:${data.user.id}:points-history`, []);
    }
    
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

    // Return user role
    const role = user.user_metadata?.role || 'customer';

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
      role,
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
      userId: user.id,
      userName: user.user_metadata?.name || 'Unknown',
      userPhone: user.user_metadata?.phone || '',
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

    // Also add to global bookings list for employee view
    const allBookings = await kv.get('admin:all-bookings') || [];
    allBookings.push(booking);
    await kv.set('admin:all-bookings', allBookings);

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

// Employee: Get all bookings
app.get("/make-server-f79deb15/admin/bookings", async (c) => {
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

    // Check if user is an employee
    const role = user.user_metadata?.role || 'customer';
    if (role !== 'employee') {
      return c.json({ error: 'Access denied. Employee access only.' }, 403);
    }

    // Get all bookings from global list
    const allBookings = await kv.get('admin:all-bookings') || [];

    console.log(`Employee ${user.id} fetched ${allBookings.length} bookings`);

    return c.json({
      bookings: allBookings
    });
  } catch (error: any) {
    console.error(`Error fetching admin bookings: ${error.message}`);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Employee: Update booking status
app.put("/make-server-f79deb15/admin/bookings/:id", async (c) => {
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

    // Check if user is an employee
    const role = user.user_metadata?.role || 'customer';
    if (role !== 'employee') {
      return c.json({ error: 'Access denied. Employee access only.' }, 403);
    }

    const bookingId = c.req.param('id');
    const { userId, status } = await c.req.json();

    if (!userId || !status) {
      return c.json({ error: 'userId and status are required' }, 400);
    }

    // Update in user's bookings
    const userBookings = await kv.get(`user:${userId}:bookings`) || [];
    const updatedUserBookings = userBookings.map((b: any) => 
      b.id === bookingId ? { ...b, status } : b
    );
    await kv.set(`user:${userId}:bookings`, updatedUserBookings);

    // Update in global bookings
    const allBookings = await kv.get('admin:all-bookings') || [];
    const updatedAllBookings = allBookings.map((b: any) => 
      b.id === bookingId ? { ...b, status } : b
    );
    await kv.set('admin:all-bookings', updatedAllBookings);

    console.log(`Employee ${user.id} updated booking ${bookingId} to ${status}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error(`Error updating booking: ${error.message}`);
    return c.json({ error: 'Failed to update booking' }, 500);
  }
});

// Admin: Promote user to employee by email
// This is a protected endpoint - you should only call it with the service role key
app.post("/make-server-f79deb15/admin/promote-to-employee", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error(`Error listing users: ${listError.message}`);
      return c.json({ error: 'Failed to find user' }, 500);
    }

    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user metadata to set role as employee
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'employee'
        }
      }
    );

    if (error) {
      console.error(`Error promoting user: ${error.message}`);
      return c.json({ error: 'Failed to promote user' }, 500);
    }

    console.log(`User ${email} promoted to employee`);

    return c.json({ 
      success: true,
      message: `User ${email} is now an employee`
    });
  } catch (error: any) {
    console.error(`Error promoting user to employee: ${error.message}`);
    return c.json({ error: 'Failed to promote user' }, 500);
  }
});

Deno.serve(app.fetch);