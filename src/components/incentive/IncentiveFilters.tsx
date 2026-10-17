import { ArrowRight, Calendar, Building2, User } from "lucide-react";
import {
  AVAILABLE_PERIODS,
  AVAILABLE_DIVISIONS,
  type IncentiveFilterState,
  type IncentiveParticipant,
} from "@/lib/incentive-data";

interface IncentiveFiltersProps {
  filters: IncentiveFilterState;
  onChangeFilters: (updated: Partial<IncentiveFilterState>) => void;
  participants: IncentiveParticipant[];
}

export function IncentiveFilters({
  filters,
  onChangeFilters,
  participants,
}: IncentiveFiltersProps) {
  return (
    <div className="card-surface p-5 mb-6 space-y-4">
      {/* Row 1: Period & Division */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Period Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            <Calendar size={13} className="text-primary" />
            Period
          </label>
          <div className="relative">
            <select
              value={filters.period}
              onChange={(e) => onChangeFilters({ period: e.target.value })}
              className="input-field font-medium border-primary/40 focus:border-primary text-foreground"
            >
              {AVAILABLE_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Division Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            <Building2 size={13} className="text-primary" />
            Division
          </label>
          <div className="relative">
            <select
              value={filters.division}
              onChange={(e) => onChangeFilters({ division: e.target.value })}
              className="input-field font-medium border-primary/40 focus:border-primary text-foreground"
            >
              {AVAILABLE_DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 2: Participant Selector */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          <User size={13} className="text-primary" />
          Participant
          <ArrowRight size={12} className="text-amber-500 inline ml-0.5" />
        </label>
        <div className="relative">
          <select
            value={filters.participant}
            onChange={(e) => onChangeFilters({ participant: e.target.value })}
            className="input-field font-medium text-foreground"
          >
            <option value="All">All Participants</option>
            {participants.map((p) => (
              <option key={p.id} value={p.displayName}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
