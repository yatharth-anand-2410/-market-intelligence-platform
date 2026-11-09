import type { Category, Lead, Project, Signals } from "@/lib/types";

/**
 * DEMO DATA. Every name, phone number, email and URL here is invented for
 * demonstration. None of it is the result of real research.
 */
const DEMO_DATE = "2026-11-01T09:00:00.000Z";
const SRC = ["https://example.com/demo-source-1", "https://example.com/demo-source-2"];

type Row = [
  id: string, name: string, category: Category, locality: string,
  signals: [number, number, number, number], summary: string, hasSites?: number,
];

const rows: Row[] = [
  ["d01", "Gangaprabha Developers", "Developer", "Lahartara", [5, 5, 4, 5], "Mid-size residential developer with two towers under construction; likely bulk door and plywood requirement.", 2],
  ["d02", "Kashipuram Estates", "Developer", "Sigra", [5, 4, 4, 4], "Township developer with phased apartment launches.", 2],
  ["d03", "Varun Nirman Group", "Developer", "Shivpur", [4, 4, 3, 4], "Builds mid-segment flats and plotted colonies.", 2],
  ["d04", "Sankat Mochan Infra", "Developer", "Lanka", [4, 3, 3, 3], "Small developer, one active residential project.", 1],
  ["d05", "Purvanchal Heights Pvt Ltd", "Developer", "Harhua", [5, 5, 5, 5], "Large group with a mixed-use project and several residential towers; strong public documentation.", 2],
  ["d06", "Ramnagar Realty Works", "Developer", "Ramnagar", [3, 2, 2, 2], "Early-stage developer with announced plotted layout.", 1],
  ["d07", "Assi Ghat Residences LLP", "Developer", "Bhelupur", [4, 3, 3, 4], "Boutique premium apartments near the river front.", 1],
  ["a01", "Studio Madhyam", "Architect/Designer", "Sigra", [4, 3, 4, 4], "Residential architecture studio; specifies premium doors for villas.", 2],
  ["a02", "Atelier Nadesar", "Architect/Designer", "Nadesar", [5, 4, 3, 5], "Interior design practice active on high-end homes and boutique hotels.", 2],
  ["a03", "Rekha Interiors", "Architect/Designer", "Mahmoorganj", [3, 3, 2, 3], "Home interior designer working with local carpenters.", 1],
  ["a04", "Vastu Design Collective", "Architect/Designer", "Pandeypur", [3, 2, 3, 2], "Architect group focused on small residential plans.", 1],
  ["a05", "Kaushal & Partners Architects", "Architect/Designer", "Cantt", [4, 4, 4, 3], "Commercial and institutional architecture; occasional residential.", 2],
  ["c01", "Bharat Civil Works", "Contractor", "Manduadih", [4, 5, 4, 4], "Civil contractor on several ongoing residential blocks.", 2],
  ["c02", "Shakti Construction Co.", "Contractor", "Chitaipur", [4, 4, 3, 4], "General contractor handling apartment finishing contracts.", 1],
  ["c03", "Ganga Infra Contractors", "Contractor", "Rohania", [3, 3, 3, 3], "Roads and buildings contractor expanding into housing.", 1],
  ["c04", "Anand Builders & Contractors", "Contractor", "Sunderpur", [3, 2, 2, 3], "Local building contractor, small-scale projects.", 1],
  ["c05", "Dwarka Projects", "Contractor", "Ravindrapuri", [5, 4, 4, 5], "Turnkey contractor for villas and bungalows; buys doors with fit-out.", 2],
  ["m01", "Maa Annapurna Plywood", "Dealer", "Chowk", [4, 2, 3, 3], "Established plywood and laminate dealer; potential distribution partner.", 2],
  ["m02", "Kashi Timber Mart", "Dealer", "Orderly Bazar", [4, 3, 3, 3], "Timber and board dealer with contractor clientele.", 1],
  ["m03", "Vishwanath Building Materials", "Dealer", "Lanka", [3, 2, 2, 2], "General building material dealer.", 1],
  ["m04", "Sarnath Wood Traders", "Dealer", "Sarnath", [4, 2, 4, 3], "Wood trader supplying carpenters and furniture makers.", 2],
  ["h01", "Mahadev Hardware Stores", "Hardware", "Chowk", [3, 2, 3, 2], "Hardware retail with door fittings range.", 1],
  ["h02", "Pragati Hardware Distributors", "Hardware", "Bhullanpur", [4, 3, 4, 3], "Regional hardware distributor serving dealers.", 2],
  ["h03", "Kashi Fittings Centre", "Hardware", "Mahmoorganj", [3, 1, 2, 2], "Retailer of locks, hinges and fittings.", 1],
  ["h04", "Bholenath Sanitary & Hardware", "Hardware", "Ramnagar", [2, 2, 2, 1], "Small hardware and sanitary retailer.", 0],
  ["d08", "Trilok Homes", "Developer", "Pandeypur", [4, 4, 3, 4], "Family-run housing developer; two apartment complexes planned.", 1],
];

