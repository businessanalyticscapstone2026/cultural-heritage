import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { User, MapPin, Heart, Star, Settings, LogOut, ChevronRight, Camera, Edit3, Clock, Bookmark } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("patrimonio_auth");
      if (!raw) throw redirect({ to: "/" });
      try {
        const user = JSON.parse(raw);
        if (!user?.onboarded) throw redirect({ to: "/onboarding" });
      } catch (e) {
        if (e && typeof e === "object" && "to" in e) throw e;
        throw redirect({ to: "/" });
      }
    }
  },
  component: ProfilePage,
});

const interestLabels: Record<string, string> = {
  colonial: "Colonial Architecture", sacred: "Sacred Sites", nature: "Natural Heritage",
  art: "Art & Craft", music: "Living Culture", stories: "Stories & Lore",
  adventure: "Outdoor Trekking", coastal: "Coastal Heritage",
};

const savedDestinations = [
  { id: "basilica-martin", name: "Basilica of St. Martin de Tours", municipality: "Balayan", category: "Sacred", image: "/dest-1.jpg" },
  { id: "calatagan-archaeological", name: "Calatagan Archaeological Site", municipality: "Calatagan", category: "UNESCO", image: "/dest-4.jpg" },
  { id: "balayan-heritage-houses", name: "Balayan Heritage Houses", municipality: "Balayan", category: "Colonial", image: "/dest-2.jpg" },
  { id: "fortune-island", name: "Fortune Island Ruins", municipality: "Nasugbu", category: "Colonial", image: "/dest-3.jpg" },
];

const myReviews = [
  { site: "Basilica of St. Martin de Tours", siteId: "basilica-martin", rating: 5, text: "A breathtaking example of Baroque architecture. The centuries-old walls tell stories of the town deep spiritual roots.", date: "Jul 5, 2026" },
  { site: "Calatagan Archaeological Site", siteId: "calatagan-archaeological", rating: 4, text: "Fascinating pre-colonial burial ground. The gold ornaments on display are extraordinary.", date: "Jun 28, 2026" },
  { site: "Fortune Island Ruins", siteId: "fortune-island", rating: 4, text: "The Greek-style columns rising from the cliffside make for dramatic views. Best visited at sunset.", date: "Jun 20, 2026" },
];

const recentHistory = [
  { site: "Basilica of St. Martin de Tours", siteId: "basilica-martin", date: "Jul 10, 2026", action: "Visited" },
  { site: "Calatagan Archaeological Site", siteId: "calatagan-archaeological", date: "Jul 8, 2026", action: "Bookmarked" },
  { site: "Balayan Heritage Houses", siteId: "balayan-heritage-houses", date: "Jul 5, 2026", action: "Reviewed" },
  { site: "Fortune Island Ruins", siteId: "fortune-island", date: "Jul 1, 2026", action: "Viewed" },
  { site: "Lian Church", siteId: "lian-church", date: "Jun 28, 2026", action: "Viewed" },
];

type Tab = "saved" | "reviews" | "history" | "interests" | "settings";

