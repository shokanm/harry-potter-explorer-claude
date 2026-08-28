import type { HouseSlug } from "@/lib/content/houses";
import type { Localized } from "@/lib/i18n/types";

export interface SortingOption {
  id: string;
  text: Localized;
  /** Сколько очков вариант приносит каждому факультету. */
  weights: Partial<Record<HouseSlug, number>>;
}

export interface SortingQuestion {
  id: string;
  text: Localized;
  options: SortingOption[];
}

/**
 * Опрос Распределяющей шляпы.
 *
 * Веса — не украшение: факультет считается на сервере арифметикой, и только
 * речь Шляпы пишет языковая модель. Если ключа LLM нет или квота исчерпана,
 * распределение всё равно работает — пропадает только красноречие.
 */
export const SORTING_QUESTIONS: SortingQuestion[] = [
  {
    id: "fear",
    text: {
      ru: "Чего вы боитесь по-настоящему?",
      en: "What do you actually fear?",
    },
    options: [
      {
        id: "irrelevance",
        text: { ru: "Прожить жизнь и остаться никем", en: "Living a whole life and amounting to nothing" },
        weights: { slytherin: 3, gryffindor: 1 },
      },
      {
        id: "cowardice",
        text: { ru: "Струсить в тот момент, когда всё решится", en: "Losing my nerve at the moment it counts" },
        weights: { gryffindor: 3, hufflepuff: 1 },
      },
      {
        id: "ignorance",
        text: { ru: "Не понять чего-то важного, что было прямо перед глазами", en: "Missing something important that was right in front of me" },
        weights: { ravenclaw: 3, slytherin: 1 },
      },
      {
        id: "betrayal",
        text: { ru: "Что близкие останутся одни, а меня рядом не будет", en: "That people I love will be alone and I will not be there" },
        weights: { hufflepuff: 3, gryffindor: 1 },
      },
    ],
  },
  {
    id: "corridor",
    text: {
      ru: "В коридоре Хогвартса дверь, которой вчера не было. Вы…",
      en: "There is a door in the corridor that was not there yesterday. You…",
    },
    options: [
      {
        id: "open",
        text: { ru: "Открываете. Сейчас же", en: "Open it. Right now" },
        weights: { gryffindor: 3 },
      },
      {
        id: "study",
        text: { ru: "Сначала выясняете, что это за дверь и почему она появилась", en: "First work out what the door is and why it appeared" },
        weights: { ravenclaw: 3 },
      },
      {
        id: "leverage",
        text: { ru: "Запоминаете. Такое знание однажды пригодится", en: "Memorise it. Knowledge like that pays off eventually" },
        weights: { slytherin: 3 },
      },
      {
        id: "tell",
        text: { ru: "Зовёте того, кто отвечает за замок", en: "Fetch someone whose job it is to know" },
        weights: { hufflepuff: 3 },
      },
    ],
  },
  {
    id: "remembered",
    text: {
      ru: "Как вы хотите, чтобы вас запомнили?",
      en: "How would you like to be remembered?",
    },
    options: [
      {
        id: "brave",
        text: { ru: "Как человека, который не отступил", en: "As someone who did not back down" },
        weights: { gryffindor: 3 },
      },
      {
        id: "wise",
        text: { ru: "Как человека, который понял то, чего не поняли другие", en: "As someone who understood what others did not" },
        weights: { ravenclaw: 3 },
      },
      {
        id: "great",
        text: { ru: "Как человека, который изменил порядок вещей", en: "As someone who changed how things are done" },
        weights: { slytherin: 3 },
      },
      {
        id: "kind",
        text: { ru: "Как человека, на которого можно было положиться", en: "As someone who could be relied on" },
        weights: { hufflepuff: 3 },
      },
    ],
  },
  {
    id: "unfair",
    text: {
      ru: "При вас несправедливо наказали однокурсника. Вы…",
      en: "A classmate is punished unfairly in front of you. You…",
    },
    options: [
      {
        id: "confront",
        text: { ru: "Возражаете вслух, даже если прилетит и вам", en: "Object out loud, even if it lands on you too" },
        weights: { gryffindor: 3 },
      },
      {
        id: "evidence",
        text: { ru: "Молча собираете доказательства и приходите с ними позже", en: "Quietly gather proof and come back with it later" },
        weights: { ravenclaw: 2, slytherin: 2 },
      },
      {
        id: "support",
        text: { ru: "Ищете его после и просто остаётесь рядом", en: "Find them afterwards and simply stay with them" },
        weights: { hufflepuff: 3 },
      },
      {
        id: "useful",
        text: { ru: "Запоминаете, кто и как повёл себя. Это пригодится", en: "Note who behaved how. That will be useful" },
        weights: { slytherin: 3 },
      },
    ],
  },
  {
    id: "work",
    text: {
      ru: "Что даётся вам легче всего?",
      en: "What comes easiest to you?",
    },
    options: [
      {
        id: "persist",
        text: { ru: "Делать скучное дело до конца, когда все уже бросили", en: "Finishing dull work long after everyone else quit" },
        weights: { hufflepuff: 3 },
      },
      {
        id: "learn",
        text: { ru: "Разбираться в незнакомом быстрее остальных", en: "Getting to grips with something new faster than others" },
        weights: { ravenclaw: 3 },
      },
      {
        id: "persuade",
        text: { ru: "Убеждать людей делать то, что нужно вам", en: "Persuading people to do what I need" },
        weights: { slytherin: 3 },
      },
      {
        id: "act",
        text: { ru: "Действовать первым, пока другие совещаются", en: "Acting first while others are still discussing" },
        weights: { gryffindor: 3 },
      },
    ],
  },
  {
    id: "mirror",
    text: {
      ru: "Зеркало Еиналеж показало бы вам…",
      en: "The Mirror of Erised would show you…",
    },
    options: [
      {
        id: "family",
        text: { ru: "Тех, кого рядом больше нет", en: "The people who are no longer here" },
        weights: { hufflepuff: 2, gryffindor: 2 },
      },
      {
        id: "answer",
        text: { ru: "Ответ на вопрос, который не даёт вам покоя", en: "The answer to the question that will not let you rest" },
        weights: { ravenclaw: 3 },
      },
      {
        id: "throne",
        text: { ru: "Себя — там, куда вы идёте", en: "Myself, standing where I am headed" },
        weights: { slytherin: 3 },
      },
      {
        id: "nothing",
        text: { ru: "Себя же. Мне нечего добавить", en: "Myself, exactly as I am. Nothing to add" },
        weights: { gryffindor: 2, hufflepuff: 2 },
      },
    ],
  },
  {
    id: "price",
    text: {
      ru: "Ради важной цели вы готовы…",
      en: "For something that matters, you are willing to…",
    },
    options: [
      {
        id: "risk",
        text: { ru: "Рискнуть собой", en: "Risk myself" },
        weights: { gryffindor: 3 },
      },
      {
        id: "rules",
        text: { ru: "Нарушить правила", en: "Break the rules" },
        weights: { slytherin: 2, gryffindor: 1 },
      },
      {
        id: "time",
        text: { ru: "Потратить годы", en: "Spend years on it" },
        weights: { ravenclaw: 2, hufflepuff: 2 },
      },
      {
        id: "comfort",
        text: { ru: "Отказаться от собственного покоя", en: "Give up my own peace and quiet" },
        weights: { hufflepuff: 3 },
      },
    ],
  },
];

/** Ответы → факультет. Чистая арифметика, работает без сети и без LLM. */
export function scoreAnswers(answers: Record<string, string>): {
  house: HouseSlug;
  scores: Record<HouseSlug, number>;
} {
  const scores: Record<HouseSlug, number> = {
    gryffindor: 0,
    slytherin: 0,
    ravenclaw: 0,
    hufflepuff: 0,
  };

  for (const question of SORTING_QUESTIONS) {
    const chosen = question.options.find((option) => option.id === answers[question.id]);
    if (!chosen) continue;
    for (const [house, weight] of Object.entries(chosen.weights)) {
      scores[house as HouseSlug] += weight ?? 0;
    }
  }

  // При равенстве побеждает факультет, набравший очки в большем числе вопросов;
  // порядок в списке фиксирован, поэтому результат воспроизводим.
  const house = (Object.keys(scores) as HouseSlug[]).reduce((best, current) =>
    scores[current] > scores[best] ? current : best,
  );

  return { house, scores };
}
