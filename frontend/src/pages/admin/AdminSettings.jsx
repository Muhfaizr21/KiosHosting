import React, { useState } from "react";
import { FloppyDisk, Key, LinkSimple, Users, Buildings } from "@phosphor-icons/react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500">Configure global application settings and integrations</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
          <FloppyDisk className="h-5 w-5" /> Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-[240px] shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {[
              { id: "general", label: "General Config", icon: Buildings },
              { id: "api", label: "API Credentials", icon: Key },
              { id: "webhooks", label: "Webhooks", icon: LinkSimple },
              { id: "staff", label: "Staff & RBAC", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap text-left ${
                    activeTab === tab.id 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon weight={activeTab === tab.id ? "fill" : "duotone"} className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <h2 className="font-display text-lg font-bold text-slate-900 mb-6">Company Information</h2>
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                    <input type="text" defaultValue="KiosHosting.id" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
                    <input type="email" defaultValue="support@kioshosting.id" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Default Currency</label>
                    <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors">
                      <option>IDR (Rupiah)</option>
                      <option>USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <h2 className="font-display text-lg font-bold text-slate-900 mb-6">Automation Rules</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="font-semibold text-slate-900">Auto Suspend Overdue Accounts</p>
                      <p className="text-sm text-slate-500">Automatically suspend hosting after X days overdue.</p>
                    </div>
                    <select defaultValue="3" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:border-blue-500 outline-none">
                      <option value="1">1 Day</option>
                      <option value="3">3 Days (Default)</option>
                      <option value="7">7 Days</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="font-semibold text-slate-900">Auto Terminate Overdue Accounts</p>
                      <p className="text-sm text-slate-500">Permanently delete account after X days.</p>
                    </div>
                    <select defaultValue="30" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:border-blue-500 outline-none">
                      <option value="15">15 Days</option>
                      <option value="30">30 Days (Default)</option>
                      <option value="60">60 Days</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <h2 className="font-display text-lg font-bold text-slate-900 mb-2">Payment Gateway (Midtrans)</h2>
                <p className="text-sm text-slate-500 mb-6">Required for processing online payments automatically.</p>
                
                <div className="grid gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Environment</label>
                    <select className="w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 outline-none">
                      <option>Production</option>
                      <option>Sandbox</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Server Key</label>
                    <input type="password" defaultValue="Midtrans-Server-Key-Here" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-mono focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Client Key</label>
                    <input type="text" defaultValue="Midtrans-Client-Key-Here" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-mono focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <h2 className="font-display text-lg font-bold text-slate-900 mb-2">Domain Registrar (ResellerClub)</h2>
                <div className="grid gap-4 mt-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Reseller ID</label>
                    <input type="text" defaultValue="555432" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-mono focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">API Key</label>
                    <input type="password" defaultValue="xxxxxxxxxxxxxxxxxxxx" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-mono focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-display text-lg font-bold text-slate-900">Staff Members</h2>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Add Staff</button>
              </div>
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Admin Utama</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">Superadmin</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">Owner (Cannot edit)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">CS Rina</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Support Agent</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-medium">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "webhooks" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-center py-12">
              <LinkSimple className="mx-auto h-12 w-12 text-slate-300" weight="duotone" />
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">No Webhooks Configured</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">Webhooks allow external services to be notified when certain events happen in KiosHosting.</p>
              <button className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800">
                Create Webhook
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
