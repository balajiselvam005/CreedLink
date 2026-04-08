/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  FileText,
  Clock,
  CheckCircle2,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Send,
  Inbox,
  UserCheck,
  AlertCircle,
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";

type Stats = {
  total: number;
  sent: number;
  received: number;
  signedBoth: number;
  waitingYou: number;
  waitingThem: number;
};

export default function Dashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<any[]>([]);
  const [flow, setFlow] = useState<any[]>([]);
  const [signature, setSignature] = useState<any[]>([]);
  const [action, setAction] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const data = await apiFetch("/api/dashboard");

      setStats([
        {
          icon: FileText,
          label: "Total Agreements",
          value: data.stats.total,
          change: "",
          trend: "up",
          color: "from-purple-500 to-purple-600",
          detail: "",
        },
        {
          icon: Send,
          label: "Sent by You",
          value: data.stats.sent,
          change: "",
          trend: "up",
          color: "from-blue-500 to-blue-600",
          detail: "",
        },
        {
          icon: Inbox,
          label: "Received by You",
          value: data.stats.received,
          change: "",
          trend: "up",
          color: "from-cyan-500 to-cyan-600",
          detail: "",
        },
        {
          icon: CheckCircle2,
          label: "Signed by Both",
          value: data.stats.signedBoth,
          change: "",
          trend: "up",
          color: "from-green-500 to-green-600",
          detail: "",
        },
        {
          icon: AlertCircle,
          label: "Waiting Your Action",
          value: data.stats.waitingYou,
          change: "",
          trend: "down",
          color: "from-orange-500 to-orange-600",
          detail: "",
        },
        {
          icon: Clock,
          label: "Waiting Their Action",
          value: data.stats.waitingThem,
          change: "",
          trend: "up",
          color: "from-yellow-500 to-yellow-600",
          detail: "",
        },
      ]);

      setFlow(data.bidirectionalFlow);

      setSignature([
        {
          name: "Both Signed",
          value: data.signatureBreakdown.bothSigned,
          color: "#10b981",
        },
        {
          name: "You Signed",
          value: data.signatureBreakdown.youSigned,
          color: "#3b82f6",
        },
        {
          name: "They Signed",
          value: data.signatureBreakdown.theySigned,
          color: "#06b6d4",
        },
        {
          name: "Both Pending",
          value: data.signatureBreakdown.bothPending,
          color: "#eab308",
        },
        {
          name: "Rejected",
          value: data.signatureBreakdown.rejected,
          color: "#ef4444",
        },
      ]);

      setAction([
        {
          name: "Your Action",
          value: data.actionRequired.yourAction,
          color: "#f59e0b",
        },
        {
          name: "Their Action",
          value: data.actionRequired.theirAction,
          color: "#eab308",
        },
        {
          name: "Completed",
          value: data.actionRequired.completed,
          color: "#10b981",
        },
        {
          name: "Rejected",
          value: data.actionRequired.rejected,
          color: "#ef4444",
        },
      ]);

      setTypes(data.agreementTypes);
      setMonthly(data.monthlyPerformance);
      setCollaborators(data.topCollaborators);
      setInsights(data.quickInsights);
    };

    loadDashboard();
  }, []);

  if (!stats.length) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="space-y-8 text-white">
      {/* STATS */}

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const Trend = stat.trend === "up" ? TrendingUp : TrendingDown;

          return (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-slate-900 p-6"
            >
              <div className="mb-4 flex justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>

                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <Trend size={12} />
                    {stat.change}
                  </div>
                </div>

                <div
                  className={`rounded-xl bg-gradient-to-br p-3 ${stat.color}`}
                >
                  <Icon size={20} />
                </div>
              </div>

              <p className="text-xs text-slate-500">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      {/* FLOW + PIE */}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl">Bidirectional Agreement Flow</h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={flow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="sent"
                stroke="#3b82f6"
                fill="#3b82f633"
              />
              <Area
                type="monotone"
                dataKey="received"
                stroke="#06b6d4"
                fill="#06b6d433"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl">Action Required</h2>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={action}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
              >
                {action.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SIGNATURE */}

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl">Signature Status Breakdown</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={signature}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value">
                {signature.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RADAR */}
        <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl">Performance Analysis</h2>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart
              data={[
                { metric: "Response Time", yourScore: 92, avgScore: 75 },
                { metric: "Acceptance Rate", yourScore: 92, avgScore: 78 },
                { metric: "Agreement Volume", yourScore: 85, avgScore: 70 },
                { metric: "Completion Speed", yourScore: 88, avgScore: 72 },
                { metric: "Collaboration", yourScore: 95, avgScore: 80 },
              ]}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              <Radar
                name="You"
                dataKey="yourScore"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.4}
              />
              <Radar
                name="Average"
                dataKey="avgScore"
                stroke="#64748b"
                fill="#64748b"
                fillOpacity={0.2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AGREEMENT TYPES + MONTHLY */}

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl">Agreement Types</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={types} layout="vertical">
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis
                type="category"
                dataKey="type"
                stroke="#94a3b8"
                width={120}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl">Monthly Performance</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line dataKey="agreements" stroke="#a855f7" strokeWidth={3} />
              <Line dataKey="signed" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COLLABORATORS */}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl">Top Collaborators</h2>

          <div className="space-y-4">
            {collaborators.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-slate-950 p-4"
              >
                <div>
                  <p className="font-medium">{c.name}</p>

                  <div className="flex gap-3 text-xs text-slate-400">
                    <span>Sent {c.sent}</span>
                    <span>Received {c.received}</span>
                    <span>Signed {c.bothSigned}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INSIGHTS */}

        <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl">Quick Insights</h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm">
                <span>Avg Response Time</span>
                <span>{insights?.avgResponseTime}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded bg-slate-800">
                <div className="h-2 w-[76%] rounded bg-purple-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{insights?.completionRate}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded bg-slate-800">
                <div className="h-2 w-[67%] rounded bg-green-500" />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold">${insights?.totalRevenue}</p>

              <button
                onClick={() => router.push("/agreements")}
                className="mt-4 w-full rounded-lg bg-linear-to-r from-purple-500 to-blue-500 py-2"
              >
                View Agreements
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
