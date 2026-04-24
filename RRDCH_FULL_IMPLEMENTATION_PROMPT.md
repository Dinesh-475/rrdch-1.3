# RRDCH FULL FEATURE IMPLEMENTATION PROMPT
# Rajarajeshwari Dental College and Hospital — Campus Intelligence Platform
# For use with AI coding agents. Read every section before writing any code.

---

## PROJECT CONTEXT AND CONSTRAINTS

This is an existing production website for Rajarajeshwari Dental College and Hospital (RRDCH), Bangalore.

Codebase is pure Vanilla HTML, CSS, and JavaScript. No React, no Vue, no build tools, no Node server. All backend is Supabase direct from browser. Do not introduce any framework or bundler.

Supabase client is already initialized globally as `window.sb` via `js/config.js`. Use `window.sb` for all Supabase operations. Do not reinitialize the client anywhere.

Supabase project URL: `https://hbalflsjvtovtmmypdvv.supabase.co`
Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYWxmbHNqdnRvdnRtbXlwZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDc1OTcsImV4cCI6MjA5MjA4MzU5N30.iq60dhhWA8oqwNHQr6R4hvnCDKNBZ-sP-1A2PXxkkRU`

Existing files: index.html, admin-portal.html, students.html, doctor-portal.html, patients.html, portal.html, about.html, departments.html, contact.html, admissions.html, doctors.html, login.html, css/style.css, css/cu-theme.css, css/login-theme.css, js/config.js, js/backend.js, js/public-shell.js, js/script.js, js/ai.js, js/gallery-dynamic.js

Do not modify style.css, cu-theme.css, login-theme.css, public-shell.js, config.js, or backend.js unless a feature explicitly requires a targeted addition. Preserve all existing UI, design tokens, animations, and layout patterns.

Design tokens to reuse in all new files:
- Primary blue: #1c4578
- Deep blue: #0f2d52
- Light blue: #3b6fc7
- Gold accent: #c39c5b
- Background: #f0f4f9
- Background secondary: #f8fafc
- Border: #e2e8f0
- Text: #0f172a
- Muted: #64748b
- Green: #16a34a
- Red: #dc2626
- Amber: #d97706
- Sidebar width: 260px
- Font: Inter, ui-sans-serif, system-ui

CDN scripts to include in every new portal file (in this order):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/config.js"></script>
<script src="js/backend.js"></script>
```

Real-time architecture rule: Every feature that writes data must immediately trigger a visual update in every other portal that displays that data. This is done exclusively via Supabase Realtime postgres_changes subscriptions. The pattern is:

```javascript
window.sb.channel('channel-name')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'table_name' }, (payload) => {
    // re-fetch and re-render the affected UI component
  })
  .subscribe();
```

Subscribe to channels only after the user is authenticated and the page section is visible. Unsubscribe on page unload using `window.addEventListener('beforeunload', ...)`.

Access control model:
- role: 'admin' — full read/write on all tables
- role: 'doctor' — read/write on clinical tables, read on campus tables
- role: 'student' — read on most tables, write only on tables designated below
- role: 'staff' — read on most tables, write on their own records
- role: 'security' — write on parking_slots, visitor_log, gate_entry tables only
- role: 'canteen' — write on canteen_orders, canteen_menu tables only
- role: 'guard' (bus) — write on bus_position table only

Store role in localStorage as `rrdch_user_role` after login. Check it on page load for access gating.

---

## SUPABASE DATABASE SCHEMA — CREATE ALL TABLES FIRST

Run the following SQL in the Supabase SQL editor before implementing any feature. Enable Row Level Security on each table after creation. Enable Realtime replication on every table listed below by going to Database > Replication > Source and toggling each table on.

