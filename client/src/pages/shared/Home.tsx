import React from "react";

const FALLBACK = "https://via.placeholder.com/800x600?text=No+Image";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">

      {/* MAIN CONTENT */}
      <main className="flex-1">

        {/* HERO SECTION */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Learn Without Limits</h1>
            <p className="text-lg opacity-90 mb-6">
              Access high-quality online courses & improve your skills anytime, anywhere.
            </p>
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition">
              Browse Courses
            </button>
          </div>
        </section>

        {/* POPULAR COURSES */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-6">Popular Courses</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow hover:shadow-lg p-5 border transition"
              >
                <div className="h-40 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/course${i}/800/600`}
                    alt={`Course ${i}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = FALLBACK;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Course Title {i}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Short description about the course content.
                </p>
                <button className="text-indigo-600 font-semibold">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
              <p className="text-gray-600 mb-4">
                Our platform provides top-tier online education with expert instructors
                and engaging content to help you grow.
              </p>
              <ul className="space-y-2">
                <li>✔ High-quality course material</li>
                <li>✔ Skilled & experienced mentors</li>
                <li>✔ Learn at your own pace</li>
              </ul>
            </div>

            {/* IMAGE SLOT — replaced with sample image + fallback */}
            <div className="h-56 bg-gray-200 rounded-xl overflow-hidden">
              <img
                src="https://picsum.photos/seed/about/900/700"
                alt="About us"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.onerror = null;
                  img.src = FALLBACK;
                }}
              />
            </div>
          </div>
        </section>

      </main>

    </div>
  );
};

export default Home;
