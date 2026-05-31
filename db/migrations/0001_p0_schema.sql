-- 工单系统 P0 数据库 DDL 草案
-- Target: PostgreSQL 14+
-- Date: 2026-05-30
-- Scope: P0.1 core + P1 reserved fields

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- 1. Basic organization tables
-- =========================================================

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    username VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NULL,
    team_id UUID NULL REFERENCES teams(id),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- =========================================================
-- 2. Issue tables
-- =========================================================

CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_no VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    clue_type VARCHAR(32) NOT NULL DEFAULT 'unknown',
    status VARCHAR(32) NOT NULL DEFAULT 'pending_triage',
    priority VARCHAR(8) NULL DEFAULT 'P2',
    category VARCHAR(64) NULL,
    source_channel VARCHAR(64) NULL DEFAULT 'manual',
    submitter_id UUID NOT NULL REFERENCES users(id),
    original_submitter_text VARCHAR(128) NULL,
    impact_scope TEXT NULL,
    expected_result TEXT NULL,
    actual_result TEXT NULL,
    reproduce_steps TEXT NULL,
    external_no VARCHAR(128) NULL,
    close_reason_type VARCHAR(64) NULL,
    close_reason TEXT NULL,
    closed_by UUID NULL REFERENCES users(id),
    closed_at TIMESTAMPTZ NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT ck_issues_clue_type CHECK (clue_type IN ('demand_clue', 'defect_clue', 'unknown')),
    CONSTRAINT ck_issues_status CHECK (status IN ('pending_triage', 'converted', 'closed')),
    CONSTRAINT ck_issues_priority CHECK (priority IS NULL OR priority IN ('P0', 'P1', 'P2', 'P3')),
    CONSTRAINT ck_issues_closed_reason CHECK (
        status <> 'closed' OR close_reason_type IS NOT NULL OR close_reason IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_submitter_id ON issues(submitter_id);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_clue_type ON issues(clue_type);
CREATE INDEX IF NOT EXISTS idx_issues_external_no ON issues(external_no);
CREATE INDEX IF NOT EXISTS idx_issues_deleted_at ON issues(deleted_at);

CREATE TABLE IF NOT EXISTS issue_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id),
    from_status VARCHAR(32) NULL,
    to_status VARCHAR(32) NOT NULL,
    operator_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_issue_status_logs_to_status CHECK (to_status IN ('pending_triage', 'converted', 'closed')),
    CONSTRAINT ck_issue_status_logs_from_status CHECK (
        from_status IS NULL OR from_status IN ('pending_triage', 'converted', 'closed')
    )
);

CREATE INDEX IF NOT EXISTS idx_issue_status_logs_issue_id ON issue_status_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_status_logs_created_at ON issue_status_logs(created_at);

-- =========================================================
-- 3. Work item tables
-- =========================================================

CREATE TABLE IF NOT EXISTS work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_no VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    source_type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    priority VARCHAR(8) NULL DEFAULT 'P2',
    owner_id UUID NULL REFERENCES users(id),
    assignee_id UUID NULL REFERENCES users(id),
    team_id UUID NULL REFERENCES teams(id),
    parent_id UUID NULL REFERENCES work_items(id),
    level INTEGER NOT NULL DEFAULT 1,
    is_leaf BOOLEAN NOT NULL DEFAULT TRUE,
    due_date DATE NULL,
    completed_at TIMESTAMPTZ NULL,
    canceled_at TIMESTAMPTZ NULL,
    cancel_reason_type VARCHAR(64) NULL,
    cancel_reason TEXT NULL,
    source_defect_id UUID NULL REFERENCES work_items(id),
    ai_creation_id UUID NULL,
    business_category VARCHAR(64) NULL,
    technical_category VARCHAR(64) NULL,
    severity VARCHAR(32) NULL,
    acceptance_criteria TEXT NULL,
    completion_criteria TEXT NULL,
    risk_note TEXT NULL,
    expected_result TEXT NULL,
    actual_result TEXT NULL,
    reproduce_steps TEXT NULL,
    impact_scope TEXT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT ck_work_items_type CHECK (type IN ('business_requirement', 'technical_requirement', 'defect')),
    CONSTRAINT ck_work_items_source_type CHECK (source_type IN ('issue_converted', 'manual', 'defect_to_requirement', 'ai_created')),
    CONSTRAINT ck_work_items_status CHECK (status IN ('unassigned', 'ready_for_dev', 'in_progress', 'completed', 'canceled')),
    CONSTRAINT ck_work_items_priority CHECK (priority IS NULL OR priority IN ('P0', 'P1', 'P2', 'P3')),
    CONSTRAINT ck_work_items_progress CHECK (progress BETWEEN 0 AND 100),
    CONSTRAINT ck_work_items_level CHECK (level IN (1, 2)),
    CONSTRAINT ck_work_items_completed_progress CHECK (status <> 'completed' OR progress = 100),
    CONSTRAINT ck_work_items_canceled_reason CHECK (
        status <> 'canceled' OR cancel_reason_type IS NOT NULL OR cancel_reason IS NOT NULL
    ),
    CONSTRAINT ck_work_items_parent_level CHECK (
        (parent_id IS NULL AND level = 1) OR (parent_id IS NOT NULL AND level = 2)
    )
);

