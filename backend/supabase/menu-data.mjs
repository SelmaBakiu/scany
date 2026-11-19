/**
 * The menu, as data.
 *
 * This file — not seed.sql — is the thing you edit. Run
 *
 *     node supabase/generate-seed.mjs
 *
 * to regenerate supabase/seed.sql from it, then paste that into the Supabase
 * SQL editor. Writing ~900 translation rows by hand in SQL is how typos and
 * missing languages get in; generating them means a missing translation is a
 * crash at generation time instead of a blank card in front of a diner.
 *
 * Per item:
 *   n = name            s = short description (the menu card)
 *   l = long description (the item page)    i = ingredients (comma-separated)
 *
 * Prices are whole kroner. The generator multiplies by 100 into øre.
 *
 * Source: "Christmas Market Menu 2026 – 70x100 cm – draft 6.pdf".
 * The English and Chinese come straight from that poster. The Norwegian and
 * Italian are translations of it and have not been checked by a native
 * speaker — have someone read them before this goes in front of customers.
 */

export const RESTAURANT = {
  slug: "tromso-local-food",
  name: "Tromsø Local Food",
  baseCurrency: "NOK",
  defaultLocale: "nb",
  theme: "lys",
  address: "Storgata 1, 0155 Oslo",
  phone: "+47 22 00 00 00",
  email: "post@example.no",
  mapsUrl: "https://maps.google.com/?q=Storgata+1+Oslo",
  timezone: "Europe/Oslo",
  socials: [
    {
      "label": "Instagram",
      "url": "https://instagram.com/example"
    },
    {
      "label": "Facebook",
      "url": "https://facebook.com/example"
    }
  ],
  openingHours: [
    {
      "day": 0,
      "closed": false,
      "open": "11:00",
      "close": "22:00"
    },
    {
      "day": 1,
      "closed": false,
      "open": "11:00",
      "close": "22:00"
    },
    {
      "day": 2,
      "closed": false,
      "open": "11:00",
      "close": "22:00"
    },
    {
      "day": 3,
      "closed": false,
      "open": "11:00",
      "close": "23:00"
    },
    {
      "day": 4,
      "closed": false,
      "open": "11:00",
      "close": "23:30"
    },
    {
      "day": 5,
      "closed": false,
      "open": "12:00",
      "close": "23:30"
    },
    {
      "day": 6,
      "closed": true,
      "open": "",
      "close": ""
    }
  ],
  description: {
    "nb": "Nordnorsk mat på julemarkedet. God jul – spør oss om alt på menyen!",
    "en": "Northern Norwegian food at the Christmas market. Merry Christmas – ask us about anything on the menu!",
    "it": "Cucina della Norvegia del Nord al mercatino di Natale. Buon Natale – chiedeteci qualsiasi cosa sul menu!",
    "zh-CN": "圣诞市集上的北挪威风味。圣诞快乐！菜单上有什么想问的，尽管问我们！"
  },
};

export const LOCALES = [
  { code: "nb", label: "Norwegian", native: "Norsk" },
  { code: "en", label: "English", native: "English" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "zh-CN", label: "Chinese", native: "中文" },
];

export const CURRENCIES = [
  { code: "NOK", symbol: "kr", decimals: 2, ratePerEur: 11.5 },
  { code: "EUR", symbol: "€", decimals: 2, ratePerEur: 1 },
  { code: "USD", symbol: "$", decimals: 2, ratePerEur: 1.1 },
  { code: "SEK", symbol: "kr", decimals: 2, ratePerEur: 11.2 },
  { code: "CNY", symbol: "¥", decimals: 2, ratePerEur: 7.8 },
];

