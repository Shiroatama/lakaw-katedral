import type { PlaceQuest } from "./types";

/**
 * The visitor's current answer to a quest.
 * - cloze / choice: the tapped label (or null)
 * - select_all: the tapped labels
 * - order: the cards in the order the visitor arranged them
 * - count: the stepper value
 *
 * Pure functions: no framework imports, reusable by a future Expo app.
 */
export type QuestAnswer = string | string[] | number | null;

/** Wrong submits before a gentle hint highlights the answer. */
export const HINT_AFTER_MISSES = 3;

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((item, index) => item === right[index]);
}

/** Fisher-Yates copy that never returns the solved order. */
export function shuffleOrder<T>(items: readonly T[], random = Math.random): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  if (list.length > 1 && list.every((item, index) => item === items[index])) {
    const last = list.pop() as T;
    list.unshift(last);
  }
  return list;
}

/** The answer a fresh quest sheet starts with. Order is shuffled. */
export function initialAnswer(
  quest: PlaceQuest,
  random: () => number = Math.random,
): QuestAnswer {
  switch (quest.type) {
    case "cloze":
    case "choice":
      return null;
    case "select_all":
      return [];
    case "order":
      return shuffleOrder(quest.orderItems, random);
    case "count":
      return quest.count.min;
  }
}

/** True when Check can be pressed. */
export function isAnswerReady(quest: PlaceQuest, answer: QuestAnswer): boolean {
  switch (quest.type) {
    case "cloze":
    case "choice":
      return typeof answer === "string" && answer.length > 0;
    case "select_all":
      return Array.isArray(answer) && answer.length > 0;
    case "order":
      return Array.isArray(answer) && answer.length === quest.orderItems.length;
    case "count":
      return typeof answer === "number";
  }
}

/**
 * Normalized check per type: set equality for select_all, exact sequence for
 * order, number for count, string match for cloze and choice.
 */
export function isQuestCorrect(
  quest: PlaceQuest,
  answer: QuestAnswer,
): boolean {
  switch (quest.type) {
    case "cloze":
      return answer === quest.cloze.answer;
    case "choice":
      return answer === quest.answer;
    case "count":
      return answer === quest.count.answer;
    case "select_all":
      return Array.isArray(answer) && sameSet(answer, quest.selectAll.answers);
    case "order":
      return (
        Array.isArray(answer) &&
        answer.length === quest.orderItems.length &&
        answer.every((item, index) => item === quest.orderItems[index])
      );
  }
}

/** The right answer, used by the hint after repeated misses. */
export function correctAnswer(quest: PlaceQuest): QuestAnswer {
  switch (quest.type) {
    case "cloze":
      return quest.cloze.answer;
    case "choice":
      return quest.answer;
    case "count":
      return quest.count.answer;
    case "select_all":
      return [...quest.selectAll.answers];
    case "order":
      return [...quest.orderItems];
  }
}

/** The nudge for the nth miss (1-based). Stays on the last line past the end. */
export function nudgeFor(quest: PlaceQuest, misses: number): string {
  const index = Math.min(Math.max(misses, 1), quest.nudges.length) - 1;
  return quest.nudges[index] ?? "Not quite. Look again.";
}

/** Every label the quest can show as a tap target, for dev checks. */
export function questLabels(quest: PlaceQuest): string[] {
  switch (quest.type) {
    case "cloze":
      return quest.cloze.chips;
    case "choice":
      return quest.choices;
    case "select_all":
      return quest.selectAll.options;
    case "order":
      return [...quest.orderItems];
    case "count":
      return [];
  }
}
