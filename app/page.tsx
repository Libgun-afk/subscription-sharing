import Link from "next/link";

export default function HomePage() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          Share subscription costs with others
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
          Split Netflix, Spotify, Disney+ and more. Save money while enjoying
          premium services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/listings"
            className="inline-flex items-center justify-center bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-lg shadow-lg shadow-primary-600/25"
          >
            Browse Listings
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