```sql
-- BUS TRACKING
create table if not exists bus_routes (
  id uuid primary key default gen_random_uuid(),
  route_name text not null,
  stops jsonb not null, -- array of {name, lat, lng, order}
  created_at timestamptz default now()
);

create table if not exists bus_position (
  id uuid primary key default gen_random_uuid(),
  bus_id text not null unique,
  bus_name text not null,
  route_id uuid references bus_routes(id),
  current_lat double precision not null,
  current_lng double precision not null,
  current_stop_index integer default 0,
  status text default 'on_route', -- on_route | at_stop | delayed | off_duty
  speed_kmh integer default 0,
  updated_at timestamptz default now()
);

create table if not exists transport_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  user_type text not null, -- student | staff
  name text not null,
  route_id uuid references bus_routes(id),
  registered_at timestamptz default now()
);

-- PARKING
create table if not exists parking_slots (
  id uuid primary key default gen_random_uuid(),
  slot_number integer not null unique,
  slot_label text not null, -- e.g. 'A-01'
  zone text not null, -- 'A' | 'B' | 'C'
  status text default 'free', -- free | occupied
  vehicle_number text,
  occupied_by text, -- user_id
  occupied_at timestamptz,
  updated_by text, -- security guard id
  updated_at timestamptz default now()
);

-- seed 48 slots: run this after creating table
-- zones A (1-16), B (17-32), C (33-48)

-- OPD QUEUE (already exists — verify columns)
-- table: opd_queue (id, token_number, patient_name, department, status, created_at)

-- DENTAL CHAIR TRACKER
create table if not exists dental_chairs (
  id uuid primary key default gen_random_uuid(),
  chair_number integer not null unique,
  chair_label text not null, -- 'C-01'
  department text not null,
  room text not null,
  status text default 'free', -- free | occupied | cleaning | reserved
  patient_token text,
  doctor_id text,
  occupied_at timestamptz,
  updated_at timestamptz default now()
);

-- QR ATTENDANCE
create table if not exists attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  qr_code text not null unique,
  subject text not null,
  faculty_id text not null,
  department text not null,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references attendance_sessions(id),
  student_id text not null,
  student_name text not null,
  scanned_at timestamptz default now(),
  unique(session_id, student_id)
);

-- INTERNAL MARKS
create table if not exists marks_records (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  subject text not null,
  department text not null,
  batch text not null,
  cia1 integer,
  cia2 integer,
  assignment integer,
  practical integer,
  total integer generated always as (coalesce(cia1,0) + coalesce(cia2,0) + coalesce(assignment,0) + coalesce(practical,0)) stored,
  entered_by text,
  updated_at timestamptz default now(),
  unique(student_id, subject)
);

-- TIMETABLE
create table if not exists timetable (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  batch text not null,
  day_of_week integer not null, -- 1=Mon..6=Sat
  period_number integer not null, -- 1..8
  subject text,
  faculty_id text,
  room text,
  start_time text, -- '09:00'
  end_time text, -- '09:50'
  updated_at timestamptz default now(),
  unique(department, batch, day_of_week, period_number)
);

-- EXAM SEATING
create table if not exists exam_seating (
  id uuid primary key default gen_random_uuid(),
  exam_name text not null,
  exam_date date not null,
  hall_name text not null,
  seat_number integer not null,
  student_id text not null,
  student_name text not null,
  department text not null,
  created_at timestamptz default now(),
  unique(exam_name, exam_date, hall_name, seat_number)
);

-- NOTICE BOARD
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text default 'general', -- general | exam | holiday | urgent | placement
  target_roles text[] default array['all'], -- ['student','staff','doctor','all']
  posted_by text not null,
  is_pinned boolean default false,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- GRIEVANCES
create table if not exists grievances (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null unique,
  category text not null, -- academic | hostel | canteen | infrastructure | other
  description text not null,
  submitter_id text, -- null if anonymous
  is_anonymous boolean default false,
  status text default 'submitted', -- submitted | in_review | resolved | closed
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- LOST AND FOUND
create table if not exists lost_found (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- lost | found
  item_name text not null,
  description text,
  location_found text,
  date_reported date default current_date,
  reported_by_id text,
  reported_by_name text,
  contact text,
  status text default 'open', -- open | claimed | closed
  image_url text,
  created_at timestamptz default now()
);

-- CANTEEN
create table if not exists canteen_menu (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  category text not null, -- breakfast | lunch | snacks | beverages
  price integer not null,
  is_available boolean default true,
  updated_at timestamptz default now()
);

create table if not exists canteen_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id text not null,
  user_name text not null,
  user_type text not null, -- student | staff | doctor
  items jsonb not null, -- [{item_id, item_name, qty, price}]
  total_amount integer not null,
  token_number integer,
  status text default 'placed', -- placed | preparing | ready | collected | cancelled
  placed_at timestamptz default now(),
  ready_at timestamptz,
  collected_at timestamptz
);

-- FACILITY BOOKING
create table if not exists facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null, -- seminar_hall | sports_court | gym | library_room
  capacity integer,
  location text,
  is_active boolean default true
);

create table if not exists facility_bookings (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references facilities(id),
  booked_by_id text not null,
  booked_by_name text not null,
  user_type text not null,
  booking_date date not null,
  start_time text not null,
  end_time text not null,
  purpose text,
  status text default 'confirmed', -- confirmed | cancelled | completed
  created_at timestamptz default now()
);

-- SPORTS AND FITNESS
create table if not exists fitness_log (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  student_name text not null,
  activity text not null,
  duration_minutes integer not null,
  calories_burned integer,
  logged_date date default current_date,
  created_at timestamptz default now()
);

-- VISITOR MANAGEMENT
create table if not exists visitor_log (
  id uuid primary key default gen_random_uuid(),
  visitor_name text not null,
  visitor_id_type text not null, -- aadhar | pan | passport | driving_license
  visitor_id_number text not null,
  purpose text not null,
  visiting_whom text not null,
  visiting_department text,
  phone text,
  vehicle_number text,
  pass_number text unique,
  entry_time timestamptz default now(),
  exit_time timestamptz,
  status text default 'inside', -- inside | exited
  logged_by text not null -- security guard id
);

-- GATE ENTRY LOG
create table if not exists gate_entry_log (
  id uuid primary key default gen_random_uuid(),
  person_id text not null,
  person_name text not null,
  person_type text not null, -- student | staff | doctor | visitor
  entry_type text not null, -- in | out
  method text default 'qr', -- qr | manual
  gate text default 'main', -- main | side | emergency
  timestamp timestamptz default now(),
  logged_by text
);

-- FACULTY AVAILABILITY
create table if not exists faculty_availability (
  id uuid primary key default gen_random_uuid(),
  faculty_id text not null unique,
  faculty_name text not null,
  department text not null,
  designation text,
  cabin text,
  phone_extension text,
  status text default 'available', -- available | in_opd | in_class | on_leave | not_available
  status_message text,
  updated_at timestamptz default now()
);

-- LEAVE MANAGEMENT
create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  applicant_id text not null,
  applicant_name text not null,
  applicant_type text not null, -- staff | faculty | student
  department text not null,
  leave_type text not null, -- sick | casual | earned | emergency | study
  from_date date not null,
  to_date date not null,
  days_count integer,
  reason text not null,
  status text default 'pending', -- pending | approved | rejected
  reviewed_by text,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- EMERGENCY SOS
create table if not exists sos_alerts (
  id uuid primary key default gen_random_uuid(),
  triggered_by_id text not null,
  triggered_by_name text not null,
  user_type text not null,
  lat double precision,
  lng double precision,
  location_description text,
  message text,
  status text default 'active', -- active | acknowledged | resolved
  acknowledged_by text,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- AMBULANCE
create table if not exists ambulance_position (
  id uuid primary key default gen_random_uuid(),
  ambulance_id text not null unique,
  current_lat double precision not null,
  current_lng double precision not null,
  status text default 'standby', -- standby | dispatched | returning
  dispatched_to text,
  updated_at timestamptz default now()
);

-- CAMPUS ANALYTICS
create table if not exists campus_analytics (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null,
  metric_value integer not null default 0,
  metric_date date default current_date,
  updated_at timestamptz default now(),
  unique(metric_key, metric_date)
);

-- PLACEMENT STATISTICS
create table if not exists placement_stats (
  id uuid primary key default gen_random_uuid(),
  batch_year integer not null,
  students_placed integer default 0,
  companies_visited integer default 0,
  highest_package_lpa decimal(5,2) default 0,
  average_package_lpa decimal(5,2) default 0,
  updated_at timestamptz default now(),
  unique(batch_year)
);

-- UTILITIES MONITORING
create table if not exists utility_readings (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  utility_type text not null, -- electricity | water
  reading_date date default current_date,
  units_consumed decimal(10,2) not null,
  anomaly_flag boolean default false,
  recorded_by text,
  created_at timestamptz default now()
);

-- ALUMNI NETWORK
create table if not exists alumni (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  batch_year integer not null,
  course text not null,
  current_role text,
  organization text,
  city text,
  email text,
  linkedin_url text,
  is_mentor boolean default false,
  created_at timestamptz default now()
);

create table if not exists alumni_jobs (
  id uuid primary key default gen_random_uuid(),
  posted_by_alumni_id uuid references alumni(id),
  job_title text not null,
  organization text not null,
  location text,
  description text,
  apply_link text,
  expires_at date,
  created_at timestamptz default now()
);

-- DIGITAL STUDENT ID
create table if not exists student_ids (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  student_name text not null,
  department text not null,
  batch text not null,
  roll_number text not null,
  photo_url text,
  qr_data text not null, -- encrypted string that encodes student_id + expiry
  valid_from date not null,
  valid_until date not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

After creating all tables, run this to seed parking slots:
```sql
do $$
begin
  for i in 1..16 loop
    insert into parking_slots (slot_number, slot_label, zone) values (i, 'A-' || lpad(i::text, 2, '0'), 'A') on conflict do nothing;
  end loop;
  for i in 17..32 loop
    insert into parking_slots (slot_number, slot_label, zone) values (i, 'B-' || lpad((i-16)::text, 2, '0'), 'B') on conflict do nothing;
  end loop;
  for i in 33..48 loop
    insert into parking_slots (slot_number, slot_label, zone) values (i, 'C-' || lpad((i-32)::text, 2, '0'), 'C') on conflict do nothing;
  end loop;
