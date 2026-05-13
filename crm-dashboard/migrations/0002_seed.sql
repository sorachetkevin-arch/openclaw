-- Seed users (passwords are SHA-256 of "demo1234")
-- demo1234 -> 0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d
INSERT OR IGNORE INTO users (name, email, password_hash, role, status, phone, dept, line_linked, color) VALUES
  ('Admin สมศักดิ์', 'admin@crm.th', '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', 'SUPER_ADMIN', 'active', '081-000-0001', 'Management', 1, '#6366F1'),
  ('John D.',         'john@crm.th',  '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', 'ADMIN',       'active', '081-111-2222', 'Sales',      1, '#F59E0B'),
  ('Sara K.',         'sara@crm.th',  '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', 'USER',        'active', '081-222-3333', 'Sales',      1, '#10B981'),
  ('Mike T.',         'mike@crm.th',  '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', 'USER',        'active', '081-333-4444', 'Sales',      0, '#06B6D4'),
  ('Amy R.',          'amy@crm.th',   '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', 'USER',        'inactive','081-444-5555', 'Sales',      0, '#8B5CF6');

INSERT OR IGNORE INTO campaigns (name, source, budget, spent, status, start_date, end_date, utm_source, utm_medium, utm_campaign) VALUES
  ('Summer Promo 2026',      'Facebook Ads', 50000,  32000, 'active', '2026-04-01', '2026-06-30', 'facebook', 'cpc',   'summer-2026'),
  ('Google Search — Lead',   'Google Ads',   80000,  41250, 'active', '2026-03-15', '2026-07-15', 'google',   'cpc',   'lead-gen-th'),
  ('LINE OA Broadcast',      'LINE Ads',     20000,  18900, 'active', '2026-05-01', '2026-05-31', 'line',     'oa',    'broadcast-may'),
  ('Referral Q2',            'Referral',     10000,   3200, 'paused','2026-04-01', '2026-06-30', 'referral', 'email','q2-2026');

INSERT INTO leads (name, phone, email, company, source, status, score, budget, assignee_id, line_id, tags, last_contact, next_follow_up) VALUES
  ('สมชาย ใจดี',    '081-234-5678','somchai@email.com', 'ABC Corp', 'Facebook Ads',  'NEW',           95,  50000, 2, 'U123',  '["VIP","Hot"]',     '2026-05-12','2026-05-13'),
  ('Natthawut K.',  '082-345-6789','natthawut@biz.co',  'XYZ Ltd',  'Google Ads',    'QUALIFIED',     88, 120000, 3, 'U456',  '["Enterprise"]',    '2026-05-11','2026-05-14'),
  ('วิภา แสนดี',    '083-456-7890','vipa@corp.th',      'DEF Co',   'LINE Ads',      'PROPOSAL_SENT', 84,  80000, 4, 'U789',  '["Urgent"]',        '2026-05-10','2026-05-12'),
  ('Priya Sharma',  '084-567-8901','priya@firm.in',     'GHI Inc',  'Referral',      'CONTACTED',     82, 200000, 2, NULL,    '["High Value"]',    '2026-05-12','2026-05-15'),
  ('มานะ รักดี',    '085-678-9012','mana@web.th',       'JKL Pvt',  'Facebook Ads',  'FOLLOW_UP',     80,  35000, 3, 'Uabc',  '["Follow-up"]',     '2026-05-09','2026-05-12'),
  ('Anon Lee',      '086-789-0123','anon@lee.sg',       'MNO SG',   'Organic',       'NEW',           62,  15000, 4, NULL,    '[]',                '2026-05-08','2026-05-13'),
  ('กมลา จริยา',    '087-890-1234','kamala@org.th',     'PQR Ltd',  'Email Campaign','WON',           75,  90000, 2, 'Udef',  '["Won"]',           '2026-05-07', NULL),
  ('Tom Wilson',    '088-901-2345','tom@corp.com',      'STU Corp', 'Walk-in',       'LOST',          30,  10000, 3, NULL,    '["Lost"]',          '2026-05-05', NULL),
  ('นภา สุขใส',     '089-012-3456','napa@happy.th',     'VWX Co',   'Google Ads',    'NEW',           55,  45000, 4, 'Ughi',  '["Warm"]',          '2026-05-11','2026-05-14'),
  ('Anya Petrov',   '090-123-4567','anya@russ.ru',      'YZA Ltd',  'Facebook Ads',  'CONTACTED',     70,  60000, 2, NULL,    '["International"]', '2026-05-10','2026-05-16'),
  ('Ben Chang',     '091-234-5678','ben@chang.co',      'BCo',      'Email Campaign','QUALIFIED',     66,  90000, 5, NULL,    '[]',                '2026-05-08','2026-05-15'),
  ('Ali Hassan',    '092-345-6789','ali@hassan.co',     'AH Ltd',   'Walk-in',       'PROPOSAL_SENT', 58,  25000, 3, NULL,    '[]',                '2026-05-04','2026-05-14'),
  ('Liu Wei',       '093-456-7890','liu@wei.cn',        'LW Corp',  'Google Ads',    'PROPOSAL_SENT', 75, 110000, 2, NULL,    '[]',                '2026-05-06','2026-05-13'),
  ('Mei Sakura',    '094-567-8901','mei@sakura.jp',     'MeiCo',    'Referral',      'FOLLOW_UP',     79,  75000, 4, NULL,    '[]',                '2026-05-01','2026-05-15');

INSERT INTO lead_activities (lead_id, user_id, action, note) VALUES
  (1, 2, 'created', 'Lead captured from Facebook Ads'),
  (2, 3, 'status_change', 'Moved to QUALIFIED after discovery call'),
  (3, 4, 'note',          'Proposal sent — awaiting feedback'),
  (5, 3, 'note',          'Follow-up scheduled');
