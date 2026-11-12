"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { Btn } from "@/components/ui";
import {
  HINT_AFTER_MISSES,
  correctAnswer,
  initialAnswer,
  isAnswerReady,
  isQuestCorrect,
  nudgeFor,
  type PlaceQuest,
  type QuestAnswer,
} from "@/lib/tour";

/** How long wrong marks stay before the controls reset. */
const WRONG_FLASH_MS = 420;

type QuestSheetProps = {
  quest: PlaceQuest;
  /** Imperative line from the place ("Look up at the ceiling"). */
  action: string;
  open: boolean;
  /**
   * Bumps each time the sheet opens. A fresh session remounts the answer
   * controls, so an order quest reshuffles and nothing carries over.
   */
  session: number;
  onClose: () => void;
  /** Called once, right after a correct Check. The page celebrates, then closes. */
  onCorrect: () => void;
};

/**
 * Light sheet that rises over the place. Tap-only: cloze chips, order cards,
 * a count stepper, select-all chips, or a single choice grid. Check, then a
 * miss gives a nudge, and after a few misses a gentle hint.
 */
export function QuestSheet({
  quest,
  action,
  open,
  session,
  onClose,
  onCorrect,
}: QuestSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus the panel without scrolling the page behind it.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      panelRef.current?.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(id);
  }, [open]);

  function shake() {
    const panel = panelRef.current;
    if (!panel) return;
    panel.classList.remove("is-shake");
    void panel.offsetWidth;
    panel.classList.add("is-shake");
  }

  return (
    <div
      className="quest-root"
      data-open={open ? "true" : "false"}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <button
        type="button"
        className="quest-backdrop"
        aria-label="Close quest"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="quest-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quest-panel-title"
        tabIndex={-1}
      >
        <div className="quest-panel-head">
          <h2 className="quest-panel-title" id="quest-panel-title">
            Your quest
          </h2>
          <button
            type="button"
            className="quest-close"
            aria-label="Close"
            onClick={onClose}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {session > 0 ? (
          <QuestBody
            key={session}
            quest={quest}
            action={action}
            onMiss={shake}
            onCorrect={onCorrect}
          />
        ) : null}
      </div>
    </div>
  );
}

type QuestBodyProps = {
  quest: PlaceQuest;
  action: string;
  onMiss: () => void;
  onCorrect: () => void;
};

function sameList(a: string[], b: string[]) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function QuestBody({ quest, action, onMiss, onCorrect }: QuestBodyProps) {
  // The initial answer shuffles order quests, so this only ever runs on the
  // client after the sheet is opened (never during server render).
  const [answer, setAnswer] = useState<QuestAnswer>(() => initialAnswer(quest));
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hinted, setHinted] = useState(false);
  const [locked, setLocked] = useState(false);
  /** The wrong answer, shown in the wrong colors for a moment. */
  const [wrong, setWrong] = useState<QuestAnswer | undefined>(undefined);
  const flashTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const ready = !locked && isAnswerReady(quest, answer);
  const solution = correctAnswer(quest);

  function change(next: QuestAnswer) {
    if (locked) return;
    setAnswer(next);
    setFeedback("");
    setWrong(undefined);
  }

  function check() {
    if (locked || !isAnswerReady(quest, answer)) return;

    if (isQuestCorrect(quest, answer)) {
      setLocked(true);
      setFeedback("");
      setWrong(undefined);
      onCorrect();
      return;
    }

    const nextMisses = misses + 1;
    setMisses(nextMisses);
    setFeedback(nudgeFor(quest, nextMisses));
    setWrong(answer);
    onMiss();

    const hint = nextMisses >= HINT_AFTER_MISSES;
    if (hint) setHinted(true);

    // Tap-to-pick quests clear their pick. Order and count keep theirs, unless
    // the hint now shows the right answer.
    if (quest.type === "order" || quest.type === "count") {
      if (hint) setAnswer(solution);
    } else if (quest.type === "select_all") {
      setAnswer([]);
    } else {
      setAnswer(null);
    }

    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => {
      setWrong(undefined);
      flashTimer.current = null;
    }, WRONG_FLASH_MS);
  }

  return (
    <>
      <p className="quest-action">{action}</p>
      <p className="quest-question">
        {quest.look} <strong>{quest.question}</strong>
      </p>
      <p
        className={`quest-feedback${hinted ? " is-hint" : ""}`}
        role="status"
      >
        {feedback}
      </p>
      <div className="quest-answer">
        <QuestControls
          quest={quest}
          answer={answer}
          wrong={wrong}
          hinted={hinted}
          locked={locked}
          onChange={change}
        />
      </div>
      <Btn className="check-btn" onClick={check} disabled={!ready}>
        Check
      </Btn>
    </>
  );
}

type ControlsProps = {
  quest: PlaceQuest;
  answer: QuestAnswer;
  wrong: QuestAnswer | undefined;
  hinted: boolean;
  locked: boolean;
  onChange: (next: QuestAnswer) => void;
};

function QuestControls(props: ControlsProps) {
  const { quest } = props;
  switch (quest.type) {
    case "cloze":
      return <ClozeControls {...props} quest={quest} />;
    case "choice":
      return <ChoiceControls {...props} quest={quest} />;
    case "select_all":
      return <SelectAllControls {...props} quest={quest} />;
    case "order":
      return <OrderControls {...props} quest={quest} />;
    case "count":
      return <CountControls {...props} quest={quest} />;
  }
}