end $$;
```

Seed bus routes for Bangalore:
```sql
insert into bus_routes (id, route_name, stops) values
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Route 1 — North Bangalore',
  '[
    {"name":"RRDCH Campus","lat":12.9082,"lng":77.5026,"order":1},
    {"name":"Girinagar","lat":12.9206,"lng":77.5355,"order":2},
    {"name":"Sheshadripura","lat":12.9719,"lng":77.5554,"order":3},
    {"name":"Majestic","lat":12.9780,"lng":77.5708,"order":4},
    {"name":"KR Market","lat":12.9634,"lng":77.5760,"order":5},
    {"name":"Hebbal","lat":13.0352,"lng":77.5970,"order":6}
  ]'::jsonb
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Route 2 — West Bangalore',
  '[
    {"name":"RRDCH Campus","lat":12.9082,"lng":77.5026,"order":1},
    {"name":"Girinagar","lat":12.9206,"lng":77.5355,"order":2},
    {"name":"Yeshwanthpura","lat":13.0218,"lng":77.5482,"order":3},
    {"name":"Rajajinagar","lat":12.9928,"lng":77.5542,"order":4},
    {"name":"Vijayanagar","lat":12.9716,"lng":77.5345,"order":5}
  ]'::jsonb
)
on conflict do nothing;
```

Enable realtime on all tables by running:
```sql
alter publication supabase_realtime add table bus_position;
alter publication supabase_realtime add table parking_slots;
alter publication supabase_realtime add table dental_chairs;
alter publication supabase_realtime add table opd_queue;
alter publication supabase_realtime add table attendance_sessions;
alter publication supabase_realtime add table attendance_records;
alter publication supabase_realtime add table marks_records;
alter publication supabase_realtime add table timetable;
alter publication supabase_realtime add table notices;
alter publication supabase_realtime add table grievances;
alter publication supabase_realtime add table lost_found;
alter publication supabase_realtime add table canteen_orders;
alter publication supabase_realtime add table canteen_menu;
alter publication supabase_realtime add table facility_bookings;
alter publication supabase_realtime add table fitness_log;
alter publication supabase_realtime add table visitor_log;
alter publication supabase_realtime add table gate_entry_log;
alter publication supabase_realtime add table faculty_availability;
alter publication supabase_realtime add table leave_requests;
alter publication supabase_realtime add table sos_alerts;
alter publication supabase_realtime add table ambulance_position;
alter publication supabase_realtime add table campus_analytics;
alter publication supabase_realtime add table placement_stats;
alter publication supabase_realtime add table utility_readings;
```

---

## FEATURE 1 — COLLEGE BUS TRACKING SYSTEM

Create file: `bus-tracking.html`

Purpose: Students and staff registered for transport see live bus location on a map. Admin and the bus guard can update the bus position. Non-registered users see a registration prompt instead of the map.

Access: transport_registrations table is checked on load. If user's id is not in transport_registrations, show registration form. After admin approves, user sees the map.

UI layout: Full-screen with a left sidebar (260px) listing routes and stop ETAs, and a right main area showing the Leaflet.js map. At top, show bus status badge (On Route / At Stop / Delayed) with a pulsing green dot animation.

Map implementation: Use Leaflet.js from CDN `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` and its CSS. Initialize map centered on Bangalore (12.9716, 77.5946). Draw the route polyline from the stops array in bus_routes. Place a custom animated bus marker (SVG icon, not default pin) at current_lat, current_lng from bus_position. Add stop markers for each stop in the route.

Bus simulation: Since GPS hardware is not available, implement a simulation mode. In simulation mode, the bus marker moves automatically along the polyline at a speed of approximately 40 km/h. Calculate intermediate coordinates between stops using linear interpolation. Every 3 seconds, update current_lat and current_lng in Supabase bus_position. Admin can toggle simulation on/off from admin-portal.html.

Simulation formula:
```javascript
function interpolate(lat1, lng1, lat2, lng2, fraction) {
  return {
    lat: lat1 + (lat2 - lat1) * fraction,
    lng: lng1 + (lng2 - lng1) * fraction
  };
}
```

ETA calculation: Calculate distance from current bus position to each upcoming stop using Haversine formula. Divide by average speed (40 km/h) to get ETA in minutes. Display as "ETA: 4 min" next to each stop name in the sidebar.

Haversine:
```javascript
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
```

Real-time subscription on this page:
```javascript
window.sb.channel('bus-live')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bus_position' }, (payload) => {
    const { current_lat, current_lng, status, current_stop_index } = payload.new;
    busMarker.setLatLng([current_lat, current_lng]);
    updateStatusBadge(status);
    updateETAs(current_lat, current_lng, current_stop_index);
  })
  .subscribe();
```

Bus guard portal: Separate section within bus-tracking.html gated by role check `rrdch_user_role === 'guard'`. Shows a simple form: dropdown for current stop, status selector, and a submit button. On submit, upsert bus_position with new lat/lng and status.

Add link to bus-tracking.html in students.html sidebar nav, staff section of admin-portal.html, and public-shell.js nav.

---

## FEATURE 2 — SMART PARKING MANAGEMENT PORTAL

Create file: `parking.html`

Purpose: Security guards mark parking slots as occupied or free by clicking on an animated grid. Students and staff see the live count and zone availability.

UI layout: Top section shows three stat cards — Total Slots (48), Available (live count, green), Occupied (live count, red). Below that, three zone grids labelled Zone A, Zone B, Zone C, each with 16 slots arranged in a 4x4 grid.

Each slot is a square card (80px x 80px) with the slot label (A-01 etc.) centred. Color states:
- Free: background #dcfce7, border #16a34a, text #15803d
- Occupied: background #fee2e2, border #dc2626, text #991b1b
- Hover (guard only): show a cursor pointer and slight scale transform

Guard interaction: When logged in as security role, each slot card is clickable. On click, if free, show a modal asking for vehicle number (text input) and confirm. On confirm, update parking_slots set status='occupied', vehicle_number=input, occupied_by=guard_id, occupied_at=now(), updated_at=now(). If occupied, clicking shows a modal to confirm release. On confirm, update parking_slots set status='free', vehicle_number=null, occupied_by=null, occupied_at=null.

Student and staff view: Slots are not clickable. They only see the color state and the count cards.

Animated entry: When a slot transitions from free to occupied, play a CSS animation — the card scales down to 0.95 and color transitions over 400ms. When released, reverse animation plays.

Real-time subscription on this page:
```javascript
window.sb.channel('parking-live')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parking_slots' }, (payload) => {
    const { slot_number, status } = payload.new;
    const slotEl = document.getElementById(`slot-${slot_number}`);
    if (slotEl) {
      slotEl.dataset.status = status;
      applySlotStyle(slotEl, status);
      updateCounts();
    }
  })
  .subscribe();
```

Real-time reflection in admin-portal.html: Add a parking summary widget to the admin dashboard overview section. This widget shows the same count cards (Available, Occupied, Total) and subscribes to the same parking-live channel. No grid needed in admin — just the counts.

Real-time reflection in students.html: Add a parking availability widget in the student dashboard. Shows only counts and a link to parking.html for the full grid.

Add parking.html to the public-shell.js nav under Campus Services.

---

## FEATURE 3 — LIVE OPD QUEUE DISPLAY

This feature partially exists via opd_queue table. Enhance it.

Modifications to patients.html: The existing token display should already read from opd_queue. If not already subscribed, add this channel:
```javascript
window.sb.channel('opd-queue-live')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'opd_queue' }, () => loadQueue())
  .subscribe();
```

Create file: `opd-display.html` — a public screen meant to be shown on a wall-mounted TV in the OPD waiting area. No login required for this page.

UI: Dark background (#0f2d52). Large font. Department name at top. A scrolling list of token numbers with patient names (first name + last initial only for privacy) and their status. Status colors: Waiting = amber, Being Attended = green, Done = muted gray. Auto-refreshes via realtime subscription every time opd_queue changes. Smooth CSS transition when a row changes status.

Real-time in doctor-portal.html: The doctor calls the next token by clicking a "Call Next" button. This updates the topmost waiting record in opd_queue to status 'being_attended' and sets the previous one to 'done'. The change propagates to opd-display.html and patients.html in real-time.

Real-time in admin-portal.html: Add a live patient count widget on the overview page showing: Waiting now, Under treatment, Completed today. These counts re-query opd_queue on every postgres_changes event from the opd-queue-live channel.

---

## FEATURE 4 — DENTAL CHAIR TRACKER

Create file: `chair-tracker.html`

Purpose: Shows all dental chairs across departments. Staff mark chairs as occupied when a patient is seated. Doctors and admin see live occupancy.

UI: A floor map layout. Group chairs by department (Oral Surgery, Orthodontics, Conservative Dentistry, Periodontology, Pedodontics, Implantology, General Dentistry). Each group is a card with the department name as heading. Inside each card, chairs are displayed in a row as rounded rectangles (120px x 70px) resembling a dental chair icon built from CSS shapes. A headrest curve at the top, body rectangle below.

Chair status colors:
- Free: #dcfce7 fill, #16a34a border
- Occupied: #fee2e2 fill, #dc2626 border, shows patient token number
- Cleaning: #fef9c3 fill, #ca8a04 border, shows "Cleaning" label
- Reserved: #ede9fe fill, #7c3aed border

Staff/doctor interaction: Clicking a free chair opens a modal. Enter patient token number and select the doctor. Submit updates dental_chairs. Clicking an occupied chair offers options: Mark Cleaning, Mark Free.

Real-time subscription:
```javascript
window.sb.channel('chairs-live')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'dental_chairs' }, (payload) => {
    const { chair_number, status, patient_token } = payload.new;
    updateChairUI(chair_number, status, patient_token);
  })
  .subscribe();
