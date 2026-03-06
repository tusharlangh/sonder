import { CanvasView } from '../src/components/CanvasView';
import { Controls } from '../src/components/Controls';

export default function Home() {
  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
      }}
    >
      {/* Full-viewport ASCII Canvas */}
      <CanvasView />

      {/* Floating Controls Overlay */}
      <Controls />
    </main>
  );
}
