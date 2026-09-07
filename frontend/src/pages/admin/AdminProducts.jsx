import React from "react";
import { Plus, Tag, GlobeHemisphereWest, PencilSimple, Trash } from "@phosphor-icons/react";

export default function AdminProducts() {
  const hostingPlans = [
    { name: "Starter Pro", price: "Rp 15.000", cycle: "monthly", disk: "5 GB", clients: 124, status: "Active" },
    { name: "Business", price: "Rp 45.000", cycle: "monthly", disk: "20 GB", clients: 56, status: "Active" },
    { name: "Enterprise", price: "Rp 120.000", cycle: "monthly", disk: "Unlimited", clients: 12, status: "Active" },
  ];

  const domains = [
    { tld: ".com", register: "Rp 165.000", renew: "Rp 175.000", transfer: "Rp 165.000", active: true },
    { tld: ".id", register: "Rp 250.000", renew: "Rp 275.000", transfer: "Rp 250.000", active: true },
    { tld: ".net", register: "Rp 180.000", renew: "Rp 190.000", transfer: "Rp 180.000", active: true },
    { tld: ".co.id", register: "Rp 300.000", renew: "Rp 320.000", transfer: "Rp 300.000", active: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Products & Pricing</h1>
          <p className="text-sm text-slate-500">Manage hosting plans, domains, and pricing matrix</p>
        </div>
      </div>

      {/* Hosting Plans Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Tag className="h-5 w-5" weight="duotone" />
            </div>
            <h2 className="text-lg font-display font-bold text-slate-900">Hosting Packages</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" weight="bold" /> Add Package
          </button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hostingPlans.map((plan, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-900">{plan.name}</h3>
                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  {plan.status}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-500">/{plan.cycle}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600 border-t border-slate-100 pt-4">
                <span>Disk: <span className="font-semibold text-slate-900">{plan.disk}</span></span>
                <span>Clients: <span className="font-semibold text-slate-900">{plan.clients}</span></span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                  <PencilSimple className="h-4 w-4" /> Edit
                </button>
                <button className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Domains Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <GlobeHemisphereWest className="h-5 w-5" weight="duotone" />
            </div>
            <h2 className="text-lg font-display font-bold text-slate-900">TLD Pricing</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
            <Plus className="h-4 w-4" weight="bold" /> Add TLD
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Extension</th>
                <th className="px-6 py-4 font-semibold">Register (1 Yr)</th>
                <th className="px-6 py-4 font-semibold">Renew (1 Yr)</th>
                <th className="px-6 py-4 font-semibold">Transfer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {domains.map((domain, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 font-mono font-bold text-slate-900">
                      {domain.tld}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{domain.register}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{domain.renew}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{domain.transfer}</td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked={domain.active} />
                      <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
