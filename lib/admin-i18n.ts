import type { Translated } from "./types";

/**
 * The admin's own UI text.
 *
 * Separate from lib/i18n.ts on purpose. That file is the DINER's chrome and
 * carries four languages because diners arrive speaking anything; this one is
 * the MERCHANT's chrome and carries two, because the person editing the menu
 * is the owner or their staff. Keeping them apart means adding Italian for
 * guests does not oblige anyone to translate "Rekkefølge", and the merchant
 * switching to English does not change one word on the diner's menu.
 *
 * Same shape as lib/i18n.ts, so the eventual move to next-intl is one move,
 * not two.
 */

export const ADMIN_LOCALES = [
  { code: "nb", label: "Norsk", badge: "NO" },
  { code: "en", label: "English", badge: "EN" },
] as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number]["code"];

export const DEFAULT_ADMIN_LOCALE: AdminLocale = "nb";

export function isAdminLocale(value: unknown): value is AdminLocale {
  return value === "nb" || value === "en";
}

/**
 * One explicit type for both languages rather than inferring from the
 * Norwegian block: a key missing from English is then a compile error, not a
 * blank label discovered by whoever switched languages.
 */
export type AdminStrings = {
  // ---- shell
  admin: string;
  viewMenu: string;
  signOut: string;
  sections: string;
  language: string;
  close: string;
  cancel: string;
  save: string;
  saving: string;
  saved: string;
  edit: string;
  delete: string;
  duplicate: string;
  back: string;
  none: string;

  // ---- nav + page titles
  navItems: string;
  navCategories: string;
  navMenus: string;
  navTheme: string;
  navRestaurant: string;

  // ---- login
  loginTitle: string;
  loginIntro: string;
  loginEmail: string;
  loginEmailPlaceholder: string;
  loginPassword: string;
  loginSubmit: string;
  loginPending: string;
  loginFootnote: string;

  // ---- not-linked / setup screens
  notConfiguredTitle: string;
  notConfiguredDetail: string;
  noRestaurantTitle: string;
  noRestaurantDetail: (email: string) => string;
  noRestaurantStep1: string;
  noRestaurantStep2: string;
  noRestaurantStep3: string;
  databaseErrorTitle: string;

  // ---- items
  newItem: string;
  itemNotFound: string;
  search: string;
  searchPlaceholder: string;
  category: string;
  status: string;
  all: string;
  available: string;
  soldOut: string;
  showingCount: (shown: number, total: number) => string;
  noItemsMatch: string;
  deleteItemTitle: string;
  deleteItemBody: (name: string) => string;
  deleteItemConfirm: string;

  // ---- item form
  createItem: string;
  saveChanges: string;
  chooseCategory: string;
  priceLabel: (code: string) => string;
  priceHint: string;
  sortOrder: string;
  sortOrderHint: string;
  availableToggle: string;
  availableHint: string;
  featured: string;
  norwegian: string;
  english: string;
  name: string;
  shortDescription: string;
  shortDescriptionHint: string;
  longDescription: string;
  longDescriptionHint: string;
  ingredients: string;
  ingredientsHint: string;
  tags: string;
  tagsHint: string;
  tagDiet: string;
  tagAllergen: string;
  tagHeat: string;
  tagInfo: string;
  image: string;
  uploadImage: string;
  uploadImageHint: string;
  removeImage: string;
  backToList: string;

  // ---- AI photo
  generateImage: string;
  generatingImage: string;
  generateImageHint: string;
  generateImageSaveFirst: string;
  generateImageNeedsEnglish: string;
  aiPreviewLabel: string;

  // ---- categories
  newCategory: string;
  editCategory: (name: string) => string;
  nameNorwegian: string;
  nameEnglish: string;
  nameChinese: string;
  chinese: string;
  imagePrompt: string;
  imagePromptHint: string;
  menu: string;
  visibleOnMenu: string;
  visibleHint: string;
  visible: string;
  hidden: string;
  activeMenu: string;
  dishCount: (n: number) => string;
  moveUp: (name: string) => string;
  moveDown: (name: string) => string;
  noCategoriesYet: string;
  deleteCategoryTitle: string;
  deleteCategoryBodyWithItems: (name: string, n: number) => string;
  deleteCategoryBody: (name: string) => string;
  deleteCategoryConfirm: string;

  // ---- menus
  newMenu: string;
  editMenu: (name: string) => string;
  menuNameHint: string;
  showingNow: string;
  makeActive: string;
  cannotDelete: string;
  menuStats: (categories: number, items: number) => string;
  menusExplainer: string;
  deleteMenuTitle: string;
  deleteMenuBody: (name: string, categories: number, items: number) => string;
  deleteMenuConfirm: string;

  // ---- theme
  chooseTheme: string;
  chooseThemeHint: string;
  preview: string;
  previewHint: string;
  saveTheme: string;
  adminStaysMono: string;

  // ---- restaurant
  nameAndLogo: string;
  uploadLogo: string;
  uploadLogoHint: string;
  removeLogo: string;
  description: string;
  contact: string;
  address: string;
  mapsUrl: string;
  mapsUrlHint: string;
  phone: string;
  phoneHint: string;
  email: string;
  timezone: string;
  timezoneHint: string;
  openingHours: string;
  openingHoursHint: string;
  closed: string;
  opensAt: (day: string) => string;
  closesAt: (day: string) => string;
  socials: string;
  socialsHint: string;
  socialName: string;
  socialUrl: string;

  // ---- orders
  navOrders: string;
  ordersTitle: string;
  tabNew: string;
  tabActive: string;
  tabReady: string;
  tabCompleted: string;
  tabDeclined: string;
  noOrders: string;
  noOrdersIn: (tab: string) => string;
  orderNumber: (n: number) => string;
  table: (n: string) => string;
  justNow: string;
  minutesAgo: (n: number) => string;
  orderTotal: string;
  guestNote: string;
  accept: string;
  decline: string;
  startPreparing: string;
  markReady: string;
  complete: string;
  declineTitle: string;
  declineBody: string;
  declineReason: string;
  declineReasonHint: string;
  confirmDecline: string;
  declinedBecause: (reason: string) => string;
  newOrderBadge: string;
  newOrderToast: (table: string, number: number) => string;
  soundOn: string;
  soundOff: string;
  enableSound: string;
  enableSoundHint: string;
  notificationsAsk: string;
  browserNotificationTitle: string;
  tabTitleNewOrders: (n: number) => string;
  liveConnected: string;
  livePolling: string;
  searchOrders: string;
  searchOrdersPlaceholder: string;
  dateFrom: string;
  dateTo: string;
  clearFilters: string;
  showingOrders: (shown: number, total: number) => string;

  // ---- ordering settings
  orderingSection: string;
  orderingEnabled: string;
  orderingEnabledHint: string;
  orderingClosedNowNote: string;
  orderingOpenNowNote: string;

  // ---- QR codes
  navQr: string;
  qrTitle: string;
  qrIntro: string;
  qrTables: string;
  qrTablesHint: string;
  qrBaseUrl: string;
  qrBaseUrlHint: string;
  qrDownload: string;
  qrDownloadAll: string;
  qrTableLabel: (n: string) => string;
  qrPrint: string;

  // ---- flash + action results, keyed by what the action returns
  result: Record<ActionKey, string>;
};

