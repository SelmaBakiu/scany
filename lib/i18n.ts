import type { Translated } from "./types";

/**
 * UI chrome only — button labels, headings, helper text.
 *
 * Dish names, descriptions and tag labels do NOT belong here: the merchant
 * types those, so they live in the database (see supabase/schema.sql,
 * *_translations tables).
 *
 * When this grows past a few screens, swap it for next-intl. The shape below
 * is deliberately close to what next-intl expects, so that move is mechanical.
 */

/**
 * One explicit type for all locales, rather than inferring from the English
 * block. This is what makes a missing or misspelled Albanian key a compile
 * error instead of a blank label in production.
 */
export type UiStrings = {
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  filters: string;
  language: string;
  currency: string;
  categories: string;
  dishCount: (n: number) => string;
  matchCount: (n: number) => string;
  noMatches: string;
  noMatchesHelp: string;
  clearAll: string;
  active: string;
  remove: (what: string) => string;
  diet: string;
  excludeAllergens: string;
  price: string;
  heat: string;
  heatNone: string;
  availableNow: string;
  unavailable: string;
  houseFavourite: string;
  approxNote: (code: string, base: string) => string;
  allergenNote: string;
  orderWithServer: string;
  showResults: (n: number) => string;
  done: string;
  close: string;
  theme: string;
  back: string;
  backToMenu: string;
  openItem: (name: string) => string;
  aboutDish: string;
  ingredients: string;
  allergens: string;
  noAllergens: string;
  itemNotFound: string;
  restaurantInfo: string;
  openingHours: string;
  openNow: string;
  closedNow: string;
  closedLabel: string;
  address: string;
  phone: string;
  email: string;
  showOnMap: string;
  followUs: string;

  // ---- ordering
  addToOrder: string;
  added: string;
  soldOut: string;
  quantity: string;
  increase: string;
  decrease: string;
  cart: string;
  cartEmpty: string;
  cartEmptyHelp: string;
  lineComment: string;
  lineCommentPlaceholder: string;
  removeLine: string;
  total: string;
  tableNumber: string;
  tableNumberHelp: string;
  tableNumberPlaceholder: string;
  guestName: string;
  guestNameOptional: string;
  orderComment: string;
  orderCommentPlaceholder: string;
  sendOrder: string;
  sending: string;
  orderingClosed: string;
  orderingClosedHelp: string;
  myOrders: string;
  noActiveOrders: string;
  orderNumber: (n: number) => string;
  table: (n: string) => string;
  orderPlaced: string;
  backToMenuFromOrder: string;
  statusNew: string;
  statusAccepted: string;
  statusPreparing: string;
  statusReady: string;
  statusCompleted: string;
  statusDeclined: string;
  statusChanged: string;
  declineReasonLabel: string;
  orderNotFound: string;
  orderNotFoundHelp: string;
  yourOrder: string;
  placedAt: string;
  errorOrderingClosed: string;
  errorItemUnavailable: string;
  errorTableRequired: string;
  errorEmptyOrder: string;
  errorUnknownItem: string;
  errorNetwork: string;
  errorNotConfigured: string;
};

