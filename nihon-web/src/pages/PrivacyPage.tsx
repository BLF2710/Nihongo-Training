import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { LAST_UPDATED, OPERATOR, PRIVACY_SECTIONS } from "../content/privacyPolicy";
import type { PolicyBlock } from "../content/privacyPolicy";
import { hasSession } from "../lib/authStorage";

function Block({ block }: { block: PolicyBlock }) {
  if (block.kind === "list") return <ul className="mt-2 list-disc space-y-1.5 pl-5">{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
  return <p className="mt-2">{block.text}</p>;
}

/** The privacy policy, readable without signing in (sign-up and Google sign-in link here). */
export default function PrivacyPage() {
  return <div className="min-h-screen bg-gray-50"><Navbar />
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <article className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-800 sm:p-10" aria-labelledby="privacy-title">
        <h1 id="privacy-title" className="text-3xl font-black">Privacy policy</h1>
        <p className="mt-1 text-sm text-gray-500">Last updated {LAST_UPDATED}</p>
        <p className="mt-4">This page explains what Lingora{OPERATOR.name ? `, run by ${OPERATOR.name},` : ""} collects when you use the site, why, who can see it, and what you can do about it.</p>
        <nav aria-label="On this page" className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm">
          <p className="font-bold">On this page</p>
          <ol className="mt-2 grid gap-1 sm:grid-cols-2">{PRIVACY_SECTIONS.map(section => <li key={section.id}><a href={`#${section.id}`} className="text-emerald-700 hover:underline">{section.title}</a></li>)}
            <li><a href="#contact" className="text-emerald-700 hover:underline">Contact</a></li></ol>
        </nav>
        {PRIVACY_SECTIONS.map(section => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="mt-8 scroll-mt-24">
          <h2 id={`${section.id}-heading`} className="text-xl font-black">{section.title}</h2>
          {section.blocks.map((block, index) => <Block key={index} block={block} />)}
        </section>)}
        <section id="contact" aria-labelledby="contact-heading" className="mt-8 scroll-mt-24">
          <h2 id="contact-heading" className="text-xl font-black">Contact</h2>
          <p className="mt-2">For questions about your data, a copy of it, or deleting your account, write to us in{" "}
            {hasSession() ? <Link to="/support" className="font-semibold text-emerald-700 hover:underline">Help &amp; support</Link> : "Help & support after signing in"}
            {OPERATOR.email ? <>, or by email at <a href={`mailto:${OPERATOR.email}`} className="font-semibold text-emerald-700 hover:underline">{OPERATOR.email}</a></> : null}.</p>
        </section>
      </article>
    </main>
  </div>;
}
