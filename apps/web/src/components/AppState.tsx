export function LoadingState() {
  return <div className="state">加载中...</div>;
}

export function EmptyState() {
  return <div className="state">暂无数据，后续迭代将接入问题单和工单。</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="state state-error">{message}</div>;
}
