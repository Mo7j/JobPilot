export default function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <img src="/jobpilot-192.png" alt="JobPilot" className="size-12 rounded-2xl anim-float" />
        <div className="h-1 w-24 overflow-hidden rounded-full bg-line">
          <div className="h-full w-1/3 rounded-full bg-accent skeleton" />
        </div>
      </div>
    </div>
  );
}