CREATE INDEX IF NOT EXISTS idx_work_items_type ON work_items(type);
CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
CREATE INDEX IF NOT EXISTS idx_work_items_source_type ON work_items(source_type);
CREATE INDEX IF NOT EXISTS idx_work_items_owner_id ON work_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_work_items_assignee_id ON work_items(assignee_id);
CREATE INDEX IF NOT EXISTS idx_work_items_team_id ON work_items(team_id);
CREATE INDEX IF NOT EXISTS idx_work_items_parent_id ON work_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_work_items_is_leaf ON work_items(is_leaf);
CREATE INDEX IF NOT EXISTS idx_work_items_due_date ON work_items(due_date);
CREATE INDEX IF NOT EXISTS idx_work_items_created_at ON work_items(created_at);
CREATE INDEX IF NOT EXISTS idx_work_items_deleted_at ON work_items(deleted_at);

CREATE TABLE IF NOT EXISTS issue_work_item_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id),
    work_item_id UUID NOT NULL REFERENCES work_items(id),
    relation_type VARCHAR(32) NOT NULL DEFAULT 'converted',
    note TEXT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_issue_work_item_sources UNIQUE (issue_id, work_item_id),
    CONSTRAINT ck_issue_work_item_sources_relation_type CHECK (relation_type IN ('converted', 'associated', 'merged_source'))
);

CREATE INDEX IF NOT EXISTS idx_issue_work_item_sources_issue_id ON issue_work_item_sources(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_work_item_sources_work_item_id ON issue_work_item_sources(work_item_id);
CREATE INDEX IF NOT EXISTS idx_issue_work_item_sources_relation_type ON issue_work_item_sources(relation_type);

CREATE TABLE IF NOT EXISTS work_item_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_work_item_id UUID NOT NULL REFERENCES work_items(id),
    target_work_item_id UUID NOT NULL REFERENCES work_items(id),
    relation_type VARCHAR(32) NOT NULL DEFAULT 'defect_to_requirement',
    note TEXT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_work_item_relations UNIQUE (source_work_item_id, target_work_item_id, relation_type),
    CONSTRAINT ck_work_item_relations_relation_type CHECK (relation_type IN ('defect_to_requirement', 'derived', 'related'))
);

CREATE INDEX IF NOT EXISTS idx_work_item_relations_source ON work_item_relations(source_work_item_id);
CREATE INDEX IF NOT EXISTS idx_work_item_relations_target ON work_item_relations(target_work_item_id);

CREATE TABLE IF NOT EXISTS work_item_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID NOT NULL REFERENCES work_items(id),
    from_status VARCHAR(32) NULL,
    to_status VARCHAR(32) NOT NULL,
    operator_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_work_item_status_logs_from_status CHECK (
        from_status IS NULL OR from_status IN ('unassigned', 'ready_for_dev', 'in_progress', 'completed', 'canceled')
    ),
    CONSTRAINT ck_work_item_status_logs_to_status CHECK (to_status IN ('unassigned', 'ready_for_dev', 'in_progress', 'completed', 'canceled'))
);

CREATE INDEX IF NOT EXISTS idx_work_item_status_logs_work_item_id ON work_item_status_logs(work_item_id);
CREATE INDEX IF NOT EXISTS idx_work_item_status_logs_created_at ON work_item_status_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_work_item_status_logs_to_status ON work_item_status_logs(to_status);

CREATE TABLE IF NOT EXISTS work_item_progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID NOT NULL REFERENCES work_items(id),
    from_progress INTEGER NOT NULL,
    to_progress INTEGER NOT NULL,
    operator_id UUID NOT NULL REFERENCES users(id),
    note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_work_item_progress_logs_from CHECK (from_progress BETWEEN 0 AND 100),
    CONSTRAINT ck_work_item_progress_logs_to CHECK (to_progress BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_work_item_progress_logs_work_item_id ON work_item_progress_logs(work_item_id);
CREATE INDEX IF NOT EXISTS idx_work_item_progress_logs_created_at ON work_item_progress_logs(created_at);

-- =========================================================
-- 4. Collaboration and audit tables
-- =========================================================

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(32) NOT NULL,
    target_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    file_size BIGINT NULL,
    mime_type VARCHAR(128) NULL,
    uploader_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT ck_attachments_target_type CHECK (target_type IN ('issue', 'work_item'))
);

