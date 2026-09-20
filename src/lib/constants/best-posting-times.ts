export interface BestTimeSlot {
  day: string; // e.g. "Senin", "Selasa"
  dayIndex: number; // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
  timeRange: string; // "09:00 - 12:00"
  startHour: number; // 9
  endHour: number; // 12
  engagementLevel: "peak" | "high" | "medium" | "moderate";
  notes?: string;
}

export interface PlatformBestTime {
  platformType: string;
  name: string;
  description: string;
  bestDays: string[];
  slots: BestTimeSlot[];
  tips: string[];
}

export interface NicheBestTime {
  niche: string;
  aliases: string[]; // matching tags/persona niches e.g. ["skincare", "beauty", "perawatan", "kecantikan"]
  peakTime: string;
  bestDays: string[];
  notes: string;
  recommendedSlots: {
    day: string;
    dayIndex: number;
    time: string;
    startHour: number;
    endHour: number;
  }[];
}

export const PLATFORM_BEST_TIMES: Record<string, PlatformBestTime> = {
  facebook: {
    platformType: "facebook",
    name: "Facebook Groups",
    description: "Optimal untuk sebar link racun Shopee di grup jual-beli & komunitas",
    bestDays: ["Selasa", "Rabu", "Kamis", "Weekend"],
    slots: [
      {
        day: "Selasa",
        dayIndex: 2,
        timeRange: "09:00 - 12:00",
        startHour: 9,
        endHour: 12,
        engagementLevel: "peak",
        notes: "Waktu kerja produktif, audiens sering multitasking cek grup",
      },
      {
        day: "Rabu",
        dayIndex: 3,
        timeRange: "09:00 - 12:00",
        startHour: 9,
        endHour: 12,
        engagementLevel: "peak",
        notes: "Pertengahan pekan, respon diskusi grup sangat tinggi",
      },
      {
        day: "Kamis",
        dayIndex: 4,
        timeRange: "12:00 - 15:00",
        startHour: 12,
        endHour: 15,
        engagementLevel: "high",
        notes: "Jam istirahat siang hingga siang santai menjelang sore",
      },
      {
        day: "Jumat",
        dayIndex: 5,
        timeRange: "09:00 - 11:00",
        startHour: 9,
        endHour: 11,
        engagementLevel: "medium",
        notes: "Pagi sebelum persiapan sholat Jumat & weekend",
      },
      {
        day: "Sabtu",
        dayIndex: 6,
        timeRange: "10:00 - 14:00",
        startHour: 10,
        endHour: 14,
        engagementLevel: "peak",
        notes: "Sangat tinggi terutama grup lifestyle, hobi, dan keluarga",
      },
      {
        day: "Minggu",
        dayIndex: 0,
        timeRange: "10:00 - 14:00",
        startHour: 10,
        endHour: 14,
        engagementLevel: "peak",
        notes: "Waktu santai santai scrolling belanja di rumah",
      },
    ],
    tips: [
      "Gunakan format rekomendasi jujur (honest review) daripada hard-selling langsung link.",
      "Sertakan screenshot bukti pemakaian atau potongan diskon untuk meningkatkan CTR.",
      "Balas komentar pertama dalam 15 menit agar algoritma grup memboost postingan.",
    ],
  },
  instagram: {
    platformType: "instagram",
    name: "Instagram Reels & Stories",
    description: "Cocok untuk video pendek racun Shopee dan review visual estetik",
    bestDays: ["Senin", "Selasa", "Rabu", "Kamis", "Sabtu", "Minggu"],
    slots: [
      {
        day: "Senin",
        dayIndex: 1,
        timeRange: "06:00 - 08:00",
        startHour: 6,
        endHour: 8,
        engagementLevel: "high",
        notes: "Pagi commute kerja/kuliah",
      },
      {
        day: "Senin",
        dayIndex: 1,
        timeRange: "18:00 - 21:00",
        startHour: 18,
        endHour: 21,
        engagementLevel: "peak",
        notes: "Malam hari relaksasi scrolling feed",
      },
      {
        day: "Selasa",
        dayIndex: 2,
        timeRange: "11:00 - 13:00",
        startHour: 11,
        endHour: 13,
        engagementLevel: "high",
        notes: "Jam makan siang kantor & santai",
      },
      {
        day: "Selasa",
        dayIndex: 2,
        timeRange: "19:00 - 21:00",
        startHour: 19,
        endHour: 21,
        engagementLevel: "peak",
        notes: "Prime time scrolling malam",
      },
      {
        day: "Rabu",
        dayIndex: 3,
        timeRange: "11:00 - 13:00",
        startHour: 11,
        endHour: 13,
        engagementLevel: "high",
        notes: "Jam makan siang",
      },
      {
        day: "Rabu",
        dayIndex: 3,
        timeRange: "19:00 - 21:00",
        startHour: 19,
        endHour: 21,
        engagementLevel: "peak",
        notes: "Prime time malam",
      },
      {
        day: "Kamis",
        dayIndex: 4,
        timeRange: "11:00 - 13:00",
        startHour: 11,
        endHour: 13,
        engagementLevel: "high",
        notes: "Jam makan siang",
      },
      {
        day: "Kamis",
        dayIndex: 4,
        timeRange: "19:00 - 21:00",
        startHour: 19,
        endHour: 21,
        engagementLevel: "peak",
        notes: "Prime time malam",
      },
      {
        day: "Jumat",
        dayIndex: 5,
        timeRange: "11:00 - 13:00",
        startHour: 11,
        endHour: 13,
        engagementLevel: "high",
        notes: "Sebelum akhir pekan dimulai",
      },
      {
        day: "Sabtu",
        dayIndex: 6,
        timeRange: "09:00 - 11:00",
        startHour: 9,
        endHour: 11,
        engagementLevel: "high",
        notes: "Weekend morning browsing",
      },
      {
        day: "Minggu",
        dayIndex: 0,
        timeRange: "10:00 - 14:00",
        startHour: 10,
        endHour: 14,
        engagementLevel: "peak",
        notes: "Leisure time hari libur",
      },
    ],
    tips: [
      "Pasang 3 detik pertama hook visual yang memancing penasaran ('Jangan beli ini sebelum nonton...').",
      "Gunakan sticker link Shopee di Instagram Story segera setelah Reels di-publish.",
      "Manfaatkan audio trending yang relevan dengan niche persona.",
    ],
  },
  tiktok: {
    platformType: "tiktok",
    name: "TikTok & Shopee Video",
    description: "Algoritma For You Page (FYP) dengan potensi viral tinggi untuk affiliate",
    bestDays: ["Selasa", "Kamis", "Jumat", "Sabtu"],
    slots: [
      {
        day: "Selasa",
        dayIndex: 2,
        timeRange: "12:00 - 14:00",
        startHour: 12,
        endHour: 14,
        engagementLevel: "high",
        notes: "Lunch break browsing",
      },
      {
        day: "Kamis",
        dayIndex: 4,
        timeRange: "19:00 - 22:00",
        startHour: 19,
        endHour: 22,
        engagementLevel: "peak",
        notes: "Prime time hiburan malam",
      },
      {
        day: "Jumat",
        dayIndex: 5,
        timeRange: "16:00 - 22:00",
        startHour: 16,
        endHour: 22,
        engagementLevel: "peak",
        notes: "Menjelang akhir pekan / TGIF hype",
      },
      {
        day: "Sabtu",
        dayIndex: 6,
        timeRange: "11:00 - 15:00",
        startHour: 11,
        endHour: 15,
        engagementLevel: "peak",
        notes: "Waktu senggang belanja online",
      },
    ],
    tips: [
      "Tampilkan produk langsung di thumbnail dan 2 detik awal video.",
      "Sertakan hashtag niche spesifik (#RacunShopee, #SpillBaju, #SkincareViral).",
      "Buat video vertikal 9:16 dengan resolusi jernih 1080p.",
    ],
  },
  threads: {
    platformType: "threads",
    name: "Threads",
    description: "Format percakapan teks santai, curhat pengalaman produk, dan spill link",
    bestDays: ["Senin", "Rabu", "Jumat"],
    slots: [
      {
        day: "Senin",
        dayIndex: 1,
        timeRange: "07:00 - 09:00",
        startHour: 7,
        endHour: 9,
        engagementLevel: "high",
        notes: "Morning coffee & baca update cepat",
      },
      {
        day: "Rabu",
        dayIndex: 3,
        timeRange: "12:00 - 13:00",
        startHour: 12,
        endHour: 13,
        engagementLevel: "high",
        notes: "Lunch break catch-up",
      },
      {
        day: "Jumat",
        dayIndex: 5,
        timeRange: "20:00 - 22:00",
        startHour: 20,
        endHour: 22,
        engagementLevel: "peak",
        notes: "Diskusi santai malam akhir pekan",
      },
    ],
    tips: [
      "Buka dengan cerita atau pertanyaan yang mengundang reply ('Ada yang udah cobain ini?').",
      "Spill link Shopee di reply pertama agar post utama tidak terkesan spam.",
    ],
  },
};

