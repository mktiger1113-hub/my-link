export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 font-sans">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            김민규
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다.
          </p>
        </div>
        
        <div className="h-px w-24 bg-zinc-200 dark:bg-zinc-800" />
        
        <footer className="text-sm text-zinc-500">
          © {new Date().getFullYear()} 김민규
        </footer>
      </main>
    </div>
  );
}
