import React from 'react';
import dynamic from 'next/dynamic';
const AgentInvokePanel = dynamic(() => import('@/components/studio/AgentInvokePanel'), { ssr: false });;

export const metadata = {
  title: 'Agent Invoke · AIX Studio',
  description: 'Surgical, monochromatic invocation panel for AIX agents.',
};

function InvokePage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-8"
      style={{ background: '#09090B' }}
    >
      <div className="w-full max-w-[1280px]">
        <AgentInvokePanel />
      </div>
    </main>
  );
}

export default React.memo(InvokePage);

InvokePage.displayName = 'InvokePage';
