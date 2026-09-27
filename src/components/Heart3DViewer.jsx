import { Suspense, useState, Component } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Html } from "@react-three/drei";

// Model file location: public/models/heart.glb
// If the file is not available, viewer will display error state (not crash).
const MODEL_PATH = "/models/heart.glb";

function HeartModel() {
  const { scene } = useGLTF(MODEL_PATH);
  return (
    <Center>
      <primitive object={scene} scale={1} />
    </Center>
  );
}

function ModelFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center text-slate-500 text-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        <span className="mt-2">Loading 3D model...</span>
      </div>
    </Html>
  );
}

export default function Heart3DViewer({ height = 320, autoRotateDefault = true }) {
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div style={{ height }} className="flex flex-col items-center justify-center rounded-lg bg-surface-muted text-center px-4">
        <span className="text-3xl">🫀</span>
        <p className="mt-2 text-sm font-medium text-slate-600">3D model failed to load</p>
        <p className="mt-1 text-xs text-slate-400">
          Ensure the file <code>heart.glb</code> exists in the folder <code>public/models/</code>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Auto Rotate</span>

        <button type="button" role="switch" aria-checked={autoRotate} aria-label="Auto Rotate" onClick={() => setAutoRotate((prev) => !prev)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${autoRotate ? "bg-brand-600" : "bg-slate-300"}`}>
          <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${autoRotate ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>

      <div style={{ height }} className="overflow-hidden rounded-lg bg-surface-muted">
        <ErrorCatcher onError={() => setFailed(true)}>
          <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 3, 3]} intensity={1} />
            <Suspense fallback={<ModelFallback />}>
              <HeartModel />
            </Suspense>
            <OrbitControls autoRotate={autoRotate} autoRotateSpeed={2.2} enablePan enableZoom minDistance={1} maxDistance={8} />
          </Canvas>
        </ErrorCatcher>
      </div>
    </div>
  );
}

// Simple runtime error boundary (class component required for componentDidCatch)
class ErrorCatcher extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
