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
 * NOTE ON THE TRANSLATIONS: the Norwegian and English are the ones to trust.
 * The Albanian and Italian are mine and have not been checked by a native
 * speaker — have someone read them before this goes in front of customers.
 */

export const RESTAURANT = {
  slug: "sofra",
  name: "Tromsø Restaurant",
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
    "nb": "Et nabolagskjøkken midt i byen. Vi lager alt fra bunnen, baker brødet selv og griller over kull.",
    "en": "A neighbourhood kitchen in the middle of town. We make everything from scratch, bake our own bread and grill over charcoal.",
    "it": "Una cucina di quartiere in centro città. Facciamo tutto da zero, panifichiamo in casa e grigliamo sulla brace.",
    "zh-CN": "位于市中心的街坊小馆。所有菜品从零做起，面包自家烘焙，炭火烧烤。"
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
  { slug: "mild", kind: "heat", order: 10, l: {"nb":"Litt sterk","en":"Mild heat","it":"Poco piccante","zh-CN":"微辣"} },
  { slug: "hot", kind: "heat", order: 20, l: {"nb":"Sterk","en":"Spicy","it":"Piccante","zh-CN":"辣"} },
  { slug: "serves_two", kind: "info", order: 10, l: {"nb":"For 2 personer","en":"Serves 2","it":"Per 2 persone","zh-CN":"2 人份"} },
  { slug: "gf_on_request", kind: "info", order: 20, l: {"nb":"Glutenfri på bestilling","en":"GF on request","it":"Senza glutine su richiesta","zh-CN":"可做无麸质"} },
];

