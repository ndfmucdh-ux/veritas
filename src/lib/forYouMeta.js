import { STAGE1_META } from "@/lib/forYouStage1";
import { FOR_YOU_EXTRA } from "@/lib/forYouExtra";
import { Shield, Anchor, Users, Zap, Star, Heart, Sprout, BookOpen, Sun, Feather, Compass, Flame, Home, Hammer, Moon, Smile, Church, Wallet, Lock } from "lucide-react";

// Language-independent structure of every For You category. Verses use English book names;
// the page shows them in the reader's language.
export const FOR_YOU_META = {
  men: {
    labelKey: "s4Men", color: "#C9A66B", icon: Shield, photo: "mountains", planCat: "men", key: "Joshua 1:9",
    themes: [
      { icon: Shield, photo: "mountains", verses: ["Joshua 1:9", "1 Corinthians 16:13", "Proverbs 27:17"] },
      { icon: Anchor, photo: "desert", verses: ["Romans 5:3-4", "James 1:2-4", "Psalm 46:1"] },
      { icon: Users, photo: "forest", verses: ["Ephesians 6:4", "Proverbs 22:6", "Psalm 128:3"] },
      { icon: Compass, photo: "sunrise", verses: ["Jeremiah 29:11", "Ephesians 2:10", "Romans 8:28"] },
      { icon: Hammer, photo: "wheat", verses: ["Colossians 3:23", "Proverbs 11:3", "Micah 6:8"] },
      { icon: Flame, photo: "chapel", verses: ["Ecclesiastes 4:9-10", "Galatians 6:2", "Hebrews 10:24-25"] },
    ],
  },
  women: {
    labelKey: "s4Women", color: "#C17B5C", icon: Heart, photo: "lily", planCat: "women", key: "Proverbs 31:25",
    themes: [
      { icon: Star, photo: "lily", verses: ["Genesis 1:27", "Psalm 139:14", "1 Peter 3:4"] },
      { icon: Shield, photo: "waterfall", verses: ["Proverbs 31:25", "Judges 4:4-9", "Ruth 1:16-17"] },
      { icon: Anchor, photo: "dove", verses: ["Philippians 4:7", "Isaiah 26:3", "John 14:27"] },
      { icon: Heart, photo: "candle", verses: ["Luke 1:38", "1 Samuel 1:10-11", "Matthew 15:22-28"] },
      { icon: Home, photo: "wheat", verses: ["Proverbs 31:28", "Isaiah 66:13", "2 Timothy 1:5"] },
      { icon: Moon, photo: "forest", verses: ["Matthew 11:28-30", "Psalm 23:2-3", "Isaiah 40:31"] },
    ],
  },
  youth: {
    labelKey: "s4Youth", color: "#8BA888", icon: Zap, photo: "sunrise", planCat: "youth", key: "1 Timothy 4:12",
    themes: [
      { icon: Star, photo: "sunrise", verses: ["1 Timothy 4:12", "Jeremiah 1:5", "Ephesians 1:4-5"] },
      { icon: Compass, photo: "starfield", verses: ["Proverbs 3:5-6", "James 1:5", "Psalm 25:4-5"] },
      { icon: Users, photo: "ocean", verses: ["1 Corinthians 15:33", "Proverbs 17:17", "Ecclesiastes 4:9-10"] },
      { icon: Zap, photo: "mountains", verses: ["Matthew 17:20", "Mark 11:23-24", "Hebrews 11:1"] },
      { icon: Lock, photo: "candle", verses: ["Psalm 119:9", "1 Corinthians 10:13", "2 Timothy 2:22"] },
      { icon: Feather, photo: "waterfall", verses: ["1 Peter 5:7", "Philippians 4:6-7", "Psalm 94:19"] },
    ],
  },
  kids: {
    labelKey: "s4Kids", color: "#C9A66B", icon: Star, photo: "starfield", planCat: "kids", key: "John 3:16",
    themes: [
      { icon: Heart, photo: "starfield", verses: ["John 3:16", "1 John 4:19", "Psalm 100:5"] },
      { icon: BookOpen, photo: "forest", verses: ["Daniel 6", "1 Samuel 17", "Jonah 1"] },
      { icon: Smile, photo: "dove", verses: ["Ephesians 4:32", "Matthew 7:12", "Galatians 6:10"] },
      { icon: Anchor, photo: "sunrise", verses: ["Isaiah 41:10", "Joshua 1:9", "Psalm 23:4"] },
      { icon: Feather, photo: "lily", verses: ["1 Samuel 3:10", "Ephesians 6:1", "Proverbs 1:8"] },
      { icon: Sun, photo: "waterfall", verses: ["1 Thessalonians 5:16-18", "Psalm 118:24", "Psalm 136:1"] },
    ],
  },
  marriage: {
    labelKey: "s4Marriage", color: "#C17B5C", icon: Anchor, photo: "dove", planCat: "marriage", key: "1 Corinthians 13:7",
    themes: [
      { icon: Heart, photo: "dove", verses: ["Genesis 2:24", "Mark 10:9", "Ephesians 5:31"] },
      { icon: Users, photo: "candle", verses: ["1 Corinthians 13:4-7", "Ephesians 5:25", "Philippians 2:3-4"] },
      { icon: Anchor, photo: "chapel", verses: ["Ephesians 4:26", "Colossians 3:13", "Proverbs 15:1"] },
      { icon: Star, photo: "ocean", verses: ["Matthew 18:19-20", "1 Peter 3:7", "Ecclesiastes 4:12"] },
      { icon: Lock, photo: "wheat", verses: ["Proverbs 5:18-19", "Hebrews 13:4", "Matthew 19:6"] },
      { icon: Wallet, photo: "lily", verses: ["Proverbs 24:3-4", "Luke 14:28", "Psalm 127:1"] },
    ],
  },
  newBeliever: {
    labelKey: "s4NewBeliever", color: "#5B8C8C", icon: Sprout, photo: "forest", planCat: "new_believer", key: "2 Corinthians 5:17",
    themes: [
      { icon: Star, photo: "forest", verses: ["John 1:1", "1 John 4:8", "Exodus 3:14-15"] },
      { icon: Heart, photo: "sunrise", verses: ["John 3:16", "Romans 10:9-10", "Ephesians 2:8-9"] },
      { icon: Anchor, photo: "candle", verses: ["Matthew 6:9-13", "Philippians 4:6-7", "1 Thessalonians 5:17"] },
      { icon: Sprout, photo: "wheat", verses: ["Hebrews 11:6", "Romans 10:17", "2 Peter 3:18"] },
      { icon: BookOpen, photo: "chapel", verses: ["Psalm 119:105", "2 Timothy 3:16-17", "Joshua 1:8"] },
      { icon: Church, photo: "dove", verses: ["Acts 2:42", "Hebrews 10:24-25", "1 Corinthians 12:27"] },
    ],
  },
};

// Staged additions: new themes are appended to each category.
Object.entries(STAGE1_META).forEach(([cat, themes]) => FOR_YOU_META[cat].themes.push(...themes));

// Extra passages and cross references, matched to themes by position.
Object.entries(FOR_YOU_EXTRA).forEach(([cat, { more, cross }]) => {
  FOR_YOU_META[cat].themes.forEach((theme, i) => {
    theme.verses = [...theme.verses, ...(more[i] || [])];
    theme.cross = cross[i] || [];
  });
});