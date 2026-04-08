/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Send,
  Inbox,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { apiFetch } from "@/app/lib/api";

type FilterTab =
  | "all"
  | "sent"
  | "received"
  | "needsYourSignature"
  | "needsTheirSignature"
  | "fullySigned"
  | "rejected";

interface Agreement {
  id: string;
  agreementNumber: string;
  title: string;
  collaborator: string;
  type: string;
  direction: "sent" | "received";
  yourStatus: "signed" | "pending" | "rejected";
  theirStatus: "signed" | "pending" | "rejected";
  actionRequiredBy: "you" | "them" | "none";
  date: string;
  amount?: string;
  urgent?: boolean;
}

export default function MyAgreements() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [agreements, setAgreements] = useState<Agreement[]>([]);

  useEffect(() => {
    const loadAgreements = async () => {
      try {
        const data = await apiFetch("/api/agreements");

        const mapped = data.map((a: any) => {
          const isSender = a.senderId === a.sender.id;

          const direction = isSender ? "sent" : "received";

          const yourStatus = isSender
            ? a.senderSigned
              ? "signed"
              : "pending"
            : a.receiverSigned
              ? "signed"
              : "pending";

          const theirStatus = isSender
            ? a.receiverSigned
              ? "signed"
              : "pending"
            : a.senderSigned
              ? "signed"
              : "pending";

          let actionRequiredBy: "you" | "them" | "none" = "none";

          if (!a.senderSigned || !a.receiverSigned) {
            if (isSender && !a.receiverSigned) actionRequiredBy = "them";
            if (!isSender && !a.receiverSigned) actionRequiredBy = "you";
          }

          const typeMap: any = {
            LICENSE: "Content License",
            COLLABORATION: "Collaboration",
            REVENUE_SHARE: "Revenue Share",
            PARTNERSHIP: "Partnership",
          };

          return {
            id: a.id,
            agreementNumber: a.agreementNumber,
            title: a.title,
            collaborator: isSender ? a.receiver.email : a.sender.email,
            type: typeMap[a.type] || "Agreement",
            direction,
            yourStatus,
            theirStatus,
            actionRequiredBy,
            date: new Date(a.createdAt).toISOString().split("T")[0],
          };
        });

        setAgreements(mapped);
      } catch (error) {
        console.error(error);
      }
    };

    loadAgreements();
  }, []);

  const tabs = [
    { id: "all" as const, label: "All", icon: Users, count: agreements.length },
    {
      id: "sent" as const,
      label: "Sent by Me",
      icon: Send,
      count: agreements.filter((a) => a.direction === "sent").length,
    },
    {
      id: "received" as const,
      label: "Received by Me",
      icon: Inbox,
      count: agreements.filter((a) => a.direction === "received").length,
    },
    {
      id: "needsYourSignature" as const,
      label: "Needs My Signature",
      icon: AlertCircle,
      count: agreements.filter((a) => a.actionRequiredBy === "you").length,
      highlight: true,
    },
    {
      id: "needsTheirSignature" as const,
      label: "Needs Their Signature",
      icon: ArrowRight,
      count: agreements.filter((a) => a.actionRequiredBy === "them").length,
    },
    {
      id: "fullySigned" as const,
      label: "Fully Signed",
      icon: CheckCircle2,
      count: agreements.filter(
        (a) => a.yourStatus === "signed" && a.theirStatus === "signed",
      ).length,
    },
    {
      id: "rejected" as const,
      label: "Rejected",
      icon: XCircle,
      count: agreements.filter(
        (a) => a.yourStatus === "rejected" || a.theirStatus === "rejected",
      ).length,
    },
  ];

  const getStatusBadge = (
    status: "signed" | "pending" | "rejected",
    label: string,
  ) => {
    const variants = {
      signed: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    const icons = {
      signed: CheckCircle2,
      pending: AlertCircle,
      rejected: XCircle,
    };
    const Icon = icons[status];

    return (
      <Badge className={`${variants[status]} flex items-center gap-1 border`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const filterAgreements = (agreements: Agreement[], tab: FilterTab) => {
    switch (tab) {
      case "sent":
        return agreements.filter((a) => a.direction === "sent");
      case "received":
        return agreements.filter((a) => a.direction === "received");
      case "needsYourSignature":
        return agreements.filter((a) => a.actionRequiredBy === "you");
      case "needsTheirSignature":
        return agreements.filter((a) => a.actionRequiredBy === "them");
      case "fullySigned":
        return agreements.filter(
          (a) => a.yourStatus === "signed" && a.theirStatus === "signed",
        );
      case "rejected":
        return agreements.filter(
          (a) => a.yourStatus === "rejected" || a.theirStatus === "rejected",
        );
      default:
        return agreements;
    }
  };

  const filteredAgreements = filterAgreements(agreements, activeTab).filter(
    (agreement) =>
      agreement.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.collaborator
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      agreement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate summary stats
  const stats = {
    total: agreements.length,
    sent: agreements.filter((a) => a.direction === "sent").length,
    received: agreements.filter((a) => a.direction === "received").length,
    needsYourAction: agreements.filter((a) => a.actionRequiredBy === "you")
      .length,
    needsTheirAction: agreements.filter((a) => a.actionRequiredBy === "them")
      .length,
    fullySigned: agreements.filter(
      (a) => a.yourStatus === "signed" && a.theirStatus === "signed",
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">My Agreements</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage all your collaboration agreements
          </p>
        </div>
        <Button
          onClick={() => router.push("create-agreement")}
          className="bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-blue-600"
        >
          Create New Agreement
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-white/10 bg-slate-900 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-slate-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card className="border-white/10 bg-slate-900 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Send className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-slate-400">Sent</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.sent}</p>
        </Card>
        <Card className="border-white/10 bg-slate-900 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Inbox className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Received</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.received}</p>
        </Card>
        <Card className="border-white/10 bg-slate-900 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-slate-400">Your Action</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.needsYourAction}
          </p>
        </Card>
        <Card className="border-white/10 bg-slate-900 p-4">
          <div className="mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Their Action</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.needsTheirAction}
          </p>
        </Card>
        <Card className="border-white/10 bg-slate-900 p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-xs text-slate-400">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.fullySigned}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20"
                  : tab.highlight
                    ? "border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                    : "border border-white/10 bg-slate-900 text-slate-400 hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              <Badge
                className={`${
                  isActive
                    ? "border-white/30 bg-white/20 text-white"
                    : "border-slate-700 bg-slate-800 text-slate-300"
                } border text-xs`}
              >
                {tab.count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <Card className="border-white/10 bg-slate-900 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="top-1/2s absolute left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, collaborator, title, or type..."
              className="border-white/10 bg-slate-950 pl-10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          <Button
            variant="outline"
            className="justify-centerborder-white/10 flex items-center bg-slate-950 text-white hover:bg-white/5"
          >
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filter
          </Button>
        </div>
      </Card>

      {/* Agreements Table */}
      <Card className="overflow-hidden border-white/10 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Direction
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Agreement ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Collaborator
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Your Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Their Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Action Required
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAgreements.map((agreement, index) => (
                <tr
                  key={agreement.id}
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                    index === filteredAgreements.length - 1 ? "border-b-0" : ""
                  } ${agreement.urgent ? "bg-orange-500/5" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {agreement.direction === "sent" ? (
                        <div className="flex items-center gap-1 text-blue-400">
                          <ArrowRight className="h-4 w-4" />
                          <span className="text-xs font-medium">Sent</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-cyan-400">
                          <ArrowLeft className="h-4 w-4" />
                          <span className="text-xs font-medium">Received</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-purple-400">
                      {agreement.agreementNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-medium text-white">
                        {agreement.title}
                      </span>
                      {agreement.urgent && (
                        <Badge className="ml-2 border border-orange-500/30 bg-orange-500/20 text-xs text-orange-400">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-semibold text-white">
                        {agreement.collaborator
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-sm text-white">
                        {agreement.collaborator}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">
                      {agreement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(
                      agreement.yourStatus,
                      agreement.yourStatus === "signed"
                        ? "You Signed"
                        : agreement.yourStatus === "pending"
                          ? "Pending"
                          : "You Rejected",
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(
                      agreement.theirStatus,
                      agreement.theirStatus === "signed"
                        ? "They Signed"
                        : agreement.theirStatus === "pending"
                          ? "Pending"
                          : "They Rejected",
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {agreement.actionRequiredBy === "you" ? (
                      <Badge className="border border-orange-500/30 bg-orange-500/20 text-orange-400">
                        Your Action
                      </Badge>
                    ) : agreement.actionRequiredBy === "them" ? (
                      <Badge className="border border-yellow-500/30 bg-yellow-500/20 text-yellow-400">
                        Their Action
                      </Badge>
                    ) : (
                      <Badge className="border border-slate-500/30 bg-slate-500/20 text-slate-400">
                        None
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-green-400">
                      {agreement.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">
                      {agreement.date}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`agreements/${agreement.id}`)}
                      className="text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAgreements.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-slate-400">
              No agreements found matching your search
            </p>
          </div>
        )}
      </Card>

      {/* Results Summary */}
      {filteredAgreements.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <p>
            Showing {filteredAgreements.length} of {agreements.length}{" "}
            agreements
          </p>
          <p className="text-xs">
            {stats.needsYourAction > 0 && (
              <span className="font-medium text-orange-400">
                {stats.needsYourAction} agreement
                {stats.needsYourAction > 1 ? "s" : ""} need
                {stats.needsYourAction === 1 ? "s" : ""} your attention
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
