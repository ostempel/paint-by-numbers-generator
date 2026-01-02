import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, ImageIcon, FileDown, Sliders } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url(/background.jpg)" }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

        <div className="relative container mx-auto px-6 min-h-screen flex items-center">
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

      <section className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smart color reduction
              </h3>
              <p className="text-gray-600 text-sm">
                Intelligently reduce your image to 4-24 colors while maintaining
                visual quality and recognizable details.
              </p>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smooth, organic outlines
              </h3>
              <p className="text-gray-600 text-sm">
                Adjust smoothing levels to create gentle, flowing boundaries
                between color regions for a natural look.
              </p>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <FileDown className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Printable SVG & PNG export
              </h3>
              <p className="text-gray-600 text-sm">
                Download your finished template as high-quality SVG or PNG
                files, ready for printing at any size.
              </p>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <Sliders className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Adjustable detail level
              </h3>
              <p className="text-gray-600 text-sm">
                Control minimum area sizes to merge tiny regions and create
                templates that are easier to paint.
              </p>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Numbered color guide
              </h3>
              <p className="text-gray-600 text-sm">
                Each region is labeled with numbers that correspond to your
                color palette for easy painting.
              </p>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Open Source
              </h3>
              <p className="text-gray-600 text-sm">
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
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center py-20">
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

      <section id="examples" className="min-h-screen bg-gray-50 py-20">
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

      <section className="min-h-screen flex items-center py-20">
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

            {/* Preview Image */}
            <div className="w-full flex justify-center mt-4">
              <div className="max-w-sm w-full p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <img
                  src="logo.png"
                  alt="Paint by Numbers preview"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
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
