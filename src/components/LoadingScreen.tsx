import { asset } from "@/lib/asset";

export default function LoadingScreen() {
  return (
    <div className="splash" role="status">
      <img className="splash-cat" src={asset("art/load-cat.png")} alt="" />
      <img className="dots" src={asset("art/load-dots.svg")} alt="加载中" />
    </div>
  );
}
