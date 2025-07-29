// /components/badges/ALL_BADGES.ts

export type BadgeCategory = "tijd" | "geld" | "streaks" | "gezondheid";

export interface Badge {
  id: string;
  category: BadgeCategory;
  label: string;
  description: string;
  icon: string;
  value: number;
}

export const ALL_BADGES: Badge[] = [
  // --- TIJD ---
  { id: "stop",    category: "tijd", label: "Gestopt!", description: "Je hebt de stap gezet!", icon: "🛑", value: 0 },
  { id: "dag1",    category: "tijd", label: "1 dag rookvrij", description: "Je eerste 24 uur!", icon: "🌅", value: 1 },
  { id: "dag2",    category: "tijd", label: "2 dagen rookvrij", description: "Twee dagen volgehouden!", icon: "🌄", value: 2 },
  { id: "dag3",    category: "tijd", label: "3 dagen rookvrij", description: "Over de eerste hobbel!", icon: "🏔️", value: 3 },
  { id: "dag4",    category: "tijd", label: "4 dagen rookvrij", description: "Je doorzettingsvermogen groeit!", icon: "🏞️", value: 4 },
  { id: "dag5",    category: "tijd", label: "5 dagen rookvrij", description: "Vijf dagen zonder sigaret!", icon: "🏆", value: 5 },
  { id: "week1",   category: "tijd", label: "1 week rookvrij", description: "Een volle week gehaald!", icon: "🗓️", value: 7 },
  { id: "week2",   category: "tijd", label: "2 weken rookvrij", description: "Twee weken zonder roken!", icon: "🗓️", value: 14 },
  { id: "maand1",  category: "tijd", label: "1 maand rookvrij", description: "Geweldige mijlpaal!", icon: "🌙", value: 30 },
  { id: "maand2",  category: "tijd", label: "2 maanden rookvrij", description: "Twee maanden volgehouden!", icon: "🌕", value: 60 },
  { id: "maand3",  category: "tijd", label: "3 maanden rookvrij", description: "Drie maanden – top!", icon: "🌝", value: 90 },
  { id: "maand4",  category: "tijd", label: "4 maanden rookvrij", description: "Vier maanden!", icon: "🌚", value: 120 },
  { id: "maand5",  category: "tijd", label: "5 maanden rookvrij", description: "Vijf maanden – respect!", icon: "🌑", value: 150 },
  { id: "halfjaar",category: "tijd", label: "Half jaar rookvrij", description: "Zes maanden rookvrij!", icon: "🌟", value: 182 },
  { id: "jaar1",   category: "tijd", label: "1 jaar rookvrij", description: "Een jaar zonder sigaret!", icon: "🎉", value: 365 },
  { id: "jaar1_5", category: "tijd", label: "1,5 jaar rookvrij", description: "1,5 jaar volgehouden!", icon: "💪", value: 547 },
  { id: "jaar2",   category: "tijd", label: "2 jaar rookvrij", description: "Twee jaar – fenomenaal!", icon: "🏅", value: 730 },
  { id: "jaar3",   category: "tijd", label: "3 jaar rookvrij", description: "Drie jaar rookvrij!", icon: "🏆", value: 1095 },

  // --- GELD ---
  { id: "geld10",    category: "geld", label: "€10 bespaard", description: "De eerste €10 niet opgerookt!", icon: "💸", value: 10 },
  { id: "geld25",    category: "geld", label: "€25 bespaard", description: "Al €25 in je zak!", icon: "💵", value: 25 },
  { id: "geld100",   category: "geld", label: "€100 bespaard", description: "Wow, €100 niet uitgegeven!", icon: "💰", value: 100 },
  { id: "geld250",   category: "geld", label: "€250 bespaard", description: "€250 bespaard – goed bezig!", icon: "💶", value: 250 },
  { id: "geld500",   category: "geld", label: "€500 bespaard", description: "€500 bespaard!", icon: "💷", value: 500 },
  { id: "geld750",   category: "geld", label: "€750 bespaard", description: "€750 bespaard!", icon: "💴", value: 750 },
  { id: "geld1000",  category: "geld", label: "€1000 bespaard", description: "€1000 – ongelofelijk!", icon: "🏦", value: 1000 },
  { id: "geld1500",  category: "geld", label: "€1500 bespaard", description: "€1500 niet uitgegeven!", icon: "💎", value: 1500 },
  { id: "geld2000",  category: "geld", label: "€2000 bespaard", description: "€2000 voor jezelf!", icon: "🪙", value: 2000 },
  { id: "geld2500",  category: "geld", label: "€2500 bespaard", description: "€2500 gered!", icon: "💎", value: 2500 },

  // --- STREAKS ---
  { id: "streak5",    category: "streaks", label: "5 dagen streak", description: "Vijf dagen achter elkaar rookvrij!", icon: "🔥", value: 5 },
  { id: "streak10",   category: "streaks", label: "10 dagen streak", description: "Tien dagen in een streak!", icon: "🔥", value: 10 },
  { id: "streak20",   category: "streaks", label: "20 dagen streak", description: "Twintig dagen in een streak!", icon: "🔥", value: 20 },
  { id: "streak30",   category: "streaks", label: "30 dagen streak", description: "Dertig dagen zonder rook!", icon: "🔥", value: 30 },
  { id: "streak50",   category: "streaks", label: "50 dagen streak", description: "Vijftig dagen streak!", icon: "🔥", value: 50 },
  { id: "streak75",   category: "streaks", label: "75 dagen streak", description: "Zeventig-vijf dagen streak!", icon: "🔥", value: 75 },
  { id: "streak100",  category: "streaks", label: "100 dagen streak", description: "100 dagen streak!", icon: "🔥", value: 100 },
  { id: "streak125",  category: "streaks", label: "125 dagen streak", description: "125 dagen streak!", icon: "🔥", value: 125 },
  { id: "streak150",  category: "streaks", label: "150 dagen streak", description: "150 dagen streak!", icon: "🔥", value: 150 },
  { id: "streak200",  category: "streaks", label: "200 dagen streak", description: "200 dagen streak!", icon: "🔥", value: 200 },
  { id: "streak250",  category: "streaks", label: "250 dagen streak", description: "250 dagen streak!", icon: "🔥", value: 250 },
  { id: "streak375",  category: "streaks", label: "375 dagen streak", description: "375 dagen streak!", icon: "🔥", value: 375 },
  { id: "streak500",  category: "streaks", label: "500 dagen streak", description: "500 dagen streak!", icon: "🔥", value: 500 },
  { id: "streak750",  category: "streaks", label: "750 dagen streak", description: "750 dagen streak!", icon: "🔥", value: 750 },
  { id: "streak1000", category: "streaks", label: "1000 dagen streak", description: "1000 dagen streak!", icon: "🔥", value: 1000 },

  // --- GEZONDHEID ---
  { id: "20min",    category: "gezondheid", label: "20 minuten", description: "Hartslag & bloeddruk dalen", icon: "❤️", value: 20 },
  { id: "8uur",     category: "gezondheid", label: "8 uur", description: "Zuurstofgehalte normaliseert", icon: "⚕️", value: 480 },
  { id: "12uur",    category: "gezondheid", label: "12 uur", description: "CO-niveau daalt", icon: "💨", value: 720 },
  { id: "1dag",     category: "gezondheid", label: "1 dag", description: "Kans op hartaanval daalt", icon: "💉", value: 1440 },
  { id: "2dagen",   category: "gezondheid", label: "2 dagen", description: "Smaak & geur scherper", icon: "🍽️", value: 2880 },
  { id: "3dagen",   category: "gezondheid", label: "3 dagen", description: "Ademen gaat makkelijker", icon: "🫁", value: 4320 },
  { id: "1week",    category: "gezondheid", label: "1 week", description: "Longfunctie verbetert", icon: "💪", value: 10080 },
  { id: "2weken",   category: "gezondheid", label: "2 weken", description: "Bloedsomloop beter", icon: "🦵", value: 20160 },
  { id: "1maand",   category: "gezondheid", label: "1 maand", description: "Hoest verdwijnt", icon: "😤", value: 43200 },
  { id: "3maanden", category: "gezondheid", label: "3 maanden", description: "+30% longcapaciteit", icon: "🌿", value: 129600 },
  { id: "6maanden", category: "gezondheid", label: "6 maanden", description: "Trilhaarcellen herstellen", icon: "🦠", value: 259200 },
  { id: "9maanden", category: "gezondheid", label: "9 maanden", description: "Minder longinfecties", icon: "🫀", value: 388800 },
  { id: "1jaar",    category: "gezondheid", label: "1 jaar", description: "Risico hartziekten halveert", icon: "💊", value: 525600 },
  { id: "5jaar",    category: "gezondheid", label: "5 jaar", description: "Risico beroerte daalt 50%", icon: "🎉", value: 2628000 },
  { id: "10jaar",   category: "gezondheid", label: "10 jaar", description: "Longkanker-risico halveert", icon: "🧬", value: 5256000 },
];