/**
 * What a server action reports back.
 *
 * Actions return a KEY, never a sentence: they run on the server, where the
 * merchant's chosen language is a browser-side preference and not known. The
 * form translates it. A raw database error can ride along in `detail`, which
 * is not translated because Postgres does not speak Norwegian either.
 */
export const ACTION_KEYS = [
  "saved",
  "themeSaved",
  "itemSaved",
  "itemDeleted",
  "itemCopied",
  "itemCopiedMakeAvailable",
  "categoryDeleted",
  "menuActivated",
  "menuDeleted",
  "menuActiveCannotDelete",
  "imageGenerated",
  "signedOut",
  "notSignedIn",
  "supabaseMissing",
  "badCredentials",
  "missingCredentials",
  "itemNeedsName",
  "itemNeedsCategory",
  "priceMustBeNumber",
  "categoryNeedsName",
  "categoryNeedsMenu",
  "menuNeedsName",
  "restaurantNeedsName",
  "unknownTheme",
  "saveFailed",
  "createFailed",
  "textSaveFailed",
  "tagSaveFailed",
  "nameSaveFailed",
  "descriptionSaveFailed",
  "imageGenerationFailed",
  "imageUploadFailed",
  "itemMissing",
  "orderUpdated",
  "orderAccepted",
  "orderDeclined",
  "orderCompleted",
  "orderNotFound",
  "orderingTurnedOn",
  "orderingTurnedOff",
] as const;

export type ActionKey = (typeof ACTION_KEYS)[number];

