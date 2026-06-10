import { useState, useEffect, useRef } from "react";

// ── CONFIG — update these ──
const WHATSAPP = "2348160164718"; // ← Your WhatsApp number
const ADMIN_PIN = "1112"; // ← Change this to your secret PIN

const CONDITIONS = ["Brand New", "UK Used", "Nigerian Used", "Refurbished"];
const CATEGORIES = ["Smartphone", "Laptop", "Tablet", "Smartwatch", "Earbuds / Headphones", "Accessory", "Other"];
const CAT_ICON = { Smartphone: "📱", Laptop: "💻", Tablet: "📟", Smartwatch: "⌚", "Earbuds / Headphones": "🎧", Accessory: "🔌", Other: "📦" };

const SAMPLE_LISTINGS = [
  { id: 1, name: "iPhone 14 Pro Max", category: "Smartphone", condition: "Brand New", specs: "256GB · Deep Purple · Unlocked", price: 720000, negotiable: true, image: "", sold: false },
  { id: 2, name: "Dell XPS 15", category: "Laptop", condition: "UK Used", specs: "Core i7 · 16GB RAM · 512GB SSD · RTX 3050", price: 850000, negotiable: true, image: "", sold: false },
  { id: 3, name: "Samsung Galaxy S23", category: "Smartphone", condition: "Nigerian Used", specs: "128GB · Phantom Black · Dual SIM", price: 380000, negotiable: true, image: "", sold: false },
];

const toBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });

const fmt = (n) => "₦" + Number(n).toLocaleString();
const EMPTY = { name: "", category: "", condition: "", specs: "", price: "", negotiable: true, image: "", sold: false };

// ─────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
      background: "#0d0d0d", color: "#f5f3ef", padding: "0.8rem 1.6rem",
      fontSize: "0.83rem", fontWeight: 500, letterSpacing: "0.04em",
      boxShadow: "0 8px 28px rgba(0,0,0,0.18)", zIndex: 9999, whiteSpace: "nowrap"
    }}>{msg}</div>
  );
}

