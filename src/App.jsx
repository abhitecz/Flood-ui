import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Layers, AlertTriangle, FileText, X, Printer, Globe } from "lucide-react";

// Fix Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ==========================================
// 💡 DATA CONTRACT (Your AI teammates edit this)
// ==========================================
const floodData = {
  eventId: "EMSR927-NEPAL-TRISHULI",
  eventDate: "2026-08-26",
  title: "Bhote Koshi - Trishuli Valley Glacial Flood",
  centerCoords: [28.05, 85.25],
  kpis: {
    inundatedKm2: 34.8,
    cutOffSettlements: 19,
    severedRoadKm: 42.6,
    damagedBuildings: 642,
  },
  villages: [
    {
      id: 1,
      name: "Syabrubesi",
      coords: [28.163, 85.341],
      urgency: "CRITICAL",
      reason: "Pasang Lhamu Highway bridge severed (Km 114)",
      pop: 1850,
      supplies: "2 days",
      hospital: "Dhunche District Hospital",
    },
    {
      id: 2,
      name: "Mailung",
      coords: [28.012, 85.228],
      urgency: "HIGH",
      reason: "Trishuli 3A access corridor buried under rock debris",
      pop: 940,
      supplies: "4 days",
      hospital: "Trishuli Hospital, Bidur",
    },
    {
      id: 3,
      name: "Betrawati (Upper Ward)",
      coords: [27.978, 85.183],
      urgency: "MEDIUM",
      reason: "Secondary river bank breached; bridge structurally unstable",
      pop: 1200,
      supplies: "6 days",
      hospital: "Bidur Community Health Center",
    },
  ],
  exactLocations: [
    {
      id: "LOC-1",
      site: "Rasuwagadhi Border Post",
      coords: "28.272° N, 85.378° E",
      type: "Border Customs & Infrastructure",
      status: "Destroyed",
      desc: "Upstream glacial lake outburst mud-rock inundation.",
    },
    {
      id: "LOC-2",
      site: "Trishuli Hydro Intake",
      coords: "28.075° N, 85.251° E",
      type: "Power Facility",
      status: "Severe Damage",
      desc: "Intake submerged under 4 meters of boulder deposition.",
    },
    {
      id: "LOC-3",
      site: "Ramche Valley Roadway",
      coords: "28.051° N, 85.239° E",
      type: "Highway Link",
      status: "Severed",
      desc: "1.4 km section eroded along river flank.",
    },
  ],
  situationReport: {
    en: "SITUATION REPORT: Bhote Koshi - Trishuli Flood (EMSR927). On 26 August 2026, upstream glacier collapse triggered flash flooding down the Trishuli River. Satellite radar (Sentinel-1) indicates 34.8 sq km inundation. 19 villages are cut off from hospital routes, with Syabrubesi facing critical shortages. Immediate helicopter relief required.",
    np: "स्थिति प्रतिवेदन: भोटेकोशी-त्रिशूली बाढी (EMSR927)। सन् २०२६ अगस्ट २६ मा माथिल्लो हिमनदी पहिरोका कारण त्रिशूली नदी करिडोरमा भीषण बाढी आएको छ। सेन्टिनेल-१ स्याटेलाइट राडार अनुसार ३४.८ वर्ग किमी क्षेत्र प्रभावित भएको छ। पासाङ ल्हामु राजमार्ग अवरुद्ध हुँदा स्याफ्रुबेँसी र मैलुङसहित १९ बस्ती सम्पर्कविहीन भएका छन्।",
  },
};