export const SEED_LEADS: Lead[] = rows.map(([id, name, category, locality, s, summary, n = 1]) => {
  const signals: Signals = { relevance: s[0], projectActivity: s[1], evidence: s[2], requirement: s[3] };
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const sourceUrls = SRC.slice(0, n);
  return {
    id, name, category, locality, summary, signals, sourceUrls,
    website: `https://example.com/${slug}`,
    phone: "+91 00000 00000",
    email: `contact@${slug}.example`,
    researchedAt: DEMO_DATE,
    origin: "demo" as const,
    facts: {
      Activity: {
        value: summary,
        provenance: n > 0 ? "verified" : "assumption",
        sourceUrls,
        researchedAt: DEMO_DATE,
      },
      "Door requirement": {
        value: "Likely requirement for interior doors based on project stage.",
        provenance: "assumption",
        sourceUrls: [],
        researchedAt: DEMO_DATE,
      },
    },
  };
});

const projRows: [string, string, Project["type"], Project["status"], string, string, string][] = [
  ["p01", "Gangaprabha Towers", "Residential", "Under construction", "Lahartara", "d01", "Two towers, 2 and 3 BHK flats."],
  ["p02", "Kashipuram Greens Phase 2", "Residential", "Announced", "Sigra", "d02", "Second phase of a gated apartment township."],
  ["p03", "Purvanchal Central", "Mixed-use", "Under construction", "Harhua", "d05", "Retail podium with residential towers above."],
  ["p04", "Purvanchal Skyline Homes", "Residential", "Nearing completion", "Harhua", "d05", "Premium apartments, handover planned soon."],
  ["p05", "Varun Vihar", "Residential", "Under construction", "Shivpur", "d03", "Plotted colony with villas."],
  ["p06", "Assi Riverside Residences", "Residential", "Announced", "Bhelupur", "d07", "Boutique premium apartments."],
  ["p07", "Trilok Enclave", "Residential", "Announced", "Pandeypur", "d08", "Two low-rise apartment complexes."],
  ["p08", "Sigra Business Court", "Commercial", "Under construction", "Sigra", "d02", "Office and showroom complex."],
  ["p09", "Cantt Medical Annex", "Institutional", "Under construction", "Cantt", "a05", "Hospital annex designed by a local architect."],
  ["p10", "Dwarka Heritage Villas", "Residential", "Under construction", "Ravindrapuri", "c05", "Independent villas; turnkey fit-out."],
  ["p11", "Manduadih Housing Block", "Residential", "Under construction", "Manduadih", "c01", "Four-storey housing block, finishing stage."],
  ["p12", "Ramnagar Layout", "Residential", "Announced", "Ramnagar", "d06", "Plotted layout, infrastructure stage."],
];

export const SEED_PROJECTS: Project[] = projRows.map(([id, name, type, status, locality, devId, summary]) => ({
  id, name, type, status, locality, summary,
  developerId: devId,
  developerName: rows.find((r) => r[0] === devId)![1],
  sourceUrls: SRC.slice(0, 1),
  researchedAt: DEMO_DATE,
  origin: "demo" as const,
}));

export const SEED_RESEARCH_LOG = [
  { at: "2026-11-05T10:30:00.000Z", query: "Find real estate developers in Varanasi (demo entry)" },
  { at: "2026-11-04T16:10:00.000Z", query: "Architects working on residential projects (demo entry)" },
  { at: "2026-11-02T11:45:00.000Z", query: "Construction companies with ongoing projects (demo entry)" },
];
