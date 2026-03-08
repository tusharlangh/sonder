import { CanvasView } from '../src/components/CanvasView';
import { Controls } from '../src/components/Controls';
import { BottomBar } from '../src/components/BottomBar';

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#040404] relative flex">
      <div className="flex-1 h-full relative overflow-hidden flex items-center justify-center bg-[#070707]">
        <CanvasView />
        <BottomBar />
      </div>

      <div className="flex-shrink-0 w-[420px] h-full relative z-[100] border-l border-white/5 bg-[#000000] shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
        <Controls />
      </div>
    </main>
  );
}