import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function HeroPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* HEADER */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link to="/" className="text-2xl font-bold text-indigo-500">
              Aria
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-300"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Login Button */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              to="/LoginPage"
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Log in →
            </Link>
          </div>
        </nav>

        {/* Mobile Drawer */}
        <Dialog
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
          className="lg:hidden"
        >
          <div className="fixed inset-0 bg-black/60" />
          <Dialog.Panel className="fixed right-0 top-0 h-full w-64 bg-gray-900 p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-indigo-500">Aria</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <Link
                to="/HomePage"
                className="block mt-6 text-indigo-400 font-semibold"
              >
                Log in
              </Link>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      {/* HERO SECTION */}
      <div className="relative isolate px-6 pt-32 lg:px-8 text-center min-w-full w-screen">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl bg-red min-w-full"></div>

        <div className="mx-auto max-w-3xl">
          {/* Announcement Badge */}
          <div className="mb-6 inline-block rounded-full border border-indigo-500/30 px-4 py-1 text-sm text-indigo-300">
            🚀 Powered by Generative AI + MERN Stack
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            Smarter Conversations with{" "}
            <span className="text-indigo-500">Aria AI</span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg text-gray-400">
            Aria is a real-time AI-powered chat application built with the MERN
            stack (MongoDB, Express.js, React, Node.js). Chat with friends,
            enhance messages instantly using AI — rewrite, shorten, rephrase, or
            transform tone into formal or fun styles effortlessly.
          </p>

          <p className="mt-4 text-gray-400">
            Secure media uploads via Cloudinary and lightning-fast messaging
            powered by Socket.IO ensure seamless communication in real time.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex justify-center gap-6">
            <Link
              to="/HomePage"
              className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold hover:bg-indigo-500 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