// ─────────────────────────────────────────
// ADMIN COMPONENTS
// ─────────────────────────────────────────

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const check = () => {
    if (pin === ADMIN_PIN) { onUnlock(); }
    else { setErr(true); setPin(""); setTimeout(() => setErr(false), 1500); }
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f3ef" }}>
      <div style={{ background: "#fff", border: "1px solid #e0dbd2", padding: "2.5rem 2rem", width: "100%", maxWidth: 320, textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "1.5rem", marginBottom: "0.3rem" }}>Asura<span style={{ color: "#c94a2b" }}>Gadgets</span></div>
        <div style={{ fontSize: "0.75rem", color: "#7a7570", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2rem" }}>Admin Access</div>
        <input
          type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Enter PIN"
          style={{
            width: "100%", padding: "0.85rem 1rem", border: `1px solid ${err ? "#c94a2b" : "#d4cfc8"}`,
            background: "#faf8f4", fontFamily: "inherit", fontSize: "1rem",
            textAlign: "center", letterSpacing: "0.3em", outline: "none", marginBottom: "0.8rem"
          }}
        />
        {err && <div style={{ fontSize: "0.78rem", color: "#c94a2b", marginBottom: "0.8rem" }}>Wrong PIN. Try again.</div>}
        <button onClick={check} style={{ ...primaryBtn, width: "100%" }}>Enter →</button>
      </div>
    </div>
  );
}

function AdminForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState(editing || EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { setForm(editing || EMPTY); }, [editing]);

  const handleImg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { alert("Photo too large. Use one under 4MB."); return; }
    setUploading(true);
    const b64 = await toBase64(file);
    set("image", b64);
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!form.name || !form.category || !form.condition || !form.price) {
      alert("Fill in Name, Category, Condition and Price."); return;
    }
    onSave({ ...form, id: editing?.id || Date.now() });
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e0dbd2", padding: "1.6rem", marginBottom: "1.8rem" }}>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.2rem", marginBottom: "1.3rem", letterSpacing: "-0.02em" }}>
        {editing ? "✏️ Edit Listing" : "➕ Add New Listing"}
      </h3>

      {/* Photo */}
      <div style={{ marginBottom: "1.1rem" }}>
        <label style={lbl}>Photo</label>
        <div onClick={() => fileRef.current.click()} style={{
          border: "2px dashed #d4cfc8", borderRadius: 2, padding: "1.2rem",
          textAlign: "center", cursor: "pointer", background: "#faf8f4", position: "relative", minHeight: 100
        }}>
          {form.image
            ? <img src={form.image} alt="preview" style={{ maxHeight: 160, maxWidth: "100%", objectFit: "contain" }} />
            : <div style={{ color: "#7a7570", fontSize: "0.82rem" }}><div style={{ fontSize: "1.8rem" }}>📸</div>Tap to upload</div>}
          {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem" }}>Processing…</div>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
        {form.image && <button onClick={() => set("image", "")} style={{ ...ghostBtn, marginTop: "0.4rem", fontSize: "0.72rem", padding: "0.3rem 0.7rem" }}>Remove photo</button>}
      </div>

      {/* Name */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={lbl}>Product Name *</label>
        <input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. iPhone 15 Pro 128GB" />
      </div>

      {/* Category + Condition */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
        <div>
          <label style={lbl}>Category *</label>
          <select style={inp} value={form.category} onChange={e => set("category", e.target.value)}>
            <option value="">— Pick —</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Condition *</label>
          <select style={inp} value={form.condition} onChange={e => set("condition", e.target.value)}>
            <option value="">— Pick —</option>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Specs */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={lbl}>Specs / Description</label>
        <textarea style={{ ...inp, minHeight: 75, resize: "vertical" }} value={form.specs}
          onChange={e => set("specs", e.target.value)} placeholder="e.g. 8GB RAM · 256GB · Unlocked · Space Grey" />
      </div>

      {/* Price + negotiable */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "end", marginBottom: "1rem" }}>
        <div>
          <label style={lbl}>Price (₦) *</label>
          <input style={inp} type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 650000" />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#7a7570", cursor: "pointer", paddingBottom: "0.8rem" }}>
          <input type="checkbox" checked={form.negotiable} onChange={e => set("negotiable", e.target.checked)} /> Negotiable
        </label>
      </div>

      {/* Sold */}
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#7a7570", cursor: "pointer", marginBottom: "1.4rem" }}>
        <input type="checkbox" checked={form.sold} onChange={e => set("sold", e.target.checked)} /> Mark as Sold
      </label>

      <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
        <button onClick={handleSubmit} style={primaryBtn}>{editing ? "Save Changes" : "Add Listing"}</button>
        {editing && <button onClick={onCancel} style={ghostBtn}>Cancel</button>}
      </div>
    </div>
  );
}

function AdminCard({ item, onEdit, onDelete }) {
  return (
    <div style={{ border: "1px solid #e0dbd2", background: "#fff", display: "flex", gap: "0.9rem", padding: "0.9rem", opacity: item.sold ? 0.5 : 1 }}>
      <div style={{ width: 72, height: 72, flexShrink: 0, background: "#ede9e1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "1.8rem" }}>{CAT_ICON[item.category] || "📦"}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {item.name}
          {item.sold && <span style={{ fontSize: "0.6rem", background: "#7a7570", color: "#fff", padding: "0.15rem 0.45rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sold</span>}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#7a7570", marginTop: "0.15rem" }}>{item.condition} · {item.category}</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", marginTop: "0.3rem" }}>{fmt(item.price)}{item.negotiable ? <span style={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#7a7570" }}> neg.</span> : ""}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flexShrink: 0 }}>
        <button onClick={() => onEdit(item)} style={{ ...ghostBtn, fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}>Edit</button>
        <button onClick={() => onDelete(item.id)} style={{ ...ghostBtn, fontSize: "0.72rem", padding: "0.3rem 0.65rem", color: "#c94a2b", borderColor: "#c94a2b" }}>Delete</button>
      </div>
    </div>
  );
}