export const NICHE_BEST_TIMES: NicheBestTime[] = [
  {
    niche: "Skincare / Beauty",
    aliases: ["skincare", "beauty", "kecantikan", "makeup", "perawatan", "bodycare"],
    peakTime: "19:00 - 22:00",
    bestDays: ["Selasa", "Rabu", "Kamis"],
    notes: "Setelah jam kerja / aktivitas selesai, audiens meluangkan waktu untuk rutinitas self-care dan mencari racun produk kecantikan.",
    recommendedSlots: [
      { day: "Selasa", dayIndex: 2, time: "19:30 WIB", startHour: 19, endHour: 22 },
      { day: "Rabu", dayIndex: 3, time: "20:00 WIB", startHour: 19, endHour: 22 },
      { day: "Kamis", dayIndex: 4, time: "19:30 WIB", startHour: 19, endHour: 22 },
    ],
  },
  {
    niche: "Fashion / Outfit",
    aliases: ["fashion", "outfit", "ootd", "baju", "pakaian", "sepatu", "tas", "lifestyle cowok"],
    peakTime: "11:00 - 14:00, 19:00 - 21:00",
    bestDays: ["Rabu", "Kamis", "Sabtu"],
    notes: "Jam makan siang untuk inspirasi OOTD harian, dan malam hari untuk merencanakan outfit hangout akhir pekan.",
    recommendedSlots: [
      { day: "Rabu", dayIndex: 3, time: "12:00 WIB", startHour: 11, endHour: 14 },
      { day: "Kamis", dayIndex: 4, time: "19:30 WIB", startHour: 19, endHour: 21 },
      { day: "Sabtu", dayIndex: 6, time: "10:30 WIB", startHour: 10, endHour: 14 },
    ],
  },
  {
    niche: "Gym / Fitness",
    aliases: ["gym", "fitness", "workout", "olahraga", "suplemen", "sehat"],
    peakTime: "05:00 - 07:00, 17:00 - 19:00",
    bestDays: ["Senin", "Selasa", "Kamis"],
    notes: "Sesuai jadwal pre-workout pagi sebelum beraktivitas atau post-workout sore setelah jam kantor.",
    recommendedSlots: [
      { day: "Senin", dayIndex: 1, time: "06:00 WIB", startHour: 5, endHour: 7 },
      { day: "Selasa", dayIndex: 2, time: "17:30 WIB", startHour: 17, endHour: 19 },
      { day: "Kamis", dayIndex: 4, time: "17:30 WIB", startHour: 17, endHour: 19 },
    ],
  },
  {
    niche: "Parfum / Fragrance",
    aliases: ["parfum", "fragrance", "minyak wangi", "scent"],
    peakTime: "18:00 - 21:00",
    bestDays: ["Kamis", "Jumat", "Sabtu"],
    notes: "Evening vibes menjelang hangout malam dan akhir pekan, audiens mencari wewangian untuk kencan/pertemuan.",
    recommendedSlots: [
      { day: "Kamis", dayIndex: 4, time: "19:00 WIB", startHour: 18, endHour: 21 },
      { day: "Jumat", dayIndex: 5, time: "18:30 WIB", startHour: 18, endHour: 21 },
      { day: "Sabtu", dayIndex: 6, time: "19:00 WIB", startHour: 18, endHour: 21 },
    ],
  },
  {
    niche: "Home Living / Perlengkapan Rumah",
    aliases: ["homeliving", "home living", "dekorasi", "rumah", "dapur", "kamar"],
    peakTime: "09:00 - 12:00, 20:00 - 22:00",
    bestDays: ["Sabtu", "Minggu"],
    notes: "Waktu akhir pekan untuk membersihkan, mendekorasi rumah, dan mencari barang perabot fungsional.",
    recommendedSlots: [
      { day: "Sabtu", dayIndex: 6, time: "10:00 WIB", startHour: 9, endHour: 12 },
      { day: "Minggu", dayIndex: 0, time: "11:00 WIB", startHour: 9, endHour: 12 },
      { day: "Minggu", dayIndex: 0, time: "20:00 WIB", startHour: 20, endHour: 22 },
    ],
  },
];

