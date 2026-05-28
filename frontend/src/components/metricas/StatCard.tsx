import React from 'react';
import './StatCard.css';

type Props = {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
};

export default function StatCard({ icon, label, value, suffix }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-card-left">
        {icon && <div className="stat-icon">{icon}</div>}
        <div className="stat-info">
          <div className="stat-value">{value}{suffix ?? ''}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}