CREATE INDEX IF NOT EXISTS idx_attachments_target ON attachments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploader_id ON attachments(uploader_id);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(32) NOT NULL,
    target_id UUID NOT NULL,
    content TEXT NOT NULL,
    creator_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT ck_comments_target_type CHECK (target_type IN ('issue', 'work_item'))
);

CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_creator_id ON comments(creator_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(32) NOT NULL,
    target_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    operator_id UUID NOT NULL REFERENCES users(id),
    detail JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operator_id ON audit_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_detail_gin ON audit_logs USING GIN(detail);

-- =========================================================
-- 5. P0.2 / P1 reserved tables
-- =========================================================

CREATE TABLE IF NOT EXISTS issue_import_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(512) NULL,
    file_format VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending_confirm',
    total_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    error_detail JSONB NULL,
    created_issue_ids JSONB NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_issue_import_tasks_format CHECK (file_format IN ('xlsx', 'csv')),
    CONSTRAINT ck_issue_import_tasks_status CHECK (status IN ('pending_confirm', 'importing', 'success', 'partial_success', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_issue_import_tasks_created_by ON issue_import_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_issue_import_tasks_status ON issue_import_tasks(status);

CREATE TABLE IF NOT EXISTS view_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    view_type VARCHAR(32) NOT NULL,
    scope VARCHAR(32) NOT NULL,
    owner_id UUID NULL REFERENCES users(id),
    team_id UUID NULL REFERENCES teams(id),
    filters JSONB NULL,
    group_by JSONB NULL,
    sort_by JSONB NULL,
    visible_fields JSONB NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT ck_view_configs_view_type CHECK (view_type IN ('list', 'table', 'board')),
    CONSTRAINT ck_view_configs_scope CHECK (scope IN ('personal', 'team')),
    CONSTRAINT ck_view_configs_scope_owner CHECK (
        (scope = 'personal' AND owner_id IS NOT NULL) OR
        (scope = 'team' AND team_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_view_configs_owner_id ON view_configs(owner_id);
CREATE INDEX IF NOT EXISTS idx_view_configs_team_id ON view_configs(team_id);
CREATE INDEX IF NOT EXISTS idx_view_configs_scope ON view_configs(scope);

CREATE TABLE IF NOT EXISTS ai_creation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_input TEXT NOT NULL,
    suggested_type VARCHAR(32) NULL,
    generated_draft JSONB NOT NULL,
    final_content JSONB NULL,
    confirmed_by UUID NULL REFERENCES users(id),
    confirmed_at TIMESTAMPTZ NULL,
    model_info VARCHAR(128) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_ai_creation_records_suggested_type CHECK (
        suggested_type IS NULL OR suggested_type IN ('business_requirement', 'technical_requirement', 'defect')
    )
);

CREATE INDEX IF NOT EXISTS idx_ai_creation_records_confirmed_by ON ai_creation_records(confirmed_by);
CREATE INDEX IF NOT EXISTS idx_ai_creation_records_created_at ON ai_creation_records(created_at);

CREATE TABLE IF NOT EXISTS ai_triage_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id),
    suggestion_type VARCHAR(64) NOT NULL,
    suggestion_content JSONB NOT NULL,
    confidence NUMERIC(5, 4) NULL,
    user_action VARCHAR(32) NULL,
    final_result JSONB NULL,
    operator_id UUID NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    handled_at TIMESTAMPTZ NULL,
    CONSTRAINT ck_ai_triage_suggestions_user_action CHECK (
        user_action IS NULL OR user_action IN ('accepted', 'modified', 'rejected')
    )
);

CREATE INDEX IF NOT EXISTS idx_ai_triage_suggestions_issue_id ON ai_triage_suggestions(issue_id);
CREATE INDEX IF NOT EXISTS idx_ai_triage_suggestions_type ON ai_triage_suggestions(suggestion_type);

-- =========================================================
-- 6. Optional updated_at trigger helper
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_teams_updated_at ON teams;
CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_issues_updated_at ON issues;
CREATE TRIGGER trg_issues_updated_at BEFORE UPDATE ON issues
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_work_items_updated_at ON work_items;
CREATE TRIGGER trg_work_items_updated_at BEFORE UPDATE ON work_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_issue_import_tasks_updated_at ON issue_import_tasks;
CREATE TRIGGER trg_issue_import_tasks_updated_at BEFORE UPDATE ON issue_import_tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_view_configs_updated_at ON view_configs;
CREATE TRIGGER trg_view_configs_updated_at BEFORE UPDATE ON view_configs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
