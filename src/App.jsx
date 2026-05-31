
import { useState, useEffect, useCallback } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// Replace these with your actual Supabase credentials
const SUPABASE_URL = "https://czaatjbchihfraujjciu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YWF0amJjaGloZnJhdWpqY2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjg2NjksImV4cCI6MjA5NTY0NDY2OX0.9_32eRFFPkry0GRyFmS7cJz8Z9Knx_uuqK0vQRYsHM0";

const ADMIN_EMAIL = "flapido00@gmail.com";

// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
async function sbFetch(path, options = {}) {
  const { method = "GET", body, token } = options;
  const authKey = token || SUPABASE_KEY;
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${authKey}`,
      "Content-Type": "application/json",
      ...(method === "POST" || method === "PATCH" ? { Prefer: "return=representation" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : null;
}

async function getEntrenadores(filters = {}, token) {
  let query = "/rest/v1/entrenadores?select=*&estado=eq.aprobado&order=created_at.desc";
  return sbFetch(query, { token });
}

async function getAllEntrenadores(token) {
  return sbFetch("/rest/v1/entrenadores?select=*&order=created_at.desc", { token });
}

async function getClientes(token) {
  return sbFetch("/rest/v1/clientes?select=*&order=created_at.desc", { token });
}

async function updateEntrenador(id, data, token) {
  return sbFetch(`/rest/v1/entrenadores?id=eq.${id}`, { method: "PATCH", body: data, token });
}

async function insertEntrenador(data) {
  return sbFetch("/rest/v1/entrenadores", { method: "POST", body: data });
}

async function insertCliente(data) {
  return sbFetch("/rest/v1/clientes", { method: "POST", body: data });
}

// Auth
async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Credenciales incorrectas");
  return res.json();
}

async function signOut(token) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ZONAS = [
  "Pocitos","Punta Carretas","Carrasco","Malvín","Buceo","Parque Batlle",
  "Cordón","Centro","Palermo","Aguada","Prado","Belvedere","Sayago",
  "Cerro","La Blanqueada","Unión","Peñarol","Paso de la Arena",
  "Ciudad de la Costa","Otros",
];

const ESPECIALIDADES = [
  "Pérdida de peso","Aumento de masa muscular","Salud y bienestar general",
  "Entrenamiento funcional","Rendimiento deportivo","Running",
  "Entrenamiento híbrido","Otro",
];

const MODALIDADES = ["Presencial","Online","Ambos"];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0F1D35;
    --navy2: #1B2A4A;
    --orange: #E8561A;
    --orange-dim: rgba(232,86,26,0.1);
    --orange-mid: rgba(232,86,26,0.3);
    --white: #FFFFFF;
    --gray: #6B7280;
    --lgray: #374151;
    --border: #E5E7EB;
    --border-dark: rgba(255,255,255,0.1);
    --card: #F9FAFB;
    --card-dark: rgba(255,255,255,0.06);
    --green: #0F6E56;
    --green-dim: rgba(15,110,86,0.1);
    --text: #111827;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: #F3F4F6;
    color: var(--text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: var(--navy);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 32px;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    font-family: 'Inter', sans-serif;
    font-size: 20px; font-weight: 800; letter-spacing: -0.5px;
    cursor: pointer; color: white;
  }
  .nav-logo span { color: var(--orange); }
  .nav-links { display: flex; align-items: center; gap: 8px; }
  .nav-btn {
    padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500;
    cursor: pointer; border: none; font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }
  .nav-btn-ghost {
    background: transparent; color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.15);
  }
  .nav-btn-ghost:hover { background: rgba(255,255,255,0.08); color: white; }
  .nav-btn-primary { background: var(--orange); color: white; }
  .nav-btn-primary:hover { background: #d44e17; }

  /* HERO */
  .hero {
    min-height: 100vh;
    background: var(--navy);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 80px 24px 40px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 50% at 50% 40%, rgba(232,86,26,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(232,86,26,0.15); border: 1px solid rgba(232,86,26,0.3);
    padding: 6px 16px; border-radius: 40px;
    font-size: 13px; font-weight: 500; color: var(--orange);
    margin-bottom: 32px;
  }
  .hero-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--orange); }
  .hero-title {
    font-family: 'Inter', sans-serif;
    font-size: clamp(48px, 8vw, 88px);
    font-weight: 900; line-height: 0.92; letter-spacing: -3px;
    margin-bottom: 24px; color: white;
  }
  .hero-title span { color: var(--orange); }
  .hero-sub {
    font-size: 18px; font-weight: 400; color: rgba(255,255,255,0.6);
    max-width: 520px; line-height: 1.6; margin-bottom: 40px;
  }
  .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .btn-lg {
    padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 600;
    cursor: pointer; border: none; font-family: 'Inter', sans-serif;
    transition: all 0.2s;
  }
  .btn-orange { background: var(--orange); color: white; }
  .btn-orange:hover { background: #d44e17; transform: translateY(-1px); }
  .btn-outline {
    background: transparent; color: white;
    border: 1px solid rgba(255,255,255,0.25);
  }
  .btn-outline:hover { background: rgba(255,255,255,0.08); }

  /* PAGE WRAPPER — light background for inner pages */
  .page { padding: 80px 24px 40px; max-width: 1200px; margin: 0 auto; }
  .page-header { padding: 32px 0 24px; }
  .page-title {
    font-family: 'Inter', sans-serif;
    font-size: 28px; font-weight: 800; margin-bottom: 4px; color: var(--text);
  }
  .page-title span { color: var(--orange); }
  .page-sub { font-size: 15px; color: var(--gray); }

  /* FILTERS */
  .filters {
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px; padding: 20px;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px; margin-bottom: 28px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .filter-group { display: flex; flex-direction: column; gap: 6px; }
  .filter-label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--gray); }
  .filter-select, .filter-input {
    background: #F9FAFB;
    border: 1.5px solid var(--border);
    border-radius: 8px; padding: 10px 14px;
    font-size: 14px; color: var(--text);
    font-family: 'Inter', sans-serif;
    cursor: pointer; outline: none;
    transition: border-color 0.15s;
    appearance: none; -webkit-appearance: none;
  }
  .filter-select:focus, .filter-input:focus { border-color: var(--orange); }
  .filter-select option { background: white; color: var(--text); }

  /* TRAINER GRID */
  .trainers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  /* TRAINER CARD */
  .trainer-card {
    background: white;
    border: 1.5px solid var(--border);
    border-radius: 16px; overflow: hidden;
    transition: all 0.2s; cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .trainer-card:hover {
    border-color: var(--orange-mid);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  .trainer-card-img {
    width: 100%; height: 200px; object-fit: cover;
    background: linear-gradient(135deg, var(--navy2), var(--navy));
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .trainer-card-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--orange);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif; font-size: 32px; font-weight: 800;
    color: white;
  }
  .trainer-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .verified-badge {
    position: absolute; top: 12px; right: 12px;
    background: rgba(15,29,53,0.85);
    border: 1px solid rgba(232,86,26,0.4);
    border-radius: 20px; padding: 4px 10px;
    font-size: 11px; font-weight: 600; color: var(--orange);
  }
  .trainer-card-body { padding: 20px; }
  .trainer-card-name {
    font-family: 'Inter', sans-serif;
    font-size: 17px; font-weight: 700; margin-bottom: 6px; color: var(--text);
  }
  .trainer-card-bio {
    font-size: 13px; color: var(--gray); line-height: 1.5;
    margin-bottom: 14px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .trainer-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .trainer-tag {
    background: var(--orange-dim); border: 1px solid rgba(232,86,26,0.2);
    border-radius: 20px; padding: 3px 10px;
    font-size: 11px; font-weight: 500; color: var(--orange);
  }
  .trainer-meta { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
  .trainer-meta-row {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--lgray);
  }
  .trainer-meta-icon { color: var(--orange); font-size: 14px; }
  .trainer-card-footer {
    display: flex; gap: 8px; padding-top: 14px;
    border-top: 1px solid var(--border);
    align-items: center;
  }
  .card-btn {
    flex: 1; padding: 10px; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    border: none; font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }
  .card-btn-primary { background: var(--orange); color: white; }
  .card-btn-primary:hover { background: #d44e17; }
  .card-btn-secondary {
    background: transparent; color: var(--lgray);
    border: 1.5px solid var(--border);
  }
  .card-btn-secondary:hover { background: var(--card); color: var(--text); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal {
    background: white; border: 1px solid var(--border);
    border-radius: 20px; max-width: 600px; width: 100%;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  }
  .modal-header {
    height: 200px; position: relative;
    background: linear-gradient(135deg, var(--navy2), var(--navy));
    overflow: hidden; border-radius: 20px 20px 0 0;
    display: flex; align-items: center; justify-content: center;
  }
  .modal-header img { width: 100%; height: 100%; object-fit: cover; }
  .modal-avatar-wrap { position: absolute; bottom: -40px; left: 28px; }
  .modal-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    border: 3px solid white;
    background: var(--orange);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 800; color: white;
    overflow: hidden;
  }
  .modal-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .modal-body { padding: 52px 28px 28px; }
  .modal-name {
    font-family: 'Inter', sans-serif;
    font-size: 22px; font-weight: 800; margin-bottom: 4px;
    color: var(--text);
    display: flex; align-items: center; gap: 10px;
  }
  .modal-verified { font-size: 12px; color: var(--orange); font-weight: 600; }
  .modal-sub { font-size: 14px; color: var(--gray); margin-bottom: 20px; }
  .modal-section { margin-bottom: 20px; }
  .modal-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--gray); margin-bottom: 10px;
  }
  .modal-bio { font-size: 15px; color: var(--lgray); line-height: 1.7; }
  .modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .modal-close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(0,0,0,0.4); border: none;
    color: white; cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
  }

  /* REGISTER FORM */
  .form-page {
    min-height: 100vh; padding: 80px 24px 40px;
    display: flex; align-items: flex-start; justify-content: center;
    background: #F3F4F6;
  }
  .form-card {
    background: white;
    border: 1.5px solid var(--border);
    border-radius: 20px; padding: 40px;
    max-width: 600px; width: 100%;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    margin-top: 20px;
  }
  .form-title {
    font-family: 'Inter', sans-serif;
    font-size: 26px; font-weight: 800; margin-bottom: 6px; color: var(--text);
  }
  .form-title span { color: var(--orange); }
  .form-sub { font-size: 14px; color: var(--gray); margin-bottom: 32px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid-full { grid-column: 1 / -1; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--gray); }
  .form-input, .form-select, .form-textarea {
    background: #F9FAFB;
    border: 1.5px solid var(--border);
    border-radius: 10px; padding: 12px 16px;
    font-size: 14px; color: var(--text);
    font-family: 'Inter', sans-serif;
    outline: none; transition: border-color 0.15s;
    appearance: none; -webkit-appearance: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--orange); background: white; }
  .form-select option { background: white; color: var(--text); }
  .form-textarea { resize: vertical; min-height: 100px; }
  .form-input::placeholder, .form-textarea::placeholder { color: #9CA3AF; }
  .form-check-group { display: flex; flex-wrap: wrap; gap: 8px; }
  .form-check {
    display: flex; align-items: center; gap: 8px;
    background: #F9FAFB;
    border: 1.5px solid var(--border);
    border-radius: 8px; padding: 8px 14px;
    cursor: pointer; transition: all 0.15s;
    font-size: 13px; color: var(--lgray); font-weight: 500;
  }
  .form-check input { accent-color: var(--orange); }
  .form-check:has(input:checked) {
    background: var(--orange-dim); border-color: rgba(232,86,26,0.35); color: var(--orange);
  }
  .form-submit {
    width: 100%; padding: 14px; border-radius: 10px;
    background: var(--orange); color: white;
    font-size: 16px; font-weight: 700; cursor: pointer;
    border: none; font-family: 'Inter', sans-serif;
    margin-top: 24px; transition: background 0.15s;
  }
  .form-submit:hover { background: #d44e17; }
  .form-submit:disabled { background: #D1D5DB; cursor: not-allowed; }

  /* MATCH PAGE */
  .match-section { max-width: 800px; margin: 0 auto; padding: 100px 24px 40px; }
  .match-title {
    font-family: 'Inter', sans-serif;
    font-size: 32px; font-weight: 800; margin-bottom: 8px; color: var(--text);
  }
  .match-title span { color: var(--orange); }
  .match-sub { font-size: 16px; color: var(--gray); margin-bottom: 40px; }
  .match-results { display: flex; flex-direction: column; gap: 14px; }
  .match-card {
    background: white; border: 1.5px solid var(--border);
    border-radius: 14px; padding: 20px;
    display: flex; gap: 16px; align-items: center;
    transition: all 0.2s; cursor: pointer;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .match-card:hover { border-color: var(--orange-mid); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .match-score {
    width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
    background: var(--orange-dim); border: 2px solid var(--orange);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 800; color: var(--orange);
  }
  .match-info { flex: 1; }
  .match-name { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--text); }
  .match-detail { font-size: 13px; color: var(--gray); }
  .match-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }

  /* EMPTY STATE */
  .empty { text-align: center; padding: 80px 20px; color: var(--gray); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; color: var(--lgray); margin-bottom: 8px; }

  /* ALERT */
  .alert { padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
  .alert-success { background: rgba(15,110,86,0.08); border: 1.5px solid rgba(15,110,86,0.3); color: #065F46; }
  .alert-error { background: rgba(220,38,38,0.08); border: 1.5px solid rgba(220,38,38,0.25); color: #B91C1C; }

  /* TABS */
  .tabs { display: flex; gap: 4px; background: #F3F4F6; border-radius: 10px; padding: 4px; margin-bottom: 24px; }
  .tab {
    flex: 1; padding: 10px; border-radius: 7px; text-align: center;
    font-size: 14px; font-weight: 500; cursor: pointer; border: none;
    background: transparent; color: var(--gray); font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }
  .tab.active { background: var(--orange); color: white; }

  /* PRICE BADGE */
  .price-badge {
    background: var(--green-dim); border: 1px solid rgba(15,110,86,0.25);
    border-radius: 20px; padding: 3px 10px;
    font-size: 11px; font-weight: 600; color: var(--green);
  }

  /* LOADING */
  .loading { display: flex; align-items: center; justify-content: center; padding: 60px; }
  .spinner {
    width: 32px; height: 32px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--orange);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .form-grid { grid-template-columns: 1fr; }
    .hero-title { font-size: 42px; letter-spacing: -2px; }
    .nav { padding: 0 16px; }
    .form-card { padding: 24px; }
  }
`;

// ─── MOCK DATA (replace with Supabase calls) ──────────────────────────────────
const MOCK_TRAINERS = [
  {
    id: "1", nombre: "Francisco Lapido", bio: "Entrenador personal especializado en entrenamiento híbrido, combinando fuerza y cardio para resultados reales y sostenibles.",
    edad: 24, experiencia: 1, zona: ["Carrasco","Malvín"], especialidades: ["Entrenamiento híbrido","Aumento de masa muscular"],
    modalidad: "Ambos", precio: 30, whatsapp: "59891606517", instagram: "@franlapido_training",
    foto: null, verificado: true,
  },
  {
    id: "2", nombre: "Chiara Vico", bio: "Entrenadora personal y futura licenciada en Nutrición. Especializada en pérdida de peso y bienestar general con enfoque integral.",
    edad: 23, experiencia: 2, zona: ["Pocitos","Punta Gorda","Centro","Palermo"], especialidades: ["Pérdida de peso","Salud y bienestar general","Entrenamiento funcional"],
    modalidad: "Presencial", precio: 25, whatsapp: "59897881344", instagram: "@chiaravico",
    foto: null, verificado: true,
  },
  {
    id: "3", nombre: "Joaquín Acheriteguy", bio: "Licenciado en Educación Física, Personal Trainer y Técnico en Musculación. Trabajo con todo tipo de personas para alcanzar sus objetivos.",
    edad: 25, experiencia: 2, zona: ["Malvín","Pocitos","Buceo","Parque Batlle","Cordón","Centro","Palermo","Aguada","Prado","La Blanqueada","Sayago"],
    especialidades: ["Aumento de masa muscular","Salud y bienestar general","Entrenamiento funcional"],
    modalidad: "Ambos", precio: 28, whatsapp: "59899000000", instagram: "@joaco.trainer",
    foto: null, verificado: true,
  },
  {
    id: "4", nombre: "Bruno Viña", bio: "Egresado de la Tecnicatura en Fitness. Trabajo en la mejora del rendimiento, masa muscular y condición física de forma progresiva y adaptada.",
    edad: 23, experiencia: 1, zona: ["Carrasco","Ciudad de la Costa"],
    especialidades: ["Rendimiento deportivo","Aumento de masa muscular","Running"],
    modalidad: "Ambos", precio: 25, whatsapp: "59899111111", instagram: "@brunoviña",
    foto: null, verificado: true,
  },
  {
    id: "5", nombre: "Hernán García", bio: "Entrenador presencial con foco en principiantes. Ayudo a personas a incorporar el ejercicio como hábito de vida para mejorar su salud general.",
    edad: 35, experiencia: 2, zona: ["Buceo","Parque Batlle","Palermo"],
    especialidades: ["Salud y bienestar general","Entrenamiento funcional","Pérdida de peso"],
    modalidad: "Presencial", precio: 30, whatsapp: "59899222222", instagram: "@hernan.fit",
    foto: null, verificado: true,
  },
];

// ─── MATCH ALGORITHM ─────────────────────────────────────────────────────────
function matchTrainers(trainers, cliente) {
  return trainers
    .map(t => {
      let score = 0;
      // Modalidad match (20 pts)
      if (cliente.modalidad === "Sin preferencia" || t.modalidad === "Ambos" || t.modalidad === cliente.modalidad) score += 20;
      // Zona match (30 pts)
      if (cliente.modalidad !== "Online") {
        if (t.zona.includes(cliente.zona)) score += 30;
      } else score += 30;
      // Especialidad/objetivo match (35 pts)
      if (t.especialidades.includes(cliente.objetivo)) score += 35;
      else if (t.especialidades.some(e => e.toLowerCase().includes(cliente.objetivo?.toLowerCase()?.split(" ")[0]))) score += 15;
      // Precio match (15 pts)
      if (cliente.precio_max && t.precio <= parseInt(cliente.precio_max)) score += 15;
      else if (!cliente.precio_max) score += 15;

      return { ...t, score };
    })
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function TrainerCard({ trainer, onClick }) {
  const initial = trainer.nombre.charAt(0).toUpperCase();
  return (
    <div className="trainer-card" onClick={() => onClick(trainer)}>
      <div className="trainer-card-img">
        {trainer.foto ? <img src={trainer.foto} alt={trainer.nombre} /> : <div className="trainer-card-avatar">{initial}</div>}
        {trainer.verificado && <span className="verified-badge">✓ Verificado</span>}
      </div>
      <div className="trainer-card-body">
        <div className="trainer-card-name">{trainer.nombre}</div>
        <div className="trainer-card-bio">{trainer.bio}</div>
        <div className="trainer-tags">
          {trainer.especialidades.slice(0,2).map(e => <span key={e} className="trainer-tag">{e}</span>)}
        </div>
        <div className="trainer-meta">
          <div className="trainer-meta-row"><span className="trainer-meta-icon">📍</span>{Array.isArray(trainer.zona) ? trainer.zona.slice(0,2).join(", ") : trainer.zona}</div>
          <div className="trainer-meta-row"><span className="trainer-meta-icon">🏋</span>{trainer.modalidad}</div>
          <div className="trainer-meta-row"><span className="trainer-meta-icon">⏱</span>{trainer.experiencia} {trainer.experiencia === 1 ? "año" : "años"} de experiencia</div>
        </div>
        <div className="trainer-card-footer">
          <span className="price-badge">USD {trainer.precio}/hora</span>
          <button className="card-btn card-btn-primary" onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${trainer.whatsapp}`, '_blank'); }}>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function TrainerModal({ trainer, onClose }) {
  if (!trainer) return null;
  const initial = trainer.nombre.charAt(0).toUpperCase();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{position:"relative"}}>
          {trainer.foto && <img src={trainer.foto} alt={trainer.nombre} />}
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="modal-avatar-wrap">
            <div className="modal-avatar">
              {trainer.foto ? <img src={trainer.foto} alt="" /> : initial}
            </div>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-name">
            {trainer.nombre}
            {trainer.verificado && <span className="modal-verified">✓ Verificado</span>}
          </div>
          <div className="modal-sub">{trainer.modalidad} · {trainer.experiencia} {trainer.experiencia === 1 ? "año" : "años"} de experiencia · USD {trainer.precio}/hora</div>

          <div className="modal-section">
            <div className="modal-section-title">Sobre mí</div>
            <div className="modal-bio">{trainer.bio}</div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Especialidades</div>
            <div className="trainer-tags">{trainer.especialidades.map(e => <span key={e} className="trainer-tag">{e}</span>)}</div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Zonas</div>
            <div className="trainer-tags">{(Array.isArray(trainer.zona) ? trainer.zona : [trainer.zona]).map(z => <span key={z} className="trainer-tag">{z}</span>)}</div>
          </div>

          {trainer.instagram && (
            <div className="modal-section">
              <div className="modal-section-title">Instagram</div>
              <div style={{color:"var(--orange)", fontSize:"14px"}}>{trainer.instagram}</div>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn-lg btn-orange" style={{flex:1}} onClick={() => window.open(`https://wa.me/${trainer.whatsapp}`, '_blank')}>
              Contactar por WhatsApp
            </button>
            {trainer.instagram && (
              <button className="btn-lg btn-outline" onClick={() => window.open(`https://instagram.com/${trainer.instagram.replace('@','')}`, '_blank')}>
                Instagram
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div className="hero">
      <div className="hero-tag">Uruguay · Entrenadores verificados</div>
      <h1 className="hero-title">
        Tu entrenador<br /><span>ideal.</span>
      </h1>
      <p className="hero-sub">
        Cada entrenador en TrainerHub fue entrevistado personalmente. No es un buscador, es una agencia. Encontrá el indicado para vos.
      </p>
      <div className="hero-ctas">
        <button className="btn-lg btn-orange" onClick={() => setPage("buscar")}>Buscar Entrenador</button>
        <button className="btn-lg btn-outline" onClick={() => setPage("registro-entrenador")}>Soy Entrenador</button>
      </div>
    </div>
  );
}

function BuscarPage({ token }) {
  const [trainers, setTrainers] = useState(MOCK_TRAINERS);
  const [filtered, setFiltered] = useState(MOCK_TRAINERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getEntrenadores({}, token);
        if (data && data.length > 0) { setTrainers(data); setFiltered(data); }
      } catch (e) { console.log("Using mock data"); }
      setLoading(false);
    };
    load();
  }, [token]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ zona: "", especialidad: "", modalidad: "", precio: "" });

  useEffect(() => {
    let result = trainers;
    if (filters.zona) result = result.filter(t => Array.isArray(t.zona) ? t.zona.includes(filters.zona) : t.zona === filters.zona);
    if (filters.especialidad) result = result.filter(t => t.especialidades.includes(filters.especialidad));
    if (filters.modalidad) result = result.filter(t => t.modalidad === filters.modalidad || t.modalidad === "Ambos");
    if (filters.precio) result = result.filter(t => t.precio <= parseInt(filters.precio));
    setFiltered(result);
  }, [filters, trainers]);

  const setFilter = (key, val) => setFilters(f => ({...f, [key]: val}));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Buscar <span>Entrenadores</span></h1>
        <p className="page-sub">Encontrá el entrenador perfecto para vos · {filtered.length} disponibles</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Zona</label>
          <select className="filter-select" value={filters.zona} onChange={e => setFilter("zona", e.target.value)}>
            <option value="">Todas las zonas</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Especialidad</label>
          <select className="filter-select" value={filters.especialidad} onChange={e => setFilter("especialidad", e.target.value)}>
            <option value="">Todas</option>
            {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Modalidad</label>
          <select className="filter-select" value={filters.modalidad} onChange={e => setFilter("modalidad", e.target.value)}>
            <option value="">Todas</option>
            {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Precio máx (USD/h)</label>
          <input className="filter-input" type="number" placeholder="Sin límite" value={filters.precio} onChange={e => setFilter("precio", e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No encontramos entrenadores con esos filtros</div>
          <p>Probá ajustando los criterios de búsqueda</p>
        </div>
      ) : (
        <div className="trainers-grid">
          {filtered.map(t => <TrainerCard key={t.id} trainer={t} onClick={setSelected} />)}
        </div>
      )}

      {selected && <TrainerModal trainer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function MatchPage({ token }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nombre: "", edad: "", modalidad: "", zona: "", objetivo: "", precio_max: "" });
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const setField = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleMatch = () => {
    const matched = matchTrainers(MOCK_TRAINERS, form);
    setResults(matched);
    setStep(2);
  };

  return (
    <div className="match-section">
      {step === 1 && (
        <>
          <h1 className="match-title">Encontrá tu entrenador <span>ideal</span></h1>
          <p className="match-sub">Contanos qué buscás y te mostramos los entrenadores que mejor encajan con vos.</p>
          <div style={{background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", borderRadius:"16px", padding:"32px"}}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Tu nombre</label>
                <input className="form-input" placeholder="¿Cómo te llamás?" value={form.nombre} onChange={e => setField("nombre", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Edad</label>
                <input className="form-input" type="number" placeholder="Años" value={form.edad} onChange={e => setField("edad", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Modalidad preferida</label>
                <select className="form-select" value={form.modalidad} onChange={e => setField("modalidad", e.target.value)}>
                  <option value="">Seleccioná</option>
                  <option value="Sin preferencia">Sin preferencia</option>
                  {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tu zona (si es presencial)</label>
                <select className="form-select" value={form.zona} onChange={e => setField("zona", e.target.value)}>
                  <option value="">Seleccioná</option>
                  {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-group form-grid-full">
                <label className="form-label">¿Cuál es tu objetivo?</label>
                <select className="form-select" value={form.objetivo} onChange={e => setField("objetivo", e.target.value)}>
                  <option value="">Seleccioná tu objetivo</option>
                  {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="form-group form-grid-full">
                <label className="form-label">Precio máximo por hora (USD)</label>
                <input className="form-input" type="number" placeholder="Sin límite" value={form.precio_max} onChange={e => setField("precio_max", e.target.value)} />
              </div>
            </div>
            <button className="form-submit" onClick={handleMatch} disabled={!form.objetivo}>
              Encontrar mi entrenador →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="match-title">Tu <span>match</span></h1>
          <p className="match-sub">
            {results.length > 0 ? `Encontramos ${results.length} entrenadores que encajan con lo que buscás.` : "No encontramos entrenadores exactos, pero podés explorar todos en el buscador."}
          </p>
          {results.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🤔</div>
              <div className="empty-title">Sin resultados exactos</div>
              <p>Probá ajustando tus criterios o explorá todos los entrenadores disponibles.</p>
            </div>
          ) : (
            <div className="match-results">
              {results.map((t, i) => (
                <div key={t.id} className="match-card" onClick={() => setSelected(t)}>
                  <div className="match-score">{t.score}%</div>
                  <div className="match-info">
                    <div className="match-name">{t.nombre} {i === 0 && "⭐"}</div>
                    <div className="match-detail">{t.modalidad} · {Array.isArray(t.zona) ? t.zona.slice(0,2).join(", ") : t.zona} · USD {t.precio}/h</div>
                    <div className="match-tags">{t.especialidades.map(e => <span key={e} className="trainer-tag">{e}</span>)}</div>
                  </div>
                  <button className="card-btn card-btn-primary" style={{width:"120px", flexShrink:0}} onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${t.whatsapp}`, '_blank'); }}>
                    Contactar
                  </button>
                </div>
              ))}
            </div>
          )}
          <button className="btn-lg btn-outline" style={{marginTop:"24px"}} onClick={() => setStep(1)}>← Buscar de nuevo</button>
        </>
      )}

      {selected && <TrainerModal trainer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function RegisterPage({ type }) {
  const isTrainer = type === "entrenador";
  const [form, setForm] = useState({
    nombre: "", edad: "", bio: "", experiencia: "",
    zonas: [], especialidades: [], modalidad: "",
    precio: "", whatsapp: "", instagram: "",
    objetivo: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const setField = (k, v) => setForm(f => ({...f, [k]: v}));
  const toggleArray = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isTrainer) {
        await insertEntrenador({
          nombre: form.nombre,
          edad: form.edad ? parseInt(form.edad) : null,
          bio: form.bio,
          experiencia: form.experiencia ? parseInt(form.experiencia) : 1,
          zona: form.zonas,
          especialidades: form.especialidades,
          modalidad: form.modalidad,
          precio: form.precio ? parseInt(form.precio) : null,
          whatsapp: form.whatsapp,
          instagram: form.instagram,
          estado: "pendiente",
          verificado: false,
        });
      } else {
        await insertCliente({
          nombre: form.nombre,
          edad: form.edad ? parseInt(form.edad) : null,
          modalidad: form.modalidad,
          zona: form.zonas[0] || null,
          objetivo: form.objetivo,
          precio_max: form.precio ? parseInt(form.precio) : null,
        });
      }
      setStatus("success");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2 className="form-title">
          {isTrainer ? <>Registrate como <span>Entrenador</span></> : <>Encontrá tu <span>Entrenador</span></>}
        </h2>
        <p className="form-sub">
          {isTrainer ? "Completá tu perfil para ser parte del equipo TrainerHub. Primeros 3 meses gratis." : "Registrate para conectar con entrenadores verificados."}
        </p>

        {status === "success" && (
          <div className="alert alert-success">
            {isTrainer ? "¡Registro enviado! Fran te va a contactar pronto para la entrevista." : "¡Registro exitoso! En breve te contactamos con tu match."}
          </div>
        )}
        {status === "error" && <div className="alert alert-error">Hubo un error. Intentá de nuevo.</div>}

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Nombre completo *</label>
            <input className="form-input" placeholder="Tu nombre" value={form.nombre} onChange={e => setField("nombre", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Edad</label>
            <input className="form-input" type="number" placeholder="Años" value={form.edad} onChange={e => setField("edad", e.target.value)} />
          </div>

          {isTrainer && (
            <>
              <div className="form-group form-grid-full">
                <label className="form-label">Bio / Descripción</label>
                <textarea className="form-textarea" placeholder="Contanos sobre vos, tu experiencia y tu enfoque..." value={form.bio} onChange={e => setField("bio", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Años de experiencia</label>
                <input className="form-input" type="number" placeholder="1" value={form.experiencia} onChange={e => setField("experiencia", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Precio por hora (USD)</label>
                <input className="form-input" type="number" placeholder="25" value={form.precio} onChange={e => setField("precio", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp *</label>
                <input className="form-input" placeholder="598 9X XXX XXX" value={form.whatsapp} onChange={e => setField("whatsapp", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" placeholder="@usuario" value={form.instagram} onChange={e => setField("instagram", e.target.value)} />
              </div>
            </>
          )}

          <div className="form-group form-grid-full">
            <label className="form-label">Modalidad *</label>
            <div className="form-check-group">
              {MODALIDADES.map(m => (
                <label key={m} className="form-check">
                  <input type="radio" name="modalidad" value={m} checked={form.modalidad === m} onChange={() => setField("modalidad", m)} />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">Zonas de trabajo (Montevideo)</label>
            <div className="form-check-group">
              {ZONAS.map(z => (
                <label key={z} className="form-check">
                  <input type="checkbox" checked={form.zonas.includes(z)} onChange={() => toggleArray("zonas", z)} />
                  {z}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">{isTrainer ? "Especialidades" : "Tu objetivo"} *</label>
            <div className="form-check-group">
              {ESPECIALIDADES.map(e => (
                <label key={e} className="form-check">
                  <input
                    type={isTrainer ? "checkbox" : "radio"}
                    name="objetivo"
                    checked={isTrainer ? form.especialidades.includes(e) : form.objetivo === e}
                    onChange={() => isTrainer ? toggleArray("especialidades", e) : setField("objetivo", e)}
                  />
                  {e}
                </label>
              ))}
            </div>
          </div>

          {!isTrainer && (
            <div className="form-group form-grid-full">
              <label className="form-label">Precio máximo por hora (USD)</label>
              <input className="form-input" type="number" placeholder="Sin límite" value={form.precio} onChange={e => setField("precio", e.target.value)} />
            </div>
          )}
        </div>

        <button className="form-submit" onClick={handleSubmit} disabled={loading || !form.nombre || !form.modalidad}>
          {loading ? "Enviando..." : isTrainer ? "Enviar solicitud →" : "Registrarme →"}
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ──────────────────────────────────────────────────────────────
function AdminPage({ token }) {
  const [tab, setTab] = useState("pendientes");
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, c] = await Promise.all([getAllEntrenadores(token), getClientes(token)]);
        setTrainers(t || []);
        setClients(c || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [token]);

  const handleUpdate = async (id, estado) => {
    try {
      await updateEntrenador(id, { estado, verificado: estado === "aprobado" }, token);
      setTrainers(prev => prev.map(t => t.id === id ? { ...t, estado, verificado: estado === "aprobado" } : t));
    } catch (e) { alert("Error: " + e.message); }
  };

  const filtered = trainers.filter(t => {
    if (tab === "pendientes") return t.estado === "pendiente";
    if (tab === "aprobados") return t.estado === "aprobado";
    if (tab === "rechazados") return t.estado === "rechazado";
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Panel <span>Admin</span></h1>
        <p className="page-sub">Gestioná entrenadores y clientes registrados</p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"28px"}}>
        {[
          { label:"Pendientes", val: trainers.filter(t=>t.estado==="pendiente").length, color:"#F59E0B" },
          { label:"Aprobados", val: trainers.filter(t=>t.estado==="aprobado").length, color:"var(--green)" },
          { label:"Clientes", val: clients.length, color:"var(--orange)" },
        ].map(s => (
          <div key={s.label} style={{background:"white", border:"1.5px solid var(--border)", borderRadius:"12px", padding:"20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"32px", fontWeight:"800", color:s.color, fontFamily:"Inter"}}>{s.val}</div>
            <div style={{fontSize:"13px", color:"var(--gray)", marginTop:"4px"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{background:"white", border:"1.5px solid var(--border)", borderRadius:"16px", padding:"24px", marginBottom:"24px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <h2 style={{fontSize:"16px", fontWeight:"700", marginBottom:"16px", color:"var(--text)"}}>Entrenadores</h2>
        <div className="tabs" style={{marginBottom:"20px"}}>
          {["pendientes","aprobados","rechazados","todos"].map(t => (
            <button key={t} className={"tab" + (tab===t?" active":"")} onClick={() => setTab(t)} style={{textTransform:"capitalize"}}>{t}</button>
          ))}
        </div>
        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          filtered.length === 0 ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-title">Sin entrenadores en esta categoría</div></div> : (
            <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
              {filtered.map(t => (
                <div key={t.id} style={{display:"flex", alignItems:"center", gap:"16px", padding:"14px", background:"#F9FAFB", borderRadius:"10px", border:"1px solid var(--border)"}}>
                  <div style={{width:"44px", height:"44px", borderRadius:"50%", background:"var(--orange)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", color:"white", fontSize:"18px", flexShrink:0}}>
                    {t.nombre?.charAt(0)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:"600", fontSize:"15px", color:"var(--text)"}}>{t.nombre}</div>
                    <div style={{fontSize:"12px", color:"var(--gray)"}}>{t.modalidad} · {Array.isArray(t.zona) ? t.zona.slice(0,2).join(", ") : t.zona} · {t.email}</div>
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                    <span style={{padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"600",
                      background: t.estado==="aprobado" ? "rgba(15,110,86,0.1)" : t.estado==="rechazado" ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)",
                      color: t.estado==="aprobado" ? "var(--green)" : t.estado==="rechazado" ? "#B91C1C" : "#92400E"
                    }}>{t.estado}</span>
                    {t.estado !== "aprobado" && <button className="card-btn card-btn-primary" style={{padding:"6px 14px", fontSize:"12px", width:"auto", flex:"none"}} onClick={() => handleUpdate(t.id, "aprobado")}>Aprobar</button>}
                    {t.estado !== "rechazado" && <button className="card-btn card-btn-secondary" style={{padding:"6px 14px", fontSize:"12px", width:"auto", flex:"none"}} onClick={() => handleUpdate(t.id, "rechazado")}>Rechazar</button>}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <div style={{background:"white", border:"1.5px solid var(--border)", borderRadius:"16px", padding:"24px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <h2 style={{fontSize:"16px", fontWeight:"700", marginBottom:"16px", color:"var(--text)"}}>Clientes registrados</h2>
        {clients.length === 0 ? <div style={{color:"var(--gray)", fontSize:"14px"}}>Sin clientes todavía</div> : (
          <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
            {clients.map(c => (
              <div key={c.id} style={{display:"flex", alignItems:"center", gap:"12px", padding:"12px", background:"#F9FAFB", borderRadius:"10px", border:"1px solid var(--border)"}}>
                <div style={{width:"36px", height:"36px", borderRadius:"50%", background:"#1B2A4A", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700", color:"white", fontSize:"14px", flexShrink:0}}>{c.nombre?.charAt(0)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:"600", fontSize:"14px", color:"var(--text)"}}>{c.nombre}</div>
                  <div style={{fontSize:"12px", color:"var(--gray)"}}>{c.objetivo} · {c.zona} · {c.modalidad}</div>
                </div>
                <div style={{fontSize:"12px", color:"var(--gray)"}}>{new Date(c.created_at).toLocaleDateString("es-UY")}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOGIN MODAL ─────────────────────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setLoading(true); setError("");
    try {
      const data = await signIn(email, password);
      onLogin(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:"400px"}} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{paddingTop:"32px"}}>
          <div className="modal-name" style={{marginBottom:"6px"}}>Iniciar sesión</div>
          <div className="modal-sub" style={{marginBottom:"24px"}}>Accedé a tu cuenta TrainerHub</div>
          {error && <div className="alert alert-error" style={{marginBottom:"16px"}}>{error}</div>}
          <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter" && handle()} />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handle()} />
            </div>
          </div>
          <button className="form-submit" onClick={handle} disabled={loading || !email || !password} style={{marginTop:"20px"}}>
            {loading ? "Entrando..." : "Entrar →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const handleLogin = (data) => {
    setSession(data);
    setShowLogin(false);
    if (data?.user?.email === ADMIN_EMAIL) setPage("admin");
  };

  const handleLogout = async () => {
    if (session?.access_token) await signOut(session.access_token).catch(() => {});
    setSession(null);
    setPage("home");
  };

  const pages = {
    home: <HomePage setPage={setPage} />,
    buscar: <BuscarPage token={session?.access_token} />,
    match: <MatchPage token={session?.access_token} />,
    "registro-entrenador": <RegisterPage type="entrenador" />,
    "registro-cliente": <RegisterPage type="cliente" />,
    admin: isAdmin ? <AdminPage token={session?.access_token} /> : <HomePage setPage={setPage} />,
  };

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage("home")}>
          Trainer<span>Hub</span>
        </div>
        <div className="nav-links">
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage("buscar")}>Buscar</button>
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage("match")}>Mi Match</button>
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage("registro-entrenador")}>Soy Entrenador</button>
          {!session ? (
            <>
              <button className="nav-btn nav-btn-ghost" onClick={() => setShowLogin(true)}>Entrar</button>
              <button className="nav-btn nav-btn-primary" onClick={() => setPage("registro-cliente")}>Soy Cliente</button>
            </>
          ) : (
            <>
              {isAdmin && <button className="nav-btn nav-btn-ghost" onClick={() => setPage("admin")}>⚙ Admin</button>}
              <button className="nav-btn nav-btn-ghost" onClick={handleLogout}>Salir</button>
            </>
          )}
        </div>
      </nav>
      {pages[page] || pages.home}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
    </>
  );
}
