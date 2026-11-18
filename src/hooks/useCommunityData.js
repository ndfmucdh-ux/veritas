import { useState, useEffect, useCallback } from "react";
import { community } from "@/lib/communityApi";

const EMPTY_FRIENDS = { friends: [], incoming: [], outgoing: [] };
const EMPTY_GROUPS = { groups: [], invites: [] };

// Friends and groups of the signed-in user, loaded once and refreshed after every change.
export default function useCommunityData() {
  const [friends, setFriends] = useState(EMPTY_FRIENDS);
  const [groups, setGroups] = useState(EMPTY_GROUPS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reloadFriends = useCallback(() => community("friends.list").then(setFriends), []);
  const reloadGroups = useCallback(() => community("groups.mine").then(setGroups), []);

  useEffect(() => {
    Promise.all([reloadFriends(), reloadGroups()])
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [reloadFriends, reloadGroups]);

  return { friends, groups, loading, error, reloadFriends, reloadGroups };
}