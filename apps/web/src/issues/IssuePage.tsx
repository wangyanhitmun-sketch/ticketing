import type { Issue } from '../api/issues';

const sampleIssues: Issue[] = [
  {
    id: 'issue-demo-1',
    issueNo: 'ISSUE-000001',
    title: '审批提交后偶现失败',
    description: '用户点击提交审批后，页面提示网络异常，但后台实际已生成记录。',
    clueType: 'defect_clue',
    status: 'pending_triage',
    priority: 'P1',
    category: '审批流',
    sourceChannel: 'manual',
    submitterId: 'anonymous',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
];

const clueTypeLabels: Record<Issue['clueType'], string> = {
  demand_clue: '需求线索',
  defect_clue: '缺陷线索',
  unknown: '待判断',
};

const statusLabels: Record<Issue['status'], string> = {
  pending_triage: '待分流',
  converted: '已转工单',
  closed: '已关闭',
};

export function IssuePage() {
  return (
    <section className="issue-page">
      <div className="issue-hero">
        <div>
          <p className="eyebrow">Iteration 1 / 问题单最小闭环</p>
          <h1>问题单收集与关闭</h1>
          <p className="summary">
            当前纵切已覆盖问题单手动创建、编辑、列表、详情与关闭 API；前端先提供模块壳和列表视图，后续接入真实接口与分流工作台。
          </p>
        </div>
        <button className="primary-action" type="button">
          新建问题单
        </button>
      </div>

      <div className="issue-toolbar">
        <span>全部问题单</span>
        <span>待分流优先</span>
        <span>支持关键词 / 状态 / 类型 / 优先级筛选</span>
      </div>

      <div className="issue-list">
        {sampleIssues.map((issue) => (
          <article className="issue-row" key={issue.id}>
            <div>
              <span className="issue-no">{issue.issueNo}</span>
              <h2>{issue.title}</h2>
              <p>{issue.description}</p>
            </div>
            <div className="issue-meta">
              <strong>{issue.priority}</strong>
              <span>{clueTypeLabels[issue.clueType]}</span>
              <span>{statusLabels[issue.status]}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="state">空状态：当接口返回 0 条问题单时，引导用户通过“新建问题单”录入需求线索或缺陷线索。</div>
    </section>
  );
}