/**
 * Generate 7 days x 24 hours heatmap score (0-10) for a specific platform or general
 */
export function getHeatmapData(platformKey = "facebook"): {
  dayName: string;
  dayIndex: number;
  hours: { hour: number; score: number; label: string }[];
}[] {
  const days = [
    { name: "Minggu", index: 0 },
    { name: "Senin", index: 1 },
    { name: "Selasa", index: 2 },
    { name: "Rabu", index: 3 },
    { name: "Kamis", index: 4 },
    { name: "Jumat", index: 5 },
    { name: "Sabtu", index: 6 },
  ];

  const plat = PLATFORM_BEST_TIMES[platformKey] || PLATFORM_BEST_TIMES.facebook;

  return days.map((day) => {
    const hours = Array.from({ length: 24 }, (_, hour) => {
      // Find matching slots for this day and hour
      const matchingSlot = plat.slots.find(
        (s) =>
          (s.dayIndex === day.index || (day.index === 0 && s.day === "Weekend") || (day.index === 6 && s.day === "Weekend")) &&
          hour >= s.startHour &&
          hour <= s.endHour
      );

      let score = 2; // base score for off-peak
      let label = "Normal";

      if (matchingSlot) {
        if (matchingSlot.engagementLevel === "peak") {
          score = 10;
          label = "Zona Emas (Peak)";
        } else if (matchingSlot.engagementLevel === "high") {
          score = 8;
          label = "Sangat Tinggi (High)";
        } else if (matchingSlot.engagementLevel === "medium") {
          score = 6;
          label = "Sedang (Medium)";
        } else {
          score = 4;
          label = "Cukup (Moderate)";
        }
      } else if (hour >= 11 && hour <= 13) {
        // general lunch boost
        score = 5;
        label = "Lunch Break";
      } else if (hour >= 19 && hour <= 21) {
        // general evening boost
        score = 6;
        label = "Evening Browsing";
      } else if (hour >= 1 && hour <= 5) {
        score = 1;
        label = "Tidur / Low";
      }

      return { hour, score, label };
    });

    return {
      dayName: day.name,
      dayIndex: day.index,
      hours,
    };
  });
}
