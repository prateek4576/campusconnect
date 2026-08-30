import {
  Rocket,
  Shield,
  HeartHandshake,
  Target,
  LockKeyhole,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

import { useState } from "react";


export default function About() {

    const [showDeveloper, setShowDeveloper] = useState(false);
  const faqs = [
    {
      question: "How do I report a lost item?",
      answer:
        'Create an account, choose "Report Lost Item", add the item details, location, date and a photo, then submit your post.',
    },
    {
      question: "How do I report something I found?",
      answer: `Choose "Report Found Item" from the dashboard and provide the item's details, location, date and a clear photo.`,
    },
    {
      question: "Can I edit or delete my posts?",
      answer:
        "Yes. You can manage your own posts from the My Account page, including editing or deleting them.",
    },
    {
      question: "Can I mark an item as returned?",
      answer:
        'Yes. Once a lost or found item has been successfully returned, its status can be changed from "Open" to "Returned".',
    },
    {
      question: "Is CampusConnect free?",
      answer:
        "Yes. CampusConnect is designed to be free for students and the campus community.",
    },
    {
      question: "How should I meet someone to return an item?",
      answer:
        "For safety, arrange the exchange in a public and familiar campus location whenever possible.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">

      {/* ================= HEADER ================= */}

      <div className="border-b-2 border-black pb-6 mb-8">

        <div className="inline-block bg-[#E9C46A] border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3">
          About
        </div>

        <h1 className="font-display font-black text-4xl md:text-6xl uppercase leading-none">
          Built for the campus community.
        </h1>

        <p className="mt-4 text-lg max-w-3xl">
          CampusConnect is a student-first lost &amp; found board. It takes
          about 30 seconds to post something you&apos;ve lost or found. From
          there, the community does the rest.
        </p>

      </div>


      {/* ================= FEATURES ================= */}

      <div className="grid md:grid-cols-3 gap-6">

        {[
          {
            icon: Rocket,
            title: "Fast",
            desc: "Post an item and see it live on the board immediately. No approval queues.",
          },
          {
            icon: Shield,
            title: "Private-first",
            desc: "We only share the contact info you choose to display on your posts.",
          },
          {
            icon: HeartHandshake,
            title: "Community-driven",
            desc: "Every reunion is powered by a fellow student doing a small good deed.",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="bg-white border-2 border-black brutal-shadow p-6"
          >
            <f.icon size={28} strokeWidth={2.5} />

            <h3 className="font-display font-black text-xl uppercase mt-3">
              {f.title}
            </h3>

            <p className="mt-2 leading-relaxed text-sm">
              {f.desc}
            </p>
          </div>
        ))}

      </div>


      {/* ================= OUR MISSION ================= */}

      

      <section className="mt-12">

        <div className="bg-[#E63946] text-white border-2 border-black brutal-shadow-lg p-8 md:p-10">

          <div className="flex items-start gap-5">

            <div className="w-14 h-14 bg-white text-black border-2 border-black brutal-shadow-sm flex items-center justify-center flex-shrink-0">
              <Target size={30} strokeWidth={2.5} />
            </div>

            <div>

              <div className="font-bold uppercase text-xs tracking-widest mb-2">
                Our Mission
              </div>

              <h2 className="font-display font-black text-3xl md:text-4xl uppercase leading-tight">
                Make lost &amp; found simple.
              </h2>

              <p className="mt-4 leading-relaxed text-white/95 max-w-3xl">
                Losing something on campus can be frustrating. Finding it
                shouldn&apos;t be impossible. CampusConnect was created to
                make lost-and-found simple, fast and accessible for students.
              </p>

              <p className="mt-3 leading-relaxed text-white/95 max-w-3xl">
                Whether you lost your keys, found someone&apos;s wallet or
                simply want to help a fellow student, CampusConnect gives
                everyone a simple way to connect.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= SAFETY & PRIVACY ================= */}

      <section className="mt-12">

        <div className="bg-[#0B2545] text-white border-2 border-black brutal-shadow-lg p-8 md:p-10">

          <div className="flex items-start gap-5">

            <div className="w-14 h-14 bg-[#E9C46A] text-black border-2 border-black brutal-shadow-sm flex items-center justify-center flex-shrink-0">
              <LockKeyhole size={30} strokeWidth={2.5} />
            </div>

            <div>

              <div className="font-bold uppercase text-xs tracking-widest text-[#E9C46A] mb-2">
                Safety &amp; Privacy
              </div>

              <h2 className="font-display font-black text-3xl md:text-4xl uppercase leading-tight">
                Meet safely. Share wisely.
              </h2>

              <p className="mt-4 leading-relaxed text-white/90 max-w-3xl">
                CampusConnect helps students connect, but your safety always
                comes first. Avoid sharing passwords, bank details, ID numbers
                or other sensitive information in your posts.
              </p>

              <div className="mt-6 grid md:grid-cols-2 gap-4">

                <div className="border-2 border-white/40 p-4">
                  <h3 className="font-display font-black uppercase text-lg">
                    Protect your information
                  </h3>

                  <p className="mt-1 text-sm text-white/80">
                    Only include information that is necessary to identify
                    your item.
                  </p>
                </div>

                <div className="border-2 border-white/40 p-4">
                  <h3 className="font-display font-black uppercase text-lg">
                    Choose a safe location
                  </h3>

                  <p className="mt-1 text-sm text-white/80">
                    Arrange item exchanges in a public and familiar campus
                    location.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= COMMUNITY MESSAGE ================= */}

      <SectionDivider />

      <section className="mt-12">

        <div className="bg-[#E9C46A] border-2 border-black brutal-shadow-lg p-8 md:p-12 text-center">

          <div className="mx-auto w-14 h-14 bg-white border-2 border-black brutal-shadow-sm flex items-center justify-center">
            <MessageCircle size={30} strokeWidth={2.5} />
          </div>

          <div className="font-bold uppercase text-xs tracking-widest mt-5">
            Community Message
          </div>

          <h2 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight mt-2">
            Help something find
            <br />
            its way home.
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            A small act can make a big difference. If you lose something,
            report it. If you find something, post it. Together, we can make
            campus a little more helpful for everyone.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">

            <a
              href="/report/lost"
              className="bg-[#E63946] text-white border-2 border-black px-5 py-3 brutal-shadow brutal-press font-bold uppercase text-sm"
            >
              I Lost Something
            </a>

            <a
              href="/report/found"
              className="bg-[#2A9D8F] text-white border-2 border-black px-5 py-3 brutal-shadow brutal-press font-bold uppercase text-sm"
            >
              I Found Something
            </a>

          </div>

        </div>

      </section>


      {/* ================= FAQ ================= */}

     <SectionSpace />
     

      <section className="mt-12">

        <div className="border-b-2 border-black pb-4 mb-6">

          <div className="inline-block bg-[#2A9D8F] text-white border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3">
            FAQ
          </div>

          <h2 className="font-display font-black text-3xl md:text-4xl uppercase">
            Frequently Asked Questions
          </h2>

          <p className="mt-2 text-sm">
            Everything you need to know about using CampusConnect.
          </p>

        </div>


        <div className="space-y-4">

          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white border-2 border-black brutal-shadow"
            >

              <summary className="list-none cursor-pointer p-5 flex items-center justify-between gap-4 font-display font-black uppercase text-lg">

                <span>
                  {faq.question}
                </span>

                <ChevronDown
                  size={22}
                  className="flex-shrink-0 transition-transform group-open:rotate-180"
                />

              </summary>

              <div className="border-t-2 border-black px-5 py-4 text-sm leading-relaxed">
                {faq.answer}
              </div>

            </details>
          ))}

        </div>

      </section>


      {/* ================= OUR PROMISE ================= */}

      <SectionDivider />

      <div className="mt-12 bg-[#0B2545] text-white border-2 border-black brutal-shadow-lg p-8">

        <h2 className="font-display font-black text-2xl md:text-3xl uppercase">
          Our promise
        </h2>

        <p className="mt-3 leading-relaxed max-w-3xl">
          We keep CampusConnect free for students, ad-free on item pages, and
          simple by design. The site exists to help reunite students with
          their belongings and encourage a helpful campus community.
        </p>

      </div>

      {/* ABOUT THE DEVELOPER */}
<div className="mt-16 border-t-2 border-black pt-10 pb-12 text-center">

  

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
          useful platform where students can report, search, and
          recover lost items within their campus community.
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

    </div>
  );
}


function SectionDivider() {
  return (
    <div className="border-t-2 border-black mt-12 mb-10"></div>
  );
}


function SectionSpace() {
  return <div className="h-10"></div>;
}