function ProfilePage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("saved");

  const tabs: { id: Tab; label: string; icon: typeof Heart }[] = [
    { id: "saved", label: "Saved", icon: Bookmark },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "history", label: "History", icon: Clock },
    { id: "interests", label: "Interests", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="bg-cream pt-20 md:pt-24 border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-parchment border-4 border-cream flex items-center justify-center">
                <User size={36} strokeWidth={1.5} className="text-ink-soft" />
              </div>
              <button className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-ink text-primary-foreground border-2 border-cream transition-colors hover:bg-accent">
                <Camera size={14} strokeWidth={1.5} />
              </button>
            </div>
            <h1 className="mt-4 text-display text-2xl">{user?.name ?? "Guest"}</h1>
            <p className="mt-1 text-sm text-ink-soft">{user?.email ?? ""}</p>
            <button className="mt-4 flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-1.5 text-xs text-ink transition-colors hover:bg-parchment/60">
              <Edit3 size={12} strokeWidth={1.5} />
              Edit Profile
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-ink/10 bg-card p-6 text-center">
            <div className="text-display text-3xl">{savedDestinations.length}</div>
            <div className="mt-1 text-xs text-ink-soft">Saved</div>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-card p-6 text-center">
            <div className="text-display text-3xl">{myReviews.length}</div>
            <div className="mt-1 text-xs text-ink-soft">Reviews</div>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-card p-6 text-center">
            <div className="text-display text-3xl">{recentHistory.length}</div>
            <div className="mt-1 text-xs text-ink-soft">Visited</div>
          </div>
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex gap-1 overflow-x-auto border-b border-ink/10">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${
                  tab === t.id
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab content */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-10 pb-24">
        {tab === "saved" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-display text-xl mb-6">Saved Destinations</h2>
            {savedDestinations.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-ink/15 px-8 py-16 text-center">
                <Bookmark className="mx-auto h-12 w-12 text-ink/20 mb-4" />
                <p className="text-ink-soft">No saved destinations yet. Heart a site to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {savedDestinations.map((site) => (
                  <Link key={site.id} to="/heritage/$id" params={{ id: site.id }} className="group overflow-hidden rounded-2xl border border-ink/10 bg-card transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={site.image} alt={site.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">{site.category}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-ink group-hover:text-accent transition-colors">{site.name}</h3>
                      <p className="mt-1 text-xs text-ink-soft">{site.municipality}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "reviews" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-display text-xl mb-6">My Reviews</h2>
            <div className="space-y-4">
              {myReviews.map((review, i) => (
                <div key={i} className="rounded-2xl border border-ink/10 bg-card p-6">
                  <div className="flex items-start justify-between">
                    <Link to="/heritage/$id" params={{ id: review.siteId }} className="text-display text-base text-ink hover:text-accent transition-colors">{review.site}</Link>
                    <span className="text-xs text-ink-soft shrink-0 ml-4">{review.date}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={12} className={s < review.rating ? "fill-accent text-accent" : "text-ink/20"} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-display text-xl mb-6">Recent Activity</h2>
            <div className="space-y-1">
              {recentHistory.map((item, i) => (
                <Link key={i} to="/heritage/$id" params={{ id: item.siteId }} className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-parchment/50">
                  <Clock size={16} className="shrink-0 text-ink-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink group-hover:text-accent transition-colors">{item.site}</p>
                    <p className="text-xs text-ink-soft">{item.action} · {item.date}</p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-ink-soft" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "interests" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-display text-xl">Travel Interests</h2>
              <Link to="/onboarding" className="text-xs text-accent underline underline-offset-4 hover:text-ink transition-colors">
                Update preferences
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-ink/10 bg-card p-6">
                <h3 className="text-sm font-medium text-ink mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {(user?.interests?.length ? user.interests : []).map((interest) => (
                    <span key={interest} className="rounded-full bg-parchment/60 border border-ink/10 px-3 py-1 text-xs text-ink">
                      {interestLabels[interest] ?? interest}
                    </span>
                  ))}
                  {(!user?.interests || user.interests.length === 0) && (
                    <p className="text-xs text-ink-soft">No interests set. Complete onboarding to personalize.</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-card p-6">
                <h3 className="text-sm font-medium text-ink mb-3">Travel Style</h3>
                <p className="text-xs text-ink-soft">{user?.travelStyle ? `You travel ${user.travelStyle}.` : "Not set yet."}</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-card p-6">
                <h3 className="text-sm font-medium text-ink mb-3">Accessibility</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.accessibilityPrefs?.length
                    ? user.accessibilityPrefs.map((p) => (
                        <span key={p} className="rounded-full bg-parchment/60 border border-ink/10 px-3 py-1 text-xs text-ink">{p}</span>
                      ))
                    : <p className="text-xs text-ink-soft">No preferences set.</p>
                  }
                </div>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-card p-6">
                <h3 className="text-sm font-medium text-ink mb-3">Travel Distance</h3>
                <p className="text-xs text-ink-soft">{user?.travelDistance ?? "Not set yet."}</p>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-display text-xl mb-6">Settings</h2>
            <div className="space-y-4 max-w-lg">
              {[
                { label: "Notification Preferences", desc: "Manage email and push notifications" },
                { label: "Privacy Settings", desc: "Control who can see your profile and activity" },
                { label: "Language", desc: "English" },
                { label: "Location Services", desc: user?.locationEnabled ? "Enabled" : "Disabled" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-ink/10 bg-card px-6 py-4 transition-colors hover:bg-parchment/30 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-ink-soft mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-ink-soft" />
                </div>
              ))}
              <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-card px-6 py-4 text-sm text-red-600 transition-colors hover:bg-red-50 mt-8">
                <LogOut size={16} strokeWidth={1.5} />
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
