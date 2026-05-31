export const defaultTeams = [
  { id: 'team_a', name: '默认测试团队 A' },
  { id: 'team_b', name: '权限隔离团队 B' },
] as const;

export const defaultUsers = [
  { id: 'user_submitter', role: 'submitter', teamId: 'team_a' },
  { id: 'user_triager', role: 'triager', teamId: 'team_a' },
  { id: 'user_dev', role: 'developer', teamId: 'team_a' },
  { id: 'user_manager', role: 'manager', teamId: 'team_a' },
  { id: 'user_admin', role: 'admin', teamId: null },
] as const;
