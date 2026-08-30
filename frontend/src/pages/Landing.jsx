import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

import { useState } from "react";
import {
  ArrowRight,
  Search,
  PackageOpen,
  Users,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export default function Landing() {
  const { user, loading } = useAuth();
  const [showDeveloper, setShowDeveloper] = useState(false);
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const faqs = [
    {
      question: "What is CampusConnect?",
      answer:
        "CampusConnect is a student-first lost and found platform that helps students report, search for, and return lost belongings around campus.",
    },
    {
      question: "How do I report a lost item?",
      answer:
        'Create an account, go to the dashboard and select "Report Lost Item". Add the item details, location, date and a photo, then submit your post.',
    },
    {
      question: "How do I report something I found?",
      answer:
        'Select "Report Found Item" from your dashboard and provide the item details, location, date and a clear photo.',
    },
    {
      question: "Is my personal information safe?",
      answer:
        "Yes. Your personal information is kept private. Other users cannot see your email address or phone number directly on your posts. You can communicate with other students through the built-in messaging system and choose what information you want to share.",
    },
    {
      question: "Is CampusConnect free?",
      answer:
        "Yes. CampusConnect is designed to be free for students and the campus community.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="sticky top-0 z-50 bg-[#FDFBF7] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#E63946] border-2 border-black flex items-center justify-center brutal-shadow-sm">
              <span className="font-display font-black text-white text-lg">
                C
              </span>
            </div>
            <span className="font-display font-black text-xl md:text-2xl uppercase">
              CampusConnect
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 border-2 border-black brutal-shadow-sm brutal-press font-semibold uppercase text-sm"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-black text-white border-2 border-black brutal-shadow-sm brutal-press font-semibold uppercase text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-[#E9C46A] border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-6">
              Campus-wide lost &amp; found
            </div>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[0.9] uppercase mb-6">
              Lost it?
              <br />
              <span className="text-[#E63946]">Find it.</span>
              <br />
              Found it? <span className="text-[#2A9D8F]">Return it.</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-xl mb-8">
              CampusConnect helps students reunite with lost belongings through
              quick reporting, photo-based browsing, and private messaging.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-[#0B2545] text-white border-2 border-black px-6 py-3 brutal-shadow brutal-press font-bold uppercase"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white border-2 border-black px-6 py-3 brutal-shadow brutal-press font-bold uppercase"
              >
                I have an account
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border-2 border-black brutal-shadow-lg p-6">
              <img
                src="https://images.pexels.com/photos/7972324/pexels-photo-7972324.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Students on campus"
                className="w-full h-80 object-cover border-2 border-black grayscale contrast-125"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display font-black text-lg uppercase">
                  Built for students
                </span>
                <span className="bg-[#E9C46A] border-2 border-black px-2 py-1 text-xs font-bold uppercase">
                  Free
                </span>
              </div>
            </div>
            <div className="hidden lg:block absolute -bottom-6 -left-6 bg-[#E63946] text-white border-2 border-black brutal-shadow px-4 py-3 font-display font-black uppercase text-lg rotate-[-3deg]">
              Find. Connect. Return.
            </div>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: PackageOpen,
              title: "Post Easily",
              desc: "Report a lost or found item in just a few seconds with simple details and a photo.",
            },
            {
              icon: Search,
              title: "Browse & Discover",
              desc: "Explore items reported by students across your campus.",
            },
            {
              icon: Users,
              title: "Private Messaging",
              desc: "Connect with the person who posted an item without exposing your email or phone number.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white border-2 border-black brutal-shadow p-6"
            >
              <f.icon size={32} strokeWidth={2.5} />
              <h3 className="font-display font-black text-xl uppercase mt-4">
                {f.title}
              </h3>
              <p className="mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Final Call To Action */}
        <section className="mt-24 mb-8">
          <div className="bg-[#E9C46A] border-2 border-black brutal-shadow-lg p-8 md:p-14 text-center relative overflow-hidden">
            <div className="inline-block bg-black text-white border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-5">
              Don't give up yet
            </div>

            <h2 className="font-display font-black text-4xl md:text-7xl uppercase leading-[0.9]">
              Lost something?
              <br />
              <span className="text-[#E63946]">Let's find it.</span>
            </h2>

            <p className="max-w-2xl mx-auto mt-6 text-lg md:text-xl leading-relaxed">
              Someone on campus might have already found your item. Search the
              board or report what you're missing.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-black text-white border-2 border-black px-6 py-3 brutal-shadow brutal-press font-bold uppercase"
              >
                Search Lost Items →
              </Link>

              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white border-2 border-black px-6 py-3 brutal-shadow brutal-press font-bold uppercase"
              >
                Report Lost Item
              </Link>
            </div>

            {/* Decorative blocks */}
            <div className="hidden md:block absolute top-6 left-6 w-8 h-8 bg-[#E63946] border-2 border-black rotate-6" />

            <div className="hidden md:block absolute bottom-6 right-6 w-8 h-8 bg-[#2A9D8F] border-2 border-black -rotate-6" />
          </div>
        </section>

        {/* Safety & Privacy */}
        <section className="mt-24">
          <div className="border-b-2 border-black pb-6 mb-8">
            <div className="inline-block bg-[#0B2545] text-white border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3">
              Safety First
            </div>

            <h2 className="font-display font-black text-4xl md:text-6xl uppercase leading-none">
              Keep it safe.
            </h2>

            <p className="mt-4 text-lg max-w-2xl">
              CampusConnect is built around trust and responsible communication.
              Follow these simple guidelines when connecting with other
              students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Safety Card */}
            <div className="bg-[#0B2545] text-white border-2 border-black brutal-shadow-lg p-8">
              <h3 className="font-display font-black text-2xl uppercase mb-6">
                Stay Safe
              </h3>

              <ul className="space-y-5">
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-[#E9C46A] border-2 border-black flex-shrink-0 flex items-center justify-center text-black font-black">
                    ✓
                  </div>

                  <div>
                    <h4 className="font-bold uppercase">
                      Meet in a safe place
                    </h4>

                    <p className="text-sm text-white/80 mt-1">
                      When returning an item, choose a public and well-known
                      location on campus.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-[#E9C46A] border-2 border-black flex-shrink-0 flex items-center justify-center text-black font-black">
                    ✓
                  </div>

                  <div>
                    <h4 className="font-bold uppercase">Verify the item</h4>

                    <p className="text-sm text-white/80 mt-1">
                      Ask the person to describe the item before handing it
                      over.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-[#E9C46A] border-2 border-black flex-shrink-0 flex items-center justify-center text-black font-black">
                    ✓
                  </div>

                  <div>
                    <h4 className="font-bold uppercase">
                      Don't share sensitive information
                    </h4>

                    <p className="text-sm text-white/80 mt-1">
                      Never share passwords, financial information, or other
                      sensitive personal details.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Community Card */}
            <div className="bg-white border-2 border-black brutal-shadow-lg p-8">
              <div className="inline-block bg-[#2A9D8F] text-white border-2 border-black px-2 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-5">
                Community
              </div>

              <h3 className="font-display font-black text-2xl uppercase mb-4">
                Help someone get it back.
              </h3>

              <p className="leading-relaxed mb-6">
                A lost phone, wallet, bag, or set of keys can completely ruin
                someone's day. If you find something, taking a few seconds to
                report it could make a huge difference.
              </p>

              <div className="border-t-2 border-black pt-5">
                <p className="font-display font-black text-xl uppercase">
                  Found something?
                </p>

                <p className="text-sm mt-1 mb-4">
                  Do the right thing. Report it to the campus community.
                </p>

                <Link
                  to="/report/found"
                  className="inline-flex items-center gap-2 bg-[#2A9D8F] text-white border-2 border-black px-5 py-3 brutal-shadow brutal-press font-bold uppercase"
                >
                  Report Found Item →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}

        <section className="mt-20 mb-12">
          <div className="border-b-2 border-black pb-5 mb-8">
            <div className="inline-block bg-[#2A9D8F] text-white border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3">
              FAQ
            </div>

            <h2 className="font-display font-black text-3xl md:text-5xl uppercase leading-tight">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-lg max-w-2xl">
              Got questions? Here are some things students ask most often.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white border-2 border-black brutal-shadow"
              >
                <summary className="list-none cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4">
                  <span className="font-display font-black text-lg md:text-xl uppercase">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={24}
                    strokeWidth={2.5}
                    className="flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>

                <div className="border-t-2 border-black px-5 md:px-6 py-5">
                  <p className="leading-relaxed text-sm md:text-base max-w-3xl">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* DEVELOPER SECTION */}
        <div className="mt-16 border-t-2 border-black pt-10 pb-41 text-center">
          <p className="mt-3 text-base max-w-2xl mx-auto">
            Want to know more about the person behind CampusConnect?
          </p>

          <button
            onClick={() => setShowDeveloper(true)}
            className="mt-6 bg-black text-white border-2 border-black px-6 py-3 brutal-shadow brutal-press font-bold uppercase"
          >
            About the Developer →
          </button>
        </div>

        {/* DEVELOPER MODAL */}
        {showDeveloper && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowDeveloper(false)}
          >
            <div
              className="bg-white border-2 border-black brutal-shadow-lg w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#0B2545] text-white border-b-2 border-black p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#E9C46A]">
                    Developer
                  </div>

                  <h2 className="font-display font-black text-2xl md:text-3xl uppercase mt-1">
                    Prateek Jangir
                  </h2>
                </div>

                <button
                  onClick={() => setShowDeveloper(false)}
                  className="bg-white text-black border-2 border-black px-3 py-1 font-black"
                >
                  ✕
                </button>
              </div>

              {/* Developer information */}
              <div className="p-6">
                <h3 className="font-display font-black text-xl uppercase">
                  Hello! 👋
                </h3>

                <p className="mt-3 leading-relaxed">
                  I&apos;m Prateek, a student and the developer behind
                  CampusConnect. I built this project to create a simple and
                  useful platform where students can report, search, and recover
                  lost items within their campus community.
                </p>

                {/* Links */}
                <div className="mt-6 border-t-2 border-dashed border-black pt-5">
                  <div className="font-bold uppercase text-xs tracking-widest mb-3">
                    Connect with me
                  </div>

                  <div className="flex flex-col gap-3">
                    <a
                      href="https://www.linkedin.com/in/prateek-jangir-software-developer/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#E9C46A] border-2 border-black px-4 py-3 font-bold uppercase brutal-shadow-sm brutal-press"
                    >
                      LinkedIn →
                    </a>

                    <a
                      href="https://github.com/prateek4576"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border-2 border-black px-4 py-3 font-bold uppercase brutal-shadow-sm brutal-press"
                    >
                      GitHub →
                    </a>

                    <a
                      href="mailto:prateekjangir4576@gmail.com"
                      className="bg-[#E63946] text-white border-2 border-black px-4 py-3 font-bold uppercase brutal-shadow-sm brutal-press"
                    >
                      Email Me →
                    </a>
                  </div>
                </div>

                {/* Close */}
                <button
                  onClick={() => setShowDeveloper(false)}
                  className="w-full mt-6 bg-black text-white border-2 border-black px-4 py-3 font-bold uppercase brutal-shadow-sm brutal-press"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
