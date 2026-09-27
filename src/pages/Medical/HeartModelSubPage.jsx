import { Card } from "../../components/common/UI";
import Heart3DViewer from "../../components/Heart3DViewer";

export default function HeartModelSubPage() {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-bold text-slate-800">Model 3D Jantung</h3>
      <p className="mb-3 text-xs text-slate-400">
        Model statis dari asset lokal proyek (<code>public/models/heart.glb</code>).
        Tidak ada CRUD/upload untuk model 3D — backend tidak memiliki
        controller/routes untuk tabel <code>user_3d_models</code>, jadi model ini
        bukan model khusus per-pasien dari server.
      </p>
      <Heart3DViewer height={420} />
      <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-500">
        <span>🖱️ Klik &amp; geser untuk rotate</span>
        <span>🖲️ Scroll untuk zoom</span>
        <span>✋ Klik kanan &amp; geser untuk pan</span>
      </div>
    </Card>
  );
}