// ==========================================
// 🖥️ MAIN DASHBOARD
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState("summary"); // 'summary' | 'cutoff' | 'exact'
  const [sarLayer, setSarLayer] = useState(true);
  const [opticalLayer, setOpticalLayer] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lang, setLang] = useState("en");

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Top Split View: Left (Map) + Right (Blueprint Info Panel) */}
      <div className="flex flex-1 w-full h-[calc(100vh-32px)] overflow-hidden">
        
        {/* LEFT PANE: EARTH MAP & SEARCH */}
        <div className="w-2/3 h-full relative">
          {/* Search & Satellite Layers Header */}
          <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 w-80">
            <input
              type="text"
              placeholder="Search location..."
              className="w-full bg-zinc-900/95 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-xl"
            />
            <div className="bg-zinc-900/95 border border-zinc-800 rounded-lg p-2.5 shadow-xl flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Satellite Overlays
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSarLayer(!sarLayer)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    sarLayer ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  Sentinel-1 (SAR)
                </button>
                <button
                  onClick={() => setOpticalLayer(!opticalLayer)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    opticalLayer ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  Sentinel-2
                </button>
              </div>
            </div>
          </div>

          {/* Leaflet Dark Map */}
          <MapContainer
            center={floodData.centerCoords}
            zoom={11}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Inundation Zones */}
            {sarLayer && (
              <Circle
                center={[28.02, 85.22]}
                radius={4000}
                pathOptions={{ color: "#06b6d4", fillColor: "#0891b2", fillOpacity: 0.35, weight: 1.5 }}
              />
            )}
            {opticalLayer && (
              <Circle
                center={[28.15, 85.32]}
                radius={4500}
                pathOptions={{ color: "#ef4444", fillColor: "#dc2626", fillOpacity: 0.4, weight: 2 }}
              />
            )}

            {/* Cut-Off Village Pins */}
            {floodData.villages.map((v) => (
              <Marker key={v.id} position={v.coords}>
                <Popup>
                  <div className="p-1">
                    <h4 className="font-bold text-sm text-red-400">{v.name}</h4>
                    <p className="text-xs text-zinc-200 mt-0.5 font-semibold">Status: CUT OFF ({v.urgency})</p>
                    <p className="text-[11px] text-zinc-400 mt-1">{v.reason}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">Hospital: {v.hospital}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Status Badge */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-zinc-300">{floodData.eventId}</span>
          </div>
        </div>

        {/* RIGHT PANE: CONTROL AND INFO PANEL (From your blueprint) */}
        <div className="w-1/3 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                control and info panel
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{floodData.title}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium"
            >
              <FileText className="w-3.5 h-3.5" /> SitRep
            </button>
          </div>

          {/* 3 Blueprint Tabs */}
          <div className="grid grid-cols-3 border-b border-zinc-800 p-2 gap-1 bg-zinc-950/60">
            <button
              onClick={() => setActiveTab("summary")}
              className={`py-2 text-xs font-medium rounded transition-all ${
                activeTab === "summary" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              summary
            </button>
            <button
              onClick={() => setActiveTab("cutoff")}
              className={`py-2 text-xs font-medium rounded transition-all ${
                activeTab === "cutoff" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Cut off
            </button>
            <button
              onClick={() => setActiveTab("exact")}
              className={`py-2 text-xs font-medium rounded transition-all ${
                activeTab === "exact" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              exact location and info of flood
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: SUMMARY */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-zinc-400">Impact Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-400">Flooded Footprint</span>
                    <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
                      {floodData.kpis.inundatedKm2} <span className="text-xs text-zinc-500">km²</span>
                    </p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-400">Cut-Off Villages</span>
                    <p className="text-xl font-bold font-mono text-red-400 mt-1">
                      {floodData.kpis.cutOffSettlements}
                    </p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-400">Severed Highway</span>
                    <p className="text-xl font-bold font-mono text-amber-400 mt-1">
                      {floodData.kpis.severedRoadKm} <span className="text-xs text-zinc-500">km</span>
                    </p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-400">Damaged Buildings</span>
                    <p className="text-xl font-bold font-mono text-orange-400 mt-1">
                      {floodData.kpis.damagedBuildings}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex items-start gap-2 text-xs text-zinc-400">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>Pasang Lhamu Highway breached. Syabrubesi has approximately 48 hours of food and medical supplies remaining.</p>
                </div>
              </div>
            )}

            {/* TAB 2: CUT OFF */}
            {activeTab === "cutoff" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase text-red-400">
                  Isolated Settlements ({floodData.villages.length})
                </h3>
                {floodData.villages.map((v) => (
                  <div key={v.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm text-zinc-200">{v.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {v.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">
                      <strong className="text-zinc-300">Cause:</strong> {v.reason}
                    </p>
                    <div className="flex justify-between text-[11px] text-zinc-500 border-t border-zinc-900 pt-2 font-mono">
                      <span>Population: {v.pop}</span>
                      <span>Reserves: {v.supplies}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: EXACT LOCATION AND INFO */}
            {activeTab === "exact" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase text-cyan-400">Exact Flood Sites</h3>
                {floodData.exactLocations.map((loc) => (
                  <div key={loc.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-zinc-200">{loc.site}</span>
                      <span className="font-mono text-zinc-400 text-[11px]">{loc.coords}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{loc.desc}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">{loc.type}</span>
                      <span className="text-[10px] text-red-400 font-bold">{loc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER: MANDATORY COPENICUS ATTRIBUTION */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-800 px-4 py-2 text-[10px] text-zinc-500 flex justify-between items-center">
        <div>
          Contains modified Copernicus Sentinel data 2026. • Produced using Copernicus WorldDEM-30. • © OpenStreetMap contributors.
        </div>
        <div className="font-mono text-zinc-400">Track B | EMSR927</div>
      </footer>

      {/* ONE-PAGE SITUATION REPORT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-xl rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="flex items-center gap-1.5 font-bold text-sm">
                <Globe className="w-4 h-4 text-emerald-400" /> Situation Report
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLang(lang === "en" ? "np" : "en")}
                  className="px-2 py-1 bg-zinc-800 text-xs rounded text-zinc-300 hover:text-white"
                >
                  {lang === "en" ? "नेपाली (Nepali)" : "English"}
                </button>
                <button onClick={() => window.print()} className="p-1 text-zinc-400 hover:text-white">
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-zinc-950 p-4 rounded text-xs text-zinc-300 leading-relaxed font-sans">
              {lang === "en" ? floodData.situationReport.en : floodData.situationReport.np}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}