```

Real-time in admin-portal.html: Add a chair occupancy overview widget. Shows a compact version of the grid with just colored squares and total counts per department.

Real-time in doctor-portal.html: Doctor sees only chairs in their own department. When a chair in their department is assigned to them (doctor_id matches), it highlights with a blue border.

---

## FEATURE 5 — QR ATTENDANCE SYSTEM

Create two sections:
- Faculty section within a new file `faculty-portal.html`
- Student attendance scanner section within students.html

Faculty flow in faculty-portal.html:
Faculty logs in with their faculty_id and password (Supabase auth). After login, they see a dashboard with a "Generate Attendance QR" button. On click, a unique QR code is generated using the `qrcode` library from CDN `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`. The QR encodes a JSON string `{"session_id":"uuid","subject":"text","valid_until":"iso_string"}`. The session is valid for 10 minutes by default (faculty can set 5, 10, or 15 minutes). The QR is inserted into attendance_sessions. Display the QR at 300x300px with session details below. Auto-expire visually using a countdown timer. On expiry, QR grays out and shows "Session Expired".

Real-time in faculty-portal.html: As students scan, their names appear in a live list below the QR in real time using:
```javascript
window.sb.channel(`attendance-session-${sessionId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_records', filter: `session_id=eq.${sessionId}` }, (payload) => {
    appendStudentToList(payload.new.student_name);
    updateCount();
  })
  .subscribe();
```

Student flow in students.html: Add a "Mark Attendance" section in the student sidebar. On opening, camera access is requested using `navigator.mediaDevices.getUserMedia`. Use `jsQR` library from CDN `https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js` to decode QR from camera feed. On successful decode, validate session_id against attendance_sessions (check valid_until > now()). If valid, insert into attendance_records. Show success animation (green checkmark with scale-in animation). If already scanned, show "Already marked" in amber. If expired, show "QR has expired" in red.

Attendance history section in students.html: A table showing subject, date, status (present/absent) for all sessions of the current semester. Query attendance_records joined with attendance_sessions filtered by student_id.

Real-time in admin-portal.html: Attendance overview widget showing department-wise attendance percentage for today. Subscribes to attendance_records channel and recalculates on each insert.

---

## FEATURE 6 — INTERNAL MARKS PORTAL

Add a section to faculty-portal.html and students.html.

Faculty section: A table showing all students in the faculty's department and batch. For each student and each subject the faculty handles, editable cells for CIA1 (max 25), CIA2 (max 25), Assignment (max 10), Practical (max 40). Total column is auto-calculated as a read-only sum. On clicking a cell, it becomes an input. On blur, it saves to marks_records via upsert. Show a toast notification "Saved" on successful write.

Real-time in students.html: Add a "My Marks" section. Load marks_records where student_id = current user. Show a card for each subject with a visual bar showing percentage. Subscribe to:
```javascript
window.sb.channel('my-marks')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'marks_records', filter: `student_id=eq.${studentId}` }, () => loadMarks())
  .subscribe();
```
When a faculty updates a mark, the student's portal updates in real-time with an animation — the bar width transitions smoothly to the new value using CSS transition `width 0.6s ease`.

---

## FEATURE 7 — TIMETABLE MANAGER

Add section to faculty-portal.html (edit view) and students.html (read view).

Admin/faculty edit in faculty-portal.html: A 6-column (Mon–Sat) x 8-row (periods 1–8) grid. Each cell is clickable and opens a modal to set subject, faculty, and room. On save, upsert into timetable table. Updated_at is written.

Student view in students.html: Pull timetable for student's department and batch. Display same 6x8 grid read-only. Current period highlighted with a blue background. Current day column has a subtle left border accent.

Real-time subscription in students.html:
```javascript
window.sb.channel('timetable-live')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable', filter: `department=eq.${dept}&batch=eq.${batch}` }, () => loadTimetable())
  .subscribe();
```
When admin updates the timetable, every student with that department/batch sees the change instantly.

---

## FEATURE 8 — EXAM SEATING ARRANGEMENT

Add section to admin-portal.html (create/edit) and students.html (view own seat).

Admin section: Form to upload a CSV or enter manually — exam_name, exam_date, hall_name, seat_number, student_id, student_name, department. Bulk insert into exam_seating. After upload, show an animated hall layout: a grid of seat cards (same theater-seat style as parking) with student roll number shown in each. Seats are color-coded by department.

Student section in students.html: Show a card with "Your Seat for [exam_name] on [exam_date]: Hall [hall_name], Seat [seat_number]". Include a visual of the hall grid with the student's seat highlighted in gold (#c39c5b).

No real-time subscription needed for exam seating (changes are pre-exam batch updates). Use a polling fallback: load on page focus.

---

## FEATURE 9 — LIVE DIGITAL NOTICE BOARD

Create file: `notices.html` for the public-facing notice board.

Add notice posting section to admin-portal.html.

Admin creates a notice: title (text, 100 chars max), body (textarea), category (general/exam/holiday/urgent/placement dropdown), target_roles (checkboxes: all, student, staff, doctor), is_pinned toggle, expires_at date picker. On submit, insert into notices. Pinned notices have is_pinned=true and appear at top always.

notices.html: Public page accessible without login. Shows a grid of notice cards sorted by is_pinned DESC, created_at DESC. Urgent category cards have a red left border. Exam cards have amber. Placement cards have blue. Holiday cards have green.

Real-time in notices.html:
```javascript
window.sb.channel('notices-live')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notices' }, (payload) => {
    prependNoticeCard(payload.new);
    showNewNoticePulse();
  })
  .subscribe();
```
When a new notice is posted, it slides in from the top of the list with a CSS animation `translateY(-20px) to translateY(0)` over 500ms.

Real-time notification badge: In students.html, doctor-portal.html, and admin-portal.html sidebars, show a notification badge count for unread notices. Store last-seen timestamp in localStorage as `rrdch_notices_seen`. On each INSERT event, increment the badge. Clicking the notices nav item sets rrdch_notices_seen to current timestamp and clears the badge.

---

## FEATURE 10 — GRIEVANCE PORTAL

Add a "Submit Grievance" section to students.html and a "Grievances" section to admin-portal.html.

Student submission: A form with category dropdown, description textarea (minimum 30 characters), and an anonymous toggle. If anonymous is off, submitter_id is set to the student's id. If anonymous is on, submitter_id is null. Generate ticket_id as `GRV-${year}-${random 4-digit number}`. On submit, show the ticket_id to the student prominently in a styled card. Store ticket_id in localStorage as `rrdch_grievances` array so the student can track it without login.

Student tracking: Below the submission form, show a "Track My Grievances" section. Load all grievances where submitter_id = student_id (for non-anonymous). Show status as a stepper: Submitted (step 1) → In Review (step 2) → Resolved (step 3). Each step has a circle that fills with color when active.

Real-time in students.html:
```javascript
window.sb.channel('grievance-updates')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'grievances', filter: `submitter_id=eq.${studentId}` }, (payload) => {
    updateGrievanceStatus(payload.new.ticket_id, payload.new.status);
  })
  .subscribe();
```

Admin section in admin-portal.html: A table listing all grievances with ticket_id, category, submitted_at, status. Admin can click a row to open a slide-in panel (right side drawer) with full description and a status updater dropdown and admin_notes textarea. On save, update grievances table. The student's portal updates status in real-time.

---

## FEATURE 11 — LOST AND FOUND BOARD

Create file: `lost-found.html`

No login required to view. Login required to post.

UI: Two tab sections at top — "Lost Items" and "Found Items". Each section shows a card grid. Each card shows: item name, description, location, date, status badge. For found items, contact info is shown after login.

Posting form: Accessible to logged-in students/staff. Radio buttons for Lost or Found. Item name, description, location, date, contact (phone or college email). Optional image upload — upload to Supabase Storage bucket named `lost-found-images`, store public URL in image_url column.

Real-time subscription:
```javascript
window.sb.channel('lost-found-live')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lost_found' }, (payload) => {
    prependItemCard(payload.new);
  })
  .subscribe();
```

Claiming: Logged-in user can click "This is Mine" on a found item. This sends a notification (inserts a notice record with category 'general' targeting the poster's id). Admin can mark item as claimed which sets status to 'claimed' and grays out the card.

Add link in students.html sidebar and public-shell.js nav.

---

## FEATURE 12 — CANTEEN PRE-ORDER SYSTEM

Create file: `canteen.html`

Separate portal for canteen staff: section within canteen.html gated by role check.

Menu section: Canteen staff maintain the menu in canteen_menu table. They can toggle item availability (is_available) with a single click. Unavailable items appear grayed out for users.

User ordering flow:
1. User opens canteen.html and sees menu cards grouped by category (Breakfast, Lunch, Snacks, Beverages).
2. Each card has item name, price (Rs.), and an Add/Remove button with a quantity counter.
3. A floating cart summary at bottom shows item count and total.
4. On tapping "Place Order", generate order_id as `ORD-${timestamp}`, assign token_number as count of today's orders + 1.
5. Insert into canteen_orders with status 'placed'.
6. Show a confirmation screen with token_number in large font.

Canteen staff view: A live order queue. Orders come in real-time:
```javascript
window.sb.channel('canteen-orders-live')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'canteen_orders' }, (payload) => {
    addOrderToQueue(payload.new);
    playOrderChime(); // Web Audio API: short 800Hz tone for 200ms
  })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'canteen_orders' }, (payload) => {
    updateOrderCard(payload.new);
  })
  .subscribe();
```

Staff clicks "Preparing" on each order card, then "Ready". When marked ready, the user's canteen.html (if still open) shows a notification: "Your order [order_id] is ready for collection — Token [token_number]". This is done via the same realtime subscription on canteen_orders filtered by user_id.

Real-time in students.html: Add a canteen widget showing today's menu highlights and a "Order Now" link. Widget shows current estimated wait time (count of 'preparing' orders x 2 minutes).

---

## FEATURE 13 — FACILITY SLOT BOOKING

Add section to students.html and staff section of admin-portal.html.

UI: A calendar widget at top (build with vanilla JS — a month grid with day cells). Each day is clickable. On clicking a day, a panel slides in showing all facilities with their time slots for that day. Slots that are already booked are shown in red. Available slots are shown in green and are clickable.

Booking flow: User selects facility, date, start time, end time, enters purpose. On submit, first check if there is an overlapping booking by querying:
```javascript
const { data } = await window.sb.from('facility_bookings')
  .select('id')
  .eq('facility_id', facilityId)
  .eq('booking_date', date)
  .eq('status', 'confirmed')
  .lt('start_time', endTime)
  .gt('end_time', startTime);
if (data.length > 0) { showError('Slot already booked'); return; }
```
If no conflict, insert booking. Show confirmation with booking reference.

Real-time: When a booking is made, all users viewing the same facility's calendar for that day see the slot turn red immediately:
```javascript
window.sb.channel('bookings-live')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'facility_bookings' }, () => {
    if (currentViewDate && currentViewFacility) reloadSlots(currentViewFacility, currentViewDate);
  })
  .subscribe();
```

---

## FEATURE 14 — SPORTS AND FITNESS TRACKER

Add section to students.html.

Log activity form: Dropdown of activities (Cricket, Football, Basketball, Badminton, Gym - Cardio, Gym - Weights, Running, Swimming, Yoga, Kabaddi). Duration in minutes slider (5 to 180). Auto-calculate calories_burned using a lookup table (e.g., Gym = 7 cal/min, Running = 9 cal/min, Yoga = 3 cal/min). On submit, insert into fitness_log.

Personal stats: Show total minutes this week, total calories this month, streak (consecutive days with at least one log entry), and a sparkline of activity over the last 14 days (build with SVG — a simple path drawing through daily total points).

Campus leaderboard: A separate public leaderboard card. Query fitness_log grouped by student_id, sum duration_minutes for current month, join with student name, order by total descending, show top 10. Label it "Most Active Students — [Month Year]".

Real-time:
```javascript
window.sb.channel('fitness-live')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fitness_log' }, () => {
    reloadLeaderboard();
  })
  .subscribe();
```

---

## FEATURE 15 — SMART VISITOR MANAGEMENT

Add section to a new file `security-portal.html` gated by security role.

Also add a visitor log view to admin-portal.html.

Guard interface in security-portal.html: A clean form on the left half of the screen. Fields: Visitor Name, ID Type (dropdown), ID Number, Purpose, Visiting Whom (text), Department (dropdown), Phone, Vehicle Number (optional). On submit, generate pass_number as `VP-${date}-${4-digit-seq}`, insert into visitor_log. On successful insert, display a printable pass card on the right half of the screen. The pass card shows pass_number in large font, visitor name, visiting whom, date and time, and a barcode placeholder (CSS rectangle with lines).

Visitor exit: Guard can search by pass_number or visitor name in a search bar. Matching record appears as a card. Guard clicks "Mark Exit" which sets exit_time=now() and status='exited'.

Real-time in admin-portal.html: Add a "Currently Inside" widget showing count of records where status='inside'. Live count updates on every INSERT/UPDATE to visitor_log:
```javascript
window.sb.channel('visitor-live')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_log' }, () => updateVisitorCount())
  .subscribe();
```

---

## FEATURE 16 — GATE ENTRY LOG

Add section to security-portal.html.

Guard manually logs entries/exits when QR scan is not possible. Form fields: Person type (student/staff/doctor/visitor), Person ID (text), Person Name (text), Entry Type (In/Out radio), Method (QR/Manual radio), Gate (Main/Side dropdown). On submit, insert into gate_entry_log.

QR scan gate: Also implement QR scanning mode in security-portal.html using the same jsQR library. Student shows their digital ID QR, guard scans it, student_id and name auto-populate, guard just picks In/Out and submits.

Real-time log feed in security-portal.html: A live scrolling feed on the right half of the screen. Each new entry appears at the top with a slide-down animation. Shows time, name, person type, and IN/OUT badge (green for in, red for out). Subscribed to gate_entry_log INSERT events.

Real-time in admin-portal.html: Add a today's gate activity widget. Shows total entries in (green count) and exits (red count) today. Recalculates on each realtime event.

---

## FEATURE 17 — FACULTY AVAILABILITY BOARD

Create file: `faculty-availability.html` — public, no login required.

Also add self-update section to faculty-portal.html.

Faculty self-update in faculty-portal.html: At the top of the faculty dashboard, a prominent status card with the faculty's name and a status selector. Options: Available (green), In OPD (blue), In Class (amber), On Leave (red), Not Available (gray). Optional status message (e.g., "Back at 3 PM"). On selecting, update faculty_availability table for their faculty_id.

Public board in faculty-availability.html: Cards for all faculty members, grouped by department. Each card shows: photo placeholder (initials avatar), name, designation, department, cabin number, phone extension, status dot with label. Status dot pulses with CSS animation when status is 'available'. Cards sorted by department, then by name.

Real-time:
```javascript
window.sb.channel('faculty-status')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'faculty_availability' }, (payload) => {
    updateFacultyCard(payload.new.faculty_id, payload.new.status, payload.new.status_message);
  })
  .subscribe();
```

When a faculty updates their status, every person viewing faculty-availability.html sees the status dot change and color transition in real-time.

Real-time in students.html: Add a "Find My Faculty" quick widget. Dropdown of departments. On select, shows the faculty of that department and their current live status.

---

## FEATURE 18 — LEAVE MANAGEMENT

Add leave section to faculty-portal.html (apply + view own status), students.html (apply + view own), and admin-portal.html (HOD approval view).

Leave application form: leave_type dropdown, from_date and to_date date pickers, days_count auto-calculated, reason textarea. On submit, insert into leave_requests with status 'pending'. Show a reference number to the applicant.

Real-time for applicant: Subscribe to leave_requests filtered by applicant_id:
```javascript
window.sb.channel(`leave-${applicantId}`)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leave_requests', filter: `applicant_id=eq.${applicantId}` }, (payload) => {
    updateLeaveStatus(payload.new.id, payload.new.status, payload.new.review_notes);
  })
  .subscribe();
```

When admin approves/rejects, the applicant sees the status change from "Pending" to "Approved"/"Rejected" with a color transition in real-time. Approved = green stepper completes. Rejected = red badge appears with admin notes.

Admin HOD view in admin-portal.html: A pending leaves table with applicant name, type, dates, reason. Two action buttons per row: Approve (green) and Reject (red). Reject opens a modal for review_notes. On either action, update leave_requests with status, reviewed_by, review_notes, reviewed_at.

Integration with timetable: When a faculty leave is approved, check if they have classes during those dates in the timetable table. If yes, show a warning toast: "Faculty has [n] classes during this period. Timetable adjustment needed."

---

## FEATURE 19 — EMERGENCY SOS BUTTON

Add to students.html, faculty-portal.html, and doctor-portal.html.

A fixed-position button at the bottom-right of the screen (below the main content area). The button is circular, 60px diameter, with a red background and a siren icon (Lucide `siren` icon). On hover, it expands slightly with box-shadow.

On click, first show a confirmation dialog: "Send Emergency Alert? Security and Admin will be notified immediately." Two buttons: Cancel and Send Alert. On confirm:
1. Get GPS coordinates via `navigator.geolocation.getCurrentPosition`. If denied, use null.
2. Insert into sos_alerts with triggered_by_id, triggered_by_name, user_type, lat, lng, status='active'.
3. Show a pulsing red overlay across the page with message "Alert Sent. Help is on the way. Stay where you are." Overlay has a dismiss button.

Real-time in security-portal.html and admin-portal.html: A fullscreen alert overlay appears when a new SOS is received:
```javascript
window.sb.channel('sos-alerts')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, (payload) => {
    showSOSAlert(payload.new);
    playSOSSound(); // Web Audio API: repeating 1200Hz beep
  })
  .subscribe();
```

The SOS overlay in admin/security portals shows: who triggered it, their type, timestamp, and a link to Google Maps if lat/lng is available `https://maps.google.com/?q=${lat},${lng}`. Two buttons: Acknowledge (sets status to 'acknowledged') and Resolve (sets to 'resolved'). When acknowledged or resolved, the overlay in the triggering user's portal also updates.

Real-time chain: admin acknowledges → sos_alerts status becomes 'acknowledged' → the triggering student's overlay updates to show "Help acknowledged. Security is responding."

---

## FEATURE 20 — AMBULANCE TRACKER

Add section to security-portal.html for dispatch control and to patients.html for public view.

Security dispatch in security-portal.html: Shows ambulance current status (Standby/Dispatched/Returning). A "Dispatch" button with a destination text field. On dispatch, update ambulance_position set status='dispatched', dispatched_to=destination. A "Back to Base" button sets status='returning'. A "Standby" button sets status='standby'.

Same Leaflet.js map as bus tracking. Add an ambulance marker (use a red cross SVG icon). Marker shows at current_lat, current_lng. When status is 'dispatched', marker pulses with a CSS keyframe animation (opacity 0.6 to 1.0 repeating).

Simulation: When dispatched, animate the ambulance marker moving toward a fixed "hospital base" coordinate (13.0120, 77.5010 as example) over 30 seconds using the same interpolation function from bus tracking.

Real-time in patients.html and public view:
```javascript
window.sb.channel('ambulance-live')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ambulance_position' }, (payload) => {
    ambulanceMarker.setLatLng([payload.new.current_lat, payload.new.current_lng]);
    updateAmbulanceStatus(payload.new.status);
  })
  .subscribe();
```

---

## FEATURE 21 — CAMPUS ANALYTICS DASHBOARD

Enhance admin-portal.html overview section.

Build a dedicated analytics section within admin-portal.html (add to sidebar nav as "Analytics").

Metrics to display, all sourced from live Supabase queries:
- Daily OPD patients: count of opd_queue where date(created_at)=today
- Attendance today: avg of records in attendance_records today vs registered students
- Parking occupancy: count of parking_slots where status='occupied' / 48 * 100 as percentage
- Active canteen orders: count of canteen_orders where status in ('placed','preparing')
- Faculty available now: count of faculty_availability where status='available'
- Visitors inside: count of visitor_log where status='inside'
- SOS alerts today: count of sos_alerts where date(created_at)=today

UI: A 3-column grid of metric cards (each 200px tall). Each card has a large number, a label, a trend arrow (up/down compared to yesterday using campus_analytics table), and a color-coded background (green for good, amber for neutral, red for alert thresholds).

Bar chart for weekly OPD count: Build with SVG directly — no chart library required. Fetch last 7 days of opd_queue grouped by date. Render as a bar chart with 7 bars, x-axis labels for day names, y-axis showing patient count. Bars animate height from 0 to final value on load using CSS transition.

Line chart for attendance trend: Same SVG approach. Fetch last 14 days of attendance records. Render a connected line path. Use SVG `<path>` with cubic bezier for smooth curve.

All charts re-render when the underlying tables receive realtime events. Subscribe to opd_queue, attendance_records, parking_slots, canteen_orders channels. On each event, call a debounced reload function (300ms debounce) to avoid excessive re-renders.

---

## FEATURE 22 — PLACEMENT STATISTICS BOARD

Create file: `placements.html` — public-facing, no login required.

Add placement data management section to admin-portal.html.

Admin section: A simple form with batch_year, students_placed, companies_visited, highest_package_lpa, average_package_lpa. On submit, upsert into placement_stats.

placements.html public page: Large animated counters for the current year's stats. Use a count-up animation on page load — numbers increment from 0 to final value over 2 seconds using requestAnimationFrame. Show all batch years in a timeline below. Each year is a row showing batch year, placed count, companies, and packages.

Add a "Companies That Visited" logo wall (text-based cards with company name since logos may not be available). Admin can add company names via a simple insert.

Real-time: Subscribe to placement_stats INSERT/UPDATE. When admin updates a stat, the public page counter animates to the new value:
```javascript
window.sb.channel('placement-live')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'placement_stats' }, () => loadAndAnimateStats())
  .subscribe();
```

Add link to placements.html in public-shell.js nav under the main college navigation.

---

## FEATURE 23 — ELECTRICITY AND WATER USAGE MONITOR

Add section to admin-portal.html.

Data entry section: Security or admin can log daily readings. Form: department dropdown (all departments), utility_type radio (Electricity/Water), reading_date (default today), units_consumed number input, recorded_by auto-filled from session. On submit, insert into utility_readings. If today's reading for that department and utility is already entered, show a warning and allow update.

Anomaly detection: When inserting, compare units_consumed with the average of last 7 days for the same department and utility. If more than 150% of average, set anomaly_flag=true and show a red alert in admin-portal.html.

Dashboard view: A heatmap grid — departments on rows, last 30 days as columns. Cell color intensity corresponds to consumption level (light green = low, dark red = high). Build with CSS background-color set via inline style per cell. Anomaly cells have a red dot overlay.

Real-time: Subscribe to utility_readings. When a new reading is entered, the heatmap cell for that department and date updates immediately without page reload.

---

## FEATURE 24 — AI DENTAL ASSISTANT CHATBOT

The existing js/ai.js file and Gemini API key are already in the codebase. Enhance the existing chatbot.

Add the chatbot widget to all pages via public-shell.js. It is currently on some pages. Ensure it is injected by public-shell.js so it appears consistently on every page.

Chatbot system prompt to pass to Gemini API (set as a context variable in js/ai.js):
"You are RRDCH Assistant, the official AI assistant for Rajarajeshwari Dental College and Hospital, Bangalore. You help patients understand dental treatments, suggest which department to visit based on symptoms, explain procedures, answer FAQs about appointments and timing, and provide general oral health advice. You also help students with information about college services, fee payment, admissions, and general academic guidance. Always be professional, precise, and helpful. Do not discuss topics unrelated to the college or dental health. If asked about live data like OPD queue status, parking, or bus location, tell the user to check the relevant portal."

Symptom-to-department routing: Add a lookup map in ai.js:
```javascript
const SYMPTOM_DEPT_MAP = {
  'toothache': 'Conservative Dentistry & Endodontics',
  'cavity': 'Conservative Dentistry & Endodontics',
  'root canal': 'Conservative Dentistry & Endodontics',
  'braces': 'Orthodontics & Dentofacial Orthopedics',
  'alignment': 'Orthodontics & Dentofacial Orthopedics',
  'gum bleeding': 'Periodontology',
  'gum pain': 'Periodontology',
  'extraction': 'Oral & Maxillofacial Surgery',
  'wisdom tooth': 'Oral & Maxillofacial Surgery',
  'jaw pain': 'Oral & Maxillofacial Surgery',
  'child teeth': 'Pedodontics',
  'milk teeth': 'Pedodontics',
  'implant': 'Implantology',
  'missing tooth': 'Implantology'
};
```

Before sending to Gemini, check if the user message contains any symptom keyword. If yes, prepend a context hint to the Gemini prompt: "Note: the patient mentions symptoms related to [department]. Guide them accordingly."

Chat history persistence: Store last 20 messages in localStorage as `rrdch_chat_history` JSON array. Load on chatbot open. Show a "Clear History" button in the chatbot header.

---

## FEATURE 25 — VIRTUAL CAMPUS TOUR

Create file: `campus-tour.html`

UI: A full-width SVG-based interactive campus map. The campus layout is drawn as a simplified floor plan using SVG rectangles and polygons. Each building is a labeled rectangle. Buildings to include:
- Main Academic Block
- OPD Block
- Clinical Labs
- Library
- Canteen
- Auditorium / Seminar Hall
- Administrative Block
- Parking Area
- Sports Ground

Each building rectangle is clickable. On hover, the building highlights (fill changes to #c39c5b gold with 0.3 opacity). On click, an information panel slides in from the right (320px wide panel). The panel shows: building name, departments inside, floors, key facilities, and a photo placeholder. Each panel has a "Get Directions" link to Google Maps using the college address.

Path highlighting: When a building is selected, a dashed path line animates from a "You Are Here" marker (main gate) to the selected building using SVG `stroke-dasharray` and `stroke-dashoffset` animation.

No real-time needed for this feature.

Add link in public-shell.js nav and on the index.html hero section.

---

## FEATURE 26 — ALUMNI NETWORK PORTAL

Create file: `alumni.html`

Public view: A searchable directory of alumni. Search by name, batch year, or company. Results show as cards: name, batch year, current role, organization, city. If is_mentor=true, show a "Mentor" badge on the card.

Job board tab: Shows alumni_jobs records. Each job card has title, organization, location, posted by (alumni name), and "Apply" link. Filter by city and specialization.

Alumni registration: A public form at bottom of alumni.html. Fields: name, batch_year, course (BDS/MDS/Intern), current_role, organization, city, email, LinkedIn URL, is_mentor checkbox. On submit, insert into alumni table with a pending flag (add `is_approved boolean default false` column). Admin approves in admin-portal.html before the entry is publicly visible.

Real-time: Subscribe to alumni_jobs INSERT. When a new job is posted, a toast notification appears at top of alumni.html: "New job posted by [alumni name] at [organization]."

Real-time in students.html: Add an alumni widget showing the latest 3 job postings from alumni. Subscribe to alumni_jobs channel. On INSERT, update the widget with the newest posting with a slide-in animation.

---

## DIGITAL STUDENT ID CARD

Add section to students.html.

On loading student portal, check if student has a record in student_ids where student_id matches and is_active=true and valid_until >= today.

If record exists: Show a beautifully styled digital ID card (350px x 220px). Card design mirrors a physical college ID. Blue gradient background (#1c4578 to #0f2d52). Top: RRDCH logo placeholder (initials) + college name in gold. Middle: student photo (circle placeholder with initials avatar), name in white, roll number, department. Bottom: valid_until date in small text. A QR code is generated client-side using qrcode.js library from the qr_data column value. QR is shown at bottom-right of the card (80x80px).

ID card is downloadable: A "Download ID" button uses the Canvas API to render the card and trigger download as PNG. Use html2canvas from CDN `https://html2canvas.hertzen.com/dist/html2canvas.min.js`.

QR scan at gate: The security portal's QR scanner reads the qr_data from the QR. Decode it (it is base64-encoded JSON with student_id and valid_until). If valid_until >= today, autofill gate entry form.

Admin creates IDs: In admin-portal.html, a bulk ID generation section. Admin can select a department and batch, and click "Generate IDs for All". This queries students, creates a qr_data as `btoa(JSON.stringify({student_id, valid_until, college:'RRDCH'}))` for each, and inserts into student_ids. Progress bar shows insertion progress.

---

## SECURITY-PORTAL.HTML — CONSOLIDATED

Create file: `security-portal.html`

This single file serves the security guards. It contains sections for:
1. Parking slot management (Feature 2 guard view)
2. Visitor management (Feature 15)
3. Gate entry log (Feature 16)
4. Emergency SOS acknowledgement (Feature 19)
5. Ambulance dispatch (Feature 20)

Sidebar navigation (same pattern as admin-portal.html) with five nav items for each section. Active section shown, others hidden.

Authentication: Login with guard credentials via Supabase auth. After login, store role 'security' in localStorage.

---

## FACULTY-PORTAL.HTML — CONSOLIDATED

Create file: `faculty-portal.html`

This single file serves faculty members. Sections:
1. QR Attendance generator (Feature 5)
2. Internal Marks entry (Feature 6)
3. Timetable editor (Feature 7)
4. Faculty availability self-update (Feature 17)
5. Leave application (Feature 18)
6. Notice posting (re-export of admin feature for faculty with category restrictions)

Authentication: Supabase auth with role 'staff'. Post-login, check faculty_availability table to confirm they are a registered faculty.

---

## ADMIN-PORTAL.HTML — ADDITIONS

Do not rewrite admin-portal.html. Add the following sections to the existing sidebar and page-section pattern:

Add these nav items and corresponding page-section divs:
- "Analytics" section (Feature 21)
- "Notices" section (Feature 9 admin view)
- "Grievances" section (Feature 10 admin view)
- "Leave Requests" section (Feature 18 HOD view)
- "Placements" section (Feature 22 admin management)
- "Utilities" section (Feature 23)
- "Alumni Approvals" section (Feature 26 admin approvals)
- "Parking Overview" widget added to existing Overview section
- "Visitor Count" widget added to existing Overview section
- "SOS Alerts" realtime overlay (Feature 19) injected at top-level outside the sidebar layout

Each new section follows the exact same HTML structure as existing sections in admin-portal.html:
```html
<div id="section-analytics" class="page-section">
  <h2 class="section-title">Analytics</h2>
  <!-- content here -->
</div>
```

Sidebar nav item structure to match existing pattern:
```html
<a href="#" class="nav-item" data-section="analytics">
  <i data-lucide="bar-chart-2"></i>
  Analytics
</a>
```

---

## STUDENTS.HTML — ADDITIONS

Do not rewrite students.html. Add the following sections to the existing sidebar and page-section pattern:

- "Bus Tracking" section with embedded Leaflet map (Feature 1 student view)
- "Parking" section showing count cards + link to parking.html (Feature 2)
- "My Marks" section (Feature 6)
- "Timetable" section (Feature 7)
- "Canteen" section with quick order and status (Feature 12)
- "Facility Booking" section (Feature 13)
- "Fitness" section with log form and leaderboard (Feature 14)
- "Notices" section with badge count (Feature 9)
- "Grievances" section (Feature 10)
- "My Leave" section (Feature 18)
- "Alumni Jobs" widget (Feature 26)
- "My ID Card" section (Digital ID)
- "Attendance" section (Feature 5 scan mode)
- SOS floating button injected into body (Feature 19)

---

## REALTIME INTEGRATION MAP

This section summarizes which portal subscribes to which channel and what it does on receiving an event.

| Channel | Table | Subscribing Portals | Action on Event |
|---|---|---|---|
| bus-live | bus_position | bus-tracking.html | Move marker, update ETAs |
| parking-live | parking_slots | parking.html, students.html, admin-portal.html | Update slot color, recount |
| opd-queue-live | opd_queue | opd-display.html, patients.html, doctor-portal.html, admin-portal.html | Re-render queue list |
| chairs-live | dental_chairs | chair-tracker.html, admin-portal.html, doctor-portal.html | Update chair color |
| attendance-session-{id} | attendance_records | faculty-portal.html | Add student name to live list |
| my-marks | marks_records | students.html | Animate bar to new value |
| timetable-live | timetable | students.html, faculty-portal.html | Reload timetable grid |
| notices-live | notices | notices.html, students.html, doctor-portal.html | Prepend card, increment badge |
| grievance-updates | grievances | students.html, admin-portal.html | Update stepper status |
| lost-found-live | lost_found | lost-found.html | Prepend item card |
| canteen-orders-live | canteen_orders | canteen.html (staff view), canteen.html (user view) | Add order to queue / notify ready |
| bookings-live | facility_bookings | students.html | Mark slot as taken |
| fitness-live | fitness_log | students.html | Reload leaderboard |
| visitor-live | visitor_log | security-portal.html, admin-portal.html | Update inside count |
| gate-log-live | gate_entry_log | security-portal.html, admin-portal.html | Prepend to live feed |
| faculty-status | faculty_availability | faculty-availability.html, students.html | Update status dot and color |
| leave-{applicant_id} | leave_requests | students.html, faculty-portal.html | Update leave status stepper |
| sos-alerts | sos_alerts | admin-portal.html, security-portal.html | Full-screen SOS overlay with sound |
| ambulance-live | ambulance_position | patients.html, security-portal.html | Move ambulance marker |
| placement-live | placement_stats | placements.html | Animate counter to new value |
| utility-live | utility_readings | admin-portal.html | Update heatmap cell |
| alumni-jobs-live | alumni_jobs | alumni.html, students.html | Toast notification, add card |

---

## PERFORMANCE AND SAFETY RULES

1. Never subscribe to the same channel twice in the same file. Check if a channel subscription already exists before creating a new one using `window.sb.getChannels()`.

2. Debounce all realtime-triggered re-renders with a 200ms debounce function to prevent flickering when multiple events arrive in rapid succession.

3. Unsubscribe all channels on beforeunload:
```javascript
window.addEventListener('beforeunload', () => {
  window.sb.removeAllChannels();
});
```

4. All Supabase writes must be followed by error handling. Pattern:
```javascript
const { data, error } = await window.sb.from('table').insert({...});
if (error) { showToast(error.message, 'error'); return; }
showToast('Saved successfully', 'success');
```

5. Toast notification system: Implement a single shared `showToast(message, type)` function that creates a fixed-position notification at bottom-right. Type: 'success' (green), 'error' (red), 'info' (blue), 'warning' (amber). Auto-dismisses after 4 seconds. Can queue multiple toasts. Add this to a shared utility script or include inline in each file.

6. All modals must trap focus (tab key cycles only within modal) and close on Escape key press.

7. All forms must disable the submit button during async Supabase operations and re-enable on completion.

8. Role check on every protected page: At the top of each portal's script block:
```javascript
const allowedRoles = ['admin']; // or ['student'], ['security'], etc.
const userRole = localStorage.getItem('rrdch_user_role');
if (!allowedRoles.includes(userRole)) {
  window.location.href = 'login.html';
}
```

9. All user-facing dates should be formatted consistently: `new Intl.DateTimeFormat('en-IN', {day:'numeric', month:'short', year:'numeric'}).format(new Date(dateString))`.

10. All currency should be formatted as: `new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0}).format(amount)`.

---

## FILES TO CREATE (COMPLETE LIST)

| File | Purpose |
|---|---|
| bus-tracking.html | Bus tracking map + guard update section |
| parking.html | Parking grid with theater-seat style slots |
| opd-display.html | Wall-display queue board for OPD waiting area |
| chair-tracker.html | Dental chair occupancy grid |
| faculty-portal.html | Faculty consolidated portal |
| security-portal.html | Security guard consolidated portal |
| canteen.html | Canteen menu + ordering + staff queue |
| lost-found.html | Lost and found board |
| notices.html | Public notice board |
| faculty-availability.html | Public faculty status board |
| placements.html | Placement statistics public page |
| campus-tour.html | SVG interactive campus map |
| alumni.html | Alumni network + job board |

## FILES TO MODIFY (TARGETED ADDITIONS ONLY)

| File | What to Add |
|---|---|
| admin-portal.html | 8 new page-section divs + sidebar nav items + SOS overlay |
| students.html | 14 new page-section divs + sidebar nav items + SOS button |
| doctor-portal.html | Realtime subscriptions for OPD queue + chairs |
| patients.html | Ambulance map section + OPD queue realtime |
| public-shell.js | New nav links for all new public pages |

---

## IMPLEMENTATION ORDER FOR AI AGENTS

Implement features in this sequence to avoid dependency errors:

1. Run all SQL schema creation and seed statements in Supabase.
2. Enable realtime on all tables.
3. Create security-portal.html (parking + visitor + gate + SOS + ambulance).
4. Create parking.html.
5. Create bus-tracking.html.
6. Create faculty-portal.html (attendance + marks + timetable + availability + leave).
7. Modify students.html — add all new sections.
8. Modify admin-portal.html — add all new sections.
9. Create canteen.html.
10. Create opd-display.html.
11. Create chair-tracker.html.
12. Create notices.html + lost-found.html.
13. Create faculty-availability.html.
14. Create placements.html.
15. Create campus-tour.html.
16. Create alumni.html.
17. Enhance ai.js for chatbot improvements.
18. Update public-shell.js nav links.
19. Test all realtime channels by opening two browser windows simultaneously.

---

END OF IMPLEMENTATION PROMPT
