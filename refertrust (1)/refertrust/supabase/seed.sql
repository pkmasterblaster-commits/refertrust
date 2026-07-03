-- ============================================================================
-- ReferTrust — Seed data
-- Run AFTER schema.sql, in Supabase SQL Editor.
-- Creates 20 companies + 6 demo employees + 15 referrals posted by them,
-- so that when YOU sign up you can immediately test "Request Referral"
-- (you can't request your own posts, hence the demo posters).
--
-- If the auth.users insert errors on your Supabase version, delete that block
-- and just have 2 people sign up + post manually — everything else still runs.
-- ============================================================================

-- ---- 20 companies (Indian job market) ----
insert into companies (name, domain) values
  ('Swiggy',        'swiggy.com'),
  ('Zomato',        'zomato.com'),
  ('Flipkart',      'flipkart.com'),
  ('Razorpay',      'razorpay.com'),
  ('CRED',          'cred.club'),
  ('Zerodha',       'zerodha.com'),
  ('Paytm',         'paytm.com'),
  ('PhonePe',       'phonepe.com'),
  ('Meesho',        'meesho.com'),
  ('Groww',         'groww.in'),
  ('Postman',       'postman.com'),
  ('Freshworks',    'freshworks.com'),
  ('Nykaa',         'nykaa.com'),
  ('Dream11',       'dream11.com'),
  ('Urban Company', 'urbancompany.com'),
  ('PhysicsWallah', 'pw.live'),
  ('upGrad',        'upgrad.com'),
  ('Ola',           'olacabs.com'),
  ('BrowserStack',  'browserstack.com'),
  ('Chargebee',     'chargebee.com')
on conflict (domain) do nothing;

-- ---- 6 demo employees (auth users) ----
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password,
   email_confirmed_at, created_at, updated_at,
   raw_app_meta_data, raw_user_meta_data,
   confirmation_token, recovery_token, email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111','authenticated','authenticated','ravi@razorpay.com', crypt('demo-pass-123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{}','','','',''),
  ('00000000-0000-0000-0000-000000000000','22222222-2222-2222-2222-222222222222','authenticated','authenticated','priya@swiggy.com',  crypt('demo-pass-123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{}','','','',''),
  ('00000000-0000-0000-0000-000000000000','33333333-3333-3333-3333-333333333333','authenticated','authenticated','arjun@flipkart.com',crypt('demo-pass-123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{}','','','',''),
  ('00000000-0000-0000-0000-000000000000','44444444-4444-4444-4444-444444444444','authenticated','authenticated','neha@cred.club',    crypt('demo-pass-123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{}','','','',''),
  ('00000000-0000-0000-0000-000000000000','55555555-5555-5555-5555-555555555555','authenticated','authenticated','karan@postman.com', crypt('demo-pass-123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{}','','','',''),
  ('00000000-0000-0000-0000-000000000000','66666666-6666-6666-6666-666666666666','authenticated','authenticated','sneha@meesho.com',  crypt('demo-pass-123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{}','','','','')
on conflict (id) do nothing;

-- ---- profiles for the demo employees ----
insert into profiles (id, full_name, role, company_id, skills, years_experience, location, trust_score)
values
  ('11111111-1111-1111-1111-111111111111','Ravi Menon','employee', (select id from companies where domain='razorpay.com'), '{backend,go,payments}', 5, 'Bengaluru', 100),
  ('22222222-2222-2222-2222-222222222222','Priya Nair','employee', (select id from companies where domain='swiggy.com'),   '{android,kotlin,mobile}', 4, 'Bengaluru', 100),
  ('33333333-3333-3333-3333-333333333333','Arjun Rao','employee',  (select id from companies where domain='flipkart.com'), '{java,backend,systems}', 6, 'Bengaluru', 100),
  ('44444444-4444-4444-4444-444444444444','Neha Gupta','employee', (select id from companies where domain='cred.club'),    '{ios,swift,mobile}', 4, 'Bengaluru', 100),
  ('55555555-5555-5555-5555-555555555555','Karan Shah','employee', (select id from companies where domain='postman.com'),  '{react,frontend,devrel}', 5, 'Delhi NCR', 100),
  ('66666666-6666-6666-6666-666666666666','Sneha Iyer','employee', (select id from companies where domain='meesho.com'),   '{product,design,analytics}', 3, 'Bengaluru', 100)
on conflict (id) do nothing;

-- ---- 15 referrals (all JD links match company domain -> verified) ----
insert into referrals (poster_id, company_id, job_title, jd_url, slots, jd_verified) values
  ('11111111-1111-1111-1111-111111111111', (select id from companies where domain='razorpay.com'), 'Backend Engineer (Go)',        'https://razorpay.com/careers/backend-go',        3, true),
  ('11111111-1111-1111-1111-111111111111', (select id from companies where domain='razorpay.com'), 'Frontend Engineer (React)',    'https://razorpay.com/careers/frontend-react',    2, true),
  ('11111111-1111-1111-1111-111111111111', (select id from companies where domain='razorpay.com'), 'Product Manager',              'https://razorpay.com/careers/pm',                1, true),
  ('22222222-2222-2222-2222-222222222222', (select id from companies where domain='swiggy.com'),   'Android Engineer (Kotlin)',    'https://swiggy.com/careers/android-kotlin',      2, true),
  ('22222222-2222-2222-2222-222222222222', (select id from companies where domain='swiggy.com'),   'Data Scientist',               'https://swiggy.com/careers/data-scientist',      2, true),
  ('22222222-2222-2222-2222-222222222222', (select id from companies where domain='swiggy.com'),   'SDET',                         'https://swiggy.com/careers/sdet',                1, true),
  ('33333333-3333-3333-3333-333333333333', (select id from companies where domain='flipkart.com'), 'SDE II (Java)',                'https://flipkart.com/careers/sde-2-java',        4, true),
  ('33333333-3333-3333-3333-333333333333', (select id from companies where domain='flipkart.com'), 'Machine Learning Engineer',    'https://flipkart.com/careers/ml-engineer',       2, true),
  ('33333333-3333-3333-3333-333333333333', (select id from companies where domain='flipkart.com'), 'UX Designer',                  'https://flipkart.com/careers/ux-designer',       1, true),
  ('44444444-4444-4444-4444-444444444444', (select id from companies where domain='cred.club'),    'iOS Engineer (Swift)',         'https://cred.club/careers/ios-swift',            2, true),
  ('44444444-4444-4444-4444-444444444444', (select id from companies where domain='cred.club'),    'Backend Engineer (Kotlin)',    'https://cred.club/careers/backend-kotlin',       2, true),
  ('55555555-5555-5555-5555-555555555555', (select id from companies where domain='postman.com'),  'Developer Advocate',           'https://postman.com/careers/developer-advocate', 1, true),
  ('55555555-5555-5555-5555-555555555555', (select id from companies where domain='postman.com'),  'Frontend Engineer (React)',    'https://postman.com/careers/frontend-react',     2, true),
  ('66666666-6666-6666-6666-666666666666', (select id from companies where domain='meesho.com'),   'Business Analyst',             'https://meesho.com/careers/business-analyst',    2, true),
  ('66666666-6666-6666-6666-666666666666', (select id from companies where domain='meesho.com'),   'Senior Product Designer',      'https://meesho.com/careers/product-designer',    1, true);