function AdminPanel({ listings, onSave, onDelete, onLogout }) {
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  const handleSave = (item) => {
    const isEdit = !!editing;
    const updated = isEdit ? listings.map(l => l.id === item.id ? item : l) : [item, ...listings];
    onSave(updated);
    setEditing(null);
    setToast(isEdit ? "✓ Listing updated" : "✓ Listing added");
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this listing?")) return;
    onDelete(id);
    setToast("Listing deleted");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ef" }}>
      <div style={{ background: "#0d0d0d", padding: "1rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem", color: "#f5f3ef" }}>
          Asura<span style={{ color: "#c94a2b" }}>Gadgets</span> <span style={{ fontSize: "0.7rem", color: "#7a7570", letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin</span>
        </div>
        <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #333", color: "#7a7570", fontSize: "0.72rem", padding: "0.35rem 0.8rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em", textTransform: "uppercase" }}>Logout</button>
      </div>
      <div style={{ padding: "1.4rem", maxWidth: 700, margin: "0 auto" }}>
        <AdminForm onSave={handleSave} editing={editing} onCancel={() => setEditing(null)} key={editing?.id || "new"} />
        {listings.length > 0 && (
          <>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7570", marginBottom: "0.8rem" }}>
              All Listings ({listings.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {listings.map(item => (
                <AdminCard key={item.id} item={item}
                  onEdit={i => { setEditing(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN WEBSITE
// ─────────────────────────────────────────

function Nav({ onAdminClick }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1.1rem 5vw",
      background: "rgba(245,243,239,0.92)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(13,13,13,0.1)"
    }}>
      <a href="#" style={{ fontFamily: "Georgia,serif", fontSize: "1.35rem", textDecoration: "none", color: "#0d0d0d", letterSpacing: "-0.02em" }}>
        Asura<span style={{ color: "#c94a2b" }}>Gadgets</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
        {["#services", "#shop", "#how", "#contact"].map((href, i) => (
          <a key={href} href={href} style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", color: "#7a7570" }}
            onMouseEnter={e => e.target.style.color = "#0d0d0d"} onMouseLeave={e => e.target.style.color = "#7a7570"}>
            {["Services", "Shop", "How It Works", "Contact"][i]}
          </a>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
        <a href="#contact" style={{ background: "#0d0d0d", color: "#f5f3ef", padding: "0.5rem 1.2rem", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}>
          Get a Quote
        </a>
        <button onClick={onAdminClick} style={{ background: "transparent", border: "1px solid #d4cfc8", color: "#7a7570", padding: "0.45rem 0.9rem", fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ⚙️
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", paddingTop: 72, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "5rem 4vw 5rem 6vw" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c94a2b", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ display: "inline-block", width: 24, height: 1, background: "#c94a2b" }} />
          Phones · Laptops · Gadgets · Lagos
        </div>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(2.8rem,5vw,5rem)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.4rem" }}>
          Buy. Sell.<br /><em style={{ fontStyle: "italic", color: "#c94a2b" }}>Swap.</em> Repair.
        </h1>
        <p style={{ fontSize: "1rem", color: "#7a7570", maxWidth: 420, lineHeight: 1.75, marginBottom: "2.5rem", fontWeight: 300 }}>
          Your one-stop destination for pre-owned and new tech in Lagos. We buy your old devices, sell quality gadgets, and fix what's broken — fast, fair, reliable.
        </p>
        <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
          <a href="#shop" style={{ ...primaryBtn, textDecoration: "none" }}>Browse Listings ↓</a>
          <a href="#contact" style={{ ...ghostBtn, textDecoration: "none" }}>Get a Quote</a>
        </div>
      </div>
      <div style={{ background: "#ede9e1", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "clamp(5rem,12vw,14rem)", color: "#e3dfd7", userSelect: "none", lineHeight: 1, letterSpacing: "-0.05em" }}>AG</div>
        {[
          { label: "Devices Sold", val: "2,400+", sub: "Happy customers", top: "18%", left: "6%" },
          { label: "Repairs Done", val: "98%", sub: "Success rate", top: "42%", right: "8%" },
          { label: "Turnaround", val: "24 hrs", sub: "Most repairs", bottom: "20%", left: "12%" },
        ].map((c, i) => (
          <div key={i} style={{
            position: "absolute", ...c, background: "#fff", border: "1px solid rgba(13,13,13,0.1)",
            padding: "1rem 1.3rem", minWidth: 150, boxShadow: "0 6px 24px rgba(0,0,0,0.07)",
            animation: `float ${3.5 + i * 0.5}s ease-in-out ${i * 0.6}s infinite`
          }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7570", marginBottom: "0.2rem" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#c94a2b", display: "inline-block", marginRight: "0.35rem" }} />{c.label}
            </div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "1.45rem" }}>{c.val}</div>
            <div style={{ fontSize: "0.75rem", color: "#7a7570", marginTop: "0.1rem" }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  const items = [
    { icon: "🛒", title: "Buy Gadgets", desc: "Quality new and certified pre-owned phones, laptops, and accessories at honest prices.", link: "#shop", cta: "Browse listings →" },
    { icon: "💰", title: "Sell Your Device", desc: "Get fast, fair cash for your used phones and laptops. No haggling — just an honest price.", link: "#contact", cta: "Get a quote →" },
    { icon: "🔄", title: "Swap & Trade", desc: "Trade in your old device and upgrade to something better. Simple and transparent.", link: "#contact", cta: "Start a swap →" },
    { icon: "🔧", title: "Repairs", desc: "Screen replacements, battery swaps, charging ports, software fixes. Most done same day.", link: "#contact", cta: "Book repair →" },
  ];
  return (
    <section id="services" style={{ padding: "6rem 6vw" }}>
      <div style={{ maxWidth: 480, marginBottom: "3.5rem" }}>
        <SectionTag>What We Do</SectionTag>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.7rem)", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: "0.7rem" }}>Everything tech, under one roof</h2>
        <p style={{ color: "#7a7570", fontWeight: 300, lineHeight: 1.7 }}>Whether you're upgrading, downsizing, or dealing with a cracked screen.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid rgba(13,13,13,0.1)", borderLeft: "1px solid rgba(13,13,13,0.1)" }}>
        {items.map(s => (
          <div key={s.title} style={{ padding: "2.2rem 1.8rem", borderRight: "1px solid rgba(13,13,13,0.1)", borderBottom: "1px solid rgba(13,13,13,0.1)", cursor: "pointer", transition: "background 0.2s", position: "relative" }}
            onMouseEnter={e => e.currentTarget.style.background = "#ede9e1"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            onClick={() => document.querySelector(s.link)?.scrollIntoView({ behavior: "smooth" })}>
            <div style={{ fontSize: "1.7rem", marginBottom: "1rem" }}>{s.icon}</div>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.2rem", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>{s.title}</h3>
            <p style={{ fontSize: "0.87rem", color: "#7a7570", lineHeight: 1.65, fontWeight: 300 }}>{s.desc}</p>
            <a href={s.link} style={{ display: "inline-block", marginTop: "1rem", fontSize: "0.76rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#c94a2b", textDecoration: "none" }}>{s.cta}</a>
          </div>
        ))}
      </div>
    </section>
  );
}

function Shop({ listings }) {
  const [filter, setFilter] = useState("All");
  const active = listings.filter(l => !l.sold);
  const cats = ["All", ...Array.from(new Set(active.map(l => l.category)))];
  const shown = filter === "All" ? active : active.filter(l => l.category === filter);

  return (
    <section id="shop" style={{ padding: "6rem 6vw", background: "#fff" }}>
      <div style={{ maxWidth: 480, marginBottom: "2.5rem" }}>
        <SectionTag>Available Now</SectionTag>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.7rem)", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: "0.7rem" }}>Fresh listings</h2>
        <p style={{ color: "#7a7570", fontWeight: 300, lineHeight: 1.7 }}>Hand-picked and tested. Message us to confirm availability or negotiate.</p>
      </div>

      {cats.length > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: "0.4rem 1rem", border: "1px solid", fontFamily: "inherit",
              fontSize: "0.76rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
              background: filter === c ? "#0d0d0d" : "transparent",
              color: filter === c ? "#f5f3ef" : "#7a7570",
              borderColor: filter === c ? "#0d0d0d" : "#d4cfc8"
            }}>{c}</button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#7a7570" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <p style={{ fontSize: "0.9rem" }}>No listings yet — check back soon or message us on WhatsApp.</p>
          <a href={`https://wa.me/${WHATSAPP}?text=Hi%20AsuraGadgets!%20What%20do%20you%20have%20in%20stock%3F`} target="_blank" rel="noreferrer"
            style={{ display: "inline-block", marginTop: "1.2rem", ...primaryBtn, textDecoration: "none" }}>
            💬 Ask on WhatsApp
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))", gap: "1.3rem" }}>
          {shown.map(item => (
            <div key={item.id} style={{ border: "1px solid #e0dbd2", background: "#faf8f4", overflow: "hidden", transition: "all 0.22s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d0d0d"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(0,0,0,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0dbd2"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ height: 190, background: "#ede9e1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "3.5rem" }}>{CAT_ICON[item.category] || "📦"}</span>}
              </div>
              <div style={{ padding: "1.2rem" }}>
                <span style={{
                  display: "inline-block", fontSize: "0.6rem", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "0.2rem 0.5rem", marginBottom: "0.6rem",
                  background: item.condition === "Brand New" ? "#c94a2b" : "#e0dbd2",
                  color: item.condition === "Brand New" ? "#fff" : "#7a7570"
                }}>{item.condition}</span>
                <div style={{ fontFamily: "Georgia,serif", fontSize: "1.05rem", marginBottom: "0.3rem" }}>{item.name}</div>
                {item.specs && <div style={{ fontSize: "0.78rem", color: "#7a7570", marginBottom: "0.8rem", lineHeight: 1.5 }}>{item.specs}</div>}
                <div style={{ fontFamily: "Georgia,serif", fontSize: "1.25rem", marginBottom: "0.9rem" }}>
                  {fmt(item.price)}{item.negotiable && <span style={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: "#7a7570" }}> / neg.</span>}
                </div>
                <a href={`https://wa.me/${WHATSAPP}?text=Hi!%20I%20am%20interested%20in%20the%20${encodeURIComponent(item.name)}%20(${encodeURIComponent(fmt(item.price))})%20listed%20on%20your%20site.`}
                  target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "#25D366", color: "#fff", padding: "0.7rem", textDecoration: "none", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  💬 Enquire on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
        <a href={`https://wa.me/${WHATSAPP}?text=Hi%20AsuraGadgets!%20Please%20show%20me%20your%20full%20stock.`}
          target="_blank" rel="noreferrer" style={{ ...ghostBtn, textDecoration: "none" }}>
          See full stock on WhatsApp →
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Reach out or walk in", body: "Send us a WhatsApp or come in store. Tell us what you need — buying, selling, swapping or a repair." },
    { n: "02", title: "Get your instant quote", body: "We assess the device and give you a clear, no-obligation price on the spot. No hidden charges." },
    { n: "03", title: "Walk away happy", body: "Complete the deal, pick up your gadget, or collect your repaired device. Fast, guaranteed, honest." },
  ];
  return (
    <section id="how" style={{ padding: "6rem 6vw", background: "#ede9e1" }}>
      <div style={{ maxWidth: 480, marginBottom: "2.5rem" }}>
        <SectionTag>How It Works</SectionTag>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.7rem)", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: "0.7rem" }}>Simple. Fast. Honest.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ padding: "2.5rem 2rem", borderRight: i < 2 ? "1px solid rgba(13,13,13,0.1)" : "none" }}>
            <span style={{ fontFamily: "Georgia,serif", fontSize: "3rem", color: "rgba(13,13,13,0.1)", lineHeight: 1, display: "block", marginBottom: "0.9rem" }}>{s.n}</span>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.15rem", marginBottom: "0.5rem", letterSpacing: "-0.015em" }}>{s.title}</h3>
            <p style={{ fontSize: "0.86rem", color: "#7a7570", lineHeight: 1.7, fontWeight: 300 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", service: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.phone || !form.service || !form.message) { alert("Please fill all fields."); return; }
    setSending(true);
    try {
      const res = await fetch("https://formspree.io/f/YOUR_FORMSPREE_ID", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) setSent(true); else throw new Error();
    } catch {
      alert("Something went wrong. Please message us on WhatsApp instead.");
    }
    setSending(false);
  };

  return (
    <section id="contact" style={{ padding: "6rem 6vw", background: "#f5f3ef" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }}>
        <div>
          <SectionTag>Get In Touch</SectionTag>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,3vw,2.7rem)", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: "1rem" }}>Let's talk tech</h2>
          <p style={{ color: "#7a7570", fontWeight: 300, lineHeight: 1.7, marginBottom: "2rem" }}>Have a device to sell, want a repair quote, or just want to see what's in stock? We respond fast.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {[
              { icon: "💬", label: "WhatsApp", val: `+${WHATSAPP}`, href: `https://wa.me/${WHATSAPP}` },
              { icon: "✉️", label: "Email", val: "hello@asuragadgets.com", href: "mailto:hello@asuragadgets.com" },
              { icon: "📍", label: "Location", val: "Lagos, Nigeria", href: "#" },
            ].map(c => (
              <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.9rem", textDecoration: "none", color: "#0d0d0d", padding: "0.9rem 1.1rem", background: "#fff", border: "1px solid #e0dbd2", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d0d0d"; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0dbd2"; e.currentTarget.style.transform = "none"; }}>
                <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#7a7570", marginBottom: "0.1rem" }}>{c.label}</div>
                  <div style={{ fontSize: "0.88rem" }}>{c.val}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e0dbd2", padding: "2.2rem" }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.3rem", marginBottom: "0.3rem" }}>Send a message</h3>
          <p style={{ fontSize: "0.82rem", color: "#7a7570", marginBottom: "1.6rem", fontWeight: 300 }}>We'll get back within the hour.</p>
          {sent ? (
            <div style={{ textAlign: "center", padding: "2rem", fontFamily: "Georgia,serif", color: "#c94a2b", fontSize: "1.1rem" }}>✓ Message sent! We'll be in touch shortly.</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "0.9rem" }}>
                <div><label style={lbl}>Name</label><input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" /></div>
                <div><label style={lbl}>Phone / WhatsApp</label><input style={inp} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+234..." /></div>
              </div>
              <div style={{ marginBottom: "0.9rem" }}>
                <label style={lbl}>What do you need?</label>
                <select style={inp} value={form.service} onChange={e => set("service", e.target.value)}>
                  <option value="">— Select —</option>
                  <option>Buy a device</option><option>Sell my device</option>
                  <option>Swap / Trade-in</option><option>Repair</option><option>Just a question</option>
                </select>
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={lbl}>Message</label>
                <textarea style={{ ...inp, minHeight: 100, resize: "vertical" }} value={form.message} onChange={e => set("message", e.target.value)} placeholder="Tell us about the device — model, condition, what you need..." />
              </div>
              <button onClick={submit} disabled={sending} style={{ ...primaryBtn, width: "100%", opacity: sending ? 0.7 : 1 }}>
                {sending ? "Sending…" : "Send Message →"}
              </button>
              <p style={{ fontSize: "0.7rem", color: "#7a7570", textAlign: "center", marginTop: "0.7rem" }}>
                Or <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{ color: "#c94a2b" }}>message us on WhatsApp</a> directly.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(13,13,13,0.1)", padding: "2.5rem 6vw", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
      <a href="#" style={{ fontFamily: "Georgia,serif", fontSize: "1.15rem", textDecoration: "none", color: "#0d0d0d", letterSpacing: "-0.02em" }}>
        Asura<span style={{ color: "#c94a2b" }}>Gadgets</span>
      </a>
      <div style={{ display: "flex", gap: "1.8rem" }}>
        {[["#services", "Services"], ["#shop", "Shop"], ["#how", "How It Works"], ["#contact", "Contact"]].map(([h, t]) => (
          <a key={h} href={h} style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7a7570", textDecoration: "none" }}>{t}</a>
        ))}
      </div>
      <small style={{ fontSize: "0.73rem", color: "#7a7570" }}>© 2026 AsuraGadgets. All rights reserved.</small>
    </footer>
  );
}

function SectionTag({ children }) {
  return (
    <div style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c94a2b", marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ display: "inline-block", width: 18, height: 1, background: "#c94a2b" }} />{children}
    </div>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const lbl = { display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#7a7570", marginBottom: "0.4rem" };
const inp = { width: "100%", padding: "0.75rem 0.9rem", border: "1px solid #d4cfc8", background: "#faf8f4", fontFamily: "inherit", fontSize: "0.88rem", color: "#0d0d0d", outline: "none", borderRadius: 0, WebkitAppearance: "none", boxSizing: "border-box" };
const primaryBtn = { background: "#0d0d0d", color: "#f5f3ef", border: "2px solid #0d0d0d", padding: "0.75rem 1.8rem", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" };
const ghostBtn = { background: "transparent", color: "#0d0d0d", border: "1px solid #d4cfc8", padding: "0.75rem 1.4rem", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" };

// ─────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────
export default function App() {
  const [listings, setListings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("ag_listings");
        if (res?.value) {
          const parsed = JSON.parse(res.value);
          setListings(parsed.length ? parsed : SAMPLE_LISTINGS);
        } else {
          setListings(SAMPLE_LISTINGS);
        }
      } catch { setListings(SAMPLE_LISTINGS); }
      setLoaded(false);
      setLoaded(true);
    })();
  }, []);

  const saveListing = async (updated) => {
    setListings(updated);
    try { await window.storage.set("ag_listings", JSON.stringify(updated)); } catch {}
  };

  const deleteListing = async (id) => {
    const updated = listings.filter(l => l.id !== id);
    await saveListing(updated);
  };

  const enterAdmin = () => { setAdminMode(true); };
  const logout = () => { setAdminMode(false); setPinUnlocked(false); };

  if (!loaded) return null;

  if (adminMode) {
    if (!pinUnlocked) return <PinGate onUnlock={() => setPinUnlocked(true)} />;
    return <AdminPanel listings={listings} onSave={saveListing} onDelete={deleteListing} onLogout={logout} />;
  }

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#f5f3ef" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr!important}
          .services-grid{grid-template-columns:1fr 1fr!important}
          .steps-grid{grid-template-columns:1fr!important}
          .contact-grid{grid-template-columns:1fr!important}
          .nav-links{display:none!important}
        }
        @media(max-width:600px){
          .services-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${WHATSAPP}?text=Hello%20AsuraGadgets!`} target="_blank" rel="noreferrer"
        style={{ position: "fixed", bottom: "1.8rem", right: "1.8rem", zIndex: 200, width: 52, height: 52, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 4px 18px rgba(37,211,102,0.4)", textDecoration: "none" }}>
        💬
      </a>

      <Nav onAdminClick={enterAdmin} />
      <Hero />
      <Services />
      <Shop listings={listings} />
      <HowItWorks />
      <Contact />
      <Footer />
    </div>
  );
}