export const TAGS = [
  { slug: "vegetarian", kind: "diet", order: 10, l: {"nb":"Vegetar","en":"Vegetarian","it":"Vegetariano","zh-CN":"素食"} },
  { slug: "vegan", kind: "diet", order: 20, l: {"nb":"Vegansk","en":"Vegan","it":"Vegano","zh-CN":"纯素"} },
  { slug: "gluten_free", kind: "diet", order: 30, l: {"nb":"Glutenfri","en":"Gluten free","it":"Senza glutine","zh-CN":"无麸质"} },
  { slug: "halal", kind: "diet", order: 40, l: {"nb":"Halal","en":"Halal","it":"Halal","zh-CN":"清真"} },
  { slug: "nuts", kind: "allergen", order: 10, l: {"nb":"Inneholder nøtter","en":"Contains nuts","it":"Contiene frutta a guscio","zh-CN":"含坚果"} },
  { slug: "dairy", kind: "allergen", order: 20, l: {"nb":"Inneholder melk","en":"Contains dairy","it":"Contiene latticini","zh-CN":"含乳制品"} },
  { slug: "gluten", kind: "allergen", order: 30, l: {"nb":"Inneholder gluten","en":"Contains gluten","it":"Contiene glutine","zh-CN":"含麸质"} },
  { slug: "egg", kind: "allergen", order: 40, l: {"nb":"Inneholder egg","en":"Contains egg","it":"Contiene uova","zh-CN":"含鸡蛋"} },
  { slug: "fish", kind: "allergen", order: 50, l: {"nb":"Inneholder fisk","en":"Contains fish","it":"Contiene pesce","zh-CN":"含鱼类"} },
  { slug: "shellfish", kind: "allergen", order: 60, l: {"nb":"Inneholder skalldyr","en":"Contains shellfish","it":"Contiene crostacei","zh-CN":"含贝类"} },
  { slug: "sesame", kind: "allergen", order: 70, l: {"nb":"Inneholder sesam","en":"Contains sesame","it":"Contiene sesamo","zh-CN":"含芝麻"} },
  { slug: "celery", kind: "allergen", order: 80, l: {"nb":"Inneholder selleri","en":"Contains celery","it":"Contiene sedano","zh-CN":"含芹菜"} },
  { slug: "mustard", kind: "allergen", order: 90, l: {"nb":"Inneholder sennep","en":"Contains mustard","it":"Contiene senape","zh-CN":"含芥菜籽"} },
  { slug: "mild", kind: "heat", order: 10, l: {"nb":"Litt sterk","en":"Mild heat","it":"Poco piccante","zh-CN":"微辣"} },
  { slug: "hot", kind: "heat", order: 20, l: {"nb":"Sterk","en":"Spicy","it":"Piccante","zh-CN":"辣"} },
  { slug: "serves_two", kind: "info", order: 10, l: {"nb":"For 2 personer","en":"Serves 2","it":"Per 2 persone","zh-CN":"2 人份"} },
  { slug: "gf_on_request", kind: "info", order: 20, l: {"nb":"Glutenfri på bestilling","en":"GF on request","it":"Senza glutine su richiesta","zh-CN":"可做无麸质"} },
];

// Allergen numbers on the poster: 1 fish · 2 dairy · 3 celery · 4 mustard seed
// · 5 sesame · 6 egg. Bread (marked *) contains gluten and may contain traces
// of sesame — that goes in the text, not as a "Contains sesame" tag.

const FISHCAKE_L = {
  nb: "Tradisjonell nordnorsk oppskrift: fersk hyse, helmelk og krydder, stekt lette og luftige. Serveres med sprø strimlet kål, tartarsaus og tangpulver. Glutenfri.",
  en: "Traditional Northern Norwegian recipe: fresh haddock, whole milk & spices, pan-fried light and fluffy. Served with crispy shredded cabbage, tartare sauce and seaweed powder. Gluten-free.",
  it: "Ricetta tradizionale della Norvegia del Nord: eglefino fresco, latte intero e spezie, fritte in padella leggere e soffici. Servite con cavolo croccante a striscioline, salsa tartara e polvere di alghe. Senza glutine.",
  "zh-CN": "挪威北部传统做法：以新鲜黑线鳕、全脂牛奶和香料制成，煎至松软。配香脆卷心菜丝、塔塔酱和海藻粉。无麸质。",
};
const FISHCAKE_I = {
  nb: "Hyse, helmelk, krydder, kål, tartarsaus, tangpulver",
  en: "Haddock, whole milk, spices, cabbage, tartare sauce, seaweed powder",
  it: "Eglefino, latte intero, spezie, cavolo, salsa tartara, polvere di alghe",
  "zh-CN": "黑线鳕、全脂牛奶、香料、卷心菜、塔塔酱、海藻粉",
};

const SAUSAGE_L = {
  nb: "Grovkvernet, 87 % kjøtt. Serveres med sprø strimlet kål og søt sennep.",
  en: "Coarse-ground, 87% meat. Served with crispy shredded cabbage & sweet mustard.",
  it: "Macinata grossa, 87% di carne. Servita con cavolo croccante a striscioline e senape dolce.",
  "zh-CN": "粗绞，肉含量 87%。配香脆卷心菜丝和甜芥末酱。",
};
const SAUSAGE_I = {
  nb: "Reinsdyrpølse (87 % kjøtt), kål, søt sennep",
  en: "Reindeer sausage (87% meat), cabbage, sweet mustard",
  it: "Salsiccia di renna (87% carne), cavolo, senape dolce",
  "zh-CN": "驯鹿香肠（肉含量 87%）、卷心菜、甜芥末酱",
};
const BREAD_NOTE = {
  nb: "Brødet inneholder gluten og kan inneholde spor av sesam.",
  en: "The bread contains gluten and may contain traces of sesame.",
  it: "Il pane contiene glutine e può contenere tracce di sesamo.",
  "zh-CN": "面包含麸质，可能含微量芝麻。",
};

