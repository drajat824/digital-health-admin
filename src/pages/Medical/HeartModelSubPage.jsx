import { Card } from "../../components/common/UI";
import Heart3DViewer from "../../components/Heart3DViewer";

export default function HeartModelSubPage() {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-bold text-slate-800">3D Heart Model</h3>
      <Heart3DViewer height={420} />
      <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-500">
        <span>🖱️ Click & drag to rotate</span>
        <span>🖲️ Scroll to zoom</span>
        <span>✋ Right-click & drag to pan</span>
      </div>
    </Card>
  );
}
