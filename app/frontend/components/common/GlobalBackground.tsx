"use client";

import React from "react";
import {
  PARENT_DASHBOARD_BG_BASE,
  PARENT_DASHBOARD_BG_CORAL_BLOB,
  PARENT_DASHBOARD_BG_PURPLE_BLOB,
} from "../../constants/colors";

// Blob background used on the parent dashboard (matched to your provided design).
export function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Base black background */}
      <div className="absolute inset-0 bg-black" style={{ backgroundColor: PARENT_DASHBOARD_BG_BASE }} />

      {/* Gradient Blobs */}
      <div className="absolute inset-0 overflow-clip">
        {/* Purple blob - Top Left */}
        <div
          className="absolute blur-[120px] left-[-148px] opacity-40 rounded-full w-[782px] h-[782px] top-[-185px]"
          style={{ backgroundColor: PARENT_DASHBOARD_BG_PURPLE_BLOB }}
        />

        {/* Coral blob - Top Right */}
        <div
          className="absolute blur-[120px] right-[-230px] opacity-40 rounded-full w-[739px] h-[739px] top-[-133px]"
          style={{ backgroundColor: PARENT_DASHBOARD_BG_CORAL_BLOB }}
        />

        {/* Purple blob - Bottom Center-Left */}
        <div
          className="absolute blur-[120px] left-[20%] opacity-40 rounded-full w-[705px] h-[705px] bottom-[-200px]"
          style={{ backgroundColor: PARENT_DASHBOARD_BG_PURPLE_BLOB }}
        />

        {/* Coral blob - Bottom Center-Right */}
        <div
          className="absolute blur-[120px] right-[20%] opacity-30 rounded-full w-[643px] h-[643px] bottom-[-150px]"
          style={{ backgroundColor: PARENT_DASHBOARD_BG_CORAL_BLOB }}
        />
      </div>
    </div>
  );
}

