import { useState } from "react";
import PrayerWall from "@/components/community/PrayerWall";
import GroupsTab from "@/components/community/GroupsTab";
import FriendsTab from "@/components/community/FriendsTab";
import { LoadingState } from "@/components/ui/states";
import useCommunityData from "@/hooks/useCommunityData";
import { useLang } from "@/lib/LanguageContext";

export default function CommunityHub() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("groups");
  const { friends, groups, loading, error, reloadFriends, reloadGroups } = useCommunityData();
  const tabs = [["groups", t.cmGroups], ["friends", t.cmFriendsTab], ["prayer_wall", t.cmWall]];
  const pending = friends.incoming.length + groups.invites.length;

  return (
    <div className="min-h-screen pb-28 px-4 md:px-8">
      <div className="max-w-4xl mx-auto pt-8 mb-6">
        <h1 className="font-cinzel text-4xl font-semibold text-foreground">{t.community}</h1>
        <p className="text-sm mt-1 text-muted-foreground">{t.cmSub}</p>
        <div className="mt-4 h-px w-full bg-primary/40" />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-2 border-b border-border overflow-x-auto scrollbar-hide">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)}
              className={`px-4 py-2.5 text-sm -mb-px border-b-2 whitespace-nowrap transition-colors ${activeTab === id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {label}{id !== "prayer_wall" && pending > 0 && id === (friends.incoming.length ? "friends" : "groups") ? ` (${pending})` : ""}
            </button>
          ))}
        </div>

        {activeTab === "prayer_wall" && <PrayerWall />}
        {activeTab !== "prayer_wall" && loading && <LoadingState label={t.cmFinding} size="lg" />}
        {activeTab !== "prayer_wall" && !loading && error && <p className="text-sm text-muted-foreground">{t.cmErr}</p>}
        {!loading && !error && activeTab === "groups" && <GroupsTab data={groups} reload={reloadGroups} />}
        {!loading && !error && activeTab === "friends" && <FriendsTab data={friends} reload={reloadFriends} />}
      </div>
    </div>
  );
}