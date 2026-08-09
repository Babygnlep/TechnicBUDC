import { motion } from 'framer-motion';
import { Briefcase, Clock3, Layers3, TrendingUp } from 'lucide-react';
import type { DashboardStats } from '@/types';

interface Props {
  stats: DashboardStats;
}

export function StatsCards({ stats }: Props) {
  const cards = [
    { label: 'Today', value: `${stats.todayHours.toFixed(1)}h`, icon: Clock3 },
    { label: 'This Week', value: `${stats.weekHours.toFixed(1)}h`, icon: TrendingUp },
    { label: 'This Month', value: `${stats.monthHours.toFixed(1)}h`, icon: Briefcase },
    { label: 'Projects', value: `${stats.projectCount}`, icon: Layers3 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
              </div>
              <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
