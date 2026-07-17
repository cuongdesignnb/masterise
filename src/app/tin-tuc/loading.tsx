export default function NewsLoading() {
  return (
    <main className="min-h-screen bg-[#FBF8F2] pb-16 pt-24 lg:pb-0">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="h-[360px] animate-pulse rounded-[22px] bg-[#E8DED1] sm:h-[420px]" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }, (_, index) => <div key={index} className="h-[340px] animate-pulse rounded-[16px] bg-white" />)}
          </div>
          <div className="hidden h-[520px] animate-pulse rounded-[18px] bg-white lg:block" />
        </div>
      </div>
    </main>
  );
}
