import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Palette,
  ImageIcon,
  FileDown,
  Sliders,
  Paintbrush,
  CodeXml,
} from "lucide-react";
import FeatureCard from "@/components/feature-card";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/test.png" alt="Logo" width={40} height={40} />
              <Link
                href="/"
                className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Paint by Numbers
              </Link>
            </div>
            <Link
              href="https://github.com/ostempel/paint-by-numbers-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="View on GitHub"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Link>
          </div>
        </div>
      </header>
      <section
        className="relative min-h-[calc(100vh-4rem)] bg-cover bg-center"
        style={{ backgroundImage: "url(/background.jpg)" }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

        <div className="relative container mx-auto px-6 min-h-[calc(100vh-4rem)] flex items-center">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
              Turn any image into a beautiful Paint-by-Numbers artwork
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Transform your favorite photos into printable paint-by-numbers
              templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary-gradient">
                <Link href="/editor">Try it now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#examples">See examples</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Palette className="w-6 h-6 text-gray-700" />}
              title="Smart color reduction"
              description="Intelligently reduce your image to 4-24 colors while maintaining visual quality and recognizable details."
            />

            <FeatureCard
              icon={<ImageIcon className="w-6 h-6 text-gray-700" />}
              title="Smooth, organic outlines"
              description="Adjust smoothing levels to create gentle, flowing boundaries between color regions for a natural look."
            />

            <FeatureCard
              icon={<FileDown className="w-6 h-6 text-gray-700" />}
              title="Printable SVG & PNG export"
              description="Download your finished template as high-quality SVG or PNG files, ready for printing at any size."
            />

            <FeatureCard
              icon={<Sliders className="w-6 h-6 text-gray-700" />}
              title="Adjustable detail level"
              description="Control minimum area sizes to merge tiny regions and create templates that are easier to paint."
            />

            <FeatureCard
              icon={<Paintbrush className="w-6 h-6 text-gray-700" />}
              title="Numbered color guide"
              description="Each region is labeled with numbers that correspond to your color palette for easy painting."
            />

            <FeatureCard
              icon={<CodeXml className="w-6 h-6 text-gray-700" />}
              title="Open Source"
              description={
                <>
                  Completely free and open-source software. View the code on{" "}
                  <a
                    href="https://github.com/oliverstempel/paint-by-numbers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 underline underline-offset-4 hover:text-gray-700"
                  >
                    GitHub
                  </a>
                  .
                </>
              }
            />
          </div>
        </div>
      </section>

      <section className="min-h-[calc(100vh-4rem)] flex items-center py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              How it started
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The idea for this project started while I was looking for a gift
                for my girlfriend. She loves painting, and I wanted to give her
                something personal — not just another standard paint-by-numbers
                kit.
              </p>

              <p>
                I began wondering if it would be possible to create a custom
                paint-by-numbers template from one of our own photos. I found a
                company that offered exactly that, but the price felt
                surprisingly high for what was essentially a single generated
                image.
              </p>

              <p>
                When I started looking for a similar gift again later on, I
                searched for an open-source alternative and discovered an
                existing paint-by-numbers generator:{" "}
                <a
                  href="https://github.com/drake7707/paintbynumbersgenerator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 underline underline-offset-4 hover:text-gray-700"
                >
                  paintbynumbersgenerator on GitHub
                </a>
                . I used it to generate several images and was impressed by the
                underlying idea and the results.
              </p>

              <p>
                However, the interface felt outdated and the project was no
                longer actively maintained. That sparked the idea to build a
                modern version — one that keeps the powerful core concept, but
                adds a clean, intuitive interface and more control over the
                final result.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="examples"
        className="min-h-[calc(100vh-4rem)] bg-gray-50 py-20"
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Impressions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/paint-by-numbers-line-drawing-of-landscape.jpg"
                alt="Line drawing example"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/paint-by-numbers-painted-preview-of-portrait.jpg"
                alt="Painted preview example"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/printed-paint-by-numbers-template-on-canvas.jpg"
                alt="Printed template example"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/paint-by-numbers-of-flowers-being-painted.jpg"
                alt="Work in progress"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/completed-paint-by-numbers-artwork-of-sunset.jpg"
                alt="Completed artwork"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/paint-by-numbers-template-with-color-palette.jpg"
                alt="Template with palette"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-[calc(100vh-4rem)] flex items-center py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            <h2 className="text-4xl font-semibold text-gray-900 mb-6 text-balance">
              Create your own Paint-by-Numbers artwork
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              Start transforming your images into beautiful paint-by-numbers
              templates today. It's free to use and takes just seconds to get
              started.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-primary-gradient text-base px-10 mb-12"
            >
              <Link href="/editor">Get started</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>Paint by Numbers Generator</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                GitHub
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
