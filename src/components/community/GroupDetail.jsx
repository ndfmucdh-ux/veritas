import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Users, Lock, Globe } from "lucide-react";
import { LoadingState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";
import { community } from "@/lib/communityApi";
import { GROUP_CATEGORIES } from "@/components/community/GroupCard";
import GroupFeed from "@/components/community/GroupFeed";
import GroupPlan from "@/components/community/GroupPlan";
import GroupMembers from "@/components/community/GroupMembers";

// Inside one group: feed (messages and prayer requests), shared study plan and members.
export default function GroupDetail({ groupId, onBack }) {
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("feed");
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => community("groups.get", { groupId }).then(setData).catch(() => setFailed(true)), [groupId]);
  useEffect(() => { load(); }, [load]);

  const back = (
    <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground min-h-10">
      <ArrowLeft className="w-4 h-4" /> {t.cmBackBtn}
    </button>
  );

  if (failed) return <div className="space-y-3">{back}<p className="text-sm text-muted-foreground">{t.cmErr}</p></div>;
  if (!data) return <div className="space-y-3">{back}<LoadingState label={t.cmFinding} size="md" minHeight={160} /></div>;

  const { group } = data;
  const cat = GROUP_CATEGORIES.find((c) => c.id === group.category) || GROUP_CATEGORIES[0];
  const PrivacyIcon = group.privacy === "private" ? Lock : Globe;
  const tabs = [["feed", t.cmFeed], ["plan", t.cmPlanTab], ["members", t.cmMembersTab]];

  return (
    <div className="space-y-4">
      {back}
      <header className="rounded-2xl p-4 bg-card border border-border">
        <h2 className="font-cinzel text-2xl font-semibold text-foreground leading-tight break-words">{group.name}</h2>
        {group.description && <p className="text-sm text-foreground/75 mt-1">{group.description}</p>}
        <p className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
          <span>{t[cat.key]}</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{t.cmMembersN.replace("{n}", group.member_count)}</span>
          <PrivacyIcon className="w-3.5 h-3.5" />
        </p>
      </header>

      <div className="flex p-0.5 rounded-full bg-secondary">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-pressed={tab === id}
            className={`flex-1 min-h-10 rounded-full text-xs font-cinzel font-semibold ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{label}</button>
        ))}
      </div>

      {tab === "feed" && <GroupFeed data={data} reload={load} />}
      {tab === "plan" && <GroupPlan data={data} reload={load} />}
      {tab === "members" && <GroupMembers data={data} reload={load} onGone={onBack} />}
    </div>
  );
}