export const CATEGORIES = [
  {
    slug: "forretter",
    order: 10,
    names: {"nb":"Forretter","en":"Starters","it":"Antipasti","zh-CN":"前菜"},
    items: [
      {
        slug: "hvitloksbrod", price: 95, tags: ["vegetarian","gluten","dairy"],
        t: {
          nb: { n: "Hvitløksbrød", s: "Sprøtt surdeigsbrød med hvitløkssmør", l: "Surdeigsbrød bakt samme morgen, penslet med hvitløkssmør og persille og stekt til kantene er sprø. Serveres varmt.", i: "Surdeigsbrød, smør, hvitløk, persille, havsalt" },
          en: { n: "Garlic bread", s: "Crisp sourdough with garlic butter", l: "Sourdough baked the same morning, brushed with garlic butter and parsley and grilled until the edges crisp. Served warm.", i: "Sourdough bread, butter, garlic, parsley, sea salt" },
          it: { n: "Pane all'aglio", s: "Pane a lievitazione naturale con burro all'aglio", l: "Pane a lievitazione naturale sfornato la mattina stessa, spennellato con burro all'aglio e prezzemolo e gratinato finché i bordi diventano croccanti. Servito caldo.", i: "Pane a lievitazione naturale, burro, aglio, prezzemolo, sale marino" },
          "zh-CN": { n: "蒜香面包", s: "酥脆酸面包配蒜香黄油", l: "当天早晨烘焙的酸面包，刷上蒜香黄油和欧芹，烤至边缘酥脆。热食。", i: "酸面包、黄油、大蒜、欧芹、海盐" },
        },
      },
      {
        slug: "tomatsuppe", price: 109, tags: ["vegetarian","gluten_free","dairy"],
        t: {
          nb: { n: "Tomatsuppe", s: "Ovnsbakte tomater, basilikum, creme fraiche", l: "Tomater bakt sakte i ovnen med hvitløk og timian, kjørt glatt og rørt ut med en skje creme fraiche. Basilikum på toppen.", i: "Tomat, løk, hvitløk, timian, creme fraiche, basilikum, olivenolje" },
          en: { n: "Tomato soup", s: "Oven-roasted tomatoes, basil, crème fraîche", l: "Tomatoes slow-roasted with garlic and thyme, blended smooth and finished with a spoon of crème fraîche. Basil on top.", i: "Tomato, onion, garlic, thyme, crème fraîche, basil, olive oil" },
          it: { n: "Zuppa di pomodoro", s: "Pomodori al forno, basilico, crème fraîche", l: "Pomodori arrostiti lentamente con aglio e timo, frullati fino a crema e completati con un cucchiaio di crème fraîche. Basilico in superficie.", i: "Pomodoro, cipolla, aglio, timo, crème fraîche, basilico, olio d'oliva" },
          "zh-CN": { n: "番茄汤", s: "烤番茄、罗勒、法式酸奶油", l: "番茄与大蒜、百里香慢烤，打成顺滑浓汤，最后加入一勺法式酸奶油。顶部点缀罗勒。", i: "番茄、洋葱、大蒜、百里香、法式酸奶油、罗勒、橄榄油" },
        },
      },
      {
        slug: "bruschetta", price: 115, tags: ["vegan","vegetarian","gluten"],
        t: {
          nb: { n: "Bruschetta", s: "Tomat, basilikum og olivenolje på ristet brød", l: "Ristet surdeigsbrød gnidd med rå hvitløk, toppet med modne tomater, basilikum og god olivenolje. Enkelt og sommerlig.", i: "Surdeigsbrød, tomat, hvitløk, basilikum, olivenolje, havsalt" },
          en: { n: "Bruschetta", s: "Tomato, basil and olive oil on toasted bread", l: "Toasted sourdough rubbed with raw garlic, piled with ripe tomatoes, basil and good olive oil. Simple and summery.", i: "Sourdough bread, tomato, garlic, basil, olive oil, sea salt" },
          it: { n: "Bruschetta", s: "Pomodoro, basilico e olio d'oliva su pane tostato", l: "Pane a lievitazione naturale tostato e strofinato con aglio crudo, con pomodori maturi, basilico e buon olio d'oliva. Semplice ed estiva.", i: "Pane a lievitazione naturale, pomodoro, aglio, basilico, olio d'oliva, sale marino" },
          "zh-CN": { n: "意式烤面包", s: "番茄、罗勒与橄榄油配烤面包", l: "酸面包烤香后抹上生蒜，铺满熟番茄、罗勒和优质橄榄油。简单而清爽。", i: "酸面包、番茄、大蒜、罗勒、橄榄油、海盐" },
        },
      },
      {
        slug: "kyllingvinger", price: 135, tags: ["halal","hot","sesame"],
        t: {
          nb: { n: "Kyllingvinger", s: "Sterk glasur, sesam, syltet rødløk", l: "Vinger marinert over natten, stekt sprø og vendt i en sterk glasur av chili og honning. Sesamfrø og syltet rødløk til.", i: "Kylling, chili, honning, soyasaus, hvitløk, sesamfrø, rødløk, eddik" },
          en: { n: "Chicken wings", s: "Hot glaze, sesame, pickled red onion", l: "Wings marinated overnight, fried crisp and tossed in a hot chilli-and-honey glaze. Sesame seeds and pickled red onion alongside.", i: "Chicken, chilli, honey, soy sauce, garlic, sesame seeds, red onion, vinegar" },
          it: { n: "Ali di pollo", s: "Glassa piccante, sesamo, cipolla rossa marinata", l: "Ali marinate per una notte, fritte croccanti e saltate in una glassa piccante di peperoncino e miele. Con semi di sesamo e cipolla rossa marinata.", i: "Pollo, peperoncino, miele, salsa di soia, aglio, semi di sesamo, cipolla rossa, aceto" },
          "zh-CN": { n: "烤鸡翅", s: "香辣蜜汁、芝麻、腌红洋葱", l: "鸡翅隔夜腌制，炸至酥脆，再裹上辣椒蜂蜜酱。配芝麻与腌红洋葱。", i: "鸡肉、辣椒、蜂蜜、酱油、大蒜、芝麻、红洋葱、醋" },
        },
      },
      {
        slug: "mozzarellasticks", price: 119, tags: ["vegetarian","dairy","gluten","egg"],
        t: {
          nb: { n: "Mozzarellasticks", s: "Panert mozzarella med tomatdip", l: "Mozzarella panert i krydret brødsmuler og fritert til osten så vidt trekker seg. Serveres med en kald tomatdip.", i: "Mozzarella, brødsmuler, egg, hvetemel, oregano, tomat, hvitløk" },
          en: { n: "Mozzarella sticks", s: "Breaded mozzarella with tomato dip", l: "Mozzarella in seasoned breadcrumbs, fried until the cheese just pulls. Served with a cold tomato dip.", i: "Mozzarella, breadcrumbs, egg, wheat flour, oregano, tomato, garlic" },
          it: { n: "Bastoncini di mozzarella", s: "Mozzarella impanata con salsa al pomodoro", l: "Mozzarella impanata con pangrattato aromatizzato e fritta finché il formaggio comincia a filare. Servita con una salsa fredda al pomodoro.", i: "Mozzarella, pangrattato, uova, farina di grano, origano, pomodoro, aglio" },
          "zh-CN": { n: "炸马苏里拉条", s: "面包糠马苏里拉配番茄酱", l: "马苏里拉裹上调味面包糠炸至芝士恰好拉丝。配冷番茄蘸酱。", i: "马苏里拉、面包糠、鸡蛋、小麦粉、牛至、番茄、大蒜" },
        },
      },
      {
        slug: "rekecocktail", price: 149, tags: ["shellfish","egg","gluten_free"],
        t: {
          nb: { n: "Rekecocktail", s: "Håndpillede reker, sitron, rosasaus", l: "Håndpillede reker fra Nordsjøen på knasende salat, med en klassisk rosasaus og rikelig med sitron.", i: "Reker, salat, majones, tomatpuré, sitron, dill, pepper" },
          en: { n: "Prawn cocktail", s: "Hand-peeled prawns, lemon, cocktail sauce", l: "Hand-peeled North Sea prawns on crisp lettuce, with a classic cocktail sauce and plenty of lemon.", i: "Prawns, lettuce, mayonnaise, tomato purée, lemon, dill, pepper" },
          it: { n: "Cocktail di gamberi", s: "Gamberi sgusciati, limone, salsa rosa", l: "Gamberi del Mare del Nord sgusciati a mano su lattuga croccante, con una classica salsa rosa e abbondante limone.", i: "Gamberi, lattuga, maionese, concentrato di pomodoro, limone, aneto, pepe" },
          "zh-CN": { n: "鲜虾杯", s: "手剥鲜虾、柠檬、鸡尾酒酱", l: "手剥北海鲜虾配脆生菜，佐以经典鸡尾酒酱和充足的柠檬。", i: "虾、生菜、蛋黄酱、番茄泥、柠檬、莳萝、胡椒" },
        },
      },
      {
        slug: "hummus-flatbrod", price: 129, tags: ["vegan","vegetarian","sesame","gluten","gf_on_request"],
        t: {
          nb: { n: "Hummus med flatbrød", s: "Kremet kikertpuré, olivenolje, varmt brød", l: "Kikerter kokt møre og kjørt glatt med tahini, sitron og hvitløk. Olivenolje og sumak på toppen, varmt flatbrød ved siden av.", i: "Kikerter, tahini, sitron, hvitløk, olivenolje, sumak, flatbrød" },
          en: { n: "Hummus with flatbread", s: "Creamy chickpea purée, olive oil, warm bread", l: "Chickpeas cooked soft and blended smooth with tahini, lemon and garlic. Olive oil and sumac on top, warm flatbread alongside.", i: "Chickpeas, tahini, lemon, garlic, olive oil, sumac, flatbread" },
          it: { n: "Hummus con pane piatto", s: "Crema di ceci, olio d'oliva, pane caldo", l: "Ceci cotti morbidi e frullati con tahina, limone e aglio. Olio d'oliva e sommacco in superficie, pane piatto caldo a parte.", i: "Ceci, tahina, limone, aglio, olio d'oliva, sommacco, pane piatto" },
          "zh-CN": { n: "鹰嘴豆泥配薄饼", s: "顺滑鹰嘴豆泥、橄榄油、热薄饼", l: "鹰嘴豆煮至软烂，与芝麻酱、柠檬和大蒜打成细腻豆泥。淋橄榄油、撒盐肤木，配热薄饼。", i: "鹰嘴豆、芝麻酱、柠檬、大蒜、橄榄油、盐肤木、薄饼" },
        },
      },
      {
        slug: "troffelpommes", price: 109, tags: ["vegetarian","gluten_free","dairy"],
        t: {
          nb: { n: "Trøffelpommes", s: "Sprø pommes frites, trøffelolje, parmesan", l: "Tynne pommes frites stekt to ganger, vendt i trøffelolje og revet parmesan med persille. Aioli ved siden av.", i: "Potet, solsikkeolje, trøffelolje, parmesan, persille, hvitløksaioli" },
          en: { n: "Truffle fries", s: "Crisp fries, truffle oil, parmesan", l: "Thin fries cooked twice, tossed in truffle oil with grated parmesan and parsley. Aioli on the side.", i: "Potato, sunflower oil, truffle oil, parmesan, parsley, garlic aioli" },
          it: { n: "Patatine al tartufo", s: "Patatine croccanti, olio al tartufo, parmigiano", l: "Patatine sottili fritte due volte, saltate in olio al tartufo con parmigiano grattugiato e prezzemolo. Aioli a parte.", i: "Patate, olio di semi di girasole, olio al tartufo, parmigiano, prezzemolo, aioli all'aglio" },
          "zh-CN": { n: "松露薯条", s: "酥脆薯条、松露油、帕玛森", l: "细薯条两次油炸，拌入松露油、帕玛森碎和欧芹。配蒜香蛋黄酱。", i: "马铃薯、葵花籽油、松露油、帕玛森、欧芹、蒜香蛋黄酱" },
        },
      },
    ],
  },
  {
    slug: "hovedretter",
    order: 20,
    names: {"nb":"Hovedretter","en":"Mains","it":"Secondi","zh-CN":"主菜"},
    items: [
      {
        slug: "biff-bearnaise", price: 329, tags: ["gluten_free","dairy","egg"], featured: true,
        t: {
          nb: { n: "Biff med bearnaise", s: "Mørbrad, bearnaise, pommes frites", l: "Mørbrad stekt etter ønske og hvilt før servering, med husets bearnaise rørt på ekte smør, sprø pommes frites og en liten salat.", i: "Storfemørbrad, smør, eggeplomme, estragon, eddik, potet, salat" },
          en: { n: "Steak with béarnaise", s: "Tenderloin, béarnaise, fries", l: "Tenderloin cooked to your liking and rested before serving, with the house béarnaise made on real butter, crisp fries and a small salad.", i: "Beef tenderloin, butter, egg yolk, tarragon, vinegar, potato, salad" },
          it: { n: "Filetto con béarnaise", s: "Filetto, béarnaise, patatine", l: "Filetto cotto come preferisci e lasciato riposare prima di servire, con la béarnaise della casa al burro, patatine croccanti e una piccola insalata.", i: "Filetto di manzo, burro, tuorlo d'uovo, dragoncello, aceto, patate, insalata" },
          "zh-CN": { n: "牛柳配贝尔奈滋酱", s: "牛里脊、贝尔奈滋酱、薯条", l: "牛里脊按您喜欢的熟度烹制并静置后上桌，配真黄油制的招牌贝尔奈滋酱、酥脆薯条和小份沙拉。", i: "牛里脊、黄油、蛋黄、龙蒿、醋、马铃薯、沙拉" },
        },
      },
      {
        slug: "ovnsbakt-laks", price: 299, tags: ["gluten_free","fish","dairy"],
        t: {
          nb: { n: "Ovnsbakt laks", s: "Norsk laks, dillsmør, nypoteter", l: "Laksefilet bakt forsiktig i ovnen så den holder seg saftig, servert med dillsmør, nypoteter og dampede grønnsaker.", i: "Laks, smør, dill, sitron, nypoteter, brokkoli, gulrot" },
          en: { n: "Baked salmon", s: "Norwegian salmon, dill butter, new potatoes", l: "Salmon fillet baked gently so it stays moist, served with dill butter, new potatoes and steamed vegetables.", i: "Salmon, butter, dill, lemon, new potatoes, broccoli, carrot" },
          it: { n: "Salmone al forno", s: "Salmone norvegese, burro all'aneto, patate novelle", l: "Filetto di salmone cotto delicatamente al forno per restare succoso, servito con burro all'aneto, patate novelle e verdure al vapore.", i: "Salmone, burro, aneto, limone, patate novelle, broccoli, carota" },
          "zh-CN": { n: "烤三文鱼", s: "挪威三文鱼、莳萝黄油、小土豆", l: "三文鱼柳低温慢烤以保持鲜嫩，配莳萝黄油、小土豆和清蒸时蔬。", i: "三文鱼、黄油、莳萝、柠檬、小土豆、西兰花、胡萝卜" },
        },
      },
      {
        slug: "kylling-parmesan", price: 279, tags: ["halal","dairy","gluten","egg"],
        t: {
          nb: { n: "Kylling parmesan", s: "Panert kyllingfilet, tomatsaus, mozzarella", l: "Kyllingfilet panert og stekt sprø, dekket med tomatsaus og mozzarella og gratinert. Serveres med spaghetti.", i: "Kylling, brødsmuler, egg, parmesan, mozzarella, tomat, basilikum, spaghetti" },
          en: { n: "Chicken parmesan", s: "Breaded chicken, tomato sauce, mozzarella", l: "Chicken breast breaded and fried crisp, covered with tomato sauce and mozzarella and finished under the grill. Served with spaghetti.", i: "Chicken, breadcrumbs, egg, parmesan, mozzarella, tomato, basil, spaghetti" },
          it: { n: "Pollo alla parmigiana", s: "Petto di pollo impanato, salsa di pomodoro, mozzarella", l: "Petto di pollo impanato e fritto croccante, coperto con salsa di pomodoro e mozzarella e gratinato. Servito con spaghetti.", i: "Pollo, pangrattato, uova, parmigiano, mozzarella, pomodoro, basilico, spaghetti" },
          "zh-CN": { n: "帕玛森炸鸡排", s: "面包糠鸡排、番茄酱、马苏里拉", l: "鸡胸裹面包糠炸至酥脆，铺上番茄酱与马苏里拉，入炉烤至融化。配意面。", i: "鸡肉、面包糠、鸡蛋、帕玛森、马苏里拉、番茄、罗勒、意面" },
        },
      },
      {
        slug: "lammeskank", price: 319, tags: ["halal","gluten_free","serves_two"],
        t: {
          nb: { n: "Lammeskank", s: "Langtidsstekt lam, rotgrønnsaker, rødvinssaus", l: "Lammeskank stekt sakte i fire timer til kjøttet faller av beinet, med rotgrønnsaker og en kraftig rødvinssaus. Nok til to.", i: "Lammeskank, gulrot, sellerirot, løk, hvitløk, rødvin, rosmarin, timian" },
          en: { n: "Lamb shank", s: "Slow-roasted lamb, root vegetables, red wine sauce", l: "Lamb shank braised for four hours until the meat falls off the bone, with root vegetables and a deep red wine sauce. Enough for two.", i: "Lamb shank, carrot, celeriac, onion, garlic, red wine, rosemary, thyme" },
          it: { n: "Stinco d'agnello", s: "Agnello a cottura lenta, verdure, salsa al vino rosso", l: "Stinco d'agnello brasato quattro ore finché la carne si stacca dall'osso, con verdure di radice e una salsa intensa al vino rosso. Basta per due.", i: "Stinco d'agnello, carota, sedano rapa, cipolla, aglio, vino rosso, rosmarino, timo" },
          "zh-CN": { n: "慢炖羊腿", s: "慢烤羊肉、根茎蔬菜、红酒酱", l: "羊腿慢炖四小时至骨肉分离，配根茎蔬菜和浓郁红酒酱。分量适合两人。", i: "羊腿、胡萝卜、块根芹、洋葱、大蒜、红酒、迷迭香、百里香" },
        },
      },
      {
        slug: "pasta-carbonara", price: 245, tags: ["gluten","dairy","egg"],
        t: {
          nb: { n: "Pasta carbonara", s: "Guanciale, eggeplomme, pecorino", l: "Spaghetti rørt sammen med eggeplomme, pecorino og sprøstekt guanciale. Ingen fløte — bare egg, ost og pastavann.", i: "Spaghetti, guanciale, eggeplomme, pecorino, sort pepper" },
          en: { n: "Pasta carbonara", s: "Guanciale, egg yolk, pecorino", l: "Spaghetti stirred together with egg yolk, pecorino and crisp guanciale. No cream — just egg, cheese and pasta water.", i: "Spaghetti, guanciale, egg yolk, pecorino, black pepper" },
          it: { n: "Pasta alla carbonara", s: "Guanciale, tuorlo, pecorino", l: "Spaghetti mantecati con tuorlo, pecorino e guanciale croccante. Niente panna — solo uovo, formaggio e acqua di cottura.", i: "Spaghetti, guanciale, tuorlo d'uovo, pecorino, pepe nero" },
          "zh-CN": { n: "卡邦尼意面", s: "腌猪颊肉、蛋黄、佩科里诺", l: "意面与蛋黄、佩科里诺芝士和酥脆腌猪颊肉拌匀。不加奶油——只有蛋、芝士和煮面水。", i: "意面、腌猪颊肉、蛋黄、佩科里诺芝士、黑胡椒" },
        },
      },
      {
        slug: "fiskesuppe", price: 265, tags: ["fish","shellfish","dairy","gluten_free"],
        t: {
          nb: { n: "Fiskesuppe", s: "Kremet suppe med dagens fisk og reker", l: "Husets fiskesuppe på kraft kokt samme dag, med dagens fisk, reker, gulrot og purre. Serveres med brød.", i: "Fiskekraft, torsk, laks, reker, fløte, gulrot, purre, dill" },
          en: { n: "Fish soup", s: "Creamy soup with today's fish and prawns", l: "The house fish soup on stock made the same day, with today's catch, prawns, carrot and leek. Served with bread.", i: "Fish stock, cod, salmon, prawns, cream, carrot, leek, dill" },
          it: { n: "Zuppa di pesce", s: "Zuppa cremosa con il pesce del giorno e gamberi", l: "La zuppa di pesce della casa su brodo preparato in giornata, con il pescato del giorno, gamberi, carota e porro. Servita con pane.", i: "Brodo di pesce, merluzzo, salmone, gamberi, panna, carota, porro, aneto" },
          "zh-CN": { n: "奶油鱼汤", s: "当日鲜鱼与鲜虾奶油汤", l: "以当天熬制的高汤做底，加入当日渔获、鲜虾、胡萝卜和韭葱。配面包。", i: "鱼高汤、鳕鱼、三文鱼、虾、奶油、胡萝卜、韭葱、莳萝" },
        },
      },
      {
        slug: "vegetargryte", price: 229, tags: ["vegan","vegetarian","gluten_free"],
        t: {
          nb: { n: "Vegetargryte", s: "Kikerter, søtpotet, kokos og koriander", l: "Kikerter og søtpotet småkokt i kokosmelk med ingefær og spisskummen, servert med ris og frisk koriander.", i: "Kikerter, søtpotet, kokosmelk, ingefær, spisskummen, tomat, ris, koriander" },
          en: { n: "Vegetable stew", s: "Chickpeas, sweet potato, coconut and coriander", l: "Chickpeas and sweet potato simmered in coconut milk with ginger and cumin, served with rice and fresh coriander.", i: "Chickpeas, sweet potato, coconut milk, ginger, cumin, tomato, rice, coriander" },
          it: { n: "Stufato di verdure", s: "Ceci, patata dolce, cocco e coriandolo", l: "Ceci e patata dolce cotti nel latte di cocco con zenzero e cumino, serviti con riso e coriandolo fresco.", i: "Ceci, patata dolce, latte di cocco, zenzero, cumino, pomodoro, riso, coriandolo" },
          "zh-CN": { n: "素食炖菜", s: "鹰嘴豆、红薯、椰浆与香菜", l: "鹰嘴豆与红薯以椰浆、生姜和孜然慢炖，配米饭和新鲜香菜。", i: "鹰嘴豆、红薯、椰浆、生姜、孜然、番茄、米饭、香菜" },
        },
      },
      {
        slug: "kjottkaker", price: 239, tags: ["gluten","dairy"],
        t: {
          nb: { n: "Kjøttkaker", s: "Hjemmelagde kjøttkaker, brun saus, ertestuing", l: "Kjøttkaker laget på huset av norsk storfekjøtt, med brun saus, ertestuing, kokte poteter og tyttebær.", i: "Storfekjøtt, løk, potetmel, melk, erter, hvetemel, smør, tyttebær" },
          en: { n: "Norwegian meatballs", s: "House meatballs, brown sauce, mushy peas", l: "Meatballs made in house from Norwegian beef, with brown sauce, mushy peas, boiled potatoes and lingonberries.", i: "Beef, onion, potato starch, milk, peas, wheat flour, butter, lingonberry" },
          it: { n: "Polpette norvegesi", s: "Polpette della casa, salsa bruna, purè di piselli", l: "Polpette preparate in casa con manzo norvegese, con salsa bruna, purè di piselli, patate lesse e mirtilli rossi.", i: "Manzo, cipolla, fecola di patate, latte, piselli, farina di grano, burro, mirtillo rosso" },
          "zh-CN": { n: "挪威肉饼", s: "手作肉饼、褐酱、豌豆泥", l: "以挪威牛肉手工制作的肉饼，配褐酱、豌豆泥、水煮土豆和越橘果酱。", i: "牛肉、洋葱、马铃薯淀粉、牛奶、豌豆、小麦粉、黄油、越橘" },
        },
      },
    ],
  },
  {
    slug: "pizza",
    order: 30,
    names: {"nb":"Pizza","en":"Pizza","it":"Pizza","zh-CN":"披萨"},
    items: [
      {
        slug: "margherita", price: 189, tags: ["vegetarian","gluten","dairy"],
        t: {
          nb: { n: "Margherita", s: "Tomat, mozzarella, fersk basilikum", l: "Surdeigsbunn hevet i 48 timer, med san marzano-tomat, fiordilatte og fersk basilikum. Den enkleste og den vanskeligste.", i: "Pizzadeig, san marzano-tomat, mozzarella fiordilatte, basilikum, olivenolje" },
          en: { n: "Margherita", s: "Tomato, mozzarella, fresh basil", l: "Sourdough base proved for 48 hours, with San Marzano tomato, fiordilatte and fresh basil. The simplest and the hardest.", i: "Pizza dough, San Marzano tomato, fiordilatte mozzarella, basil, olive oil" },
          it: { n: "Margherita", s: "Pomodoro, mozzarella, basilico fresco", l: "Base a lievitazione naturale maturata 48 ore, con pomodoro San Marzano, fiordilatte e basilico fresco. La più semplice e la più difficile.", i: "Impasto per pizza, pomodoro San Marzano, mozzarella fiordilatte, basilico, olio d'oliva" },
          "zh-CN": { n: "玛格丽特披萨", s: "番茄、马苏里拉、新鲜罗勒", l: "酸面团发酵 48 小时，配圣马扎诺番茄、水牛马苏里拉和新鲜罗勒。最简单，也最难做好。", i: "披萨面团、圣马扎诺番茄、马苏里拉、罗勒、橄榄油" },
        },
      },
      {
        slug: "pepperoni", price: 209, tags: ["gluten","dairy","mild"],
        t: {
          nb: { n: "Pepperoni", s: "Tomat, mozzarella, pepperoni", l: "Tomat og mozzarella under rikelig med pepperoni som krøller seg og blir sprø i kanten i steinovnen.", i: "Pizzadeig, tomat, mozzarella, pepperoni, oregano" },
          en: { n: "Pepperoni", s: "Tomato, mozzarella, pepperoni", l: "Tomato and mozzarella under plenty of pepperoni that curls and crisps at the edges in the stone oven.", i: "Pizza dough, tomato, mozzarella, pepperoni, oregano" },
          it: { n: "Pepperoni", s: "Pomodoro, mozzarella, salame piccante", l: "Pomodoro e mozzarella sotto abbondante salame piccante che si arriccia e diventa croccante nel forno a pietra.", i: "Impasto per pizza, pomodoro, mozzarella, salame piccante, origano" },
          "zh-CN": { n: "辣香肠披萨", s: "番茄、马苏里拉、辣香肠", l: "番茄与马苏里拉上铺满辣香肠，石炉烘烤后边缘卷曲酥脆。", i: "披萨面团、番茄、马苏里拉、辣香肠、牛至" },
        },
      },
      {
        slug: "quattro-formaggi", price: 219, tags: ["vegetarian","gluten","dairy"],
        t: {
          nb: { n: "Quattro formaggi", s: "Fire oster, honning, sort pepper", l: "Mozzarella, gorgonzola, taleggio og parmesan på hvit bunn, med en stripe honning og nykvernet pepper over.", i: "Pizzadeig, mozzarella, gorgonzola, taleggio, parmesan, honning, sort pepper" },
          en: { n: "Quattro formaggi", s: "Four cheeses, honey, black pepper", l: "Mozzarella, gorgonzola, taleggio and parmesan on a white base, with a ribbon of honey and freshly ground pepper over.", i: "Pizza dough, mozzarella, gorgonzola, taleggio, parmesan, honey, black pepper" },
          it: { n: "Quattro formaggi", s: "Quattro formaggi, miele, pepe nero", l: "Mozzarella, gorgonzola, taleggio e parmigiano su base bianca, con un filo di miele e pepe macinato al momento.", i: "Impasto per pizza, mozzarella, gorgonzola, taleggio, parmigiano, miele, pepe nero" },
          "zh-CN": { n: "四芝士披萨", s: "四种芝士、蜂蜜、黑胡椒", l: "白底披萨上铺马苏里拉、戈贡佐拉、塔雷吉欧和帕玛森，淋上蜂蜜并现磨黑胡椒。", i: "披萨面团、马苏里拉、戈贡佐拉、塔雷吉欧、帕玛森、蜂蜜、黑胡椒" },
        },
      },
      {
        slug: "parma-rucola", price: 239, tags: ["gluten","dairy"],
        t: {
          nb: { n: "Parma og ruccola", s: "Parmaskinke, ruccola, parmesanflak", l: "Tomat og mozzarella bakt ferdig, så parmaskinke, ruccola og parmesanflak lagt på etter ovnen så skinken holder seg myk.", i: "Pizzadeig, tomat, mozzarella, parmaskinke, ruccola, parmesan, olivenolje" },
          en: { n: "Parma and rocket", s: "Parma ham, rocket, parmesan shavings", l: "Tomato and mozzarella baked first, then Parma ham, rocket and parmesan shavings added after the oven so the ham stays soft.", i: "Pizza dough, tomato, mozzarella, Parma ham, rocket, parmesan, olive oil" },
          it: { n: "Parma e rucola", s: "Prosciutto di Parma, rucola, scaglie di parmigiano", l: "Pomodoro e mozzarella cotti prima, poi prosciutto di Parma, rucola e scaglie di parmigiano aggiunti dopo il forno perché il prosciutto resti morbido.", i: "Impasto per pizza, pomodoro, mozzarella, prosciutto di Parma, rucola, parmigiano, olio d'oliva" },
          "zh-CN": { n: "帕尔马火腿芝麻菜披萨", s: "帕尔马火腿、芝麻菜、帕玛森片", l: "先烤番茄与马苏里拉，出炉后再放帕尔马火腿、芝麻菜和帕玛森薄片，保持火腿柔嫩。", i: "披萨面团、番茄、马苏里拉、帕尔马火腿、芝麻菜、帕玛森、橄榄油" },
        },
      },
      {
        slug: "vegetarpizza", price: 199, tags: ["vegetarian","gluten","dairy"],
        t: {
          nb: { n: "Vegetarpizza", s: "Grillede grønnsaker, mozzarella, pesto", l: "Grillet squash, paprika og rødløk på tomat og mozzarella, med klatter av basilikumpesto etter ovnen.", i: "Pizzadeig, tomat, mozzarella, squash, paprika, rødløk, basilikumpesto" },
          en: { n: "Vegetable pizza", s: "Grilled vegetables, mozzarella, pesto", l: "Grilled courgette, pepper and red onion on tomato and mozzarella, with spoons of basil pesto after the oven.", i: "Pizza dough, tomato, mozzarella, courgette, pepper, red onion, basil pesto" },
          it: { n: "Pizza vegetariana", s: "Verdure grigliate, mozzarella, pesto", l: "Zucchine, peperoni e cipolla rossa grigliati su pomodoro e mozzarella, con cucchiaiate di pesto al basilico dopo il forno.", i: "Impasto per pizza, pomodoro, mozzarella, zucchine, peperoni, cipolla rossa, pesto al basilico" },
          "zh-CN": { n: "蔬菜披萨", s: "炙烤蔬菜、马苏里拉、青酱", l: "番茄与马苏里拉上铺炙烤西葫芦、彩椒和红洋葱，出炉后点上罗勒青酱。", i: "披萨面团、番茄、马苏里拉、西葫芦、彩椒、红洋葱、罗勒青酱" },
        },
      },
      {
        slug: "kebabpizza", price: 229, tags: ["halal","gluten","dairy","mild","sesame"],
        t: {
          nb: { n: "Kebabpizza", s: "Kebabkjøtt, løk, hvitløksdressing", l: "Kebabkjøtt stekt på plate, med rødløk og jalapeño på tomat og mozzarella, og hvitløksdressing og salat over etterpå.", i: "Pizzadeig, tomat, mozzarella, kebabkjøtt, rødløk, jalapeño, hvitløksdressing, salat" },
          en: { n: "Kebab pizza", s: "Kebab meat, onion, garlic dressing", l: "Griddled kebab meat with red onion and jalapeño on tomato and mozzarella, finished with garlic dressing and lettuce.", i: "Pizza dough, tomato, mozzarella, kebab meat, red onion, jalapeño, garlic dressing, lettuce" },
          it: { n: "Pizza kebab", s: "Carne kebab, cipolla, salsa all'aglio", l: "Carne kebab cotta in piastra con cipolla rossa e jalapeño su pomodoro e mozzarella, completata con salsa all'aglio e insalata.", i: "Impasto per pizza, pomodoro, mozzarella, carne kebab, cipolla rossa, jalapeño, salsa all'aglio, insalata" },
          "zh-CN": { n: "烤肉披萨", s: "烤肉、洋葱、蒜香酱", l: "香煎烤肉配红洋葱和墨西哥辣椒，铺在番茄与马苏里拉上，最后淋蒜香酱并加生菜。", i: "披萨面团、番茄、马苏里拉、烤肉、红洋葱、墨西哥辣椒、蒜香酱、生菜" },
        },
      },
      {
        slug: "diavola", price: 215, tags: ["gluten","dairy","hot"],
        t: {
          nb: { n: "Diavola", s: "Sterk salami, chili, nduja", l: "Sterk salami og nduja med fersk chili og oregano. Den sterkeste på menyen — si fra hvis du vil ha den mildere.", i: "Pizzadeig, tomat, mozzarella, sterk salami, nduja, chili, oregano" },
          en: { n: "Diavola", s: "Spicy salami, chilli, nduja", l: "Hot salami and nduja with fresh chilli and oregano. The hottest thing on the menu — say if you'd like it toned down.", i: "Pizza dough, tomato, mozzarella, spicy salami, nduja, chilli, oregano" },
          it: { n: "Diavola", s: "Salame piccante, peperoncino, nduja", l: "Salame piccante e nduja con peperoncino fresco e origano. La più piccante del menu — dillo se la vuoi più delicata.", i: "Impasto per pizza, pomodoro, mozzarella, salame piccante, nduja, peperoncino, origano" },
          "zh-CN": { n: "恶魔披萨", s: "辣萨拉米、辣椒、恩杜亚辣肠", l: "辣萨拉米与恩杜亚辣肠，配新鲜辣椒和牛至。菜单上最辣的一道——需要减辣请告诉我们。", i: "披萨面团、番茄、马苏里拉、辣萨拉米、恩杜亚辣肠、辣椒、牛至" },
        },
      },
      {
        slug: "skogsopp-pizza", price: 225, tags: ["vegetarian","gluten","dairy"],
        t: {
          nb: { n: "Skogsoppizza", s: "Sopp, trøffelkrem, timian", l: "Hvit bunn med trøffelkrem, blandet skogsopp, mozzarella og timian. Ingen tomat — bare sopp og smør.", i: "Pizzadeig, trøffelkrem, kantarell, sjampinjong, mozzarella, timian, smør" },
          en: { n: "Wild mushroom pizza", s: "Mushrooms, truffle cream, thyme", l: "White base with truffle cream, mixed wild mushrooms, mozzarella and thyme. No tomato — just mushrooms and butter.", i: "Pizza dough, truffle cream, chanterelle, button mushroom, mozzarella, thyme, butter" },
          it: { n: "Pizza ai funghi di bosco", s: "Funghi, crema al tartufo, timo", l: "Base bianca con crema al tartufo, funghi di bosco misti, mozzarella e timo. Niente pomodoro — solo funghi e burro.", i: "Impasto per pizza, crema al tartufo, finferli, champignon, mozzarella, timo, burro" },
          "zh-CN": { n: "野菌披萨", s: "菌菇、松露奶油、百里香", l: "白底披萨配松露奶油、多种野生菌菇、马苏里拉和百里香。不加番茄——只有菌菇与黄油。", i: "披萨面团、松露奶油、鸡油菌、口蘑、马苏里拉、百里香、黄油" },
        },
      },
    ],
  },
  {
    slug: "burgere",
    order: 40,
    names: {"nb":"Burgere","en":"Burgers","it":"Burger","zh-CN":"汉堡"},
    items: [
      {
        slug: "klassisk-burger", price: 219, tags: ["gluten","dairy","egg","sesame"],
        t: {
          nb: { n: "Klassisk burger", s: "Storfe, salat, tomat, husets dressing", l: "160 gram norsk storfekjøtt grillet medium, i et sesambrioche med salat, tomat, sylteagurk og husets dressing. Pommes frites til.", i: "Storfekjøtt, briochebrød, salat, tomat, sylteagurk, majones, sennep, potet" },
          en: { n: "Classic burger", s: "Beef, lettuce, tomato, house dressing", l: "160 grams of Norwegian beef grilled medium, in a sesame brioche with lettuce, tomato, pickle and the house dressing. Fries with it.", i: "Beef, brioche bun, lettuce, tomato, pickle, mayonnaise, mustard, potato" },
          it: { n: "Burger classico", s: "Manzo, lattuga, pomodoro, salsa della casa", l: "160 grammi di manzo norvegese alla griglia media, in un panino brioche al sesamo con lattuga, pomodoro, cetriolino e la salsa della casa. Con patatine.", i: "Manzo, panino brioche, lattuga, pomodoro, cetriolino, maionese, senape, patate" },
          "zh-CN": { n: "经典汉堡", s: "牛肉、生菜、番茄、招牌酱", l: "160 克挪威牛肉烤至五分熟，夹在芝麻布里欧面包中，配生菜、番茄、酸黄瓜和招牌酱。附薯条。", i: "牛肉、布里欧面包、生菜、番茄、酸黄瓜、蛋黄酱、芥末、马铃薯" },
        },
      },
      {
        slug: "ostburger", price: 229, tags: ["gluten","dairy","egg","sesame"],
        t: {
          nb: { n: "Ostburger", s: "Dobbel cheddar, syltet løk", l: "Klassikeren med dobbelt lag smeltet cheddar og syltet løk. Enkel, salt og akkurat passe fet.", i: "Storfekjøtt, briochebrød, cheddar, syltet løk, majones, sylteagurk, potet" },
          en: { n: "Cheeseburger", s: "Double cheddar, pickled onion", l: "The classic with two layers of melted cheddar and pickled onion. Simple, salty and just rich enough.", i: "Beef, brioche bun, cheddar, pickled onion, mayonnaise, pickle, potato" },
          it: { n: "Cheeseburger", s: "Doppio cheddar, cipolla marinata", l: "Il classico con due strati di cheddar fuso e cipolla marinata. Semplice, sapido e giustamente ricco.", i: "Manzo, panino brioche, cheddar, cipolla marinata, maionese, cetriolino, patate" },
          "zh-CN": { n: "芝士汉堡", s: "双层切达、腌洋葱", l: "经典款，双层融化切达芝士配腌洋葱。简单、咸香，浓郁得恰到好处。", i: "牛肉、布里欧面包、切达芝士、腌洋葱、蛋黄酱、酸黄瓜、马铃薯" },
        },
      },
      {
        slug: "baconburger", price: 249, tags: ["gluten","dairy","egg","sesame"],
        t: {
          nb: { n: "Baconburger", s: "Sprøstekt bacon, cheddar, BBQ-saus", l: "Storfe med sprøstekt bacon, smeltet cheddar, stekt løk og røykt BBQ-saus. Den mest fyldige på menyen.", i: "Storfekjøtt, briochebrød, bacon, cheddar, løk, BBQ-saus, majones, potet" },
          en: { n: "Bacon burger", s: "Crisp bacon, cheddar, BBQ sauce", l: "Beef with crisp bacon, melted cheddar, fried onion and smoky BBQ sauce. The richest one on the menu.", i: "Beef, brioche bun, bacon, cheddar, onion, BBQ sauce, mayonnaise, potato" },
          it: { n: "Bacon burger", s: "Bacon croccante, cheddar, salsa BBQ", l: "Manzo con bacon croccante, cheddar fuso, cipolla fritta e salsa BBQ affumicata. Il più ricco del menu.", i: "Manzo, panino brioche, bacon, cheddar, cipolla, salsa BBQ, maionese, patate" },
          "zh-CN": { n: "培根汉堡", s: "酥脆培根、切达、烧烤酱", l: "牛肉配酥脆培根、融化切达、炸洋葱和烟熏烧烤酱。菜单上最浓郁的一款。", i: "牛肉、布里欧面包、培根、切达芝士、洋葱、烧烤酱、蛋黄酱、马铃薯" },
        },
      },
      {
        slug: "chiliburger", price: 239, tags: ["gluten","dairy","egg","hot","sesame"],
        t: {
          nb: { n: "Chiliburger", s: "Jalapeño, chilimajones, pepperjack", l: "Storfe med pepperjack, friske jalapeños, syltet chili og chilimajones. Sterk, men ikke uhåndterlig.", i: "Storfekjøtt, briochebrød, pepperjack, jalapeño, chili, majones, salat, potet" },
          en: { n: "Chilli burger", s: "Jalapeño, chilli mayo, pepperjack", l: "Beef with pepperjack, fresh jalapeños, pickled chilli and chilli mayo. Hot, but not unmanageable.", i: "Beef, brioche bun, pepperjack, jalapeño, chilli, mayonnaise, lettuce, potato" },
          it: { n: "Burger al peperoncino", s: "Jalapeño, maionese piccante, pepperjack", l: "Manzo con pepperjack, jalapeño freschi, peperoncino marinato e maionese piccante. Piccante, ma gestibile.", i: "Manzo, panino brioche, pepperjack, jalapeño, peperoncino, maionese, lattuga, patate" },
          "zh-CN": { n: "辣味汉堡", s: "墨西哥辣椒、辣蛋黄酱、胡椒杰克芝士", l: "牛肉配胡椒杰克芝士、新鲜墨西哥辣椒、腌辣椒和辣蛋黄酱。够辣，但不至于吃不消。", i: "牛肉、布里欧面包、胡椒杰克芝士、墨西哥辣椒、辣椒、蛋黄酱、生菜、马铃薯" },
        },
      },
      {
        slug: "vegetarburger", price: 209, tags: ["vegetarian","vegan","gluten","sesame"],
        t: {
          nb: { n: "Vegetarburger", s: "Linse- og betebiff, avokado, vegansk aioli", l: "Biff av linser, rødbete og havregryn, med avokado, salat og vegansk aioli i sesambrød. Helt plantebasert.", i: "Linser, rødbete, havregryn, sesambrød, avokado, salat, vegansk aioli, potet" },
          en: { n: "Veggie burger", s: "Lentil and beetroot patty, avocado, vegan aioli", l: "A patty of lentils, beetroot and oats with avocado, lettuce and vegan aioli in a sesame bun. Entirely plant-based.", i: "Lentils, beetroot, oats, sesame bun, avocado, lettuce, vegan aioli, potato" },
          it: { n: "Burger vegetariano", s: "Burger di lenticchie e barbabietola, avocado, aioli vegana", l: "Un burger di lenticchie, barbabietola e avena con avocado, lattuga e aioli vegana nel panino al sesamo. Completamente vegetale.", i: "Lenticchie, barbabietola, avena, panino al sesamo, avocado, lattuga, aioli vegana, patate" },
          "zh-CN": { n: "素食汉堡", s: "扁豆甜菜根饼、牛油果、纯素蒜酱", l: "扁豆、甜菜根与燕麦制成的肉饼，配牛油果、生菜和纯素蒜香蛋黄酱，夹芝麻面包。全植物性。", i: "扁豆、甜菜根、燕麦、芝麻面包、牛油果、生菜、纯素蒜香蛋黄酱、马铃薯" },
        },
      },
      {
        slug: "kyllingburger", price: 225, tags: ["halal","gluten","dairy","egg","sesame"],
        t: {
          nb: { n: "Kyllingburger", s: "Panert kyllingfilet, coleslaw, sriracha", l: "Kyllingfilet panert i krydret mel og stekt sprø, med coleslaw og srirachamajones i et mykt brød.", i: "Kylling, hvetemel, briochebrød, kål, gulrot, majones, sriracha, potet" },
          en: { n: "Chicken burger", s: "Breaded chicken, coleslaw, sriracha", l: "Chicken breast in seasoned flour fried crisp, with coleslaw and sriracha mayo in a soft bun.", i: "Chicken, wheat flour, brioche bun, cabbage, carrot, mayonnaise, sriracha, potato" },
          it: { n: "Burger di pollo", s: "Pollo impanato, coleslaw, sriracha", l: "Petto di pollo in farina aromatizzata fritto croccante, con coleslaw e maionese alla sriracha in un panino morbido.", i: "Pollo, farina di grano, panino brioche, cavolo, carota, maionese, sriracha, patate" },
          "zh-CN": { n: "鸡肉汉堡", s: "炸鸡排、凉拌卷心菜、是拉差", l: "鸡胸裹调味面粉炸至酥脆，配凉拌卷心菜和是拉差蛋黄酱，夹松软面包。", i: "鸡肉、小麦粉、布里欧面包、卷心菜、胡萝卜、蛋黄酱、是拉差、马铃薯" },
        },
      },
      {
        slug: "halloumiburger", price: 219, tags: ["vegetarian","gluten","dairy","sesame"],
        t: {
          nb: { n: "Halloumiburger", s: "Grillet halloumi, aubergine, mynteyoghurt", l: "Tykke skiver grillet halloumi med ovnsbakt aubergine, salat og mynteyoghurt. Salt ost og friskt sammen.", i: "Halloumi, aubergine, sesambrød, salat, yoghurt, mynte, sitron, potet" },
          en: { n: "Halloumi burger", s: "Grilled halloumi, aubergine, mint yoghurt", l: "Thick slices of grilled halloumi with roast aubergine, lettuce and mint yoghurt. Salty cheese against something fresh.", i: "Halloumi, aubergine, sesame bun, lettuce, yoghurt, mint, lemon, potato" },
          it: { n: "Burger di halloumi", s: "Halloumi grigliato, melanzana, yogurt alla menta", l: "Fette spesse di halloumi grigliato con melanzana al forno, lattuga e yogurt alla menta. Formaggio sapido contro qualcosa di fresco.", i: "Halloumi, melanzana, panino al sesamo, lattuga, yogurt, menta, limone, patate" },
          "zh-CN": { n: "哈罗米芝士汉堡", s: "炙烤哈罗米、茄子、薄荷酸奶", l: "厚切哈罗米芝士炙烤后，配烤茄子、生菜和薄荷酸奶。咸香芝士搭配清爽配菜。", i: "哈罗米芝士、茄子、芝麻面包、生菜、酸奶、薄荷、柠檬、马铃薯" },
        },
      },
      {
        slug: "dobbel-burger", price: 289, tags: ["gluten","dairy","egg","serves_two","sesame"],
        t: {
          nb: { n: "Dobbel burger", s: "To biffer, dobbel ost, stekt løk", l: "To biffer på 160 gram, dobbel cheddar, stekt løk og husets dressing. Stor nok til å dele — eller ikke.", i: "Storfekjøtt, briochebrød, cheddar, løk, majones, sylteagurk, salat, potet" },
          en: { n: "Double burger", s: "Two patties, double cheese, fried onion", l: "Two 160-gram patties, double cheddar, fried onion and the house dressing. Big enough to share — or not.", i: "Beef, brioche bun, cheddar, onion, mayonnaise, pickle, lettuce, potato" },
          it: { n: "Doppio burger", s: "Due hamburger, doppio formaggio, cipolla fritta", l: "Due hamburger da 160 grammi, doppio cheddar, cipolla fritta e la salsa della casa. Abbastanza grande da condividere — o no.", i: "Manzo, panino brioche, cheddar, cipolla, maionese, cetriolino, lattuga, patate" },
          "zh-CN": { n: "双层汉堡", s: "双份肉饼、双层芝士、炸洋葱", l: "两块 160 克肉饼、双层切达、炸洋葱和招牌酱。大到可以分着吃——或者不分。", i: "牛肉、布里欧面包、切达芝士、洋葱、蛋黄酱、酸黄瓜、生菜、马铃薯" },
        },
      },
    ],
  },
  {
    slug: "salater",
    order: 50,
    names: {"nb":"Salater","en":"Salads","it":"Insalate","zh-CN":"沙拉"},
    items: [
      {
        slug: "cesarsalat", price: 185, tags: ["halal","dairy","egg","gluten","fish"],
        t: {
          nb: { n: "Cæsarsalat", s: "Romanosalat, kylling, parmesan, krutonger", l: "Romanosalat vendt i ekte cæsardressing med ansjos, med grillet kylling, parmesanflak og krutonger stekt i smør.", i: "Romanosalat, kylling, parmesan, brød, egg, ansjos, hvitløk, sitron, olivenolje" },
          en: { n: "Caesar salad", s: "Romaine, chicken, parmesan, croutons", l: "Romaine tossed in a proper Caesar dressing with anchovy, with grilled chicken, parmesan shavings and croutons fried in butter.", i: "Romaine lettuce, chicken, parmesan, bread, egg, anchovy, garlic, lemon, olive oil" },
          it: { n: "Insalata Caesar", s: "Lattuga romana, pollo, parmigiano, crostini", l: "Lattuga romana condita con una vera salsa Caesar all'acciuga, con pollo grigliato, scaglie di parmigiano e crostini fritti nel burro.", i: "Lattuga romana, pollo, parmigiano, pane, uova, acciughe, aglio, limone, olio d'oliva" },
          "zh-CN": { n: "凯撒沙拉", s: "罗马生菜、鸡肉、帕玛森、面包丁", l: "罗马生菜拌上含鳀鱼的正宗凯撒酱，配炙烤鸡肉、帕玛森薄片和黄油煎面包丁。", i: "罗马生菜、鸡肉、帕玛森、面包、鸡蛋、鳀鱼、大蒜、柠檬、橄榄油" },
        },
      },
      {
        slug: "gresk-salat", price: 175, tags: ["vegetarian","gluten_free","dairy"],
        t: {
          nb: { n: "Gresk salat", s: "Fetaost, oliven, agurk, rødløk", l: "Tomat, agurk, paprika og rødløk med en hel skive fetaost, kalamataoliven, oregano og olivenolje. Ingen salatblader.", i: "Tomat, agurk, paprika, rødløk, fetaost, kalamataoliven, oregano, olivenolje" },
          en: { n: "Greek salad", s: "Feta, olives, cucumber, red onion", l: "Tomato, cucumber, pepper and red onion with a whole slab of feta, Kalamata olives, oregano and olive oil. No leaves.", i: "Tomato, cucumber, pepper, red onion, feta, Kalamata olives, oregano, olive oil" },
          it: { n: "Insalata greca", s: "Feta, olive, cetriolo, cipolla rossa", l: "Pomodoro, cetriolo, peperone e cipolla rossa con una fetta intera di feta, olive di Kalamata, origano e olio d'oliva. Senza insalata in foglia.", i: "Pomodoro, cetriolo, peperone, cipolla rossa, feta, olive di Kalamata, origano, olio d'oliva" },
          "zh-CN": { n: "希腊沙拉", s: "菲达芝士、橄榄、黄瓜、红洋葱", l: "番茄、黄瓜、彩椒与红洋葱，配整块菲达芝士、卡拉马塔橄榄、牛至和橄榄油。不加生菜叶。", i: "番茄、黄瓜、彩椒、红洋葱、菲达芝士、卡拉马塔橄榄、牛至、橄榄油" },
        },
      },
      {
        slug: "kyllingsalat", price: 215, tags: ["halal","gluten_free","dairy"],
        t: {
          nb: { n: "Kyllingsalat", s: "Grillet kylling, avokado, cherrytomat", l: "Grillet kyllingfilet på blandede salatblader med avokado, cherrytomat, agurk og en lett sitrondressing.", i: "Kylling, salatblader, avokado, cherrytomat, agurk, sitron, olivenolje, parmesan" },
          en: { n: "Chicken salad", s: "Grilled chicken, avocado, cherry tomato", l: "Grilled chicken breast on mixed leaves with avocado, cherry tomato, cucumber and a light lemon dressing.", i: "Chicken, mixed leaves, avocado, cherry tomato, cucumber, lemon, olive oil, parmesan" },
          it: { n: "Insalata di pollo", s: "Pollo grigliato, avocado, pomodorini", l: "Petto di pollo grigliato su insalata mista con avocado, pomodorini, cetriolo e un condimento leggero al limone.", i: "Pollo, insalata mista, avocado, pomodorini, cetriolo, limone, olio d'oliva, parmigiano" },
          "zh-CN": { n: "鸡肉沙拉", s: "炙烤鸡肉、牛油果、樱桃番茄", l: "炙烤鸡胸配什锦生菜、牛油果、樱桃番茄、黄瓜和清爽柠檬酱汁。", i: "鸡肉、什锦生菜、牛油果、樱桃番茄、黄瓜、柠檬、橄榄油、帕玛森" },
        },
      },
      {
        slug: "rekesalat", price: 225, tags: ["shellfish","gluten_free","egg"],
        t: {
          nb: { n: "Rekesalat", s: "Reker, egg, avokado, sitrondressing", l: "Håndpillede reker med halve egg, avokado, cherrytomat og sprø salat i en dressing av sitron og dill.", i: "Reker, egg, avokado, cherrytomat, salat, sitron, dill, olivenolje" },
          en: { n: "Prawn salad", s: "Prawns, egg, avocado, lemon dressing", l: "Hand-peeled prawns with halved eggs, avocado, cherry tomato and crisp leaves in a lemon and dill dressing.", i: "Prawns, egg, avocado, cherry tomato, lettuce, lemon, dill, olive oil" },
          it: { n: "Insalata di gamberi", s: "Gamberi, uova, avocado, condimento al limone", l: "Gamberi sgusciati a mano con uova a metà, avocado, pomodorini e insalata croccante in un condimento al limone e aneto.", i: "Gamberi, uova, avocado, pomodorini, lattuga, limone, aneto, olio d'oliva" },
          "zh-CN": { n: "鲜虾沙拉", s: "鲜虾、鸡蛋、牛油果、柠檬酱汁", l: "手剥鲜虾配对半水煮蛋、牛油果、樱桃番茄和脆生菜，佐柠檬莳萝酱汁。", i: "虾、鸡蛋、牛油果、樱桃番茄、生菜、柠檬、莳萝、橄榄油" },
        },
      },
      {
        slug: "quinoasalat", price: 195, tags: ["vegan","vegetarian","gluten_free"],
        t: {
          nb: { n: "Quinoasalat", s: "Quinoa, granateple, mynte, gresskarkjerner", l: "Quinoa med granateplekjerner, agurk, mynte, persille og ristede gresskarkjerner i en dressing av sitron og olivenolje.", i: "Quinoa, granateple, agurk, mynte, persille, gresskarkjerner, sitron, olivenolje" },
          en: { n: "Quinoa salad", s: "Quinoa, pomegranate, mint, pumpkin seeds", l: "Quinoa with pomegranate seeds, cucumber, mint, parsley and toasted pumpkin seeds in a lemon and olive oil dressing.", i: "Quinoa, pomegranate, cucumber, mint, parsley, pumpkin seeds, lemon, olive oil" },
          it: { n: "Insalata di quinoa", s: "Quinoa, melograno, menta, semi di zucca", l: "Quinoa con chicchi di melograno, cetriolo, menta, prezzemolo e semi di zucca tostati in un condimento al limone e olio d'oliva.", i: "Quinoa, melograno, cetriolo, menta, prezzemolo, semi di zucca, limone, olio d'oliva" },
          "zh-CN": { n: "藜麦沙拉", s: "藜麦、石榴、薄荷、南瓜籽", l: "藜麦配石榴籽、黄瓜、薄荷、欧芹和烤南瓜籽，佐柠檬橄榄油酱汁。", i: "藜麦、石榴、黄瓜、薄荷、欧芹、南瓜籽、柠檬、橄榄油" },
        },
      },
      {
        slug: "burratasalat", price: 235, tags: ["vegetarian","gluten_free","dairy"],
        t: {
          nb: { n: "Burratasalat", s: "Hel burrata, tomat, basilikum, balsamico", l: "En hel burrata på modne tomater i flere farger, med basilikum, god olivenolje og noen dråper balsamico.", i: "Burrata, tomat, basilikum, olivenolje, balsamicoeddik, havsalt, sort pepper" },
          en: { n: "Burrata salad", s: "Whole burrata, tomato, basil, balsamic", l: "A whole burrata on ripe tomatoes in several colours, with basil, good olive oil and a few drops of balsamic.", i: "Burrata, tomato, basil, olive oil, balsamic vinegar, sea salt, black pepper" },
          it: { n: "Insalata di burrata", s: "Burrata intera, pomodoro, basilico, balsamico", l: "Una burrata intera su pomodori maturi di diversi colori, con basilico, buon olio d'oliva e qualche goccia di balsamico.", i: "Burrata, pomodoro, basilico, olio d'oliva, aceto balsamico, sale marino, pepe nero" },
          "zh-CN": { n: "布拉塔沙拉", s: "整颗布拉塔、番茄、罗勒、香醋", l: "一整颗布拉塔芝士配多色熟番茄，加罗勒、优质橄榄油和几滴意大利香醋。", i: "布拉塔芝士、番茄、罗勒、橄榄油、意大利香醋、海盐、黑胡椒" },
        },
      },
      {
        slug: "tunfisksalat", price: 205, tags: ["fish","gluten_free","egg"],
        t: {
          nb: { n: "Tunfisksalat", s: "Tunfisk, egg, oliven, sprø bønner", l: "Tunfisk i olivenolje med kokte egg, sprø grønne bønner, nypoteter og oliven. Niçoise, mer eller mindre.", i: "Tunfisk, egg, grønne bønner, nypoteter, oliven, salat, sitron, olivenolje" },
          en: { n: "Tuna salad", s: "Tuna, egg, olives, crisp beans", l: "Tuna in olive oil with boiled eggs, crisp green beans, new potatoes and olives. Niçoise, more or less.", i: "Tuna, egg, green beans, new potatoes, olives, lettuce, lemon, olive oil" },
          it: { n: "Insalata di tonno", s: "Tonno, uova, olive, fagiolini croccanti", l: "Tonno sott'olio con uova sode, fagiolini croccanti, patate novelle e olive. Niçoise, più o meno.", i: "Tonno, uova, fagiolini, patate novelle, olive, lattuga, limone, olio d'oliva" },
          "zh-CN": { n: "金枪鱼沙拉", s: "金枪鱼、鸡蛋、橄榄、脆豆角", l: "橄榄油浸金枪鱼配水煮蛋、脆豆角、小土豆和橄榄。大致是尼斯沙拉的做法。", i: "金枪鱼、鸡蛋、四季豆、小土豆、橄榄、生菜、柠檬、橄榄油" },
        },
      },
      {
        slug: "bete-geitost", price: 199, tags: ["vegetarian","gluten_free","dairy","nuts"],
        t: {
          nb: { n: "Rødbete og geitost", s: "Ovnsbakte rødbeter, geitost, valnøtter", l: "Rødbeter bakt hele i ovnen, med myk geitost, ristede valnøtter, honning og ruccola.", i: "Rødbete, geitost, valnøtter, honning, ruccola, balsamicoeddik, olivenolje" },
          en: { n: "Beetroot and goat cheese", s: "Roast beetroot, goat cheese, walnuts", l: "Beetroots roasted whole, with soft goat cheese, toasted walnuts, honey and rocket.", i: "Beetroot, goat cheese, walnuts, honey, rocket, balsamic vinegar, olive oil" },
          it: { n: "Barbabietola e caprino", s: "Barbabietola al forno, caprino, noci", l: "Barbabietole arrostite intere, con caprino morbido, noci tostate, miele e rucola.", i: "Barbabietola, caprino, noci, miele, rucola, aceto balsamico, olio d'oliva" },
          "zh-CN": { n: "甜菜根山羊奶酪", s: "烤甜菜根、山羊奶酪、核桃", l: "整颗甜菜根烘烤后，配软质山羊奶酪、烤核桃、蜂蜜和芝麻菜。", i: "甜菜根、山羊奶酪、核桃、蜂蜜、芝麻菜、意大利香醋、橄榄油" },
        },
      },
    ],
  },
  {
    slug: "desserter",
    order: 60,
    names: {"nb":"Desserter","en":"Desserts","it":"Dolci","zh-CN":"甜点"},
    items: [
      {
        slug: "sjokoladefondant", price: 109, tags: ["vegetarian","dairy","egg","gluten"], featured: true,
        t: {
          nb: { n: "Sjokoladefondant", s: "Varm sjokoladekake med flytende kjerne", l: "Bakes når du bestiller, så regn med tolv minutter. Mørk sjokolade med flytende kjerne, vaniljeis ved siden av.", i: "Mørk sjokolade, smør, egg, sukker, hvetemel, vaniljeis" },
          en: { n: "Chocolate fondant", s: "Warm chocolate cake with a molten centre", l: "Baked when you order it, so allow twelve minutes. Dark chocolate with a molten centre and vanilla ice cream alongside.", i: "Dark chocolate, butter, egg, sugar, wheat flour, vanilla ice cream" },
          it: { n: "Tortino al cioccolato", s: "Tortino caldo dal cuore morbido", l: "Preparato al momento dell'ordine, quindi serve una dozzina di minuti. Cioccolato fondente dal cuore morbido e gelato alla vaniglia.", i: "Cioccolato fondente, burro, uova, zucchero, farina di grano, gelato alla vaniglia" },
          "zh-CN": { n: "熔岩巧克力蛋糕", s: "温热巧克力蛋糕，内馅流心", l: "点单后现烤，请预留十二分钟。黑巧克力蛋糕带流心内馅，配香草冰淇淋。", i: "黑巧克力、黄油、鸡蛋、糖、小麦粉、香草冰淇淋" },
        },
      },
      {
        slug: "ostekake", price: 115, tags: ["vegetarian","dairy","egg","gluten"],
        t: {
          nb: { n: "Ostekake", s: "New York-ostekake med bærkompott", l: "Tett og kremet ostekake på smørkjeksbunn, med en kompott av norske skogsbær og litt revet sitronskall.", i: "Kremost, fløte, egg, sukker, smørkjeks, smør, blåbær, bringebær, sitron" },
          en: { n: "Cheesecake", s: "New York cheesecake with berry compote", l: "Dense, creamy cheesecake on a biscuit base, with a compote of Norwegian forest berries and a little lemon zest.", i: "Cream cheese, cream, egg, sugar, biscuit, butter, blueberry, raspberry, lemon" },
          it: { n: "Cheesecake", s: "Cheesecake newyorkese con composta di frutti di bosco", l: "Cheesecake densa e cremosa su base di biscotto, con una composta di frutti di bosco norvegesi e un po' di scorza di limone.", i: "Formaggio spalmabile, panna, uova, zucchero, biscotto, burro, mirtillo, lampone, limone" },
          "zh-CN": { n: "芝士蛋糕", s: "纽约芝士蛋糕配莓果酱", l: "绵密浓郁的芝士蛋糕，饼干底，佐挪威森林莓果酱和少许柠檬皮。", i: "奶油芝士、奶油、鸡蛋、糖、饼干、黄油、蓝莓、树莓、柠檬" },
        },
      },
      {
        slug: "tiramisu", price: 119, tags: ["vegetarian","dairy","egg","gluten"],
        t: {
          nb: { n: "Tiramisu", s: "Mascarpone, espresso, kakao", l: "Lady fingers dyppet i espresso, lagvis med mascarponekrem og kakao på toppen. Laget dagen før, som den skal.", i: "Mascarpone, egg, sukker, espresso, lady fingers, kakao, marsala" },
          en: { n: "Tiramisu", s: "Mascarpone, espresso, cocoa", l: "Ladyfingers dipped in espresso, layered with mascarpone cream and dusted with cocoa. Made the day before, as it should be.", i: "Mascarpone, egg, sugar, espresso, ladyfingers, cocoa, marsala" },
          it: { n: "Tiramisù", s: "Mascarpone, espresso, cacao", l: "Savoiardi inzuppati nell'espresso, a strati con crema al mascarpone e cacao in superficie. Preparato il giorno prima, come si deve.", i: "Mascarpone, uova, zucchero, espresso, savoiardi, cacao, marsala" },
          "zh-CN": { n: "提拉米苏", s: "马斯卡彭、浓缩咖啡、可可", l: "手指饼干浸浓缩咖啡，与马斯卡彭奶油层叠，撒上可可粉。按传统提前一天制作。", i: "马斯卡彭、鸡蛋、糖、浓缩咖啡、手指饼干、可可、马沙拉酒" },
        },
      },
      {
        slug: "eplekake", price: 105, tags: ["vegetarian","dairy","egg","gluten"],
        t: {
          nb: { n: "Eplekake", s: "Varm eplekake med vaniljesaus", l: "Norske epler bakt i en lett kanelkake, servert varm med vaniljesaus. Husets mest bestilte dessert om høsten.", i: "Epler, hvetemel, smør, egg, sukker, kanel, melk, vanilje" },
          en: { n: "Apple cake", s: "Warm apple cake with vanilla sauce", l: "Norwegian apples baked into a light cinnamon cake, served warm with vanilla sauce. The most ordered dessert here in autumn.", i: "Apples, wheat flour, butter, egg, sugar, cinnamon, milk, vanilla" },
          it: { n: "Torta di mele", s: "Torta di mele calda con salsa alla vaniglia", l: "Mele norvegesi cotte in una torta leggera alla cannella, servita calda con salsa alla vaniglia. Il dolce più ordinato qui in autunno.", i: "Mele, farina di grano, burro, uova, zucchero, cannella, latte, vaniglia" },
          "zh-CN": { n: "苹果蛋糕", s: "温热苹果蛋糕配香草酱", l: "挪威苹果烤入轻盈的肉桂蛋糕，温热上桌并佐香草酱。秋天这里点得最多的甜品。", i: "苹果、小麦粉、黄油、鸡蛋、糖、肉桂、牛奶、香草" },
        },
      },
      {
        slug: "riskrem", price: 99, tags: ["vegetarian","gluten_free","dairy","nuts"],
        t: {
          nb: { n: "Riskrem", s: "Kald riskrem med rød saus og mandel", l: "Kald riskrem rørt med vaniljesukker og pisket fløte, med varm rød bærsaus og en hel mandel i porsjonen.", i: "Ris, melk, fløte, sukker, vanilje, mandel, bringebær" },
          en: { n: "Riskrem", s: "Cold rice cream with berry sauce and almond", l: "Cold rice cream folded with vanilla sugar and whipped cream, with a warm red berry sauce and one whole almond in the portion.", i: "Rice, milk, cream, sugar, vanilla, almond, raspberry" },
          it: { n: "Riskrem", s: "Crema di riso fredda con salsa ai frutti rossi e mandorla", l: "Crema di riso fredda montata con zucchero vanigliato e panna, con salsa calda ai frutti rossi e una mandorla intera nella porzione.", i: "Riso, latte, panna, zucchero, vaniglia, mandorla, lampone" },
          "zh-CN": { n: "挪威米布丁", s: "冰凉米布丁配莓果酱与杏仁", l: "冰凉米布丁拌入香草糖和打发奶油，配温热红莓果酱，每份里藏有一颗完整杏仁。", i: "大米、牛奶、奶油、糖、香草、杏仁、树莓" },
        },
      },
      {
        slug: "isdessert", price: 89, tags: ["vegetarian","gluten_free","dairy","egg"],
        t: {
          nb: { n: "Tre kuler is", s: "Vanilje, sjokolade eller jordbær", l: "Tre kuler hjemmelaget is — vanilje, mørk sjokolade eller jordbær — med pisket krem og en kjeks.", i: "Melk, fløte, egg, sukker, vanilje, sjokolade, jordbær" },
          en: { n: "Three scoops of ice cream", s: "Vanilla, chocolate or strawberry", l: "Three scoops of ice cream made here — vanilla, dark chocolate or strawberry — with whipped cream and a biscuit.", i: "Milk, cream, egg, sugar, vanilla, chocolate, strawberry" },
          it: { n: "Tre palline di gelato", s: "Vaniglia, cioccolato o fragola", l: "Tre palline di gelato fatto in casa — vaniglia, cioccolato fondente o fragola — con panna montata e un biscotto.", i: "Latte, panna, uova, zucchero, vaniglia, cioccolato, fragola" },
          "zh-CN": { n: "三球冰淇淋", s: "香草、巧克力或草莓", l: "三球自制冰淇淋——香草、黑巧克力或草莓——配打发奶油和一块饼干。", i: "牛奶、奶油、鸡蛋、糖、香草、巧克力、草莓" },
        },
      },
      {
        slug: "creme-brulee", price: 115, tags: ["vegetarian","gluten_free","dairy","egg"],
        t: {
          nb: { n: "Crème brûlée", s: "Vaniljekrem med brent sukkerlokk", l: "Vaniljekrem bakt i vannbad og kjølt, med et lokk av sukker brent hardt rett før servering så det knekker.", i: "Fløte, eggeplomme, sukker, vaniljestang" },
          en: { n: "Crème brûlée", s: "Vanilla custard under burnt sugar", l: "Vanilla custard baked in a water bath and chilled, with a lid of sugar burnt hard just before serving so it cracks.", i: "Cream, egg yolk, sugar, vanilla pod" },
          it: { n: "Crème brûlée", s: "Crema alla vaniglia sotto zucchero bruciato", l: "Crema alla vaniglia cotta a bagnomaria e raffreddata, con una crosta di zucchero bruciata poco prima di servire perché si rompa.", i: "Panna, tuorlo d'uovo, zucchero, baccello di vaniglia" },
          "zh-CN": { n: "法式焦糖布丁", s: "香草蛋奶冻配焦糖脆面", l: "香草蛋奶冻水浴烘烤后冷藏，上桌前现烤一层硬糖壳，敲开即裂。", i: "奶油、蛋黄、糖、香草荚" },
        },
      },
      {
        slug: "brownie", price: 95, tags: ["vegetarian","dairy","egg","gluten","nuts"],
        t: {
          nb: { n: "Brownie", s: "Seig sjokoladebrownie med pekannøtter", l: "Seig brownie på mørk sjokolade med pekannøtter, servert lun med en kule vaniljeis.", i: "Mørk sjokolade, smør, egg, sukker, hvetemel, pekannøtter, vaniljeis" },
          en: { n: "Brownie", s: "Fudgy chocolate brownie with pecans", l: "A fudgy dark chocolate brownie with pecans, served warm with a scoop of vanilla ice cream.", i: "Dark chocolate, butter, egg, sugar, wheat flour, pecans, vanilla ice cream" },
          it: { n: "Brownie", s: "Brownie al cioccolato con noci pecan", l: "Un brownie denso al cioccolato fondente con noci pecan, servito tiepido con una pallina di gelato alla vaniglia.", i: "Cioccolato fondente, burro, uova, zucchero, farina di grano, noci pecan, gelato alla vaniglia" },
          "zh-CN": { n: "布朗尼", s: "浓郁巧克力布朗尼配碧根果", l: "湿润浓郁的黑巧克力布朗尼配碧根果，温热上桌并佐一球香草冰淇淋。", i: "黑巧克力、黄油、鸡蛋、糖、小麦粉、碧根果、香草冰淇淋" },
        },
      },
    ],
  },
  {
    slug: "drikke",
    order: 70,
    names: {"nb":"Drikke","en":"Drinks","it":"Bevande","zh-CN":"饮品"},
    items: [
      {
        slug: "kaffe", price: 45, tags: ["vegan","vegetarian","gluten_free"],
        t: {
          nb: { n: "Kaffe", s: "Espresso, americano eller filterkaffe", l: "Bønner brent i Oslo, malt når du bestiller. Espresso, americano eller filterkaffe — melk på forespørsel.", i: "Kaffebønner, vann" },
          en: { n: "Coffee", s: "Espresso, americano or filter", l: "Beans roasted in Oslo, ground when you order. Espresso, americano or filter — milk on request.", i: "Coffee beans, water" },
          it: { n: "Caffè", s: "Espresso, americano o filtro", l: "Chicchi tostati a Oslo, macinati al momento dell'ordine. Espresso, americano o filtro — latte su richiesta.", i: "Chicchi di caffè, acqua" },
          "zh-CN": { n: "咖啡", s: "浓缩、美式或滴滤", l: "奥斯陆本地烘焙的咖啡豆，点单后现磨。浓缩、美式或滴滤——需要牛奶请告知。", i: "咖啡豆、水" },
        },
      },
      {
        slug: "te", price: 42, tags: ["vegan","vegetarian","gluten_free"],
        t: {
          nb: { n: "Te", s: "Svart, grønn, mynte eller kamille", l: "Løsvekt-te trukket ved bordet. Svart, grønn, fersk mynte eller kamille — spør om dagens utvalg.", i: "Teblader, vann, fersk mynte" },
          en: { n: "Tea", s: "Black, green, mint or chamomile", l: "Loose-leaf tea brewed at the table. Black, green, fresh mint or chamomile — ask what's in today.", i: "Tea leaves, water, fresh mint" },
          it: { n: "Tè", s: "Nero, verde, menta o camomilla", l: "Tè in foglia preparato al tavolo. Nero, verde, menta fresca o camomilla — chiedi la selezione del giorno.", i: "Foglie di tè, acqua, menta fresca" },
          "zh-CN": { n: "茶", s: "红茶、绿茶、薄荷或洋甘菊", l: "散叶茶现泡上桌。红茶、绿茶、鲜薄荷或洋甘菊——今天有哪些请询问我们。", i: "茶叶、水、鲜薄荷" },
        },
      },
      {
        slug: "appelsinjuice", price: 49, tags: ["vegan","vegetarian","gluten_free"],
        t: {
          nb: { n: "Appelsinjuice", s: "Nypresset, uten tilsatt sukker", l: "Presset på appelsiner når du bestiller. Ingenting tilsatt — verken sukker eller vann.", i: "Appelsin" },
          en: { n: "Orange juice", s: "Freshly squeezed, no added sugar", l: "Squeezed from oranges when you order. Nothing added — no sugar, no water.", i: "Orange" },
          it: { n: "Succo d'arancia", s: "Spremuto al momento, senza zuccheri aggiunti", l: "Spremuto dalle arance al momento dell'ordine. Niente di aggiunto — né zucchero né acqua.", i: "Arancia" },
          "zh-CN": { n: "鲜榨橙汁", s: "现榨，不加糖", l: "点单后现榨橙子。不添加任何东西——不加糖，不加水。", i: "橙子" },
        },
      },
      {
        slug: "brus", price: 45, tags: ["vegan","vegetarian","gluten_free"],
        t: {
          nb: { n: "Brus", s: "Cola, appelsin eller sitron", l: "Cola, appelsinbrus eller sitronbrus på flaske, servert kaldt med is og sitron.", i: "Brus, is, sitron" },
          en: { n: "Soft drink", s: "Cola, orange or lemon", l: "Cola, orangeade or lemonade by the bottle, served cold with ice and lemon.", i: "Soft drink, ice, lemon" },
          it: { n: "Bibita", s: "Cola, arancia o limone", l: "Cola, aranciata o limonata in bottiglia, servite fredde con ghiaccio e limone.", i: "Bibita, ghiaccio, limone" },
          "zh-CN": { n: "汽水", s: "可乐、橙味或柠檬味", l: "瓶装可乐、橙味或柠檬汽水，冰镇上桌，配冰块和柠檬。", i: "汽水、冰、柠檬" },
        },
      },
      {
        slug: "farris", price: 45, tags: ["vegan","vegetarian","gluten_free"],
        t: {
          nb: { n: "Mineralvann", s: "Med eller uten kullsyre", l: "Norsk mineralvann med eller uten kullsyre, servert kaldt med is og sitron.", i: "Mineralvann, is, sitron" },
          en: { n: "Mineral water", s: "Sparkling or still", l: "Norwegian mineral water, sparkling or still, served cold with ice and lemon.", i: "Mineral water, ice, lemon" },
          it: { n: "Acqua minerale", s: "Frizzante o naturale", l: "Acqua minerale norvegese, frizzante o naturale, servita fredda con ghiaccio e limone.", i: "Acqua minerale, ghiaccio, limone" },
          "zh-CN": { n: "矿泉水", s: "气泡或无气", l: "挪威矿泉水，气泡或无气，冰镇上桌，配冰块和柠檬。", i: "矿泉水、冰、柠檬" },
        },
      },
      {
        slug: "husets-ol", price: 95, tags: ["vegan","gluten"],
        t: {
          nb: { n: "Husets øl", s: "Lokal pils fra fat, 0,4 l", l: "Lys pils fra et bryggeri i nabolaget, tappet fra fat. 0,4 liter. Spør om dagens gjesteøl.", i: "Vann, bygg, humle, gjær" },
          en: { n: "House beer", s: "Local draught pilsner, 0.4 l", l: "A pale pilsner from a brewery down the road, poured from the tap. 0.4 litres. Ask about today's guest beer.", i: "Water, barley, hops, yeast" },
          it: { n: "Birra della casa", s: "Pilsner locale alla spina, 0,4 l", l: "Una pilsner chiara da un birrificio vicino, spillata alla spina. 0,4 litri. Chiedi della birra ospite del giorno.", i: "Acqua, orzo, luppolo, lievito" },
          "zh-CN": { n: "招牌啤酒", s: "本地生啤皮尔森，0.4 升", l: "来自附近酒厂的淡色皮尔森，鲜啤现打，0.4 升。可询问今日客座啤酒。", i: "水、大麦、啤酒花、酵母" },
        },
      },
      {
        slug: "husets-vin", price: 115, tags: ["vegan","gluten_free"],
        t: {
          nb: { n: "Husets vin", s: "Rød eller hvit, glass", l: "Et glass av husets røde eller hvite. Spør hva som er åpent i dag — vi bytter etter sesong.", i: "Druer, sulfitter" },
          en: { n: "House wine", s: "Red or white, by the glass", l: "A glass of the house red or white. Ask what's open today — we change it with the season.", i: "Grapes, sulphites" },
          it: { n: "Vino della casa", s: "Rosso o bianco, al bicchiere", l: "Un bicchiere di rosso o bianco della casa. Chiedi cosa è aperto oggi — cambiamo con la stagione.", i: "Uva, solfiti" },
          "zh-CN": { n: "招牌葡萄酒", s: "红或白，按杯供应", l: "一杯招牌红葡萄酒或白葡萄酒。今天开的是哪款请询问——我们随季节更换。", i: "葡萄、亚硫酸盐" },
        },
      },
      {
        slug: "varm-sjokolade", price: 55, tags: ["vegetarian","gluten_free","dairy"],
        t: {
          nb: { n: "Varm sjokolade", s: "Mørk sjokolade, melk, krem på toppen", l: "Mørk sjokolade smeltet i varm melk, med pisket krem på toppen. Ikke pulver.", i: "Mørk sjokolade, melk, fløte, sukker" },
          en: { n: "Hot chocolate", s: "Dark chocolate, milk, cream on top", l: "Dark chocolate melted into hot milk, with whipped cream on top. Not from powder.", i: "Dark chocolate, milk, cream, sugar" },
          it: { n: "Cioccolata calda", s: "Cioccolato fondente, latte, panna", l: "Cioccolato fondente sciolto nel latte caldo, con panna montata sopra. Non in polvere.", i: "Cioccolato fondente, latte, panna, zucchero" },
          "zh-CN": { n: "热巧克力", s: "黑巧克力、牛奶、顶部奶油", l: "黑巧克力融入热牛奶，顶部加打发奶油。非冲泡粉冲调。", i: "黑巧克力、牛奶、奶油、糖" },
        },
      },
    ],
  },
];
