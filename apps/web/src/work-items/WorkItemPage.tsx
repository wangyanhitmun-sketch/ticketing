import type { WorkItem } from '../api/work-items';

const sampleWorkItems: WorkItem[] = [
  {
    id: 'work-item-demo-1',
    workItemNo: 'WI-000001',
    title: '审批链路体验优化',
    description: '手动创建业务需求，未指定执行主体，因此进入待分配。',
    type: 'business_requirement',
    sourceType: 'manual',
    status: 'unassigned',
    progress: 0,
    priority: 'P2',
    level: 1,
    isLeaf: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'work-item-demo-2',
    workItemNo: 'WI-000002',
    title: '审批缓存改造',
    description: '手动创建技术需求，已指定团队，因此进入待开发。',
    type: 'technical_requirement',
    sourceType: 'manual',
    status: 'ready_for_dev',
    progress: 0,
    priority: 'P1',
    teamId: 'team-a',
    level: 1,
    isLeaf: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'work-item-demo-3',
    workItemNo: 'WI-000003',
    title: '审批提交偶现失败',
    description: '手动创建缺陷，记录实际结果、期望结果和复现步骤。',
    type: 'defect',
    sourceType: 'manual',
    status: 'ready_for_dev',
    progress: 0,
    priority: 'P0',
    assigneeId: 'user-1',
    level: 1,
    isLeaf: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
];

const typeLabels: Record<WorkItem['type'], string> = {
  business_requirement: '业务需求',
  technical_requirement: '技术需求',
  defect: '缺陷',
};

const statusLabels: Record<WorkItem['status'], string> = {
  unassigned: '待分配',
  ready_for_dev: '待开发',
  in_progress: '开发中',
  completed: '已完成',
  canceled: '已取消',
};

export function WorkItemPage() {
  return (
    <section className="work-item-page">
      <div className="issue-hero">
        <div>
          <p className="eyebrow">Iteration 2 / 工单基础闭环</p>
          <h1>三类工单创建与管理</h1>
          <p className="summary">
            当前纵切已覆盖业务需求、技术需求和缺陷的手动创建、编辑、列表与详情 API；页面先展示三类工单入口和基础状态视图。
          </p>
        </div>
        <button className="primary-action" type="button">新建工单</button>
      </div>
      <div className="work-item-columns">
        {sampleWorkItems.map((item) => (
          <article className="work-item-card" key={item.id}>
            <span className="issue-no">{item.workItemNo}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className="work-item-footer">
              <strong>{item.priority}</strong>
              <span>{typeLabels[item.type]}</span>
              <span>{statusLabels[item.status]}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
