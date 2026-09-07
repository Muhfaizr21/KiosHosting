import React from "react";
import { HardDrives, Plus, CheckCircle, Warning, ClockCounterClockwise, Plug, Desktop } from "@phosphor-icons/react";

export default function AdminNodes() {
  const nodes = [
    { 
      id: "node-1-jkt", name: "JKT-01 (Main Node)", ip: "103.22.45.12", panel: "CyberPanel", 
      cpu: 45, ram: 60, disk: 75, uptime: "99.98%", clients: 120, status: "Healthy" 
    },
    { 
      id: "node-2-jkt", name: "JKT-02 (Secondary)", ip: "103.22.45.18", panel: "cPanel", 
      cpu: 85, ram: 92, disk: 88, uptime: "99.95%", clients: 215, status: "Warning" 
    },
    { 
      id: "node-backup", name: "SGP-BACKUP (Storage)", ip: "172.10.0.5", panel: "DirectAdmin", 
      cpu: 10, ram: 15, disk: 40, uptime: "100%", clients: 0, status: "Healthy" 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Server Nodes</h1>
          <p className="text-sm text-slate-500">Monitor infrastructure health and manage control panels</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700">
          <Plus className="h-5 w-5" weight="bold" /> Add New Node
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {nodes.map((node) => (
          <div key={node.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    node.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <HardDrives className="h-5 w-5" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900">{node.name}</h3>
                    <p className="text-xs font-mono text-slate-500">{node.ip}</p>
                  </div>
                </div>
                {node.status === 'Healthy' ? (
                  <CheckCircle className="h-6 w-6 text-emerald-500" weight="fill" />
                ) : (
                  <Warning className="h-6 w-6 text-amber-500" weight="fill" />
                )}
              </div>
            </div>

            <div className="p-5 flex-1 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">CPU Usage</span>
                  <span className={node.cpu > 80 ? "text-amber-600" : "text-slate-900"}>{node.cpu}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${node.cpu > 80 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${node.cpu}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">RAM Usage</span>
                  <span className={node.ram > 80 ? "text-amber-600" : "text-slate-900"}>{node.ram}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${node.ram > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${node.ram}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Disk Space</span>
                  <span className={node.disk > 80 ? "text-red-600" : "text-slate-900"}>{node.disk}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${node.disk > 80 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${node.disk}%` }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <div className="p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Control Panel</p>
                <p className="mt-1 font-semibold text-slate-700">{node.panel}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Hosted Clients</p>
                <p className="mt-1 font-semibold text-slate-700">{node.clients} Accts</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Node Operations</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-blue-500 hover:shadow-md group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Plug className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Sync API Keys</p>
              <p className="text-xs text-slate-500">Refresh panel tokens</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-blue-500 hover:shadow-md group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Desktop className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Test Connections</p>
              <p className="text-xs text-slate-500">Ping all nodes</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-amber-500 hover:shadow-md group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ClockCounterClockwise className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Restart Services</p>
              <p className="text-xs text-slate-500">Web/DB restarts</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
