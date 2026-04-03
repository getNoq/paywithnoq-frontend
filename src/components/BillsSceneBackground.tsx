/**
 * BillsSceneBackground
 *
 * Animated 2D street scene — anchored to the bottom of the viewport.
 * Characters walk across paying electricity, water, cable, and airtime bills.
 * Sits below all app content, never distracts.
 *
 * Usage:
 *   Place inside your layout root, before the main app shell.
 *   <BillsSceneBackground />
 */

export function BillsSceneBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '180px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Top fade — scene dissolves into the page background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '70px',
        background: 'linear-gradient(to bottom, #F5F5F0, transparent)',
        zIndex: 2,
      }} />

      <svg
        width="100%"
        height="180"
        viewBox="0 0 1200 180"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', position: 'absolute', bottom: 0 }}
      >
        <defs>
          <style>{`
            @keyframes walk-right {
              from { transform: translateX(-140px); }
              to   { transform: translateX(1340px); }
            }
            @keyframes walk-left {
              from { transform: translateX(1340px); }
              to   { transform: translateX(-140px); }
            }
            @keyframes bob {
              0%, 100% { transform: translateY(0px); }
              50%       { transform: translateY(-3px); }
            }
            @keyframes phone-glow {
              0%, 100% { opacity: 0.45; }
              50%       { opacity: 1; }
            }
            @keyframes coin-float {
              0%   { transform: translateY(0)    scale(1);   opacity: 1; }
              100% { transform: translateY(-28px) scale(0.4); opacity: 0; }
            }
            @keyframes check-pop {
              0%   { transform: scale(0); opacity: 0; }
              60%  { transform: scale(1.3); opacity: 1; }
              100% { transform: scale(1);   opacity: 1; }
            }

            .p-a { animation: walk-right 15s linear infinite; }
            .p-b { animation: walk-right 20s linear infinite; animation-delay: -6s; }
            .p-c { animation: walk-left  22s linear infinite; animation-delay: -4s; }
            .p-d { animation: walk-right 17s linear infinite; animation-delay: -11s; }
            .bob  { animation: bob 0.75s ease-in-out infinite; }
            .bob2 { animation: bob 0.85s ease-in-out infinite; animation-delay: 0.3s; }
            .bob3 { animation: bob 0.9s  ease-in-out infinite; animation-delay: 0.6s; }
            .bob4 { animation: bob 0.55s ease-in-out infinite; animation-delay: 0.1s; }
            .pglow  { animation: phone-glow 1.8s ease-in-out infinite; }
            .pglow2 { animation: phone-glow 1.8s ease-in-out infinite; animation-delay: 0.4s; }
            .pglow3 { animation: phone-glow 1.8s ease-in-out infinite; animation-delay: 0.8s; }
            .pglow4 { animation: phone-glow 1.8s ease-in-out infinite; animation-delay: 0.2s; }
            .coin1 { animation: coin-float 1.5s ease-out infinite; }
            .coin2 { animation: coin-float 1.5s ease-out infinite; animation-delay: 0.5s; }
            .chk   { animation: check-pop 0.4s ease-out forwards; animation-delay: 1s; opacity: 0; }
            .chk2  { animation: check-pop 0.4s ease-out forwards; animation-delay: 2s; opacity: 0; }

            @media (prefers-reduced-motion: reduce) {
              .p-a, .p-b, .p-c, .p-d,
              .bob, .bob2, .bob3, .bob4,
              .pglow, .pglow2, .pglow3, .pglow4,
              .coin1, .coin2, .chk, .chk2 {
                animation: none;
              }
            }
          `}</style>
        </defs>

        {/* ── Ground ── */}
        <rect x="0" y="148" width="1200" height="4" rx="2" fill="#E5E3DC"/>
        <rect x="-800" y="152" width="1400" height="28" fill="#EDEAE3"/>
        <rect x="600" y="152" width="1400" height="28" fill="#EDEAE3"/>

        {/* ── Buildings ── */}
        {/* B1 */}
        <rect x="40"  y="60"  width="90"  height="90"  rx="4" fill="#EAE8E1"/>
        <rect x="52"  y="72"  width="16"  height="20"  rx="2" fill="#D4D1C8"/>
        <rect x="76"  y="72"  width="16"  height="20"  rx="2" fill="#D4D1C8"/>
        <rect x="100" y="72"  width="16"  height="20"  rx="2" fill="#D4D1C8"/>
        <rect x="52"  y="102" width="16"  height="20"  rx="2" fill="#D4D1C8"/>
        <rect x="76"  y="102" width="16"  height="20"  rx="2" fill="#BFEDE6" opacity="0.8"/>
        <rect x="95"  y="118" width="20"  height="30"  rx="3" fill="#C8C5BC"/>
        {/* B2 */}
        <rect x="160" y="30"  width="70"  height="120" rx="4" fill="#E8E6DF"/>
        <rect x="170" y="42"  width="14"  height="18"  rx="2" fill="#D0CEC5"/>
        <rect x="192" y="42"  width="14"  height="18"  rx="2" fill="#BFEDE6" opacity="0.8"/>
        <rect x="170" y="70"  width="14"  height="18"  rx="2" fill="#D0CEC5"/>
        <rect x="192" y="70"  width="14"  height="18"  rx="2" fill="#D0CEC5"/>
        <rect x="170" y="98"  width="14"  height="18"  rx="2" fill="#D0CEC5"/>
        <rect x="192" y="98"  width="14"  height="18"  rx="2" fill="#BFEDE6" opacity="0.7"/>
        <rect x="178" y="120" width="18"  height="28"  rx="3" fill="#C0BEB5"/>
        {/* Shop */}
        <rect x="265" y="90"  width="100" height="60"  rx="4" fill="#EAE8E1"/>
        <rect x="275" y="98"  width="50"  height="30"  rx="3" fill="#BFEDE6" opacity="0.7"/>
        <rect x="278" y="84"  width="44"  height="12"  rx="3" fill="#005F56" opacity="0.6"/>
        <rect x="290" y="128" width="28"  height="20"  rx="3" fill="#C8C5BC"/>
        {/* Pole */}
        <rect x="400" y="50"  width="5"   height="100" rx="2" fill="#D4D1C8"/>
        <rect x="385" y="58"  width="35"  height="3"   rx="1" fill="#D4D1C8"/>
        <circle cx="387" cy="58" r="4" fill="#EDE9A0" opacity="0.6"/>
        <circle cx="418" cy="58" r="4" fill="#EDE9A0" opacity="0.6"/>
        <path d="M387 58 Q402 68 418 58" fill="none" stroke="#C8C5BC" strokeWidth="1.5"/>
        {/* B3 */}
        <rect x="440" y="50"  width="80"  height="100" rx="4" fill="#E8E6DF"/>
        <rect x="452" y="62"  width="16"  height="22"  rx="2" fill="#BFEDE6" opacity="0.8"/>
        <rect x="476" y="62"  width="16"  height="22"  rx="2" fill="#D0CEC5"/>
        <rect x="452" y="94"  width="16"  height="22"  rx="2" fill="#D0CEC5"/>
        <rect x="476" y="94"  width="16"  height="22"  rx="2" fill="#BFEDE6" opacity="0.6"/>
        <rect x="460" y="120" width="24"  height="28"  rx="3" fill="#C0BEB5"/>
        {/* ATM */}
        <rect x="555" y="98"  width="48"  height="52"  rx="6" fill="#E0DED7"/>
        <rect x="562" y="106" width="34"  height="22"  rx="3" fill="#BFEDE6" opacity="0.8"/>
        <circle cx="579" cy="138" r="5" fill="#D0CEC5"/>
        {/* B4 */}
        <rect x="635" y="70"  width="95"  height="80"  rx="4" fill="#EAE8E1"/>
        <rect x="647" y="82"  width="16"  height="20"  rx="2" fill="#D0CEC5"/>
        <rect x="671" y="82"  width="16"  height="20"  rx="2" fill="#BFEDE6" opacity="0.8"/>
        <rect x="695" y="82"  width="16"  height="20"  rx="2" fill="#D0CEC5"/>
        <rect x="655" y="122" width="26"  height="26"  rx="3" fill="#C0BEB5"/>
        {/* Pole 2 */}
        <rect x="760" y="55"  width="5"   height="95"  rx="2" fill="#D4D1C8"/>
        <rect x="745" y="64"  width="35"  height="3"   rx="1" fill="#D4D1C8"/>
        <circle cx="747" cy="64" r="4" fill="#EDE9A0" opacity="0.6"/>
        <circle cx="778" cy="64" r="4" fill="#EDE9A0" opacity="0.6"/>
        <path d="M747 64 Q762 74 778 64" fill="none" stroke="#C8C5BC" strokeWidth="1.5"/>
        {/* Shop 2 */}
        <rect x="800" y="95"  width="90"  height="55"  rx="4" fill="#EAE8E1"/>
        <rect x="810" y="89"  width="38"  height="10"  rx="3" fill="#111111" opacity="0.65"/>
        <rect x="810" y="103" width="42"  height="28"  rx="3" fill="#BFEDE6" opacity="0.7"/>
        <rect x="820" y="126" width="26"  height="22"  rx="3" fill="#C8C5BC"/>
        {/* B5 */}
        <rect x="920" y="40"  width="75"  height="110" rx="4" fill="#E8E6DF"/>
        <rect x="930" y="54"  width="14"  height="18"  rx="2" fill="#D0CEC5"/>
        <rect x="952" y="54"  width="14"  height="18"  rx="2" fill="#BFEDE6" opacity="0.9"/>
        <rect x="972" y="54"  width="14"  height="18"  rx="2" fill="#D0CEC5"/>
        <rect x="930" y="80"  width="14"  height="18"  rx="2" fill="#D0CEC5"/>
        <rect x="952" y="80"  width="14"  height="18"  rx="2" fill="#BFEDE6" opacity="0.6"/>
        <rect x="940" y="122" width="26"  height="28"  rx="3" fill="#C0BEB5"/>
        {/* B6 */}
        <rect x="1060" y="65" width="85"  height="85"  rx="4" fill="#EAE8E1"/>
        <rect x="1072" y="78" width="16"  height="20"  rx="2" fill="#D0CEC5"/>
        <rect x="1096" y="78" width="16"  height="20"  rx="2" fill="#BFEDE6" opacity="0.8"/>
        <rect x="1072" y="106" width="16" height="20"  rx="2" fill="#D0CEC5"/>
        <rect x="1085" y="118" width="24" height="30"  rx="3" fill="#C0BEB5"/>

        {/* ── Person A — electricity bill, walks right ── */}
        <g className="p-a">
          <g className="bob">
            <rect x="18" y="106" width="18" height="30" rx="5" fill="#005F56"/>
            <circle cx="27" cy="100" r="10" fill="#C8956C"/>
            <path d="M17 98 Q27 90 37 98" fill="#3D2B1A"/>
            <rect x="7"  y="112" width="13" height="7" rx="3" fill="#C8956C"/>
            <rect x="36" y="110" width="14" height="8" rx="3" fill="#C8956C"/>
            <rect x="49" y="106" width="10" height="16" rx="2" fill="#111111"/>
            <rect x="50" y="108" width="8"  height="10" rx="1" className="pglow" fill="#BFEDE6"/>
            <path d="M53 109 L51 113 L54 113 L52 117" fill="none" stroke="#005F56" strokeWidth="1" strokeLinecap="round"/>
            <rect x="18" y="134" width="7"  height="14" rx="3" fill="#2C4A3E"/>
            <rect x="28" y="134" width="7"  height="14" rx="3" fill="#2C4A3E"/>
            <ellipse cx="21" cy="148" rx="6" ry="3" fill="#1A1A1A"/>
            <ellipse cx="32" cy="148" rx="6" ry="3" fill="#1A1A1A"/>
            <g className="coin1">
              <circle cx="54" cy="95" r="5" fill="#F0A500" opacity="0.9"/>
              <text x="54" y="99" textAnchor="middle" fontSize="6" fill="#7A5000">₦</text>
            </g>
            <g className="coin2">
              <circle cx="61" cy="88" r="4" fill="#F0A500" opacity="0.6"/>
            </g>
          </g>
        </g>

        {/* ── Person B — water bill, walks right, bag ── */}
        <g className="p-b">
          <g className="bob2">
            <path d="M16 108 Q14 128 12 136 L34 136 Q32 128 30 108 Z" fill="#D4537E"/>
            <circle cx="23" cy="100" r="10" fill="#D4956C"/>
            <path d="M13 98 Q23 88 33 98" fill="#3D2B1A"/>
            <path d="M13 99 Q13 116 14 118" fill="none" stroke="#3D2B1A" strokeWidth="3" strokeLinecap="round"/>
            <path d="M33 99 Q33 114 32 116" fill="none" stroke="#3D2B1A" strokeWidth="3" strokeLinecap="round"/>
            <rect x="0"  y="116" width="13" height="12" rx="3" fill="#E8C5A0"/>
            <rect x="6"  y="112" width="3"  height="6"  rx="1" fill="#D4A07A"/>
            <rect x="33" y="111" width="10" height="15" rx="2" fill="#111111"/>
            <rect x="34" y="112" width="8"  height="9"  rx="1" className="pglow2" fill="#BFEDE6"/>
            <path d="M38 113 Q37 116 38 118 Q39 116 38 113Z" fill="#3B82F6" opacity="0.9"/>
            <rect x="15" y="135" width="7"  height="13" rx="3" fill="#8B1A4A"/>
            <rect x="24" y="135" width="7"  height="13" rx="3" fill="#8B1A4A"/>
            <ellipse cx="18" cy="148" rx="6" ry="3" fill="#2C1A1A"/>
            <ellipse cx="27" cy="148" rx="6" ry="3" fill="#2C1A1A"/>
            <g className="chk" transform="translate(40 92)">
              <circle cx="0" cy="0" r="7" fill="#005F56"/>
              <path d="M-3 0 L-1 3 L4 -3" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </g>
        </g>

        {/* ── Person C — cable TV, walks left, older ── */}
        <g className="p-c">
          <g className="bob3">
            <rect x="14" y="107" width="20" height="30" rx="5" fill="#6B7280"/>
            <circle cx="24" cy="100" r="10" fill="#C8A882"/>
            <path d="M14 99 Q24 90 34 99" fill="#B0AEA8"/>
            <line x1="6" y1="114" x2="2" y2="148" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
            <rect x="34" y="108" width="13" height="18" rx="2" fill="#111111"/>
            <rect x="35" y="110" width="11" height="11" rx="1" className="pglow3" fill="#BFEDE6"/>
            <rect x="36" y="111" width="9"  height="5"  rx="1" fill="#005F56" opacity="0.8"/>
            <line x1="40" y1="116" x2="38" y2="119" stroke="#005F56" strokeWidth="1"/>
            <line x1="41" y1="116" x2="43" y2="119" stroke="#005F56" strokeWidth="1"/>
            <rect x="16" y="135" width="7"  height="13" rx="3" fill="#4B5563"/>
            <rect x="26" y="135" width="7"  height="13" rx="3" fill="#4B5563"/>
            <ellipse cx="19" cy="148" rx="6" ry="3" fill="#111"/>
            <ellipse cx="29" cy="148" rx="6" ry="3" fill="#111"/>
            <g className="chk2" transform="translate(45 95)">
              <circle cx="0" cy="0" r="7" fill="#005F56"/>
              <path d="M-3 0 L-1 3 L4 -3" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </g>
        </g>

        {/* ── Person D — airtime, running right ── */}
        <g className="p-d">
          <g className="bob4">
            <rect x="16" y="107" width="17" height="28" rx="5" fill="#F59E0B" transform="rotate(-5 25 121)"/>
            <circle cx="28" cy="99" r="9" fill="#C8956C"/>
            <path d="M19 97 Q28 89 37 97" fill="#111111"/>
            <rect x="37" y="95" width="6" height="3" rx="1" fill="#111111"/>
            <rect x="4"  y="108" width="13" height="7" rx="3" fill="#C8956C" transform="rotate(20 10 111)"/>
            <rect x="33" y="115" width="13" height="7" rx="3" fill="#C8956C" transform="rotate(-25 40 118)"/>
            <rect x="46" y="113" width="9" height="14" rx="2" fill="#111111"/>
            <rect x="47" y="114" width="7" height="9"  rx="1" className="pglow4" fill="#BFEDE6"/>
            <rect x="48" y="119" width="2" height="3" rx="0.5" fill="#005F56"/>
            <rect x="51" y="117" width="2" height="5" rx="0.5" fill="#005F56"/>
            <rect x="16" y="133" width="7"  height="15" rx="3" fill="#92400E" transform="rotate(15 19 140)"/>
            <rect x="25" y="133" width="7"  height="15" rx="3" fill="#92400E" transform="rotate(-10 28 140)"/>
            <ellipse cx="17" cy="148" rx="6" ry="3" fill="#1A1A1A"/>
            <ellipse cx="29" cy="147" rx="6" ry="3" fill="#1A1A1A"/>
            <line x1="0"  y1="112" x2="10" y2="112" stroke="#D9D6CE" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0"  y1="118" x2="12" y2="118" stroke="#D9D6CE" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2"  y1="124" x2="11" y2="124" stroke="#D9D6CE" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
        </g>

        {/* Sidewalk dots */}
        {[80, 200, 350, 500, 650, 800, 950, 1100].map(x => (
          <circle key={x} cx={x} cy={152} r={1.5} fill="#D9D6CE"/>
        ))}
      </svg>
    </div>
  )
}