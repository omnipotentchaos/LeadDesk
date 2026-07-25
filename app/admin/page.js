"use client";

import { useEffect, useMemo, useState } from "react";
import { Footer } from "../page";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) loadAdmin(data.session);
    });
  }, []);

  async function loadAdmin(currentSession) {
    const { data: admin } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", currentSession.user.id)
      .maybeSingle();

    if (!admin) {
      setNotice("This account is not an admin account.");
      return;
    }

    setSession(currentSession);
    setIsAdmin(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLeads(data || []);
  }

  async function signIn(event) {
    event.preventDefault();
    setNotice("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setNotice("Invalid email or password.");
      return;
    }
    await loadAdmin(data.session);
  }

  async function changeStatus(id, status) {
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);
    if (error) {
      setNotice("Status could not be updated.");
      return;
    }
    setLeads(
      leads.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setLeads([]);
  }

  const visibleLeads = useMemo(() => {
    const term = search.toLowerCase();
    return leads.filter((lead) =>
      `${lead.name} ${lead.email} ${lead.status}`.toLowerCase().includes(term),
    );
  }, [leads, search]);

  return (
    <div className="admin-page">
      <header className="site-header">
        <a className="brand" href="/">
          Lead<span>Desk</span>
        </a>
        {session && (
          <button className="small-button" onClick={signOut}>
            Sign out
          </button>
        )}
      </header>

      <main className="admin-wrap">
        {!isAdmin ? (
          <section className="login-panel">
            <p className="eyebrow">Private area</p>
            <h1>Welcome back.</h1>
            <form onSubmit={signIn}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button>Sign in →</button>
              <p className="form-status" role="status">
                {notice}
              </p>
            </form>
          </section>
        ) : (
          <section>
            <div className="dashboard-head">
              <div>
                <p className="eyebrow">Lead pipeline</p>
                <h1>All leads</h1>
              </div>
              <input
                type="search"
                placeholder="Search leads"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <p className="muted">
              {visibleLeads.length}{" "}
              {visibleLeads.length === 1 ? "lead" : "leads"}
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Budget</th>
                    <th>Message</th>
                    <th>Received</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.name}</strong>
                        <br />
                        <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      </td>
                      <td>{lead.budget_range}</td>
                      <td className="message-cell">{lead.message}</td>
                      <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={lead.status}
                          onChange={(event) =>
                            changeStatus(lead.id, event.target.value)
                          }
                        >
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