export const UI_STRINGS: Record<string, UiStrings> = {
  nb: {
    searchPlaceholder: "Søk i retter, ingredienser…",
    searchLabel: "Søk i menyen",
    clearSearch: "Tøm søket",
    filters: "Filtre",
    language: "Språk",
    currency: "Valuta",
    categories: "Menykategorier",
    dishCount: (n) => (n === 1 ? "1 rett" : `${n} retter`),
    matchCount: (n) => (n === 1 ? "1 rett passer" : `${n} retter passer`),
    noMatches: "Ingen retter passer",
    noMatchesHelp: "Prøv å fjerne et filter eller søke etter noe annet.",
    clearAll: "Fjern alle",
    active: "Aktive",
    remove: (what) => `Fjern filteret ${what}`,
    diet: "Kosthold",
    excludeAllergens: "Utelat allergener",
    price: "Pris",
    heat: "Styrke",
    heatNone: "Ingen",
    availableNow: "Tilgjengelig nå",
    unavailable: "Ikke tilgjengelig i dag",
    houseFavourite: "Husets favoritt",
    approxNote: (code, base) => `${code} omregnet fra ${base}`,
    allergenNote:
      "Prisene inkluderer mva. Fullstendig allergeninformasjon fås på forespørsel — si fra til servitøren om allergier før du bestiller.",
    orderWithServer: "Bestill hos servitøren når du er klar.",
    showResults: (n) => `Vis ${n} retter`,
    done: "Ferdig",
    close: "Lukk",
    theme: "Tema",
    back: "Tilbake",
    backToMenu: "Tilbake til menyen",
    openItem: (name) => `Se ${name}`,
    aboutDish: "Om retten",
    ingredients: "Ingredienser",
    allergens: "Allergener",
    noAllergens: "Ingen registrerte allergener",
    itemNotFound: "Fant ikke retten",
    restaurantInfo: "Restaurantinfo",
    openingHours: "Åpningstider",
    openNow: "Åpen nå",
    closedNow: "Stengt",
    closedLabel: "Stengt",
    address: "Adresse",
    phone: "Telefon",
    email: "E-post",
    showOnMap: "Vis på kart",
    followUs: "Følg oss",

    addToOrder: "Legg til",
    added: "Lagt til",
    soldOut: "Utsolgt",
    quantity: "Antall",
    increase: "Øk antall",
    decrease: "Reduser antall",
    cart: "Handlekurv",
    cartEmpty: "Handlekurven er tom",
    cartEmptyHelp: "Trykk «Legg til» på en rett for å begynne.",
    lineComment: "Kommentar",
    lineCommentPlaceholder: "f.eks. uten løk",
    removeLine: "Fjern",
    total: "Totalt",
    tableNumber: "Bordnummer",
    tableNumberHelp: "Skann QR-koden på bordet, eller skriv inn nummeret.",
    tableNumberPlaceholder: "f.eks. 5",
    guestName: "Navn",
    guestNameOptional: "Valgfritt",
    orderComment: "Melding til kjøkkenet",
    orderCommentPlaceholder: "Valgfritt",
    sendOrder: "Send bestilling",
    sending: "Sender…",
    orderingClosed: "Stengt for bestilling",
    orderingClosedHelp: "Du kan se menyen, men ikke bestille akkurat nå.",
    myOrders: "Mine bestillinger",
    noActiveOrders: "Du har ingen aktive bestillinger.",
    orderNumber: (n) => `#${n}`,
    table: (n) => `Bord ${n}`,
    orderPlaced: "Bestillingen er sendt",
    backToMenuFromOrder: "Tilbake til menyen",
    statusNew: "Bestillingen er sendt, venter på restauranten",
    statusAccepted: "Bestillingen er godkjent",
    statusPreparing: "Maten lages nå",
    statusReady: "Bestillingen er klar",
    statusCompleted: "Bestillingen er fullført, velbekomme!",
    statusDeclined: "Bestillingen ble avslått",
    statusChanged: "Ny status",
    declineReasonLabel: "Begrunnelse",
    orderNotFound: "Fant ikke bestillingen",
    orderNotFoundHelp: "Lenken kan være utdatert, eller bestillingen kan være slettet.",
    yourOrder: "Din bestilling",
    placedAt: "Bestilt",
    errorOrderingClosed: "Restauranten tar ikke imot bestillinger akkurat nå.",
    errorItemUnavailable: "En av rettene er utsolgt. Fjern den og prøv igjen.",
    errorTableRequired: "Skriv inn bordnummeret først.",
    errorEmptyOrder: "Handlekurven er tom.",
    errorUnknownItem: "En av rettene finnes ikke lenger på menyen.",
    errorNetwork: "Kunne ikke sende bestillingen. Sjekk nettet og prøv igjen.",
    errorNotConfigured: "Bestilling er ikke satt opp for denne restauranten.",
  },

  en: {
    searchPlaceholder: "Search dishes, ingredients…",
    searchLabel: "Search the menu",
    clearSearch: "Clear search",
    filters: "Filters",
    language: "Language",
    currency: "Currency",
    categories: "Menu categories",
    dishCount: (n) => (n === 1 ? "1 dish" : `${n} dishes`),
    matchCount: (n) => (n === 1 ? "1 dish matches" : `${n} dishes match`),
    noMatches: "No dishes match",
    noMatchesHelp: "Try removing a filter or searching for something else.",
    clearAll: "Clear all",
    active: "Active",
    remove: (what) => `Remove ${what} filter`,
    diet: "Dietary",
    excludeAllergens: "Exclude allergens",
    price: "Price",
    heat: "Spice level",
    heatNone: "None",
    availableNow: "Available right now",
    unavailable: "Not available today",
    houseFavourite: "House favourite",
    approxNote: (code, base) => `${code} converted from ${base}`,
    allergenNote:
      "Prices include VAT. Full allergen information is available on request — please tell your server about any allergies before ordering.",
    orderWithServer: "Order with your server when you are ready.",
    showResults: (n) => `Show ${n} dishes`,
    done: "Done",
    close: "Close",
    theme: "Theme",
    back: "Back",
    backToMenu: "Back to the menu",
    openItem: (name) => `View ${name}`,
    aboutDish: "About this dish",
    ingredients: "Ingredients",
    allergens: "Allergens",
    noAllergens: "No allergens listed",
    itemNotFound: "Dish not found",
    restaurantInfo: "Restaurant info",
    openingHours: "Opening hours",
    openNow: "Open now",
    closedNow: "Closed",
    closedLabel: "Closed",
    address: "Address",
    phone: "Phone",
    email: "Email",
    showOnMap: "Show on map",
    followUs: "Follow us",

    addToOrder: "Add",
    added: "Added",
    soldOut: "Sold out",
    quantity: "Quantity",
    increase: "Add one",
    decrease: "Remove one",
    cart: "Your order",
    cartEmpty: "Your order is empty",
    cartEmptyHelp: "Tap “Add” on a dish to start.",
    lineComment: "Note",
    lineCommentPlaceholder: "e.g. no onion",
    removeLine: "Remove",
    total: "Total",
    tableNumber: "Table number",
    tableNumberHelp: "Scan the QR code on your table, or type the number.",
    tableNumberPlaceholder: "e.g. 5",
    guestName: "Name",
    guestNameOptional: "Optional",
    orderComment: "Message to the kitchen",
    orderCommentPlaceholder: "Optional",
    sendOrder: "Send order",
    sending: "Sending…",
    orderingClosed: "Closed for orders",
    orderingClosedHelp: "You can read the menu, but ordering is closed right now.",
    myOrders: "My orders",
    noActiveOrders: "You have no orders in progress.",
    orderNumber: (n) => `#${n}`,
    table: (n) => `Table ${n}`,
    orderPlaced: "Your order has been sent",
    backToMenuFromOrder: "Back to the menu",
    statusNew: "Order sent, waiting for the restaurant",
    statusAccepted: "Your order has been accepted",
    statusPreparing: "Your food is being made",
    statusReady: "Your order is ready",
    statusCompleted: "Order complete — enjoy!",
    statusDeclined: "Your order was declined",
    statusChanged: "Status changed",
    declineReasonLabel: "Reason",
    orderNotFound: "Order not found",
    orderNotFoundHelp: "The link may be out of date, or the order may have been removed.",
    yourOrder: "Your order",
    placedAt: "Ordered",
    errorOrderingClosed: "The restaurant is not taking orders right now.",
    errorItemUnavailable: "One of the dishes has sold out. Remove it and try again.",
    errorTableRequired: "Enter your table number first.",
    errorEmptyOrder: "Your order is empty.",
    errorUnknownItem: "One of the dishes is no longer on the menu.",
    errorNetwork: "Could not send the order. Check your connection and try again.",
    errorNotConfigured: "Ordering is not set up for this restaurant.",
  },

  it: {
    searchPlaceholder: "Cerca piatti, ingredienti…",
    searchLabel: "Cerca nel menu",
    clearSearch: "Cancella ricerca",
    filters: "Filtri",
    language: "Lingua",
    currency: "Valuta",
    categories: "Categorie del menu",
    dishCount: (n) => (n === 1 ? "1 piatto" : `${n} piatti`),
    matchCount: (n) => (n === 1 ? "1 piatto corrisponde" : `${n} piatti corrispondono`),
    noMatches: "Nessun piatto trovato",
    noMatchesHelp: "Prova a rimuovere un filtro o a cercare altro.",
    clearAll: "Cancella tutto",
    active: "Attivi",
    remove: (what) => `Rimuovi il filtro ${what}`,
    diet: "Dieta",
    excludeAllergens: "Escludi allergeni",
    price: "Prezzo",
    heat: "Piccantezza",
    heatNone: "Nessuna",
    availableNow: "Disponibile adesso",
    unavailable: "Non disponibile oggi",
    houseFavourite: "Specialità della casa",
    approxNote: (code, base) => `${code} convertito da ${base}`,
    allergenNote:
      "Prezzi IVA inclusa. Le informazioni complete sugli allergeni sono disponibili su richiesta — comunica al personale eventuali allergie prima di ordinare.",
    orderWithServer: "Ordina al personale quando sei pronto.",
    showResults: (n) => `Mostra ${n} piatti`,
    done: "Fatto",
    close: "Chiudi",
    theme: "Tema",
    back: "Indietro",
    backToMenu: "Torna al menu",
    openItem: (name) => `Vedi ${name}`,
    aboutDish: "Il piatto",
    ingredients: "Ingredienti",
    allergens: "Allergeni",
    noAllergens: "Nessun allergene indicato",
    itemNotFound: "Piatto non trovato",
    restaurantInfo: "Informazioni",
    openingHours: "Orari di apertura",
    openNow: "Aperto ora",
    closedNow: "Chiuso",
    closedLabel: "Chiuso",
    address: "Indirizzo",
    phone: "Telefono",
    email: "Email",
    showOnMap: "Mostra sulla mappa",
    followUs: "Seguici",

    addToOrder: "Aggiungi",
    added: "Aggiunto",
    soldOut: "Esaurito",
    quantity: "Quantità",
    increase: "Aggiungi uno",
    decrease: "Togli uno",
    cart: "Il tuo ordine",
    cartEmpty: "Il tuo ordine è vuoto",
    cartEmptyHelp: "Tocca “Aggiungi” su un piatto per iniziare.",
    lineComment: "Nota",
    lineCommentPlaceholder: "es. senza cipolla",
    removeLine: "Togli",
    total: "Totale",
    tableNumber: "Numero del tavolo",
    tableNumberHelp: "Scansiona il QR sul tavolo, oppure scrivi il numero.",
    tableNumberPlaceholder: "es. 5",
    guestName: "Nome",
    guestNameOptional: "Facoltativo",
    orderComment: "Messaggio per la cucina",
    orderCommentPlaceholder: "Facoltativo",
    sendOrder: "Invia ordine",
    sending: "Invio…",
    orderingClosed: "Ordini chiusi",
    orderingClosedHelp: "Puoi leggere il menu, ma non ordinare in questo momento.",
    myOrders: "I miei ordini",
    noActiveOrders: "Non hai ordini in corso.",
    orderNumber: (n) => `#${n}`,
    table: (n) => `Tavolo ${n}`,
    orderPlaced: "Ordine inviato",
    backToMenuFromOrder: "Torna al menu",
    statusNew: "Ordine inviato, in attesa del ristorante",
    statusAccepted: "Ordine accettato",
    statusPreparing: "Stiamo preparando il tuo piatto",
    statusReady: "Il tuo ordine è pronto",
    statusCompleted: "Ordine completato — buon appetito!",
    statusDeclined: "Ordine rifiutato",
    statusChanged: "Stato aggiornato",
    declineReasonLabel: "Motivo",
    orderNotFound: "Ordine non trovato",
    orderNotFoundHelp: "Il link potrebbe non essere più valido, o l’ordine è stato rimosso.",
    yourOrder: "Il tuo ordine",
    placedAt: "Ordinato",
    errorOrderingClosed: "Il ristorante non accetta ordini in questo momento.",
    errorItemUnavailable: "Uno dei piatti è esaurito. Toglilo e riprova.",
    errorTableRequired: "Inserisci prima il numero del tavolo.",
    errorEmptyOrder: "Il tuo ordine è vuoto.",
    errorUnknownItem: "Uno dei piatti non è più nel menu.",
    errorNetwork: "Non è stato possibile inviare l’ordine. Controlla la connessione e riprova.",
    errorNotConfigured: "Gli ordini non sono configurati per questo ristorante.",
  },

  "zh-CN": {
    searchPlaceholder: "搜索菜品、食材…",
    searchLabel: "搜索菜单",
    clearSearch: "清除搜索",
    filters: "筛选",
    language: "语言",
    currency: "货币",
    categories: "分类",
    dishCount: (n) => `${n} 道菜`,
    matchCount: (n) => `${n} 道菜符合条件`,
    noMatches: "没有找到菜品",
    noMatchesHelp: "试试减少筛选条件，或换个搜索词。",
    clearAll: "全部清除",
    active: "已选",
    remove: (label) => `移除 ${label}`,
    diet: "饮食",
    excludeAllergens: "排除过敏原",
    price: "价格",
    heat: "辣度",
    heatNone: "不辣",
    availableNow: "仅看现有供应",
    unavailable: "售罄",
    houseFavourite: "招牌推荐",
    approxNote: (target, base) => `${target} 按 ${base} 折算`,
    allergenNote: "如有过敏或饮食禁忌，请告知服务员。厨房无法保证完全无交叉接触。",
    orderWithServer: "扫码点餐，或请服务员协助。",
    showResults: (n) => `查看 ${n} 道菜`,
    done: "完成",
    close: "关闭",
    theme: "主题",
    back: "返回",
    backToMenu: "返回菜单",
    openItem: (name) => `查看 ${name}`,
    aboutDish: "菜品介绍",
    ingredients: "食材",
    allergens: "过敏原",
    noAllergens: "无登记的过敏原",
    itemNotFound: "未找到该菜品",
    restaurantInfo: "餐厅信息",
    openingHours: "营业时间",
    openNow: "正在营业",
    closedNow: "休息中",
    closedLabel: "休息",
    address: "地址",
    phone: "电话",
    email: "电子邮箱",
    showOnMap: "在地图上查看",
    followUs: "关注我们",

    addToOrder: "加入",
    added: "已加入",
    soldOut: "售罄",
    quantity: "数量",
    increase: "增加一份",
    decrease: "减少一份",
    cart: "购物车",
    cartEmpty: "购物车是空的",
    cartEmptyHelp: "点击菜品上的“加入”开始点餐。",
    lineComment: "备注",
    lineCommentPlaceholder: "例如：不要洋葱",
    removeLine: "移除",
    total: "合计",
    tableNumber: "桌号",
    tableNumberHelp: "扫描桌上的二维码，或手动输入桌号。",
    tableNumberPlaceholder: "例如：5",
    guestName: "姓名",
    guestNameOptional: "选填",
    orderComment: "给厨房的留言",
    orderCommentPlaceholder: "选填",
    sendOrder: "提交订单",
    sending: "提交中…",
    orderingClosed: "暂停点餐",
    orderingClosedHelp: "您可以浏览菜单，但目前无法下单。",
    myOrders: "我的订单",
    noActiveOrders: "您没有进行中的订单。",
    orderNumber: (n) => `#${n}`,
    table: (n) => `${n} 号桌`,
    orderPlaced: "订单已提交",
    backToMenuFromOrder: "返回菜单",
    statusNew: "订单已提交，等待餐厅确认",
    statusAccepted: "订单已确认",
    statusPreparing: "正在备餐",
    statusReady: "餐品已就绪",
    statusCompleted: "订单已完成，请慢用！",
    statusDeclined: "订单被拒绝",
    statusChanged: "状态已更新",
    declineReasonLabel: "原因",
    orderNotFound: "未找到该订单",
    orderNotFoundHelp: "链接可能已失效，或订单已被删除。",
    yourOrder: "您的订单",
    placedAt: "下单时间",
    errorOrderingClosed: "餐厅目前暂不接受点餐。",
    errorItemUnavailable: "其中一道菜已售罄，请移除后重试。",
    errorTableRequired: "请先输入桌号。",
    errorEmptyOrder: "购物车是空的。",
    errorUnknownItem: "其中一道菜已不在菜单上。",
    errorNetwork: "订单提交失败。请检查网络后重试。",
    errorNotConfigured: "该餐厅尚未开通点餐功能。",
  },
};