/** Chip or choice classes for one label. */
function tapClass(
  base: string,
  state: { selected: boolean; wrong: boolean; right: boolean; hinted: boolean },
) {
  const classes = [base];
  if (state.right) classes.push("is-right");
  else if (state.wrong) classes.push("is-wrong");
  else if (state.selected) classes.push("is-selected");
  if (state.hinted) classes.push("is-hinted");
  return classes.join(" ");
}

function ClozeControls({
  quest,
  answer,
  wrong,
  hinted,
  locked,
  onChange,
}: ControlsProps & { quest: Extract<PlaceQuest, { type: "cloze" }> }) {
  const { cloze } = quest;
  const picked = typeof answer === "string" ? answer : null;
  const flash = typeof wrong === "string" ? wrong : null;
  const shown = picked ?? flash;

  return (
    <>
      <p className="cloze-line">
        {cloze.before + " "}
        <span className={`cloze-blank${shown ? "" : " is-empty"}`}>
          {shown ?? "\u00a0"}
        </span>
        {cloze.after}
      </p>
      <div className="chip-row">
        {cloze.chips.map((label) => {
          const right = locked && picked === label;
          return (
            <button
              key={label}
              type="button"
              className={tapClass("chip", {
                selected: picked === label,
                wrong: flash === label,
                right,
                hinted: hinted && !locked && label === cloze.answer,
              })}
              style={locked && !right ? { opacity: 0.35 } : undefined}
              disabled={locked}
              onClick={() => onChange(label)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </>
  );
}

function ChoiceControls({
  quest,
  answer,
  wrong,
  hinted,
  locked,
  onChange,
}: ControlsProps & { quest: Extract<PlaceQuest, { type: "choice" }> }) {
  const picked = typeof answer === "string" ? answer : null;
  const flash = typeof wrong === "string" ? wrong : null;

  return (
    <div className="choices">
      {quest.choices.map((label) => {
        const right = locked && picked === label;
        return (
          <button
            key={label}
            type="button"
            className={tapClass("choice", {
              selected: picked === label,
              wrong: flash === label,
              right,
              hinted: hinted && !locked && label === quest.answer,
            })}
            style={locked && !right ? { opacity: 0.35 } : undefined}
            disabled={locked}
            onClick={() => onChange(label)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SelectAllControls({
  quest,
  answer,
  wrong,
  hinted,
  locked,
  onChange,
}: ControlsProps & { quest: Extract<PlaceQuest, { type: "select_all" }> }) {
  const picked = Array.isArray(answer) ? answer : [];
  const flash = Array.isArray(wrong) ? wrong : [];

  return (
    <div className="chip-row">
      {quest.selectAll.options.map((label) => {
        const isPicked = picked.includes(label);
        const right = locked && isPicked;
        return (
          <button
            key={label}
            type="button"
            className={tapClass("chip", {
              selected: isPicked,
              wrong: flash.includes(label),
              right,
              hinted:
                hinted && !locked && quest.selectAll.answers.includes(label),
            })}
            style={locked && !right ? { opacity: 0.35 } : undefined}
            aria-pressed={isPicked}
            disabled={locked}
            onClick={() =>
              onChange(
                isPicked
                  ? picked.filter((item) => item !== label)
                  : [...picked, label],
              )
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function OrderControls({
  quest,
  answer,
  wrong,
  hinted,
  locked,
  onChange,
}: ControlsProps & { quest: Extract<PlaceQuest, { type: "order" }> }) {
  const list = Array.isArray(answer) ? answer : [...quest.orderItems];
  // Once hinted, the list shows the right order and stops moving.
  const showingHint = hinted && sameList(list, [...quest.orderItems]) && !locked;
  const flashing = Array.isArray(wrong);

  function move(from: number, to: number) {
    if (locked || to < 0 || to >= list.length) return;
    const next = list.slice();
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }

  return (
    <ol className="order-list">
      {list.map((label, index) => (
        <li key={label}>
          <div
            className={`order-card${locked ? " is-right" : flashing ? " is-wrong" : ""}${showingHint ? " is-hinted" : ""}`}
          >
            <span className="order-index">{index + 1}</span>
            <span className="order-text">{label}</span>
            {showingHint ? null : (
              <span className="order-move">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={locked || index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={locked || index === list.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  ↓
                </button>
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function CountControls({
  quest,
  answer,
  wrong,
  hinted,
  locked,
  onChange,
}: ControlsProps & { quest: Extract<PlaceQuest, { type: "count" }> }) {
  const { min, max } = quest.count;
  const value = typeof answer === "number" ? answer : min;
  const state = locked
    ? " is-right"
    : typeof wrong === "number"
      ? " is-wrong"
      : hinted
        ? " is-hinted"
        : "";

  return (
    <div className={`stepper${state}`}>
      <button
        type="button"
        className="stepper-btn"
        aria-label="Decrease"
        disabled={locked || value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <div className="stepper-value" aria-live="polite">
        {value}
      </div>
      <button
        type="button"
        className="stepper-btn"
        aria-label="Increase"
        disabled={locked || value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
