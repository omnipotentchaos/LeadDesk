"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

const emptyLead = { name: "", email: "", budget_range: "", message: "" };

export default function HomePage() {
  const [lead, setLead] = useState(emptyLead);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function updateField(event) {
    setLead({ ...lead, [event.target.name]: event.target.value });
  }

  async function submitLead(event) {
    event.preventDefault();
    setMessage("");

    if (lead.name.trim().length < 2 || lead.message.trim().length < 10) {
      setMessage(
        "Please enter your name and a message of at least 10 characters.",
      );
      return;
    }

    setSending(true);
    const { error } = await supabase.from("leads").insert({
      ...lead,
      name: lead.name.trim(),
      email: lead.email.trim().toLowerCase(),
      message: lead.message.trim(),
    });
    setSending(false);

    if (error) {
      setMessage("We could not send your enquiry. Please try again.");
      return;
    }

    setLead(emptyLead);
    setMessage("Thanks — your enquiry is on its way.");
  }

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <h1>Good work starts with a clear brief</h1>
          <p className="lede">
            Tell us where you’re headed. We’ll get back to you with a considered
            next step.
          </p>
        </section>

        <section className="contact-section" id="contact">
          <div>
            <p className="eyebrow">Let’s talk</p>
            <h2>What are you working on?</h2>
            <p>
              Share a few details and we’ll be in touch within two business
              days.
            </p>
          </div>

          <form onSubmit={submitLead}>
            <div className="form-grid">
              <label>
                Your name
                <input
                  name="name"
                  value={lead.name}
                  onChange={updateField}
                  required
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  value={lead.email}
                  onChange={updateField}
                  required
                />
              </label>
            </div>
            <label>
              Estimated budget
              <select
                name="budget_range"
                value={lead.budget_range}
                onChange={updateField}
                required
              >
                <option value="">Select a range</option>
                <option>Under ₹1,000</option>
                <option>₹1,000–₹5,000</option>
                <option>₹5,000–₹10,000</option>
                <option>₹10,000+</option>
              </select>
            </label>
            <label>
              About the project
              <textarea
                name="message"
                value={lead.message}
                onChange={updateField}
                minLength="10"
                placeholder="Goals, timeline, or anything useful to know..."
                required
              />
            </label>
            <button disabled={sending}>
              {sending ? "Sending…" : "Send enquiry →"}
            </button>
            <p className="form-status" role="status">
              {message}
            </p>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/">
        Lead<span>Desk</span>
      </a>
      <a className="text-link" href="#contact">
        Start a conversation
      </a>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <span>© {new Date().getFullYear()} LeadDesk</span>
      <a href="https://digitalheroesco.com" target="_blank" rel="noreferrer">
        Built for Digital Heroes Training Task
      </a>
      <a href="/admin">Admin</a>
    </footer>
  );
}
