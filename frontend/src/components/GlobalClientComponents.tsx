'use client';

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });
const ActivitySidebar = dynamic(() => import("@/components/ActivitySidebar"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), { ssr: false });
const LoadingScreen = dynamic(() => import("@/components/ui/LoadingScreen"), { ssr: false });
const KeyboardShortcuts = dynamic(() => import("@/components/ui/KeyboardShortcuts"), { ssr: false });

export default function GlobalClientComponents() {
  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <KeyboardShortcuts />
      <Scene />
      <ActivitySidebar />
      <CommandPalette />
    </>
  );
}
