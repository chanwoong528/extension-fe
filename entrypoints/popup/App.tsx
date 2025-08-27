import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import TabScreenShot from "@/entrypoints/popup/tabs/screenshot/TabScreenShot";
import TabStyle from "@/entrypoints/popup/tabs/style/TabStyle";
import TabAsset from "@/entrypoints/popup/tabs/asset/TabAsset";
import TabRuler from "@/entrypoints/popup/tabs/ruler/TabRuler";

const TABS = [
  {
    label: "ScreenShot",
    value: "screenshot",
    component: <TabScreenShot />,
  },
  {
    label: "Style Scanner",
    value: "styleScanner",
    component: <TabStyle />,
  },
  {
    label: "Asset Scanner",
    value: "assetScanner",
    component: <TabAsset />,
  },
  {
    label: "Page Ruler",
    value: "pageRuler",
    component: <TabRuler />,
  },
];

function App() {
  return (
    <main className='min-w-[500px] flex flex-col items-center justify-center'>
      <Tabs defaultValue='screenshot' className='w-full px-2 py-2'>
        <TabsList className='w-full'>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className='w-full h-full p-4'>{tab.component}</div>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}

export default App;
