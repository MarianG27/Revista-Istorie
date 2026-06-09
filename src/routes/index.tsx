import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { Feather, BookOpen, ScrollText, Image as ImageIcon, FileDown, Lock } from "lucide-react";
import { listArticles, listProjects } from "@/lib/admin.functions";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { Button } from "@/components/ui/button";

const articlesQuery = queryOptions({
  queryKey: ["articles"],
  queryFn: () => listArticles(),
});
const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: () => listProjects(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Revista de Istorie" },
      { name: "description", content: "Articole de istorie, proiecte ale elevilor și galerie vizuală." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery),
      context.queryClient.ensureQueryData(projectsQuery),
    ]);
  },
  component: HomePage,
});

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="anim-ink display text-5xl text-primary">R · I</div>
      <div className="mt-4 text-sm tracking-[0.4em] text-muted-foreground">REVISTA DE ISTORIE</div>
      <div className="mt-8 h-px w-40 overflow-hidden bg-border">
        <div className="h-full w-1/3 animate-pulse bg-accent" />
      </div>
    </div>
  );
}

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Toate");
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const { data: articles = [] } = useQuery(articlesQuery);
  const { data: projects = [] } = useQuery(projectsQuery);

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => set.add(a.category));
    return ["Toate", ...Array.from(set)];
  }, [articles]);

  const filtered = activeCategory === "Toate" ? articles : articles.filter((a) => a.category === activeCategory);
  const openArticle = articles.find((a) => a.id === openArticleId) ?? filtered[0] ?? articles[0];

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen">
      {/* ZONA 1 — antet + meniu */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <div className="vintage-divider text-xs">EDIȚIA · ȘCOLARĂ</div>
          <h1 className="display text-5xl md:text-6xl tracking-tight">Revista de Istorie</h1>
          <p className="mt-1 italic text-muted-foreground">„Cine nu cunoaște trecutul, este condamnat să-l repete.”</p>
          <div className="gold-rule mt-4" />
          <nav className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm uppercase tracking-widest">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => { setActiveCategory(c); setOpenArticleId(null); }}
                className={`transition-colors ${activeCategory === c ? "text-primary border-b border-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {c}
              </button>
            ))}
            <a href="#proiecte" className="text-muted-foreground hover:text-foreground">Proiecte elevi</a>
            <a href="#galerie" className="text-muted-foreground hover:text-foreground">Galerie</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* ZONA 21 — listă articole */}
          <aside className="space-y-4">
            <h2 className="display flex items-center gap-2 text-2xl">
              <ScrollText className="h-5 w-5 text-accent" /> Articole
            </h2>
            <div className="gold-rule" />
            <ul className="space-y-3">
              {filtered.length === 0 && <li className="text-sm text-muted-foreground">Niciun articol în această categorie.</li>}
              {filtered.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => setOpenArticleId(a.id)}
                    className={`w-full text-left paper-card p-3 transition hover:translate-x-0.5 hover:border-accent ${openArticle?.id === a.id ? "border-accent" : ""}`}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-accent">{a.category}</div>
                    <div className="display text-lg leading-tight">{a.title}</div>
                    {a.excerpt && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.excerpt}</div>}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* ZONA 22 — articolul deschis */}
          <article className="paper-card p-6 md:p-10">
            {openArticle ? (
              <>
                <div className="text-xs uppercase tracking-[0.3em] text-accent">{openArticle.category}</div>
                <h2 className="display mt-2 text-3xl md:text-4xl leading-tight">{openArticle.title}</h2>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(openArticle.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div className="gold-rule my-4" />
                {openArticle.image_url && (
                  <figure className="my-4">
                    <img src={openArticle.image_url} alt={openArticle.title} className="w-full rounded-sm border border-border object-cover sepia-[0.15]" />
                  </figure>
                )}
                <div className="ink-prose md:columns-2 md:gap-8">
                  {openArticle.content.split("\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-20">
                <BookOpen className="mx-auto h-10 w-10 opacity-50" />
                <p className="mt-3">Selectează un articol din stânga.</p>
              </div>
            )}
          </article>
        </div>

        {/* ZONA 23 — proiecte elevi + galerie */}
        <section id="proiecte" className="mt-16">
          <h2 className="display flex items-center justify-center gap-3 text-3xl">
            <Feather className="h-6 w-6 text-accent" /> Proiectele elevilor
          </h2>
          <div className="gold-rule mx-auto mt-2 max-w-md" />
          <p className="mt-2 text-center italic text-muted-foreground">Lucrări și documente realizate de elevi.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground">Niciun proiect publicat încă.</div>
            )}
            {projects.map((p) => (
              <div key={p.id} className="paper-card p-5 flex flex-col">
                <div className="text-[10px] uppercase tracking-widest text-accent">Proiect elev</div>
                <h3 className="display text-xl mt-1">{p.title}</h3>
                {p.student_name && <div className="text-xs text-muted-foreground italic mt-0.5">— {p.student_name}</div>}
                {p.description && <p className="mt-2 text-sm text-foreground/80">{p.description}</p>}
                {p.file_url && (
                  <a
                    href={p.file_url}
                    download={p.file_name ?? undefined}
                    className="mt-4 inline-flex items-center gap-2 self-start text-sm quill-link"
                  >
                    <FileDown className="h-4 w-4" /> Descarcă {p.file_name ?? "document"}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="galerie" className="mt-16">
          <h2 className="display flex items-center justify-center gap-3 text-3xl">
            <ImageIcon className="h-6 w-6 text-accent" /> Galerie
          </h2>
          <div className="gold-rule mx-auto mt-2 max-w-md" />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {articles.filter((a) => a.image_url).slice(0, 8).map((a) => (
              <img key={a.id} src={a.image_url!} alt={a.title} className="aspect-square w-full object-cover rounded-sm border border-border sepia-[0.2]" />
            ))}
            {articles.filter((a) => a.image_url).length === 0 && (
              <div className="col-span-full text-center text-muted-foreground text-sm">
                Adaugă imagini articolelor din panoul de admin pentru a popula galeria.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ZONA 31 — subsol cu © (acces admin) */}
      <footer className="mt-20 border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col items-center gap-3">
          <div className="vintage-divider text-xs">✦ ✦ ✦</div>
          <p className="text-center text-sm text-muted-foreground">
            Revista de Istorie · Realizată cu pasiune pentru trecut
          </p>
          <button
            onClick={() => setLoginOpen(true)}
            title="©"
            aria-label="Acces admin"
            className="group mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-accent hover:text-primary"
          >
            <span className="text-base font-serif group-hover:hidden">©</span>
            <Lock className="hidden h-4 w-4 group-hover:block" />
          </button>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} — Toate drepturile rezervate</p>
        </div>
      </footer>

      <AdminLoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
