import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const samplePersonas = [
  {
    name: "Dimas Pratama",
    niches: ["gym", "fitness", "lifestyle cowok"],
    description: "Persona pria sporty dan disiplin. Konten berfokus pada tips workout di rumah, suplemen fitness, pakaian olahraga, dan gaya hidup sehat pria.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "dimas.workout", instagram: "@dimas.fitlife", tiktok: "@dimaspratama_gym", threads: "@dimas.fitlife" },
    status: "active"
  },
  {
    name: "Sarah Aurelia",
    niches: ["skincare", "beauty", "makeup"],
    description: "Persona beauty enthusiast dengan tone of voice ceria dan informatif. Membahas review serum, sunscreen lokal, tutorial makeup natural, dan tips perawatan kulit berjerawat.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "sarah.glowup", instagram: "@sarahaurelia.skin", tiktok: "@sarah_skincare", threads: "@sarahaurelia.skin" },
    status: "active"
  },
  {
    name: "Rizky Ramadhan",
    niches: ["elektronik", "setup desk", "gadget"],
    description: "Persona tech geek minimalis. Mengulas perlengkapan meja kerja, keyboard mekanik, lampu monitor, mouse wireless, dan gadget produktivitas.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "rizky.desksetup", instagram: "@rizky.techzone", tiktok: "@rizkygadget", threads: "@rizky.techzone" },
    status: "active"
  },
  {
    name: "Nadia Safira",
    niches: ["fashion cewek", "outfit", "ootd"],
    description: "Persona fashionista muda dengan gaya kasual dan chic. Berbagi inspirasi mix and match outfit kuliah/kantor, rekomendasi tas lokal, dan sepatu sneakers wanita.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "nadia.ootd", instagram: "@nadiasafira.style", tiktok: "@nadiasafira_outfit", threads: "@nadiasafira.style" },
    status: "active"
  },
  {
    name: "Budi Santoso",
    niches: ["homeliving", "elektronik", "perabot"],
    description: "Persona bapak muda yang hobi upgrade rumah. Fokus pada review alat pembersih rumah tangga, perabot minimalis, dan peralatan dapur canggih.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "budi.homediy", instagram: "@budisantoso.home", tiktok: "@budi_rumahidaman" },
    status: "active"
  },
  {
    name: "Clara Wijaya",
    niches: ["parfum", "lifestyle", "beauty"],
    description: "Persona parfum reviewer dengan gaya elegan. Merekomendasikan parfum lokal tahan lama, notes aroma manis dan floral untuk cewek, serta layering tips.",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "clara.scents", instagram: "@clarawijaya.perfume", tiktok: "@claraperfumereview", threads: "@clarawijaya.perfume" },
    status: "active"
  },
  {
    name: "Aditya Pratama",
    niches: ["lifestyle cowok", "outfit", "parfum"],
    description: "Persona cowok modern kasual. Memberikan rekomendasi kemeja flannel, celana chino, parfum maskulin segar, dan sneakers harian untuk cowok.",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "aditya.menswear", instagram: "@adityapratama.men", tiktok: "@adityapratama_style" },
    status: "active"
  },
  {
    name: "Maya Anggraini",
    niches: ["makanan & snack", "kuliner", "resep"],
    description: "Persona pecinta cemilan dan kuliner viral. Mengulas snack kiloan enak, frozen food hemat, dan bumbu instan praktis untuk anak kos.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "maya.foodhunt", instagram: "@mayamakanterus", tiktok: "@maya_snackreview", threads: "@mayamakanterus" },
    status: "active"
  },
  {
    name: "Fajar Nugraha",
    niches: ["otomotif", "lifestyle cowok", "gadget"],
    description: "Persona hobi motor dan riding. Mengulas perlengkapan helm, intercom bluetooth, jaket riding tahan angin, dan holder HP motor kokoh.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "fajar.motovlog", instagram: "@fajarnugraha.ride", tiktok: "@fajarmotor" },
    status: "active"
  },
  {
    name: "Tiara Lestari",
    niches: ["parenting", "bayi & anak", "homeliving"],
    description: "Persona ibu muda penyayang keluarga. Rekomendasi baju bayi organik, perlengkapan MPASI, mainan edukatif balita, dan stroller praktis.",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "tiara.momjourney", instagram: "@tiaralestari.mom", tiktok: "@tiaralestari_tips" },
    status: "active"
  },
  {
    name: "Kevin Sanjaya",
    niches: ["gadget", "gaming", "setup desk"],
    description: "Persona gamer dan content creator. Review headset gaming murah tapi bagus, kursi ergonomis, mikrofon podcast, dan cooling pad laptop.",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "kevin.gaminggear", instagram: "@kevin.gadgetzone", tiktok: "@kevingaming_id" },
    status: "active"
  },
  {
    name: "Jessica Tania",
    niches: ["skincare", "bodycare", "beauty"],
    description: "Persona glowing skin advocate. Membagikan tips lotion pemutih aman BPOM, body scrub wangi tahan seharian, dan lip tint natural.",
    avatarUrl: "https://images.unsplash.com/photo-1514315384763-ba401779410f?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "jessica.glowsecret", instagram: "@jessicatania.beauty", tiktok: "@jessicatania_skin" },
    status: "active"
  },
  {
    name: "Dika Mahendra",
    niches: ["gym", "outfit", "sepatu"],
    description: "Persona runner dan calisthenics enthusiast. Rekomendasi sepatu lari empuk harga terjangkau, kaos dry-fit nyaman, dan smartwatch tracker.",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "dika.runner", instagram: "@dikamahendra.run", tiktok: "@dikarunning" },
    status: "active"
  },
  {
    name: "Amanda Putri",
    niches: ["homeliving", "dekorasi", "organizer"],
    description: "Persona pecinta rumah rapi bergaya Japandi. Rekomendasi kotak organizer estetik, sprei katun adem, diffuser aromaterapi, dan rak bumbu.",
    avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "amanda.dekorcantik", instagram: "@amandaputri.home", tiktok: "@amandahomedecor" },
    status: "active"
  },
  {
    name: "Rama Danu",
    niches: ["elektronik", "audio", "gadget"],
    description: "Persona audiophile pemula. Menguji kualitas TWS earphone murah berkualitas, bluetooth speaker outdoor tahan air, dan headphone noise cancelling.",
    avatarUrl: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "rama.audiogear", instagram: "@ramadanu.sound", tiktok: "@rama_audio" },
    status: "active"
  },
  {
    name: "Putri Rahayu",
    niches: ["hijab fashion", "outfit", "muslimah"],
    description: "Persona muslimah modern dan anggun. Rekomendasi pashmina instan anti kusut, gamis simpel elegan, manset adem, dan inner hijab nyaman.",
    avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "putri.hijabstyle", instagram: "@putrirahayu.hijab", tiktok: "@putrihijab_ootd" },
    status: "active"
  },
  {
    name: "Gilang Maulana",
    niches: ["kopi", "makanan & snack", "lifestyle cowok"],
    description: "Persona home barista & coffee lover. Merekomendasikan biji kopi arabika lokal, manual grinder portabel, cangkir kopi estetik, dan cemilan pendamping.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "gilang.coffee", instagram: "@gilang.baristahome", tiktok: "@gilang_ngopi" },
    status: "active"
  },
  {
    name: "Vanessa Kusuma",
    niches: ["beauty", "aksesoris", "fashion cewek"],
    description: "Persona cewek estetik pecinta perhiasan titanium tahan karat, kacamata hitam retro, bando lucu, dan jepit rambut vintage.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "vanessa.accs", instagram: "@vanessakusuma.acc", tiktok: "@vanessajewelry" },
    status: "active"
  },
  {
    name: "Satria Dewa",
    niches: ["parfum", "lifestyle cowok", "grooming"],
    description: "Persona pria karismatik. Ulasan pomade tahan seharian, beard oil penumbuh kumis, parfum pria beraroma leather & woody untuk malam hari.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "satria.grooming", instagram: "@satriadewa.groom", tiktok: "@satriadewa_men" },
    status: "active"
  },
  {
    name: "Bella Saphira",
    niches: ["skincare", "kesehatan", "lifestyle"],
    description: "Persona wellness dan clean beauty. Rekomendasi suplemen kolagen aman, teh herbal pelangsing, sunscreen physical untuk kulit sensitif.",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "bella.wellness", instagram: "@bellasaphira.health", tiktok: "@bellasaphira_tips" },
    status: "active"
  },
  {
    name: "Rio Ardiansyah",
    niches: ["outdoor", "camping", "lifestyle cowok"],
    description: "Persona petualang alam bebas. Rekomendasi tenda ultralight, kompor portabel kamping, tas ransel carrier gunung, dan lampu lentera LED.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "rio.outdoor", instagram: "@rioardiansyah.adventure", tiktok: "@rio_pendaki" },
    status: "active"
  },
  {
    name: "Tasya Kamila",
    niches: ["parenting", "anak", "edukasi"],
    description: "Persona bunda cerdas. Rekomendasi buku pop-up anak, flashcard edukatif, mainan montessori kayu, dan lunch box tahan bocor anak TK/SD.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "tasya.parentingkids", instagram: "@tasyakamila.smartmom", tiktok: "@tasyamama_edukasi" },
    status: "active"
  },
  {
    name: "Aris Munandar",
    niches: ["elektronik", "alat rumah", "perkakas"],
    description: "Persona pria praktis penyuka perkakas rumah. Rekomendasi obeng elektrik, lem tembak kuat, bor baterai tanpa kabel, dan lakban waterproof.",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "aris.diytools", instagram: "@arismunandar.tools", tiktok: "@arispakartukang" },
    status: "on_hiatus"
  },
  {
    name: "Dinda Kirana",
    niches: ["makeup", "skincare", "beauty"],
    description: "Persona mahasiswi hemat. Rekomendasi bedak padat oil-control murah, pensil alis natural tahan seharian, dan micellar water ramah kantong.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "dinda.makeuphemat", instagram: "@dindakirana.beauty", tiktok: "@dindabeauty_under50k" },
    status: "on_hiatus"
  },
  {
    name: "Farhan Hakim",
    niches: ["gym", "suplemen", "lifestyle cowok"],
    description: "Persona atlet binaraga natural. Membahas whey protein isolate halal, creatine monohydrate, straps angkat beban, dan sabuk gym kulit.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "farhan.fitnesstips", instagram: "@farhanhakim.iron", tiktok: "@farhan_gymbro" },
    status: "on_hiatus"
  },
  {
    name: "Zahra Salsabila",
    niches: ["hijab fashion", "aksesoris", "muslimah"],
    description: "Persona hijabi kasual. Rekomendasi ciput anti pusing, bros hijab minimalis, tas jinjing kanvas simpel, dan sandal teplek empuk.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "zahra.hijabwear", instagram: "@zahrasalsabila.modest", tiktok: "@zahrahijab_daily" },
    status: "on_hiatus"
  },
  {
    name: "Ilham Syahputra",
    niches: ["gadget", "fotografi", "kreator"],
    description: "Persona mobile photographer. Rekomendasi tripod HP fleksibel, ring light portable, lensa clip-on macro, dan gimbal stabilizer HP.",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "ilham.mobilephoto", instagram: "@ilhamsyah.lens", tiktok: "@ilhamkreator" },
    status: "on_hiatus"
  },
  {
    name: "Sheila Melinda",
    niches: ["makanan & snack", "baking", "dapur"],
    description: "Persona pembuat kue rumahan. Rekomendasi mixer tangan murah, loyang kue anti lengket, timbangan digital presisi, dan piping bag tebal.",
    avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "sheila.bakinghome", instagram: "@sheilamelinda.bakes", tiktok: "@sheila_bakingfun" },
    status: "deactive"
  },
  {
    name: "Bayu Wicaksono",
    niches: ["sepatu", "streetwear", "lifestyle cowok"],
    description: "Persona sneakerhead lokal. Ulasan pembersih sepatu khusus, kaos kaki motif retro, insoles empuk anti capek, dan kotak sepatu akrilik transparan.",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "bayu.sneakerid", instagram: "@bayuwicaksono.kicks", tiktok: "@bayusneakers" },
    status: "deactive"
  },
  {
    name: "Cindy Claudia",
    niches: ["parfum", "bodycare", "beauty"],
    description: "Persona wewangian fresh & clean. Rekomendasi body mist wangi sabun bayi, deodorant roll on tidak membuat baju kuning, dan sabun mandi batangan mewah.",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=faces",
    platforms: { facebook: "cindy.fragrance", instagram: "@cindyclaudia.scent", tiktok: "@cindy_bodymist" },
    status: "deactive"
  }
];

async function main() {
  console.log("Seeding 30 random personas...");
  let count = 0;
  for (const item of samplePersonas) {
    await prisma.persona.create({
      data: {
        name: item.name,
        niches: item.niches,
        description: item.description,
        avatarUrl: item.avatarUrl,
        platforms: item.platforms,
        status: item.status,
      }
    });
    count++;
  }
  console.log(`Successfully injected ${count} personas!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