const NB: AdminStrings = {
  admin: "Admin",
  viewMenu: "Se menyen",
  signOut: "Logg ut",
  sections: "Seksjoner",
  language: "Språk",
  close: "Lukk",
  cancel: "Avbryt",
  save: "Lagre",
  saving: "Lagrer…",
  saved: "Lagret",
  edit: "Rediger",
  delete: "Slett",
  duplicate: "Dupliser",
  back: "Tilbake",
  none: "Ingen",

  navItems: "Retter",
  navCategories: "Kategorier",
  navMenus: "Menyer",
  navTheme: "Tema",
  navRestaurant: "Restaurant",

  loginTitle: "Logg inn",
  loginIntro: "Logg inn for å redigere menyen.",
  loginEmail: "E-post",
  loginEmailPlaceholder: "post@example.no",
  loginPassword: "Passord",
  loginSubmit: "Logg inn",
  loginPending: "Logger inn…",
  loginFootnote:
    "Ingen konto? Kontoer opprettes i Supabase-panelet og kobles til restauranten med supabase/merchant-setup.sql. Det finnes ingen selvregistrering — den som kan lage en konto kan endre menyen.",

  notConfiguredTitle: "Supabase er ikke satt opp",
  notConfiguredDetail: "Admin trenger databasen. Fyll inn .env.local og kjør supabase/schema.sql.",
  noRestaurantTitle: "Kontoen er ikke koblet til en restaurant",
  noRestaurantDetail: (email) => `${email} er logget inn, men står ikke som eier av noen restaurant.`,
  noRestaurantStep1: "Åpne supabase/merchant-setup.sql.",
  noRestaurantStep2: "Bytt ut e-postadressen med din egen.",
  noRestaurantStep3: "Kjør den i Supabase SQL Editor, og last denne siden på nytt.",
  databaseErrorTitle: "Databasen svarte ikke",

  newItem: "Ny rett",
  itemNotFound: "Fant ikke retten",
  search: "Søk",
  searchPlaceholder: "Navn eller beskrivelse",
  category: "Kategori",
  status: "Status",
  all: "Alle",
  available: "Tilgjengelig",
  soldOut: "Utsolgt",
  showingCount: (shown, total) => `Viser ${shown} av ${total} retter`,
  noItemsMatch: "Ingen retter passer søket.",
  deleteItemTitle: "Slette retten?",
  deleteItemBody: (name) =>
    `"${name}" blir borte fra menyen for godt, på alle språk. Dette kan ikke angres.`,
  deleteItemConfirm: "Slett retten",

  createItem: "Opprett rett",
  saveChanges: "Lagre endringer",
  chooseCategory: "Velg kategori",
  priceLabel: (code) => `Pris (${code})`,
  priceHint: "F.eks. 189 eller 189,50",
  sortOrder: "Rekkefølge",
  sortOrderHint: "Lavere tall kommer først i kategorien.",
  availableToggle: "Tilgjengelig",
  availableHint: "Skru av for å vise retten som utsolgt.",
  featured: "Husets favoritt",
  norwegian: "Norsk",
  chinese: "Kinesisk",
  imagePrompt: "AI-bildebeskrivelse (engelsk)",
  imagePromptHint:
    "Valgfritt. Beskriv retten på ENGELSK slik du vil at bildet skal se ut. Bildetjenesten forstår engelsk best — fyll inn dette hvis AI-bildet blir feil rett.",
  english: "Engelsk",
  name: "Navn",
  shortDescription: "Kort beskrivelse",
  shortDescriptionHint: "Vises på menykortet. Hold den kort.",
  longDescription: "Full beskrivelse",
  longDescriptionHint: "Vises på rettens egen side.",
  ingredients: "Ingredienser",
  ingredientsHint: "Skill med komma.",
  tags: "Merkelapper",
  tagsHint: "Allergener og kosthold styrer filtrene gjestene bruker.",
  tagDiet: "Kosthold",
  tagAllergen: "Allergener",
  tagHeat: "Styrke",
  tagInfo: "Annet",
  image: "Bilde",
  uploadImage: "Last opp nytt bilde",
  uploadImageHint: "JPG eller PNG. Erstatter det gamle.",
  removeImage: "Fjern bildet",
  backToList: "Tilbake til listen",

  generateImage: "Generer AI-bilde",
  generatingImage: "Lager bilde…",
  generateImageHint:
    "Lager et matbilde ut fra navnet og beskrivelsen, og lagrer det med én gang. Du kan laste opp ditt eget i stedet.",
  generateImageSaveFirst: "Lagre retten først, så kan du generere et bilde.",
  generateImageNeedsEnglish:
    "Tips: fyll inn det engelske navnet først. Bildetjenesten forstår engelsk best, og gjetter på norsk — da blir bildet fort feil rett.",
  aiPreviewLabel: "Nytt AI-bilde",

  newCategory: "Ny kategori",
  editCategory: (name) => `Rediger ${name}`,
  nameNorwegian: "Navn (norsk)",
  nameEnglish: "Name (English)",
  nameChinese: "Navn (kinesisk)",
  menu: "Meny",
  visibleOnMenu: "Synlig på menyen",
  visibleHint: "Skjul uten å slette.",
  visible: "Synlig",
  hidden: "Skjult",
  activeMenu: "Aktiv meny",
  dishCount: (n) => `${n} retter`,
  moveUp: (name) => `Flytt ${name} opp`,
  moveDown: (name) => `Flytt ${name} ned`,
  noCategoriesYet: "Ingen kategorier i denne menyen ennå.",
  deleteCategoryTitle: "Slette kategorien?",
  deleteCategoryBodyWithItems: (name, n) =>
    `"${name}" inneholder ${n} retter. De blir slettet sammen med kategorien, på alle språk. Dette kan ikke angres.`,
  deleteCategoryBody: (name) => `"${name}" blir slettet. Dette kan ikke angres.`,
  deleteCategoryConfirm: "Slett kategorien",

  newMenu: "Ny meny",
  editMenu: (name) => `Rediger ${name}`,
  menuNameHint: "F.eks. Lunsj, Middag, Drikkemeny",
  showingNow: "Vises nå",
  makeActive: "Gjør aktiv",
  cannotDelete: "Kan ikke slettes",
  menuStats: (categories, items) => `${categories} kategorier · ${items} retter`,
  menusExplainer:
    "Bare én meny kan vises til gjestene om gangen. Den aktive menyen kan ikke slettes — gjør en annen aktiv først. Hvilke retter som er med styres av kategoriene: flytt en kategori til en annen meny under Kategorier.",
  deleteMenuTitle: "Slette menyen?",
  deleteMenuBody: (name, categories, items) =>
    `"${name}" inneholder ${categories} kategorier og ${items} retter. Alt blir slettet sammen med menyen. Dette kan ikke angres.`,
  deleteMenuConfirm: "Slett menyen",

  chooseTheme: "Velg tema",
  chooseThemeHint: "Temaet gjelder for alle gjester som åpner menyen.",
  preview: "Forhåndsvisning",
  previewHint: "Slik ser menyen ut for gjestene.",
  saveTheme: "Lagre tema",
  adminStaysMono: "Admin forblir svart-hvitt uansett hvilket tema du velger.",

  nameAndLogo: "Navn og logo",
  uploadLogo: "Last opp logo",
  uploadLogoHint: "PNG med gjennomsiktig bakgrunn ser best ut.",
  removeLogo: "Fjern logoen",
  description: "Beskrivelse",
  contact: "Kontakt",
  address: "Adresse",
  mapsUrl: "Google Maps-lenke",
  mapsUrlHint: "Vises som «Vis på kart».",
  phone: "Telefon",
  phoneHint: "Gjesten kan trykke for å ringe.",
  email: "E-post",
  timezone: "Tidssone",
  timezoneHint: "Brukes til å regne ut «Åpen nå».",
  openingHours: "Åpningstider",
  openingHoursHint:
    "Tidene gjelder i restaurantens egen tidssone. Krysser stengetiden midnatt (f.eks. 18:00–01:00) håndteres det automatisk.",
  closed: "Stengt",
  opensAt: (day) => `${day} åpner`,
  closesAt: (day) => `${day} stenger`,
  socials: "Sosiale medier",
  socialsHint: "Tomme rader vises ikke.",
  socialName: "Navn",
  socialUrl: "Lenke",

  navOrders: "Bestillinger",
  ordersTitle: "Bestillinger",
  tabNew: "Nye",
  tabActive: "Pågår",
  tabReady: "Klare",
  tabCompleted: "Fullført",
  tabDeclined: "Avslått",
  noOrders: "Ingen bestillinger ennå.",
  noOrdersIn: (tab) => `Ingen bestillinger under «${tab}».`,
  orderNumber: (n) => `#${n}`,
  table: (n) => `Bord ${n}`,
  justNow: "nå nettopp",
  minutesAgo: (n) => (n === 1 ? "1 min siden" : `${n} min siden`),
  orderTotal: "Totalt",
  guestNote: "Melding fra gjesten",
  accept: "Godta",
  decline: "Avslå",
  startPreparing: "Start tilberedning",
  markReady: "Klar",
  complete: "Fullfør",
  declineTitle: "Avslå bestillingen?",
  declineBody: "Gjesten får beskjed med én gang, sammen med begrunnelsen du skriver.",
  declineReason: "Begrunnelse",
  declineReasonHint: "Valgfritt, men gjesten setter pris på å få vite hvorfor.",
  confirmDecline: "Avslå bestillingen",
  declinedBecause: (reason) => `Avslått: ${reason}`,
  newOrderBadge: "Ny",
  newOrderToast: (table, number) => `Ny bestilling! Bord ${table} – #${number}`,
  soundOn: "Lyd på",
  soundOff: "Lyd av",
  enableSound: "Slå på lyd",
  enableSoundHint: "Nettleseren krever ett klikk før den spiller av varsellyd.",
  notificationsAsk: "Slå på varsler",
  browserNotificationTitle: "Ny bestilling",
  tabTitleNewOrders: (n) => `(${n}) Nye bestillinger`,
  liveConnected: "Live",
  livePolling: "Oppdaterer",
  searchOrders: "Søk",
  searchOrdersPlaceholder: "Bordnummer, navn eller #nummer",
  dateFrom: "Fra dato",
  dateTo: "Til dato",
  clearFilters: "Nullstill",
  showingOrders: (shown, total) => `Viser ${shown} av ${total} bestillinger`,

  orderingSection: "Bestilling",
  orderingEnabled: "Ta imot bestillinger",
  orderingEnabledHint:
    "Når denne er av kan gjestene lese menyen, men ikke bestille. Bestilling er uansett stengt utenfor åpningstidene.",
  orderingClosedNowNote: "Stengt for bestilling akkurat nå.",
  orderingOpenNowNote: "Åpent for bestilling akkurat nå.",

  navQr: "QR-koder",
  qrTitle: "QR-koder",
  qrIntro:
    "Én kode per bord. Gjesten skanner, og bordnummeret fylles inn automatisk i bestillingen.",
  qrTables: "Bord",
  qrTablesHint: "Skriv inn antall bord, eller en liste som 1-12 eller 1,2,5,ute-1.",
  qrBaseUrl: "Nettadresse",
  qrBaseUrlHint: "Adressen menyen ligger på. Fylles inn automatisk fra nettleseren.",
  qrDownload: "Last ned",
  qrDownloadAll: "Last ned alle",
  qrTableLabel: (n) => `Bord ${n}`,
  qrPrint: "Skriv ut",


  result: {
    saved: "Lagret",
    themeSaved: "Tema lagret",
    itemSaved: "Retten er lagret",
    itemDeleted: "Retten er slettet",
    itemCopied: "Kopien er laget",
    itemCopiedMakeAvailable: "Kopien er laget — husk å gjøre den tilgjengelig",
    categoryDeleted: "Kategorien er slettet",
    menuActivated: "Menyen vises nå til gjestene",
    menuDeleted: "Menyen er slettet",
    menuActiveCannotDelete: "Den aktive menyen kan ikke slettes",
    imageGenerated: "Bildet er laget og lagret",
    signedOut: "Du er logget ut",
    notSignedIn: "Du er ikke logget inn.",
    supabaseMissing: "Supabase er ikke satt opp ennå.",
    badCredentials: "Feil e-post eller passord.",
    missingCredentials: "Fyll inn e-post og passord.",
    itemNeedsName: "Retten må ha et norsk navn.",
    itemNeedsCategory: "Velg en kategori.",
    priceMustBeNumber: "Prisen må være et tall.",
    categoryNeedsName: "Kategorien må ha et norsk navn.",
    categoryNeedsMenu: "Velg en meny.",
    menuNeedsName: "Menyen må ha et norsk navn.",
    restaurantNeedsName: "Restauranten må ha et navn.",
    unknownTheme: "Ukjent tema.",
    saveFailed: "Kunne ikke lagre.",
    createFailed: "Kunne ikke opprette.",
    textSaveFailed: "Kunne ikke lagre teksten.",
    tagSaveFailed: "Kunne ikke lagre merkelappene.",
    nameSaveFailed: "Kunne ikke lagre navnet.",
    descriptionSaveFailed: "Kunne ikke lagre beskrivelsen.",
    imageGenerationFailed: "Bildetjenesten svarte ikke. Prøv igjen om litt.",
    imageUploadFailed: "Kunne ikke lagre bildet i Supabase.",
    itemMissing: "Fant ikke retten.",
    orderUpdated: "Bestillingen er oppdatert",
    orderAccepted: "Bestillingen er godtatt",
    orderDeclined: "Bestillingen er avslått",
    orderCompleted: "Bestillingen er fullført",
    orderNotFound: "Fant ikke bestillingen.",
    orderingTurnedOn: "Bestilling er slått på",
    orderingTurnedOff: "Bestilling er slått av",
  },
};

