# Database

数据库资产目录。

- `schema/`：DDL 快照。
- `migrations/`：数据库迁移脚本。
- `seeds/`：本地和测试环境种子数据。

## Commands

```bash
npm run db:migrate -- --dry-run
npm run db:seed -- --dry-run
npm run db:reset -- --dry-run
```

如需真实执行，请先设置 `DATABASE_URL`：

```bash
DATABASE_URL=postgresql://ticketing:ticketing@localhost:5432/ticketing npm run db:migrate
DATABASE_URL=postgresql://ticketing:ticketing@localhost:5432/ticketing npm run db:seed
```

当前脚本支持 dry-run，因此在没有本地 PostgreSQL 的环境中也可以验证 migration/seed 文件存在且可读取。
