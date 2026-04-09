export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 lg:p-12 selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation / Header */}
        <header className="flex justify-between items-center bg-white nb-card nb-shadow p-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            KMK.PROFILE
          </h2>
          <nav className="hidden sm:flex gap-6 font-bold uppercase text-sm">
            <a href="#" className="hover:underline underline-offset-4">About</a>
            <a href="#" className="hover:underline underline-offset-4">Skills</a>
            <a href="#" className="hover:underline underline-offset-4">Connect</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="bg-nb-yellow nb-card nb-shadow p-8 md:p-16 flex flex-col justify-center gap-6 min-h-[40vh]">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black leading-none uppercase tracking-tighter">
            김민규
          </h1>
          <p className="text-xl md:text-3xl font-bold max-w-3xl leading-snug">
            안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다. 
            현대적인 기술과 실험적인 디자인을 사랑합니다.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <button className="bg-black text-white px-8 py-4 text-xl font-bold nb-card hover:bg-zinc-800 transition-colors">
              함께 작업하기
            </button>
            <button className="bg-transparent border-4 border-black px-8 py-4 text-xl font-bold hover:bg-black hover:text-white transition-all">
              프로젝트 보기
            </button>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* About Section */}
          <article className="bg-nb-pink nb-card nb-shadow p-8 lg:col-span-2 space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tight">About Me</h3>
            <div className="text-lg md:text-xl font-bold leading-relaxed space-y-4">
              <p>
                저는 단순히 코드를 짜는 것을 넘어, 사용자에게 시각적으로 즐거운 경험을 주는 프로그래밍인 &apos;바이브 코딩&apos;을 지향합니다.
              </p>
              <p>
                현재 Next.js와 Tailwind CSS를 활용한 현대적인 웹 개발에 집중하고 있으며, 
                Neobrutalism과 같은 독창적인 디자인 스타일을 코드에 적용하는 실험을 좋아합니다.
              </p>
            </div>
          </article>

          {/* Experience / Status */}
          <aside className="bg-nb-orange nb-card nb-shadow p-8 flex flex-col justify-between">
            <h3 className="text-3xl font-black uppercase tracking-tight">Status</h3>
            <div className="mt-8">
              <div className="text-5xl font-black mb-2">3rd yr</div>
              <p className="text-xl font-bold uppercase">Computer Science Student</p>
            </div>
            <div className="mt-8 pt-8 border-t-4 border-black border-dashed">
              <p className="font-bold underline decoration-4 underline-offset-4">Currently learning React 19 & Next.js 16</p>
            </div>
          </aside>

          {/* Skills Section */}
          <section className="bg-nb-green nb-card nb-shadow p-8">
            <h3 className="text-3xl font-black uppercase tracking-tight mb-8">Tech Stack</h3>
            <div className="flex flex-wrap gap-3">
              {[
                "React", "Next.js", "TypeScript", "Tailwind CSS", 
                "Node.js", "Git", "Figma", "Vibe Coding"
              ].map((skill) => (
                <span key={skill} className="bg-white border-2 border-black px-4 py-2 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Connection / Links Section */}
          <section className="bg-nb-purple nb-card nb-shadow p-8 md:col-span-1 lg:col-span-2">
            <h3 className="text-3xl font-black uppercase tracking-tight mb-8">Connect with me</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a href="https://github.com" className="bg-black text-white p-6 nb-card hover:bg-zinc-800 flex flex-col items-center gap-2 group">
                <span className="text-sm font-bold uppercase">Code</span>
                <span className="text-2xl font-black group-hover:underline">GitHub</span>
              </a>
              <a href="mailto:example@email.com" className="bg-white text-black p-6 nb-card nb-shadow flex flex-col items-center gap-2 group">
                <span className="text-sm font-bold uppercase">Say Hello</span>
                <span className="text-2xl font-black group-hover:underline">Email</span>
              </a>
              <a href="#" className="bg-nb-blue text-black p-6 nb-card nb-shadow flex flex-col items-center gap-2 group">
                <span className="text-sm font-bold uppercase">Social</span>
                <span className="text-2xl font-black group-hover:underline">Twitter</span>
              </a>
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="nb-card border-black bg-white p-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xl font-black">© {new Date().getFullYear()} 김민규. NO RIGHTS RESERVED.</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-nb-yellow border-2 border-black" />
            <div className="w-8 h-8 bg-nb-pink border-2 border-black" />
            <div className="w-8 h-8 bg-nb-green border-2 border-black" />
            <div className="w-8 h-8 bg-black border-2 border-white" />
          </div>
        </footer>
      </div>
    </div>
  );
}
