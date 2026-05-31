-- Ticketing Iteration 0 base seed data
-- Uses stable UUID values so seeds are repeatable.

INSERT INTO teams (id, name, code)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', '默认测试团队 A', 'team_a'),
  ('00000000-0000-0000-0000-0000000000b1', '权限隔离团队 B', 'team_b')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = now();

INSERT INTO users (id, name, username, email, team_id, status)
VALUES
  ('00000000-0000-0000-0000-000000000101', '问题提交人', 'user_submitter', 'submitter@example.local', '00000000-0000-0000-0000-0000000000a1', 'active'),
  ('00000000-0000-0000-0000-000000000102', '分流处理人', 'user_triager', 'triager@example.local', '00000000-0000-0000-0000-0000000000a1', 'active'),
  ('00000000-0000-0000-0000-000000000103', '产品经理', 'user_pm', 'pm@example.local', '00000000-0000-0000-0000-0000000000a1', 'active'),
  ('00000000-0000-0000-0000-000000000104', '技术负责人', 'user_tech', 'tech@example.local', '00000000-0000-0000-0000-0000000000a1', 'active'),
  ('00000000-0000-0000-0000-000000000105', '研发执行人', 'user_dev', 'dev@example.local', '00000000-0000-0000-0000-0000000000a1', 'active'),
  ('00000000-0000-0000-0000-000000000106', '项目管理者', 'user_manager', 'manager@example.local', '00000000-0000-0000-0000-0000000000a1', 'active'),
  ('00000000-0000-0000-0000-000000000107', '系统管理员', 'user_admin', 'admin@example.local', NULL, 'active'),
  ('00000000-0000-0000-0000-000000000201', '隔离团队成员', 'user_team_b', 'team-b@example.local', '00000000-0000-0000-0000-0000000000b1', 'active')
ON CONFLICT (username) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  team_id = EXCLUDED.team_id,
  status = EXCLUDED.status,
  updated_at = now();
