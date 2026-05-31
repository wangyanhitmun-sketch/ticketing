import React from 'react';
import { createRoot } from 'react-dom/client';
import { EmptyState } from './components/AppState';
import './styles.css';

const navItems = ['工作台', '问题单', '工单', '统计'];
const stats = [
  { label: '待分流问题单', value: '0' },
  { label: '我的待开发工单', value: '0' },
  { label: '开发中工单', value: '0' },
  { label: '已完成工单', value: '0' },
];

function App() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Ticketing</div>
        <nav>
          {navItems.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>
      <section className="content">
        <p className="eyebrow">Iteration 0 / 工程基线</p>
        <h1>工单系统独立闭环</h1>
        <p className="summary">
          当前页面是前端基础壳，后续将按问题单、分流、工单状态机、统计看板逐步纵切实现。
        </p>
        <div className="grid">
          {stats.map((stat) => (
            <article className="card" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
        <EmptyState />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
