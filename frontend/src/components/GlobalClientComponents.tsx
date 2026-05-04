'use client';

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });
const ActivitySidebar = dynamic(() => import("@/components/ActivitySidebar"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

export default function GlobalClientComponents() {
  return (
    <>
      <Scene />
      <ActivitySidebar />
      <CommandPalette />
    </>
  );
}