const TRAVEL = {
  nb: "Reisevennlig: holder seg trygt i romtemperatur i minst to uker.",
  en: "Travel-friendly: safe at room temperature for at least two weeks.",
  it: "Comodo da portare in viaggio: si conserva a temperatura ambiente per almeno due settimane.",
  "zh-CN": "便于携带：常温下可安全保存至少两周。",
};
const ASK_US = {
  nb: "Spør oss om full ingrediensliste",
  en: "Ask us for the full ingredient list",
  it: "Chiedeteci l'elenco completo degli ingredienti",
  "zh-CN": "完整配料请询问我们",
};

export const CATEGORIES = [
  {
    slug: "fiskekaker",
    order: 10,
    names: {"nb":"Tromsø-fiskekaker","en":"Tromsø Fish Cakes","it":"Polpette di pesce di Tromsø","zh-CN":"特罗姆瑟鱼饼"},
    items: [
      {
        slug: "fiskekaker-2", price: 130, tags: ["gluten_free","fish","dairy","celery","mustard","egg"],
        t: {
          nb: { n: "2 fiskekaker (smakebit)", s: "Hyse, helmelk og krydder – kål, tartarsaus, tangpulver", l: FISHCAKE_L.nb, i: FISHCAKE_I.nb },
          en: { n: "2 Fish Cakes (to try)", s: "Haddock, whole milk & spices – cabbage, tartare, seaweed", l: FISHCAKE_L.en, i: FISHCAKE_I.en },
          it: { n: "2 polpette di pesce (assaggio)", s: "Eglefino, latte intero e spezie – cavolo, tartara, alghe", l: FISHCAKE_L.it, i: FISHCAKE_I.it },
          "zh-CN": { n: "鱼饼 2 块（尝鲜小份）", s: "黑线鳕、全脂牛奶、香料——配卷心菜丝、塔塔酱、海藻粉", l: FISHCAKE_L["zh-CN"], i: FISHCAKE_I["zh-CN"] },
        },
      },
      {
        slug: "fiskekaker-3", price: 170, featured: true, tags: ["gluten_free","fish","dairy","celery","mustard","egg"],
        t: {
          nb: { n: "3 fiskekaker", s: "Som en lokal – et helt måltid", l: FISHCAKE_L.nb, i: FISHCAKE_I.nb },
          en: { n: "3 Fish Cakes", s: "Like a local – a full meal", l: FISHCAKE_L.en, i: FISHCAKE_I.en },
          it: { n: "3 polpette di pesce", s: "Come un locale – un pasto completo", l: FISHCAKE_L.it, i: FISHCAKE_I.it },
          "zh-CN": { n: "鱼饼 3 块", s: "本地人份量，管饱", l: FISHCAKE_L["zh-CN"], i: FISHCAKE_I["zh-CN"] },
        },
      },
      {
        slug: "torskerogn-potetsalat", price: 50, tags: ["fish","mustard","egg"],
        t: {
          nb: { n: "+ Potetsalat med røkt torskerogn", s: "Anbefalt tilbehør", l: "Potetsalat med saltet og røkt torskerogn. Anbefalt tilbehør til fiskekakene.", i: "Potet, saltet og røkt torskerogn" },
          en: { n: "+ Smoked Cod Roe Potato Salad", s: "Recommended side", l: "Potato salad with cured & smoked cod eggs. The recommended side for the fish cakes.", i: "Potato, cured & smoked cod roe" },
          it: { n: "+ Insalata di patate con uova di merluzzo affumicate", s: "Contorno consigliato", l: "Insalata di patate con uova di merluzzo salate e affumicate. Il contorno consigliato per le polpette di pesce.", i: "Patate, uova di merluzzo salate e affumicate" },
          "zh-CN": { n: "+ 烟熏鳕鱼子土豆沙拉", s: "推荐搭配", l: "土豆沙拉配腌制烟熏鳕鱼子。鱼饼的推荐搭配。", i: "土豆、腌制烟熏鳕鱼子" },
        },
      },
    ],
  },
  {
    slug: "reinsdyr",
    order: 20,
    names: {"nb":"Lokalt reinsdyr","en":"Local Reindeer","it":"Renna locale","zh-CN":"驯鹿"},
    items: [
      {
        slug: "reinsdyrpolse-brod", price: 150, tags: ["mustard","egg","gluten"],
        t: {
          nb: { n: "Slakterens reinsdyrpølse – i mykt brød", s: "Grovkvernet, 87 % kjøtt, kål og søt sennep", l: `${SAUSAGE_L.nb} ${BREAD_NOTE.nb}`, i: `${SAUSAGE_I.nb}, pølsebrød` },
          en: { n: "The Butcher's Reindeer Sausage – in a soft bun", s: "Coarse-ground, 87% meat, cabbage & sweet mustard", l: `${SAUSAGE_L.en} ${BREAD_NOTE.en}`, i: `${SAUSAGE_I.en}, soft bun` },
          it: { n: "Salsiccia di renna del macellaio – nel panino morbido", s: "Macinata grossa, 87% carne, cavolo e senape dolce", l: `${SAUSAGE_L.it} ${BREAD_NOTE.it}`, i: `${SAUSAGE_I.it}, panino morbido` },
          "zh-CN": { n: "肉铺特制驯鹿香肠——夹松软小面包", s: "粗绞，肉含量 87%，配卷心菜丝和甜芥末酱", l: `${SAUSAGE_L["zh-CN"]}${BREAD_NOTE["zh-CN"]}`, i: `${SAUSAGE_I["zh-CN"]}、松软小面包` },
        },
      },
      {
        slug: "reinsdyrpolse-papir", price: 130, tags: ["mustard","egg"],
        t: {
          nb: { n: "Slakterens reinsdyrpølse – pølse i papir", s: "Grovkvernet, 87 % kjøtt, kål og søt sennep", l: `${SAUSAGE_L.nb} Servert klassisk, i papir.`, i: SAUSAGE_I.nb },
          en: { n: "The Butcher's Reindeer Sausage – in the classic paper wrap", s: "Pølse i papir · coarse-ground, 87% meat", l: `${SAUSAGE_L.en} Served the classic way, in a paper wrap (pølse i papir).`, i: SAUSAGE_I.en },
          it: { n: "Salsiccia di renna del macellaio – nella classica carta", s: "Pølse i papir · macinata grossa, 87% carne", l: `${SAUSAGE_L.it} Servita alla maniera classica, avvolta nella carta (pølse i papir).`, i: SAUSAGE_I.it },
          "zh-CN": { n: "肉铺特制驯鹿香肠——传统纸包", s: "Pølse i papir · 粗绞，肉含量 87%", l: `${SAUSAGE_L["zh-CN"]}传统纸包（pølse i papir）。`, i: SAUSAGE_I["zh-CN"] },
        },
      },
    ],
  },
  {
    slug: "arktisk-varme",
    order: 30,
    names: {"nb":"Arktisk varme","en":"Arctic Hearth","it":"Focolare artico","zh-CN":"极地暖汤"},
    items: [
      {
        slug: "vill-vinterkraft", price: 240, tags: ["celery","gluten"],
        t: {
          nb: { n: "Vill vinterkraft (oksehale og rein)", s: "Oksehale, rein, rotgrønnsaker og tyttebær", l: `Fyldig og varmende, med mør oksehale og rein, rotgrønnsaker og ville tyttebær. Familielaget, servert med sprøtt brød. ${BREAD_NOTE.nb}`, i: "Oksehale, reinsdyrkjøtt, rotgrønnsaker, tyttebær, brød" },
          en: { n: "Wild Winter Bone Broth (oxtail & reindeer)", s: "Oxtail, reindeer, root vegetables & lingonberries", l: `Rich and heartwarming, with tender oxtail & reindeer, root vegetables and wild lingonberries. Family-made, served with crusty bread. ${BREAD_NOTE.en}`, i: "Oxtail, reindeer, root vegetables, lingonberries, bread" },
          it: { n: "Brodo d'ossa invernale selvatico (coda di bue e renna)", s: "Coda di bue, renna, radici e mirtilli rossi", l: `Ricco e confortante, con tenera coda di bue e renna, verdure di radice e mirtilli rossi selvatici. Fatto in famiglia, servito con pane croccante. ${BREAD_NOTE.it}`, i: "Coda di bue, renna, verdure di radice, mirtilli rossi, pane" },
          "zh-CN": { n: "野味冬日骨汤（牛尾与驯鹿肉）", s: "牛尾、驯鹿肉、根茎蔬菜、野生越橘", l: `浓郁暖心，内含鲜嫩牛尾与驯鹿肉、根茎蔬菜和野生越橘。家庭自制，配脆皮面包。${BREAD_NOTE["zh-CN"]}`, i: "牛尾、驯鹿肉、根茎蔬菜、越橘、面包" },
        },
      },
    ],
  },
  {
    slug: "lokale-produkter",
    order: 40,
    names: {"nb":"Lokale produkter","en":"Local Products","it":"Prodotti locali","zh-CN":"本地特产"},
    items: [
      {
        slug: "reinsdyrsnacks", price: 70, tags: [],
        t: {
          nb: { n: "Reinsdyrsnacks", s: "kr 70 · 3 for kr 190", l: `${TRAVEL.nb} Kr 70 stykket, eller 3 for kr 190 – spør oss.`, i: ASK_US.nb },
          en: { n: "Reindeer snack", s: "kr 70 · 3 for kr 190", l: `${TRAVEL.en} kr 70 each, or 3 for kr 190 – just ask.`, i: ASK_US.en },
          it: { n: "Snack di renna", s: "kr 70 · 3 per kr 190", l: `${TRAVEL.it} kr 70 l'uno, oppure 3 per kr 190 – chiedeteci.`, i: ASK_US.it },
          "zh-CN": { n: "驯鹿肉小食", s: "kr 70 · 3 件 kr 190", l: `${TRAVEL["zh-CN"]}每件 kr 70，3 件 kr 190——请询问我们。`, i: ASK_US["zh-CN"] },
        },
      },
      {
        slug: "reinsdyrsalami", price: 280, tags: [],
        t: {
          nb: { n: "Reinsdyrsalami, hel", s: "Reisevennlig – tåler romtemperatur", l: TRAVEL.nb, i: ASK_US.nb },
          en: { n: "Reindeer salami, whole", s: "Travel-friendly – keeps at room temperature", l: TRAVEL.en, i: ASK_US.en },
          it: { n: "Salame di renna, intero", s: "Da viaggio – si conserva a temperatura ambiente", l: TRAVEL.it, i: ASK_US.it },
          "zh-CN": { n: "驯鹿萨拉米香肠（整根）", s: "便于携带——常温保存", l: TRAVEL["zh-CN"], i: ASK_US["zh-CN"] },
        },
      },
      {
        slug: "aurora-skinke", price: 1900, tags: [],
        t: {
          nb: { n: "Aurora-skinke (per kilo)", s: "Reisevennlig – tåler romtemperatur", l: TRAVEL.nb, i: ASK_US.nb },
          en: { n: "Aurora ham (per kilo)", s: "Travel-friendly – keeps at room temperature", l: TRAVEL.en, i: ASK_US.en },
          it: { n: "Prosciutto Aurora (al chilo)", s: "Da viaggio – si conserva a temperatura ambiente", l: TRAVEL.it, i: ASK_US.it },
          "zh-CN": { n: "极光火腿（每公斤）", s: "便于携带——常温保存", l: TRAVEL["zh-CN"], i: ASK_US["zh-CN"] },
        },
      },
      {
        slug: "torket-reinsdyrkjott", price: 2700, tags: [],
        t: {
          nb: { n: "Tørket reinsdyrkjøtt, røkt (per kilo)", s: "Reisevennlig – tåler romtemperatur", l: TRAVEL.nb, i: ASK_US.nb },
          en: { n: "Dried reindeer meat, smoked (per kilo)", s: "Travel-friendly – keeps at room temperature", l: TRAVEL.en, i: ASK_US.en },
          it: { n: "Carne di renna essiccata e affumicata (al chilo)", s: "Da viaggio – si conserva a temperatura ambiente", l: TRAVEL.it, i: ASK_US.it },
          "zh-CN": { n: "烟熏驯鹿肉干（每公斤）", s: "便于携带——常温保存", l: TRAVEL["zh-CN"], i: ASK_US["zh-CN"] },
        },
      },
      {
        slug: "klippfisk", price: 410, tags: ["fish"],
        t: {
          nb: { n: "Klippfisk, saltmodnet og tørket (per eske)", s: "Reisevennlig – tåler romtemperatur", l: TRAVEL.nb, i: ASK_US.nb },
          en: { n: "Clipfish, salt-matured & dried (per box)", s: "Travel-friendly – keeps at room temperature", l: TRAVEL.en, i: ASK_US.en },
          it: { n: "Baccalà, maturato sotto sale ed essiccato (a scatola)", s: "Da viaggio – si conserva a temperatura ambiente", l: TRAVEL.it, i: ASK_US.it },
          "zh-CN": { n: "盐腌风干鱼干（每盒）", s: "便于携带——常温保存", l: TRAVEL["zh-CN"], i: ASK_US["zh-CN"] },
        },
      },
    ],
  },
];