const EN: AdminStrings = {
  admin: "Admin",
  viewMenu: "View menu",
  signOut: "Sign out",
  sections: "Sections",
  language: "Language",
  close: "Close",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  edit: "Edit",
  delete: "Delete",
  duplicate: "Duplicate",
  back: "Back",
  none: "None",

  navItems: "Dishes",
  navCategories: "Categories",
  navMenus: "Menus",
  navTheme: "Theme",
  navRestaurant: "Restaurant",

  loginTitle: "Sign in",
  loginIntro: "Sign in to edit the menu.",
  loginEmail: "Email",
  loginEmailPlaceholder: "hello@example.com",
  loginPassword: "Password",
  loginSubmit: "Sign in",
  loginPending: "Signing in…",
  loginFootnote:
    "No account? Accounts are created in the Supabase dashboard and linked to the restaurant with supabase/merchant-setup.sql. There is no self-signup — anyone who can create an account can edit the menu.",

  notConfiguredTitle: "Supabase is not set up",
  notConfiguredDetail:
    "The admin needs the database. Fill in .env.local and run supabase/schema.sql.",
  noRestaurantTitle: "This account is not linked to a restaurant",
  noRestaurantDetail: (email) => `${email} is signed in but does not own any restaurant.`,
  noRestaurantStep1: "Open supabase/merchant-setup.sql.",
  noRestaurantStep2: "Replace the email address with your own.",
  noRestaurantStep3: "Run it in the Supabase SQL editor, then reload this page.",
  databaseErrorTitle: "The database did not answer",

  newItem: "New dish",
  itemNotFound: "Dish not found",
  search: "Search",
  searchPlaceholder: "Name or description",
  category: "Category",
  status: "Status",
  all: "All",
  available: "Available",
  soldOut: "Sold out",
  showingCount: (shown, total) => `Showing ${shown} of ${total} dishes`,
  noItemsMatch: "No dishes match that search.",
  deleteItemTitle: "Delete this dish?",
  deleteItemConfirm: "Delete the dish",
  deleteItemBody: (name) =>
    `"${name}" will be removed from the menu for good, in every language. This cannot be undone.`,

  createItem: "Create dish",
  saveChanges: "Save changes",
  chooseCategory: "Choose a category",
  priceLabel: (code) => `Price (${code})`,
  priceHint: "E.g. 189 or 189.50",
  sortOrder: "Order",
  sortOrderHint: "Lower numbers come first inside the category.",
  availableToggle: "Available",
  availableHint: "Turn off to show the dish as sold out.",
  featured: "House favourite",
  norwegian: "Norwegian",
  chinese: "Chinese",
  imagePrompt: "AI image description (English)",
  imagePromptHint:
    "Optional. Describe the dish in ENGLISH as you want the photo to look. The image service understands English best — fill this in when the AI keeps getting a dish wrong.",
  english: "English",
  name: "Name",
  shortDescription: "Short description",
  shortDescriptionHint: "Shown on the menu card. Keep it short.",
  longDescription: "Full description",
  longDescriptionHint: "Shown on the dish's own page.",
  ingredients: "Ingredients",
  ingredientsHint: "Separate with commas.",
  tags: "Tags",
  tagsHint: "Allergens and diets drive the filters your guests use.",
  tagDiet: "Diet",
  tagAllergen: "Allergens",
  tagHeat: "Heat",
  tagInfo: "Other",
  image: "Photo",
  uploadImage: "Upload a new photo",
  uploadImageHint: "JPG or PNG. Replaces the old one.",
  removeImage: "Remove the photo",
  backToList: "Back to the list",

  generateImage: "Generate AI photo",
  generatingImage: "Generating…",
  generateImageHint:
    "Makes a food photo from the name and description and saves it straight away. You can upload your own instead.",
  generateImageSaveFirst: "Save the dish first, then you can generate a photo.",
  generateImageNeedsEnglish:
    "Tip: fill in the English name first. The image service understands English best and guesses at Norwegian — which is how you get a picture of the wrong dish.",
  aiPreviewLabel: "New AI photo",

  newCategory: "New category",
  editCategory: (name) => `Edit ${name}`,
  nameNorwegian: "Name (Norwegian)",
  nameEnglish: "Name (English)",
  nameChinese: "Name (Chinese)",
  menu: "Menu",
  visibleOnMenu: "Visible on the menu",
  visibleHint: "Hide without deleting.",
  visible: "Visible",
  hidden: "Hidden",
  activeMenu: "Active menu",
  dishCount: (n) => `${n} dishes`,
  moveUp: (name) => `Move ${name} up`,
  moveDown: (name) => `Move ${name} down`,
  noCategoriesYet: "No categories in this menu yet.",
  deleteCategoryTitle: "Delete this category?",
  deleteCategoryBodyWithItems: (name, n) =>
    `"${name}" holds ${n} dishes. They will be deleted along with the category, in every language. This cannot be undone.`,
  deleteCategoryBody: (name) => `"${name}" will be deleted. This cannot be undone.`,
  deleteCategoryConfirm: "Delete the category",

  newMenu: "New menu",
  editMenu: (name) => `Edit ${name}`,
  menuNameHint: "E.g. Lunch, Dinner, Drinks",
  showingNow: "Live now",
  makeActive: "Make active",
  cannotDelete: "Cannot be deleted",
  menuStats: (categories, items) => `${categories} categories · ${items} dishes`,
  menusExplainer:
    "Only one menu can be shown to guests at a time. The active menu cannot be deleted — make another one active first. Which dishes are included is decided by the categories: move a category to another menu under Categories.",
  deleteMenuTitle: "Delete this menu?",
  deleteMenuBody: (name, categories, items) =>
    `"${name}" holds ${categories} categories and ${items} dishes. All of it will be deleted along with the menu. This cannot be undone.`,
  deleteMenuConfirm: "Delete the menu",

  chooseTheme: "Choose a theme",
  chooseThemeHint: "The theme applies to every guest who opens the menu.",
  preview: "Preview",
  previewHint: "This is how the menu looks to your guests.",
  saveTheme: "Save theme",
  adminStaysMono: "The admin stays black and white whichever theme you choose.",

  nameAndLogo: "Name and logo",
  uploadLogo: "Upload a logo",
  uploadLogoHint: "A PNG with a transparent background looks best.",
  removeLogo: "Remove the logo",
  description: "Description",
  contact: "Contact",
  address: "Address",
  mapsUrl: "Google Maps link",
  mapsUrlHint: "Shown as “Show on map”.",
  phone: "Phone",
  phoneHint: "Guests can tap to call.",
  email: "Email",
  timezone: "Time zone",
  timezoneHint: "Used to work out “Open now”.",
  openingHours: "Opening hours",
  openingHoursHint:
    "Times are in the restaurant's own time zone. A closing time after midnight (e.g. 18:00–01:00) is handled automatically.",
  closed: "Closed",
  opensAt: (day) => `${day} opens`,
  closesAt: (day) => `${day} closes`,
  socials: "Social media",
  socialsHint: "Empty rows are not shown.",
  socialName: "Name",
  socialUrl: "Link",

  navOrders: "Orders",
  ordersTitle: "Orders",
  tabNew: "New",
  tabActive: "In progress",
  tabReady: "Ready",
  tabCompleted: "Completed",
  tabDeclined: "Declined",
  noOrders: "No orders yet.",
  noOrdersIn: (tab) => `No orders under “${tab}”.`,
  orderNumber: (n) => `#${n}`,
  table: (n) => `Table ${n}`,
  justNow: "just now",
  minutesAgo: (n) => (n === 1 ? "1 min ago" : `${n} min ago`),
  orderTotal: "Total",
  guestNote: "Message from the guest",
  accept: "Accept",
  decline: "Decline",
  startPreparing: "Start preparing",
  markReady: "Ready",
  complete: "Complete",
  declineTitle: "Decline this order?",
  declineBody: "The guest is told straight away, along with whatever reason you give.",
  declineReason: "Reason",
  declineReasonHint: "Optional, but guests appreciate knowing why.",
  confirmDecline: "Decline the order",
  declinedBecause: (reason) => `Declined: ${reason}`,
  newOrderBadge: "New",
  newOrderToast: (table, number) => `New order! Table ${table} – #${number}`,
  soundOn: "Sound on",
  soundOff: "Sound off",
  enableSound: "Turn sound on",
  enableSoundHint: "Browsers need one click before they will play an alert sound.",
  notificationsAsk: "Turn on notifications",
  browserNotificationTitle: "New order",
  tabTitleNewOrders: (n) => `(${n}) New orders`,
  liveConnected: "Live",
  livePolling: "Refreshing",
  searchOrders: "Search",
  searchOrdersPlaceholder: "Table, name or #number",
  dateFrom: "From",
  dateTo: "To",
  clearFilters: "Clear",
  showingOrders: (shown, total) => `Showing ${shown} of ${total} orders`,

  orderingSection: "Ordering",
  orderingEnabled: "Accept orders",
  orderingEnabledHint:
    "With this off, guests can read the menu but not order. Ordering is closed outside opening hours either way.",
  orderingClosedNowNote: "Closed for orders right now.",
  orderingOpenNowNote: "Open for orders right now.",

  navQr: "QR codes",
  qrTitle: "QR codes",
  qrIntro:
    "One code per table. The guest scans it and the table number fills itself in on their order.",
  qrTables: "Tables",
  qrTablesHint: "Enter how many tables you have, or a list like 1-12 or 1,2,5,patio-1.",
  qrBaseUrl: "Web address",
  qrBaseUrlHint: "Where the menu lives. Filled in automatically from your browser.",
  qrDownload: "Download",
  qrDownloadAll: "Download all",
  qrTableLabel: (n) => `Table ${n}`,
  qrPrint: "Print",


  result: {
    saved: "Saved",
    themeSaved: "Theme saved",
    itemSaved: "Dish saved",
    itemDeleted: "Dish deleted",
    itemCopied: "Copy created",
    itemCopiedMakeAvailable: "Copy created — remember to make it available",
    categoryDeleted: "Category deleted",
    menuActivated: "That menu is now live for guests",
    menuDeleted: "Menu deleted",
    menuActiveCannotDelete: "The active menu cannot be deleted",
    imageGenerated: "Photo generated and saved",
    signedOut: "You are signed out",
    notSignedIn: "You are not signed in.",
    supabaseMissing: "Supabase is not set up yet.",
    badCredentials: "Wrong email or password.",
    missingCredentials: "Enter an email and a password.",
    itemNeedsName: "The dish needs a Norwegian name.",
    itemNeedsCategory: "Choose a category.",
    priceMustBeNumber: "The price has to be a number.",
    categoryNeedsName: "The category needs a Norwegian name.",
    categoryNeedsMenu: "Choose a menu.",
    menuNeedsName: "The menu needs a Norwegian name.",
    restaurantNeedsName: "The restaurant needs a name.",
    unknownTheme: "Unknown theme.",
    saveFailed: "Could not save.",
    createFailed: "Could not create.",
    textSaveFailed: "Could not save the text.",
    tagSaveFailed: "Could not save the tags.",
    nameSaveFailed: "Could not save the name.",
    descriptionSaveFailed: "Could not save the description.",
    imageGenerationFailed: "The image service did not answer. Try again shortly.",
    imageUploadFailed: "Could not save the photo to Supabase.",
    itemMissing: "Dish not found.",
    orderUpdated: "Order updated",
    orderAccepted: "Order accepted",
    orderDeclined: "Order declined",
    orderCompleted: "Order completed",
    orderNotFound: "Order not found.",
    orderingTurnedOn: "Ordering is on",
    orderingTurnedOff: "Ordering is off",
  },
};

/**
 * The keys whose value is a plain string — i.e. everything except the
 * functions and the `result` table. Lets a component take a key as a prop
 * and still be type-safe about it.
 */
export type AdminTextKey = {
  [K in keyof AdminStrings]: AdminStrings[K] extends string ? K : never;
}[keyof AdminStrings];

const TABLES: Record<AdminLocale, AdminStrings> = { nb: NB, en: EN };

export function adminStrings(locale: string): AdminStrings {
  return isAdminLocale(locale) ? TABLES[locale] : TABLES[DEFAULT_ADMIN_LOCALE];
}

/**
 * A merchant-written name, in the admin's language.
 *
 * Falls back to Norwegian and then to the slug. Dish and category names are
 * the merchant's own text, so an English admin still shows the Norwegian name
 * when no English one has been written — a blank row would be worse.
 */
export function adminName(names: Translated | undefined, locale: string, slug: string): string {
  return names?.[locale] || names?.nb || slug;
}
