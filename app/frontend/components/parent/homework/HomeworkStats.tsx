'use client';

import {
  ListChecks,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface HomeworkStatsProps {
  total: number;
  pending: number;
  submitted: number;
  completion: number;
}

export default function HomeworkStats({
  total,
  pending,
  submitted,
  completion,
}: HomeworkStatsProps) {
  return (
    <>
      <section className="min-w-0 w-full grid grid-cols-1 gap-3 sm:gap-4 md:gap-4 lg:gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="somu rounded-2xl statCard">
          <ListChecks className="icon text-lime-400" />
          <p className="statLabel">Total homework</p>
          <div className="statValue">{total}</div>
          <p className="statLabel">All assignments</p>
        </div>

        <div className="somu rounded-2xl statCard">
          <Clock className="icon text-orange-400" />
          <p className="statLabel">pending</p>
          <div className="statValue">{pending}</div>
          <p className="statLabel">Need attention</p>
        </div>

        <div className="somu rounded-2xl statCard">
          <CheckCircle2 className="icon text-lime-400" />
          <p className="statLabel">submitted</p>
           <div className="statValue">{submitted}</div>
          <p className="statLabel">On time</p>
        </div>

        <div className="somu rounded-2xl statCard">
          <TrendingUp className="icon text-yellow-300" />
          <p className="statLabel">completion rate </p>
          <div className="statValue">{completion}%</div>
          <p className="statLabel">Overall progress</p>
        </div>
      </section>

      <style jsx>{`
        .statCard {
          padding: 16px 20px;
        }
        @media (min-width: 640px) {
          .statCard {
            padding: 20px 22px;
          }
        }
        @media (min-width: 768px) {
          .statCard {
            padding: 20px 22px;
          }
        }
        @media (min-width: 1024px) {
          .statCard {
            padding: 24px;
          }
        }

        .icon {
          height: 20px;
          width: 20px;
        }
        @media (min-width: 640px) {
          .icon {
            height: 24px;
            width: 24px;
          }
        }

        .statValue {
          margin-top: 12px;
          font-size: 22px;
          font-weight: 700;
        }
        @media (min-width: 640px) {
          .statValue {
            margin-top: 16px;
            font-size: 26px;
          }
        }
        @media (min-width: 768px) {
          .statValue {
            font-size: 28px;
          }
        }

        .statLabel {
          margin-top: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
        @media (min-width: 640px) {
          .statLabel {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}