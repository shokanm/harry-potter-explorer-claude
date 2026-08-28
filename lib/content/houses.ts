import type { Localized } from "@/lib/i18n/types";

export type HouseSlug = "gryffindor" | "slytherin" | "ravenclaw" | "hufflepuff";

export interface House {
  slug: HouseSlug;
  /** Название так, как его отдаёт hp-api — по нему матчим персонажей. */
  apiName: "Gryffindor" | "Slytherin" | "Ravenclaw" | "Hufflepuff";
  name: Localized;
  founder: Localized;
  animal: Localized;
  element: Localized;
  ghost: Localized;
  head: Localized;
  commonRoom: Localized;
  traits: { ru: string[]; en: string[] };
  motto: Localized;
  description: Localized;
  /** Малоизвестный факт — на карточке факультета. */
  lore: Localized;
  colors: {
    /** Геральдические названия — выводим на странице факультета. */
    label: Localized;
    primary: string;
    secondary: string;
    /** Мягкий фон под тему страницы. */
    tint: string;
    /** Контрастный цвет текста поверх primary. */
    ink: string;
  };
}

export const HOUSES: House[] = [
  {
    slug: "gryffindor",
    apiName: "Gryffindor",
    name: { ru: "Гриффиндор", en: "Gryffindor" },
    founder: { ru: "Годрик Гриффиндор", en: "Godric Gryffindor" },
    animal: { ru: "Лев", en: "Lion" },
    element: { ru: "Огонь", en: "Fire" },
    ghost: { ru: "Почти Безголовый Ник", en: "Nearly Headless Nick" },
    head: { ru: "Минерва Макгонагалл", en: "Minerva McGonagall" },
    commonRoom: {
      ru: "Башня Гриффиндора, вход за портретом Полной Дамы",
      en: "Gryffindor Tower, behind the portrait of the Fat Lady",
    },
    traits: {
      ru: ["Храбрость", "Отвага", "Благородство", "Решимость"],
      en: ["Courage", "Bravery", "Chivalry", "Nerve"],
    },
    motto: {
      ru: "Смелость — это не отсутствие страха, а решение действовать вопреки ему",
      en: "Courage is not the absence of fear, but the choice to act in spite of it",
    },
    description: {
      ru: "Факультет тех, кто идёт первым. Годрик Гриффиндор ценил не безрассудство, а готовность встать между опасностью и тем, кто слабее. Гриффиндорцы чаще других попадают в неприятности — и чаще других вытаскивают из них остальных.",
      en: "The house of those who go first. Godric Gryffindor prized not recklessness but the willingness to stand between danger and someone weaker. Gryffindors find trouble more often than most — and pull others out of it more often, too.",
    },
    lore: {
      ru: "Меч Гриффиндора сделан гоблинами из чистого серебра и впитывает лишь то, что делает его сильнее. Именно поэтому яд василиска превратил его в оружие против крестражей.",
      en: "Gryffindor's sword is goblin-made of pure silver and imbibes only that which strengthens it. That is precisely why basilisk venom turned it into a weapon against Horcruxes.",
    },
    colors: {
      label: { ru: "Алый и золотой", en: "Scarlet and gold" },
      primary: "#7f0909",
      secondary: "#d3a625",
      tint: "#2a0a0a",
      ink: "#ffd970",
    },
  },
  {
    slug: "slytherin",
    apiName: "Slytherin",
    name: { ru: "Слизерин", en: "Slytherin" },
    founder: { ru: "Салазар Слизерин", en: "Salazar Slytherin" },
    animal: { ru: "Змея", en: "Serpent" },
    element: { ru: "Вода", en: "Water" },
    ghost: { ru: "Кровавый Барон", en: "The Bloody Baron" },
    head: { ru: "Северус Снегг, затем Гораций Слизнорт", en: "Severus Snape, later Horace Slughorn" },
    commonRoom: {
      ru: "Подземелья под Чёрным озером — сквозь окна видно воду",
      en: "The dungeons beneath the Black Lake — the windows look out into the water",
    },
    traits: {
      ru: ["Амбициозность", "Хитрость", "Находчивость", "Лидерство"],
      en: ["Ambition", "Cunning", "Resourcefulness", "Leadership"],
    },
    motto: {
      ru: "Величие рождается не из удачи, а из умысла",
      en: "Greatness is born of intent, not of luck",
    },
    description: {
      ru: "Факультет цели и расчёта. Слизеринцы знают, чего хотят, и знают дорогу туда. Репутация тёмного факультета несправедлива ровно наполовину: амбиция сама по себе не порок, и лучшие представители Слизерина доказывали это ценой собственной жизни.",
      en: "The house of purpose and calculation. Slytherins know what they want and know the road there. Its dark reputation is exactly half-deserved: ambition is not a vice in itself, and Slytherin's finest proved it at the cost of their own lives.",
    },
    lore: {
      ru: "Тайную комнату Салазар оставил не как оружие, а как условие: она открывается лишь наследнику. Полторы тысячи лет школа не могла её найти — вход был в туалете для девочек.",
      en: "Salazar left the Chamber of Secrets not as a weapon but as a condition: it opens only to his heir. For a thousand years the school could not find it — the entrance was in a girls' bathroom.",
    },
    colors: {
      label: { ru: "Изумрудный и серебряный", en: "Emerald and silver" },
      primary: "#1a472a",
      secondary: "#aaaaaa",
      tint: "#0a1f14",
      ink: "#7fd4a0",
    },
  },
  {
    slug: "ravenclaw",
    apiName: "Ravenclaw",
    name: { ru: "Когтевран", en: "Ravenclaw" },
    founder: { ru: "Кандида Когтевран", en: "Rowena Ravenclaw" },
    animal: { ru: "Орёл", en: "Eagle" },
    element: { ru: "Воздух", en: "Air" },
    ghost: { ru: "Серая Дама", en: "The Grey Lady" },
    head: { ru: "Филиус Флитвик", en: "Filius Flitwick" },
    commonRoom: {
      ru: "Башня на западе замка: вместо пароля — загадка от дверного молотка",
      en: "A west tower: instead of a password, a riddle from the bronze knocker",
    },
    traits: {
      ru: ["Ум", "Мудрость", "Любознательность", "Остроумие"],
      en: ["Intelligence", "Wisdom", "Curiosity", "Wit"],
    },
    motto: {
      ru: "Ума палата дороже любого сокровища",
      en: "Wit beyond measure is man's greatest treasure",
    },
    description: {
      ru: "Факультет вопроса, а не ответа. Сюда попадают те, кому интересно устройство вещей само по себе, без практической пользы. Дверь в гостиную не пускает по паролю — только по решённой загадке, так что запертый снаружи первокурсник учится думать быстрее всех в школе.",
      en: "The house of the question, not the answer. It takes those curious about how things work for its own sake, with no practical use in mind. The common-room door admits no password — only a solved riddle — so a first-year locked outside learns to think faster than anyone in the school.",
    },
    lore: {
      ru: "Диадема Кандиды пропала при жизни основательницы: её украла собственная дочь, Елена. Та самая Серая Дама, что теперь плавает по башне и тысячу лет молчала об этом.",
      en: "Rowena's diadem vanished in the founder's own lifetime: her daughter Helena stole it. The same Grey Lady who now drifts through the tower, silent about it for a thousand years.",
    },
    colors: {
      label: { ru: "Синий и бронзовый", en: "Blue and bronze" },
      primary: "#0e1a40",
      secondary: "#946b2d",
      tint: "#080f26",
      ink: "#8fb0ff",
    },
  },
  {
    slug: "hufflepuff",
    apiName: "Hufflepuff",
    name: { ru: "Пуффендуй", en: "Hufflepuff" },
    founder: { ru: "Пенелопа Пуффендуй", en: "Helga Hufflepuff" },
    animal: { ru: "Барсук", en: "Badger" },
    element: { ru: "Земля", en: "Earth" },
    ghost: { ru: "Толстый Проповедник", en: "The Fat Friar" },
    head: { ru: "Помона Стебль", en: "Pomona Sprout" },
    commonRoom: {
      ru: "Подвал рядом с кухней: круглые окна вровень с землёй и всегда тепло",
      en: "A basement by the kitchens: round windows at ground level, and always warm",
    },
    traits: {
      ru: ["Трудолюбие", "Верность", "Терпение", "Честность"],
      en: ["Hard work", "Loyalty", "Patience", "Fair play"],
    },
    motto: {
      ru: "Брать всех и учить одинаково",
      en: "Take the lot, and treat them all the same",
    },
    description: {
      ru: "Единственный факультет без вступительного условия: Пенелопа Пуффендуй брала всех, кого не взяли остальные трое. Из этого выросла не посредственность, а редкое качество — Пуффендуй дал школе меньше всего тёмных волшебников и больше всего тех, кто остаётся, когда становится трудно.",
      en: "The only house with no entry condition: Helga Hufflepuff took everyone the other three passed over. What grew from that was not mediocrity but something rarer — Hufflepuff produced the fewest dark wizards of any house, and the most people who stay when things get hard.",
    },
    lore: {
      ru: "Вход в гостиную открывает ритм: постучать по нужной бочке в ритме «Пе-не-ло-па Пуф-фен-дуй». Ошибёшься бочкой — окатит уксусом.",
      en: "The common room opens to a rhythm: tap the right barrel to the beat of 'Hel-ga Huff-le-puff'. Choose the wrong barrel and you get doused in vinegar.",
    },
    colors: {
      label: { ru: "Жёлтый и чёрный", en: "Yellow and black" },
      primary: "#ecb939",
      secondary: "#372e29",
      tint: "#2b2113",
      ink: "#ffd86b",
    },
  },
];

export const HOUSE_BY_SLUG: Record<HouseSlug, House> = Object.fromEntries(
  HOUSES.map((h) => [h.slug, h]),
) as Record<HouseSlug, House>;

export function houseBySlug(slug: string): House | undefined {
  return HOUSE_BY_SLUG[slug.toLowerCase() as HouseSlug];
}

/** hp-api отдаёт "Gryffindor" — переводим в наш slug. */
export function houseSlugFromApi(apiName: string | null | undefined): HouseSlug | null {
  if (!apiName) return null;
  const found = HOUSES.find((h) => h.apiName.toLowerCase() === apiName.toLowerCase());
  return found ? found.slug : null;
}