/**
 * The language to fall back to when a dish has no translation in the one being
 * viewed. English, not Norwegian: it is the language most likely to be
 * understood by whoever is left looking at an untranslated dish.
 */
export const FALLBACK_LOCALE = "en";

export function uiStrings(locale: string): UiStrings {
  return UI_STRINGS[locale] ?? UI_STRINGS[FALLBACK_LOCALE];
}

/**
 * Pick a translation, falling back so a missing translation shows the dish's
 * name in another language rather than an empty card.
 */
export function pick(
  translated: Translated | undefined,
  locale: string,
  fallbackLocale = FALLBACK_LOCALE,
): string {
  if (!translated) return "";
  return (
    translated[locale] ?? translated[fallbackLocale] ?? Object.values(translated)[0] ?? ""
  );
}

/**
 * The two-letter badge shown on the language pill.
 *
 * Norwegian Bokmål's BCP-47 code is `nb`, but no Norwegian diner looks for
 * "NB" — the country code is what people recognise. Same trap waits for `cs`
 * (Czech, not CZ) and `da`/`sv` if you add them.
 */
const LOCALE_BADGES: Record<string, string> = {
  nb: "NO",
  nn: "NO",
  // "ZH" means nothing to a Chinese reader; 中文 is two characters and fits the
  // same pill as the two-letter codes.
  "zh-CN": "中文",
};

export function localeBadge(code: string): string {
  return LOCALE_BADGES[code] ?? code.slice(0, 2).toUpperCase();
}

/** Strip accents so "përbërës" matches a search for "perberes". */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
