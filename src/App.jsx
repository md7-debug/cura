import { useEffect, useRef, useState } from "react";
import { getReading, readings, readingCode, requestedVoices, voices } from "./content/catalog.js";
import { loadReading, preloadReading } from "./content/readingLoader.js";
import { copy } from "./i18n/copy.js";
import {
  createMarkdownExport,
  createObsidianExport,
  createObsidianIndex,
  createObsidianTemplate,
  markdownToPlainText,
  parseInlineMarkdown,
  parseMarkdown,
  readMarkdownImport,
} from "./lib/markdown.js";
import { formatLetterCode, formatLetterLabel } from "./lib/letter.js";
import { availableFilename } from "./lib/files.js";
import { createPassageShare, createXShareUrl } from "./lib/share.js";
import { clipSelectionRects } from "./lib/selection.js";
import { formatTimer, remainingTimerSeconds } from "./lib/timer.js";
import {
  clearReply,
  loadAnnotations,
  loadActiveLetter,
  loadBookmarks,
  loadHighlights,
  loadLocale,
  loadReaderPreferences,
  loadReadingPosition,
  loadReplies,
  loadTheme,
  loadTimerMinutes,
  saveLocale,
  saveAnnotations,
  saveActiveLetter,
  saveBookmarks,
  saveHighlights,
  saveReaderPreferences,
  saveReadingPosition,
  saveReply,
  saveTheme,
  saveTimerMinutes,
} from "./lib/storage.js";

const sections = ["today", "letters", "yourLetters"];

const READER_PRESETS = {
  book: {
    alignment: "justify",
    contrast: "regular",
    display: "warm",
    fontSize: 100,
    hyphenation: true,
    lineHeight: 1.62,
    measure: 620,
    paragraphSpacing: 1.7,
    preset: "book",
    typeface: "literary",
  },
  comfort: {
    alignment: "left",
    contrast: "regular",
    display: "warm",
    fontSize: 105,
    hyphenation: true,
    lineHeight: 1.74,
    measure: 680,
    paragraphSpacing: 2,
    preset: "comfort",
    typeface: "legible",
  },
  editorial: {
    alignment: "left",
    contrast: "strong",
    display: "clear",
    fontSize: 100,
    hyphenation: true,
    lineHeight: 1.58,
    measure: 700,
    paragraphSpacing: 1.45,
    preset: "editorial",
    typeface: "legible",
  },
  large: {
    alignment: "left",
    contrast: "strong",
    display: "clear",
    fontSize: 125,
    hyphenation: false,
    lineHeight: 1.82,
    measure: 720,
    paragraphSpacing: 2.35,
    preset: "large",
    typeface: "legible",
  },
};

function Header({ locale, onLocaleChange, onThemeToggle, section, onSectionChange, theme }) {
  const t = copy[locale];

  return (
    <header className="site-header">
      <button className="wordmark" onClick={() => onSectionChange("today")}>
        CURA
      </button>
      <nav aria-label={t.primaryNavigation}>
        {sections.map((item) => (
          <button
            aria-current={section === item ? "page" : undefined}
            className={section === item ? "active" : ""}
            key={item}
            onClick={() => onSectionChange(item)}
          >
            {t.nav[item]}
          </button>
        ))}
      </nav>
      <p className="edition-title">{t.edition}</p>
      <div className="header-controls">
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          aria-label={theme === "light" ? t.switchToDark : t.switchToLight}
        >
          {theme === "light" ? t.dark : t.light}
        </button>
        <div className="language-switcher" aria-label={t.languageLabel}>
          {[
            ["en", "EN"],
            ["fr", "FR"],
          ].map(([value, label]) => (
            <button
              aria-pressed={locale === value}
              className={locale === value ? "active" : ""}
              key={value}
              lang={value}
              onClick={() => onLocaleChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function HourglassObject({
  completed,
  compact = false,
  duration,
  locale,
  onDurationChange,
  onReset,
  onToggle,
  remaining,
  running,
}) {
  const t = copy[locale];
  const total = duration * 60;
  const sandRemaining = Math.max(0, Math.min(1, remaining / total));
  const sandElapsed = 1 - sandRemaining;
  const timerActive = running || completed || remaining < total;

  return (
    <div
      className={`hourglass-stage${compact ? " is-compact" : ""}${running ? " is-running" : ""}${timerActive ? " has-progress" : ""}${completed ? " is-complete" : ""}`}
      style={{
        "--sand-elapsed": sandElapsed,
        "--sand-remaining": sandRemaining,
      }}
    >
      <picture aria-hidden="true">
        <img className="hourglass-light" alt="" src={`${import.meta.env.BASE_URL}assets/hourglass-light.png`} />
        <img className="hourglass-dark" alt="" src={`${import.meta.env.BASE_URL}assets/hourglass-dark.png`} />
      </picture>
      <span className="sand sand-top" aria-hidden="true" />
      <span className="sand-stream" aria-hidden="true" />
      <span className="sand sand-bottom" aria-hidden="true" />
      <div className="timer-durations" aria-label={t.timerDuration} role="group">
        {[10, 15, 20, 30].map((minutes) => (
          <button
            aria-pressed={duration === minutes}
            disabled={running}
            key={minutes}
            onClick={() => onDurationChange(minutes)}
            type="button"
          >
            {minutes}
          </button>
        ))}
      </div>
      <button
        aria-label={running ? t.pauseTimer : t.startTimer}
        className="hourglass-toggle"
        onClick={onToggle}
        type="button"
      >
        <span className="sr-only">{running ? t.pauseTimer : t.startTimer}</span>
      </button>
      <output aria-label={t.timeRemaining} className="timer-clock" aria-live="off">
        {formatTimer(remaining)}
      </output>
      <button
        aria-label={t.resetTimer}
        className="timer-reset"
        disabled={remaining === total && !completed}
        onClick={onReset}
        type="button"
      >
        {t.resetShort}
      </button>
    </div>
  );
}

function ReadingTimer({
  completed,
  duration,
  forceOpen = false,
  locale,
  onDurationChange,
  onReset,
  onToggle,
  remaining,
  running,
}) {
  const t = copy[locale];
  const total = duration * 60;
  const timerActive = running || completed || remaining < total;
  const stateCopy = completed
    ? t.timerComplete
    : running
      ? t.timerRunning
      : remaining < total
        ? t.timerPaused
        : t.timerReady;

  return (
    <details
      className={`reading-timer${running ? " is-running" : ""}${timerActive ? " has-progress" : ""}${completed ? " is-complete" : ""}`}
      open={forceOpen ? true : undefined}
    >
      <summary>
        <span>
          <span className="eyebrow">{t.dailyReading}</span>
          <time dateTime={todayIso()}>{formatCalendarDate(todayIso(), locale)}</time>
        </span>
        <span>{t.setReadingTime}</span>
      </summary>
      <div className="timer-body">
        <HourglassObject
          completed={completed}
          duration={duration}
          locale={locale}
          onDurationChange={onDurationChange}
          onReset={onReset}
          onToggle={onToggle}
          remaining={remaining}
          running={running}
        />
        <p aria-live="polite">{stateCopy}</p>
      </div>
    </details>
  );
}

function ReadingTimerDock(props) {
  const t = copy[props.locale];
  return (
    <aside className="timer-dock" aria-label={t.sessionTimer}>
      <p>{t.timeForYourself}</p>
      <div className="timer-dock-budget" aria-label={t.timerDuration} role="group">
        {[10, 15, 20, 30].map((minutes) => (
          <button
            aria-pressed={props.duration === minutes}
            disabled={props.running}
            key={minutes}
            onClick={() => props.onDurationChange(minutes)}
            type="button"
          >
            {minutes}
          </button>
        ))}
      </div>
      <HourglassObject {...props} compact />
    </aside>
  );
}

function SelectionPaint() {
  const [markerRects, setMarkerRects] = useState([]);

  useEffect(() => {
    function updateSelectionPaint() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setMarkerRects([]);
        return;
      }
      const range = selection.getRangeAt(0);
      const startElement = range.startContainer.nodeType === Node.ELEMENT_NODE
        ? range.startContainer
        : range.startContainer.parentElement;
      const endElement = range.endContainer.nodeType === Node.ELEMENT_NODE
        ? range.endContainer
        : range.endContainer.parentElement;
      const startSurface = startElement?.closest?.("[data-selection-surface]");
      const endSurface = endElement?.closest?.("[data-selection-surface]");
      if (!startSurface || startSurface !== endSurface || startSurface.matches(".focused-copy")) {
        setMarkerRects([]);
        return;
      }
      setMarkerRects(clipSelectionRects(range.getClientRects(), startSurface.getBoundingClientRect()));
    }

    document.addEventListener("selectionchange", updateSelectionPaint);
    document.addEventListener("pointerup", updateSelectionPaint, true);
    document.addEventListener("scroll", updateSelectionPaint, true);
    window.addEventListener("resize", updateSelectionPaint);
    return () => {
      document.removeEventListener("selectionchange", updateSelectionPaint);
      document.removeEventListener("pointerup", updateSelectionPaint, true);
      document.removeEventListener("scroll", updateSelectionPaint, true);
      window.removeEventListener("resize", updateSelectionPaint);
    };
  }, []);

  return markerRects.map((markerRect, index) => (
    <span
      aria-hidden="true"
      className="selection-marker"
      key={`${markerRect.top}-${markerRect.left}-${index}`}
      style={markerRect}
    />
  ));
}

function SessionInstrument({ locale, onFinish, timer }) {
  const t = copy[locale];
  const total = timer.duration * 60;
  const stateCopy = timer.completed
    ? t.timerComplete
    : timer.running
      ? t.timerRunning
      : timer.remaining < total
        ? t.timerPaused
        : t.timerReady;

  return (
    <section className="session-instrument" aria-label={t.sessionTimer}>
      <p className="eyebrow">{t.timeForYourself}</p>
      <HourglassObject {...timer} />
      <p className="session-state" aria-live="polite">{stateCopy}</p>
      <p className="timer-permission">{t.timerPermission}</p>
      <button className="finish-session-reading" onClick={onFinish}>{t.finishReading}</button>
    </section>
  );
}

function Today({
  draft,
  initialFocus,
  letter,
  locale,
  obsidianStatus,
  onCloseLetter,
  onDraftChange,
  onLocaleChange,
  onReadingSelect,
  onReadingVisibilityChange,
  onReaderPreferencesChange,
  onSaveObsidian,
  readerPreferences,
  savedAt,
  timer,
}) {
  const t = copy[locale];
  const content = letter[locale];
  const letterNumber = letter.number;
  const letterLabel = formatReadingLabel(letter, locale);
  const authorWorks = worksForAuthor(letter.authorId, locale);
  const composerRef = useRef(null);
  const focusDialogRef = useRef(null);
  const keepRef = useRef(null);
  const initialFocusHandledRef = useRef(false);
  const readingLayoutRef = useRef(null);
  const resumeButtonRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [journeyStage, setJourneyStage] = useState("read");
  const [activeNote, setActiveNote] = useState(null);
  const [annotations, setAnnotations] = useState(() => loadAnnotations(letterNumber));
  const [bookmarks, setBookmarks] = useState(() => loadBookmarks(letterNumber));
  const [highlights, setHighlights] = useState(() => loadHighlights(letterNumber));
  const [annotationScope, setAnnotationScope] = useState("letter");
  const [pendingHighlight, setPendingHighlight] = useState(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isReaderSettingsOpen, setIsReaderSettingsOpen] = useState(false);
  const [replyMode, setReplyMode] = useState("write");
  const [readingPosition, setReadingPosition] = useState(() => loadReadingPosition(letterNumber));
  const visibleBookmarks = bookmarks.filter((bookmark) => bookmark.locale === locale);
  const visibleHighlights = highlights.flatMap((highlight) => {
    if (highlight.locale !== locale) return [];
    const paragraph = content.text[highlight.paragraphIndex];
    if (typeof paragraph !== "string") return [];
    const annotation = annotations[`highlight:${highlight.id}`];
    const hasNote = Boolean(annotation?.text?.trim() || annotation?.strokes?.length);
    if (paragraph.slice(highlight.start, highlight.end) === highlight.quote) {
      return [{ ...highlight, hasNote }];
    }
    const start = paragraph.indexOf(highlight.quote);
    return start >= 0
      ? [{ ...highlight, start, end: start + highlight.quote.length, hasNote }]
      : [];
  });
  const selectedHighlight = annotationScope.startsWith("highlight:")
    ? visibleHighlights.find((highlight) => `highlight:${highlight.id}` === annotationScope)
    : null;
  const passageShare = selectedHighlight
    ? createPassageShare({
        author: letter.author,
        quote: selectedHighlight.quote,
        sourceUrl: letter.sources[locale],
        title: content.title,
        work: letter.work[locale],
      })
    : null;

  useEffect(() => {
    const readingLayout = readingLayoutRef.current;
    if (!readingLayout || typeof IntersectionObserver !== "function") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => onReadingVisibilityChange(entry.isIntersecting),
      { threshold: 0.12 },
    );
    observer.observe(readingLayout);
    return () => observer.disconnect();
  }, [onReadingVisibilityChange]);

  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return undefined;
    const sectionsToTrack = [readingLayoutRef.current, composerRef.current, keepRef.current].filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.dataset.stage) setJourneyStage(visible.target.dataset.stage);
      },
      { rootMargin: "-28% 0px -48%", threshold: [0, 0.12, 0.45] },
    );
    sectionsToTrack.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveAnnotations(letterNumber, annotations), 250);
    return () => window.clearTimeout(timeout);
  }, [annotations]);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveBookmarks(letterNumber, bookmarks), 250);
    return () => window.clearTimeout(timeout);
  }, [bookmarks]);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveHighlights(letterNumber, highlights), 250);
    return () => window.clearTimeout(timeout);
  }, [highlights]);

  useEffect(() => {
    const dialog = focusDialogRef.current;
    if (!isFocused || !dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [isFocused]);

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsBrowserFullscreen(document.fullscreenElement === focusDialogRef.current);
    };
    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  useEffect(() => {
    if (!initialFocus || initialFocusHandledRef.current) return;
    initialFocusHandledRef.current = true;
    openFocusedReading(false);
  }, [initialFocus]);

  useEffect(() => {
    if (!isFocused) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const paragraph = Number(visible?.target.dataset.paragraphIndex);
        if (!Number.isInteger(paragraph)) return;
        setReadingPosition((current) => {
          const next = Math.max(current, paragraph);
          saveReadingPosition(letterNumber, next);
          return next;
        });
      },
      { rootMargin: "-34% 0px -34%", threshold: 0 },
    );

    const paragraphs = focusDialogRef.current?.querySelectorAll("[data-paragraph-index]") ?? [];
    paragraphs.forEach((paragraph) => observer.observe(paragraph));
    return () => observer.disconnect();
  }, [isFocused, letterNumber]);

  useEffect(() => {
    if (!isFocused) return undefined;
    const dialog = focusDialogRef.current;
    const focusedCopy = dialog?.querySelector(".focused-copy");
    let viewportFrame = null;
    const refreshSelectionPosition = () => {
      if (viewportFrame !== null) window.cancelAnimationFrame(viewportFrame);
      viewportFrame = window.requestAnimationFrame(captureHighlightSelection);
    };
    document.addEventListener("selectionchange", captureHighlightSelection);
    document.addEventListener("pointerup", captureHighlightSelection, true);
    document.addEventListener("mouseup", captureHighlightSelection, true);
    document.addEventListener("scroll", refreshSelectionPosition, true);
    dialog?.addEventListener("scroll", refreshSelectionPosition, { passive: true });
    const resizeObserver = typeof ResizeObserver === "function" && focusedCopy
      ? new ResizeObserver(refreshSelectionPosition)
      : null;
    resizeObserver?.observe(focusedCopy);
    window.addEventListener("resize", refreshSelectionPosition);
    return () => {
      if (viewportFrame !== null) window.cancelAnimationFrame(viewportFrame);
      document.removeEventListener("selectionchange", captureHighlightSelection);
      document.removeEventListener("pointerup", captureHighlightSelection, true);
      document.removeEventListener("mouseup", captureHighlightSelection, true);
      document.removeEventListener("scroll", refreshSelectionPosition, true);
      dialog?.removeEventListener("scroll", refreshSelectionPosition);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", refreshSelectionPosition);
    };
  }, [isFocused, readerPreferences]);

  function closeFocusedReading(destination = "reflection") {
    if (document.fullscreenElement === focusDialogRef.current) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFocused(false);
    setActiveNote(null);
    setIsNotebookOpen(false);
    setIsReaderSettingsOpen(false);
    setPendingHighlight(null);
    setJourneyStage(destination === "write" ? "write" : "read");
    window.requestAnimationFrame(() => {
      if (destination === "write") {
        composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.requestAnimationFrame(() => document.querySelector("#reply")?.focus({ preventScroll: true }));
        return;
      }
      readingLayoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      resumeButtonRef.current?.focus({ preventScroll: true });
    });
  }

  function openFocusedReading(resume = false) {
    setIsFocused(true);
    setActiveNote(null);
    setPendingHighlight(null);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const paragraph = resume
          ? document.querySelector(`[data-paragraph-index="${readingPosition}"]`)
          : null;
        if (paragraph) {
          paragraph.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  const focusedReadingUrl = new URL(window.location.href);
  focusedReadingUrl.searchParams.set("reading", String(letterNumber));
  focusedReadingUrl.searchParams.set("focus", "reading");

  function popOutFocusedReading(event) {
    const readingWindow = window.open(
      event.currentTarget.href,
      `cura-reading-${letterNumber}`,
      "popup,width=980,height=860,resizable=yes,scrollbars=yes",
    );
    if (!readingWindow) return;
    event.preventDefault();
    readingWindow?.focus();
  }

  async function toggleBrowserFullscreen() {
    const dialog = focusDialogRef.current;
    if (!dialog?.requestFullscreen) return;
    try {
      if (document.fullscreenElement === dialog) {
        await document.exitFullscreen();
      } else {
        await dialog.requestFullscreen();
      }
    } catch {
      setIsBrowserFullscreen(false);
    }
  }

  function openJourneyNotes() {
    setJourneyStage("notes");
    setAnnotationScope("letter");
    setActiveNote(null);
    setPendingHighlight(null);
    setIsReaderSettingsOpen(false);
    setIsNotebookOpen(true);
    setIsFocused(true);
  }

  function goToStage(stage) {
    setJourneyStage(stage);
    if (stage === "notes") {
      openJourneyNotes();
      return;
    }
    const target = stage === "read"
      ? readingLayoutRef.current
      : stage === "write"
        ? composerRef.current
        : keepRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showNote(note) {
    window.getSelection()?.removeAllRanges();
    setIsNotebookOpen(false);
    setPendingHighlight(null);
    setActiveNote(note);
    if (!note) return;

    const noteParagraph = content.text.findIndex((paragraph) => paragraph.includes(note.phrase));
    if (noteParagraph >= 0) {
      setReadingPosition((current) => {
        const next = Math.max(current, noteParagraph);
        saveReadingPosition(letterNumber, next);
        return next;
      });
    }

    window.requestAnimationFrame(() => {
      const phrase = document.querySelector(`[data-note-id="${note.id}"]`);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!phrase) return;
      const compactNote = window.matchMedia("(max-width: 1280px)").matches;
      const targetTop = window.innerHeight * (compactNote ? 0.3 : 0.44);
      const top = window.scrollY + phrase.getBoundingClientRect().top - targetTop;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  function moveBetweenNotes(offset) {
    const currentIndex = content.notes.findIndex((note) => note.id === activeNote?.id);
    const nextNote = content.notes[currentIndex + offset];
    if (nextNote) showNote(nextNote);
  }

  function openNotebook(scope = "letter") {
    setAnnotationScope(scope);
    setActiveNote(null);
    setPendingHighlight(null);
    setIsNotebookOpen(true);
  }

  function captureHighlightSelection() {
    window.setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setPendingHighlight(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const startParagraph = closestReadingParagraph(range.startContainer);
      const endParagraph = closestReadingParagraph(range.endContainer);
      if (!startParagraph || startParagraph !== endParagraph) {
        setPendingHighlight(null);
        return;
      }

      let start = textOffsetWithin(startParagraph, range.startContainer, range.startOffset);
      let end = textOffsetWithin(startParagraph, range.endContainer, range.endOffset);
      let quote = range.toString();
      const leading = quote.length - quote.trimStart().length;
      const trailing = quote.length - quote.trimEnd().length;
      start += leading;
      end -= trailing;
      quote = quote.trim();
      if (!quote || end <= start) {
        setPendingHighlight(null);
        return;
      }

      const paragraphIndex = Number(startParagraph.dataset.paragraphIndex);
      const rect = range.getBoundingClientRect();
      const copySurface = startParagraph.closest(".focused-copy");
      const markerRects = copySurface
        ? clipSelectionRects(range.getClientRects(), copySurface.getBoundingClientRect())
        : [];
      setPendingHighlight({
        paragraphIndex,
        start,
        end,
        quote,
        markerRects,
        left: Math.min(window.innerWidth - 150, Math.max(16, rect.left + rect.width / 2 - 66)),
        top: Math.max(16, rect.top - 44),
      });
    }, 0);
  }

  function savePendingHighlight() {
    if (!pendingHighlight) return;
    const existing = visibleHighlights.find((highlight) => (
      highlight.paragraphIndex === pendingHighlight.paragraphIndex
      && highlight.start < pendingHighlight.end
      && highlight.end > pendingHighlight.start
    ));
    if (existing) {
      window.getSelection()?.removeAllRanges();
      openSavedHighlight(existing);
      return;
    }
    const highlight = {
      id: globalThis.crypto?.randomUUID?.() ?? `highlight-${Date.now()}`,
      locale,
      paragraphIndex: pendingHighlight.paragraphIndex,
      start: pendingHighlight.start,
      end: pendingHighlight.end,
      quote: pendingHighlight.quote,
    };
    setHighlights((current) => [...current, highlight]);
    window.getSelection()?.removeAllRanges();
    openNotebook(`highlight:${highlight.id}`);
  }

  function openSavedHighlight(highlight) {
    openNotebook(`highlight:${highlight.id}`);
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-highlight-id="${highlight.id}"]`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  function returnToHighlight(highlight) {
    setIsNotebookOpen(false);
    setAnnotationScope("letter");
    window.requestAnimationFrame(() => {
      focusDialogRef.current?.querySelector(`[data-highlight-id="${highlight.id}"]`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  function toggleBookmark(paragraphIndex) {
    const existing = visibleBookmarks.find((bookmark) => bookmark.paragraphIndex === paragraphIndex);
    if (existing) {
      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== existing.id));
      return;
    }
    const paragraph = content.text[paragraphIndex] ?? "";
    const excerpt = paragraph.length > 150
      ? `${paragraph.slice(0, 147).trimEnd()}…`
      : paragraph;
    setBookmarks((current) => [...current, {
      excerpt,
      id: globalThis.crypto?.randomUUID?.() ?? `bookmark-${Date.now()}`,
      locale,
      paragraphIndex,
    }]);
  }

  function openSavedBookmark(bookmark) {
    setIsNotebookOpen(false);
    setAnnotationScope("letter");
    setReadingPosition(bookmark.paragraphIndex);
    saveReadingPosition(letterNumber, bookmark.paragraphIndex);
    window.requestAnimationFrame(() => {
      focusDialogRef.current?.querySelector(
        `[data-paragraph-index="${bookmark.paragraphIndex}"]`,
      )?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  function setReaderDisplay(display) {
    onReaderPreferencesChange((current) => ({ ...current, display }));
  }

  function deleteSavedHighlight(highlightId) {
    setHighlights((current) => current.filter((highlight) => highlight.id !== highlightId));
    setAnnotations((current) => {
      const next = { ...current };
      delete next[`highlight:${highlightId}`];
      return next;
    });
    openNotebook("letter");
  }

  const readerClassName = [
    "focused-reader",
    `reader-preset-${readerPreferences.preset}`,
    `reader-typeface-${readerPreferences.typeface}`,
    `reader-contrast-${readerPreferences.contrast}`,
    `reader-alignment-${readerPreferences.alignment}`,
    readerPreferences.hyphenation ? "reader-hyphenation-on" : "reader-hyphenation-off",
  ].join(" ");
  const readerStyle = {
    "--reader-font-scale": readerPreferences.fontSize / 100,
    "--reader-line-height": readerPreferences.lineHeight,
    "--reader-measure": `${readerPreferences.measure}px`,
    "--reader-paragraph-spacing": `${readerPreferences.paragraphSpacing}rem`,
  };

  if (isFocused) {
    return (
      <dialog
        aria-labelledby="focused-letter-title"
        className={`focus-dialog reader-display-${readerPreferences.display}`}
        onCancel={(event) => {
          event.preventDefault();
          closeFocusedReading();
        }}
        ref={focusDialogRef}
      >
        <main id="main-content" className="focus-page">
          <article
            className={readerClassName}
            aria-labelledby="focused-letter-title"
            style={readerStyle}
          >
            <div className="focus-header">
              <p className="eyebrow">{letterLabel}</p>
              <div className="reader-actions">
                <div className="reader-focus-language" aria-label={t.languageLabel}>
                  {[
                    ["en", "EN"],
                    ["fr", "FR"],
                  ].map(([value, label]) => (
                    <button
                      aria-pressed={locale === value}
                      key={value}
                      lang={value}
                      onClick={() => onLocaleChange(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  aria-label={readerPreferences.display === "night" ? t.switchToLight : t.switchToDark}
                  className="reader-focus-theme"
                  onClick={() => setReaderDisplay(readerPreferences.display === "night" ? "warm" : "night")}
                >
                  {readerPreferences.display === "night" ? t.light : t.dark}
                </button>
                <button
                  aria-expanded={isNotebookOpen}
                  className="reader-notes-toggle"
                  onClick={() => (isNotebookOpen ? setIsNotebookOpen(false) : openNotebook())}
                >
                  {t.notes}
                </button>
                <button
                  aria-controls="reader-preferences"
                  aria-expanded={isReaderSettingsOpen}
                  className="reader-settings-toggle"
                  onClick={() => setIsReaderSettingsOpen((current) => !current)}
                >
                  <span aria-hidden="true">Aa</span>
                  <span className="sr-only">{t.readerSettings}</span>
                </button>
                <a
                  className="reader-popout"
                  href={focusedReadingUrl.href}
                  onClick={popOutFocusedReading}
                  target={`cura-reading-${letterNumber}`}
                >
                  <span>{t.popOutReading}</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="M6 3H3v10h10v-3M8 2h6v6M14 2 7 9" />
                  </svg>
                </a>
                <button className="reader-fullscreen" onClick={toggleBrowserFullscreen}>
                  <span>{isBrowserFullscreen ? t.exitFullscreen : t.enterFullscreen}</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    {isBrowserFullscreen ? (
                      <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" />
                    ) : (
                      <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" />
                    )}
                  </svg>
                </button>
                <button onClick={() => closeFocusedReading()}>{t.returnToReflection}</button>
              </div>
            </div>
            {isReaderSettingsOpen ? (
              <ReaderPreferences
                locale={locale}
                onChange={onReaderPreferencesChange}
                preferences={readerPreferences}
              />
            ) : null}
            <div className="focus-reading-timer"><ReadingTimer {...timer} forceOpen /></div>
            <span className="short-rule" aria-hidden="true" />
            <h1 id="focused-letter-title">{content.title}</h1>
            <p className="glossary-hint">{t.glossaryHint}</p>
            <div
              className={`focused-copy${activeNote ? " has-active-note" : ""}`}
              data-selection-surface
              lang={content.language ?? locale}
              onKeyUp={captureHighlightSelection}
              onMouseUp={captureHighlightSelection}
              onPointerUp={captureHighlightSelection}
            >
              {content.text.map((paragraph, paragraphIndex) => (
                <AnnotatedParagraph
                  activeNote={activeNote}
                  highlights={visibleHighlights.filter((highlight) => (
                    highlight.paragraphIndex === paragraphIndex
                  ))}
                  isBookmarked={visibleBookmarks.some((bookmark) => (
                    bookmark.paragraphIndex === paragraphIndex
                  ))}
                  isReadingPosition={readingPosition > 0 && readingPosition === paragraphIndex}
                  key={paragraph}
                  locale={locale}
                  notes={content.notes}
                  onBookmarkToggle={toggleBookmark}
                  onHighlightOpen={openSavedHighlight}
                  onSelect={showNote}
                  paragraphIndex={paragraphIndex}
                  text={paragraph}
                />
              ))}
            </div>
            {pendingHighlight?.markerRects?.map((markerRect, index) => (
              <span
                aria-hidden="true"
                className="selection-marker"
                key={`${markerRect.top}-${index}`}
                style={markerRect}
              />
            ))}
            {pendingHighlight ? (
              <button
                className="save-highlight"
                onClick={savePendingHighlight}
                onMouseDown={(event) => event.preventDefault()}
                style={{ left: pendingHighlight.left, top: pendingHighlight.top }}
              >
                {t.saveHighlight}
              </button>
            ) : null}
            <p className="source-note">
              {content.translationNote}{" "}
              <a href={letter.sources[locale]} target="_blank" rel="noreferrer">
                {t.readSourceEdition}
              </a>
            </p>
            <section className="reading-next" aria-labelledby="reading-next-title">
              <p className="eyebrow">{t.readingComplete}</p>
              <h2 id="reading-next-title">{t.chooseNextStep}</h2>
              <div>
                <button className="primary-next" onClick={() => closeFocusedReading("write")}>
                  {t.writeReply}
                </button>
                <button onClick={() => openNotebook("letter")}>{t.openReadingNotes}</button>
                <button onClick={() => closeFocusedReading("reflection")}>
                  {t.returnToInterpretation}
                </button>
              </div>
            </section>
          </article>
          {activeNote ? (
            <aside className="margin-note" id="reader-note" aria-live="polite">
              <div className="margin-note-header">
                <p className="eyebrow">{t.marginNote}</p>
                <button onClick={() => setActiveNote(null)}>{t.close}</button>
              </div>
              <h2>{activeNote.label}</h2>
              <p className="note-latin" lang="la">{activeNote.latin}</p>
              <p>{activeNote.definition}</p>
              <p className="note-context">{activeNote.context}</p>
              <button
                className="annotate-passage"
                onClick={() => openNotebook(activeNote.id)}
              >
                {t.annotatePassage}
              </button>
              <div className="note-navigation" aria-label={t.noteProgress}>
                <button
                  disabled={content.notes[0].id === activeNote.id}
                  onClick={() => moveBetweenNotes(-1)}
                >
                  {t.previousNote}
                </button>
                <span>
                  {t.noteProgress} {content.notes.findIndex((note) => note.id === activeNote.id) + 1}
                  <i aria-hidden="true"> / </i>
                  {content.notes.length}
                </span>
                <button
                  disabled={content.notes.at(-1).id === activeNote.id}
                  onClick={() => moveBetweenNotes(1)}
                >
                  {t.nextNote}
                </button>
              </div>
            </aside>
          ) : null}
          {isNotebookOpen ? (
            <AnnotationNotebook
              annotations={annotations}
              bookmarks={visibleBookmarks}
              highlights={visibleHighlights}
              locale={locale}
              onChange={setAnnotations}
              onClose={() => setIsNotebookOpen(false)}
              onDeleteHighlight={deleteSavedHighlight}
              onOpenBookmark={openSavedBookmark}
              onOpenHighlight={openSavedHighlight}
              onReturnHighlight={returnToHighlight}
              passageShare={passageShare}
              scope={annotationScope}
              scopeTitle={
                annotationScope === "letter"
                  ? content.title
                  : annotationScope.startsWith("highlight:")
                    ? visibleHighlights.find((highlight) => (
                        `highlight:${highlight.id}` === annotationScope
                      ))?.quote ?? content.title
                    : content.notes.find((note) => note.id === annotationScope)?.label ?? content.title
              }
            />
          ) : null}
        </main>
      </dialog>
    );
  }

  return (
    <main id="main-content">
      <div className="practice-bar">
        <time dateTime={todayIso()}>{formatCalendarDate(todayIso(), locale)}</time>
        <div className="practice-stages" aria-label={t.practiceJourney}>
          {[
            ["read", t.stageRead],
            ["notes", t.stageNotes],
            ["write", t.stageWrite],
            ["keep", t.stageSave],
          ].map(([stage, label]) => (
            <button
              aria-current={journeyStage === stage ? "step" : undefined}
              key={stage}
              onClick={() => goToStage(stage)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <span>{t.publicDomainEdition}</span>
      </div>
      <div className="collection-switcher" aria-label={t.chooseReading}>
        <label>
          <span>{t.author}</span>
          <select
            aria-label={t.author}
            onChange={(event) => {
              const nextVoice = voices.find((voice) => voice.id === event.target.value);
              if (nextVoice) onReadingSelect(nextVoice.reading);
            }}
            value={letter.authorId}
          >
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>{voice.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.work}</span>
          <select
            aria-label={t.work}
            onChange={(event) => onReadingSelect(Number(event.target.value))}
            value={authorWorks.find((work) => work.key === letter.work.en)?.reading ?? letter.number}
          >
            {authorWorks.map((work) => (
              <option key={work.key} value={work.reading}>{work.label}</option>
            ))}
          </select>
        </label>
        <span>{formatAvailableReadings(readings.filter((item) => item.authorId === letter.authorId).length, locale)}</span>
      </div>
      <article className="reading-layout" data-stage="read" ref={readingLayoutRef}>
        <section className="letter" aria-labelledby="letter-title">
          <p className="eyebrow">{letter.author} / {letter.work[locale]} / {letterLabel}</p>
          <span className="short-rule" aria-hidden="true" />
          <h1 id="letter-title">{content.title}</h1>
          <div className="letter-copy" data-selection-surface lang={content.language ?? locale}>
            {content.text.slice(0, 3).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <button
              className="letter-continuation"
              onClick={() => openFocusedReading(readingPosition > 0)}
              ref={resumeButtonRef}
            >
              {readingPosition > 0
                ? t.resumeAtParagraph.replace("{number}", readingPosition + 1)
                : t.continueLetter}
            </button>
          </div>
        </section>

        <SessionInstrument
          locale={locale}
          onFinish={() => composerRef.current?.scrollIntoView({ behavior: "smooth" })}
          timer={timer}
        />

        <section className="interpretation" aria-labelledby="interpretation-title">
          <span className="vertical-rule" aria-hidden="true" />
          <div className="interpretation-copy" data-selection-surface>
            <h2 id="interpretation-title" className="sr-only">
              {t.interpretation}
            </h2>
            <InterpretationBlock label={t.essentialIdea} text={content.essentialIdea} />
            {content.phraseMeaning ? (
              <InterpretationBlock
                label={t.latinPhrase}
                text={<i lang="la">Opto tibi tui facultatem.</i>}
                detail={content.phraseMeaning}
              />
            ) : (
              <InterpretationBlock label={t.practice} text={content.practice} />
            )}
            <InterpretationBlock label={t.tension} text={content.tension} />
            <button
              className="write-invitation"
              onClick={() => composerRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              {t.whatWouldYouWrite}
            </button>
          </div>
        </section>
      </article>

      <section className="composer" data-stage="write" ref={composerRef} aria-labelledby="composer-title">
        <div className="composer-intro">
          <p className="eyebrow">{t.writeBack}</p>
          <h2 id="composer-title">{content.prompt}</h2>
          <p>{t.promptSupport}</p>
        </div>
        <div className="writing-area">
          <div className="writing-toolbar">
            {replyMode === "write" ? (
              <label className="writing-label" htmlFor="reply">{t.yourReply}</label>
            ) : (
              <span className="writing-label">{t.yourReply}</span>
            )}
            <div className="writing-modes" role="tablist" aria-label={t.writingMode}>
              {[
                ["write", t.writeMode],
                ["read", t.readMode],
              ].map(([value, label]) => (
                <button
                  aria-selected={replyMode === value}
                  key={value}
                  onClick={() => setReplyMode(value)}
                  role="tab"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {replyMode === "write" ? (
            <textarea
              id="reply"
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder={content.placeholder}
              spellCheck="true"
            />
          ) : (
            <div className="reply-preview" role="tabpanel" aria-label={t.readMode}>
              <MarkdownPreview emptyText={t.previewEmpty} text={draft} />
            </div>
          )}
          <details className="markdown-guide">
            <summary>{t.markdownLabel}</summary>
            <p>{t.markdownHelp}</p>
          </details>
          <div className="save-status" role="status">
            <span>{draft ? t.savedPrivately : t.staysHere}</span>
            {savedAt ? <time dateTime={savedAt}>{formatTime(savedAt, locale)}</time> : null}
          </div>
          <div className="obsidian-workflow">
            <button disabled={!draft} onClick={() => onSaveObsidian(letterNumber)}>
              {t.saveToObsidian}
            </button>
            <p>{obsidianStatus ? t[obsidianStatus] : t.obsidianHint}</p>
          </div>
          <button
            className="close-letter"
            onClick={() => {
              onCloseLetter();
              window.scrollTo({ top: 0, behavior: "smooth" });
              window.requestAnimationFrame(() => {
                resumeButtonRef.current?.focus({ preventScroll: true });
              });
            }}
          >
            {t.closeLetter}
          </button>
        </div>
      </section>

      <section
        className="closing-memento"
        data-stage="keep"
        ref={keepRef}
        aria-labelledby="closing-memento-title"
      >
        <figure>
          <img
            alt={t.mementoImageAlt}
            loading="lazy"
            src={`${import.meta.env.BASE_URL}assets/closing-memento.png`}
          />
        </figure>
        <div>
          <p className="eyebrow">{t.closingMemento}</p>
          <h2 id="closing-memento-title">{t.mementoTitle}</h2>
          <blockquote>
            <p>{t.mementoQuote}</p>
            <cite>
              <a href={t.mementoSourceUrl} target="_blank" rel="noreferrer">{t.mementoCitation}</a>
            </cite>
          </blockquote>
          <p className="memento-support">{t.mementoSupport}</p>
          <button onClick={() => goToStage("read")}>{t.returnToReading}</button>
        </div>
      </section>
    </main>
  );
}

function ReaderPreferences({ locale, onChange, preferences }) {
  const t = copy[locale];

  function updatePreference(key, value, marksCustom = true) {
    onChange((current) => ({
      ...current,
      [key]: value,
      preset: marksCustom ? "custom" : current.preset,
    }));
  }

  function applyPreset(preset) {
    onChange((current) => ({ ...current, ...READER_PRESETS[preset] }));
  }

  return (
    <div className="reader-preferences" id="reader-preferences">
      <div className="preference-group preference-presets">
        <span>{t.readingPresets}</span>
        <div role="group" aria-label={t.readingPresets}>
          {Object.keys(READER_PRESETS).map((preset) => (
            <button
              aria-pressed={preferences.preset === preset}
              key={preset}
              onClick={() => applyPreset(preset)}
              type="button"
            >
              {t.readerPresetLabels[preset]}
            </button>
          ))}
        </div>
      </div>
      <div className="preference-group preference-display">
        <span>{t.displayStyle}</span>
        <div role="group" aria-label={t.displayStyle}>
          {["warm", "clear", "night", "eink"].map((display) => (
            <button
              aria-pressed={preferences.display === display}
              key={display}
              onClick={() => updatePreference("display", display, false)}
              type="button"
            >
              {t.readerDisplayLabels[display]}
            </button>
          ))}
        </div>
      </div>
      <div className="preference-group preference-scope">
        <span>{t.styleScope}</span>
        <div role="group" aria-label={t.styleScope}>
          {["reading", "site"].map((scope) => (
            <button
              aria-pressed={preferences.scope === scope}
              key={scope}
              onClick={() => updatePreference("scope", scope, false)}
              type="button"
            >
              {t.readerScopeLabels[scope]}
            </button>
          ))}
        </div>
      </div>
      <details className="reader-advanced">
        <summary>{t.advancedReadingSettings}</summary>
        <div className="reader-advanced-grid">
          <div className="preference-group">
            <span>{t.typeface}</span>
            <div role="group" aria-label={t.typeface}>
              {["literary", "legible", "sans"].map((typeface) => (
                <button
                  aria-pressed={preferences.typeface === typeface}
                  key={typeface}
                  onClick={() => updatePreference("typeface", typeface)}
                  type="button"
                >
                  {t.readerTypefaceLabels[typeface]}
                </button>
              ))}
            </div>
          </div>
          <RangePreference
            label={t.textSize}
            max={140}
            min={85}
            onChange={(value) => updatePreference("fontSize", value)}
            step={5}
            unit="%"
            value={preferences.fontSize}
          />
          <RangePreference
            label={t.lineSpacing}
            max={2.1}
            min={1.4}
            onChange={(value) => updatePreference("lineHeight", value)}
            step={0.05}
            value={preferences.lineHeight}
          />
          <RangePreference
            label={t.readingWidth}
            max={780}
            min={500}
            onChange={(value) => updatePreference("measure", value)}
            step={20}
            unit="px"
            value={preferences.measure}
          />
          <RangePreference
            label={t.paragraphSpacing}
            max={3}
            min={0.75}
            onChange={(value) => updatePreference("paragraphSpacing", value)}
            step={0.25}
            unit="rem"
            value={preferences.paragraphSpacing}
          />
          <div className="preference-group">
            <span>{t.textContrast}</span>
            <div role="group" aria-label={t.textContrast}>
              {["soft", "regular", "strong"].map((contrast) => (
                <button
                  aria-pressed={preferences.contrast === contrast}
                  key={contrast}
                  onClick={() => updatePreference("contrast", contrast)}
                  type="button"
                >
                  {t.readerContrastLabels[contrast]}
                </button>
              ))}
            </div>
          </div>
          <div className="preference-group">
            <span>{t.textAlignment}</span>
            <div role="group" aria-label={t.textAlignment}>
              {["left", "justify"].map((alignment) => (
                <button
                  aria-pressed={preferences.alignment === alignment}
                  key={alignment}
                  onClick={() => updatePreference("alignment", alignment)}
                  type="button"
                >
                  {t.readerAlignmentLabels[alignment]}
                </button>
              ))}
            </div>
          </div>
          <div className="preference-group">
            <span>{t.hyphenation}</span>
            <div role="group" aria-label={t.hyphenation}>
              {[true, false].map((enabled) => (
                <button
                  aria-pressed={preferences.hyphenation === enabled}
                  key={String(enabled)}
                  onClick={() => updatePreference("hyphenation", enabled)}
                  type="button"
                >
                  {t.readerToggleLabels[enabled ? "on" : "off"]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

function RangePreference({ label, max, min, onChange, step, unit = "", value }) {
  return (
    <label className="range-preference">
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          type="range"
          value={value}
        />
        <output>{value}{unit}</output>
      </div>
    </label>
  );
}

function AnnotationNotebook({
  annotations,
  bookmarks,
  highlights,
  locale,
  onChange,
  onClose,
  onDeleteHighlight,
  onOpenBookmark,
  onOpenHighlight,
  onReturnHighlight,
  passageShare,
  scope,
  scopeTitle,
}) {
  const t = copy[locale];
  const [mode, setMode] = useState("type");
  const [shareStatus, setShareStatus] = useState("");
  const entry = annotations[scope] ?? { text: "", strokes: [] };
  const scopedHighlight = scope.startsWith("highlight:")
    ? highlights.find((highlight) => `highlight:${highlight.id}` === scope)
    : null;

  useEffect(() => setShareStatus(""), [scope]);

  function updateEntry(nextEntry) {
    onChange((current) => ({
      ...current,
      [scope]: { ...entry, ...nextEntry },
    }));
  }

  async function copyPassage() {
    if (!passageShare) return;
    try {
      await navigator.clipboard.writeText(passageShare.clipboardText);
      setShareStatus("copiedPassage");
    } catch {
      setShareStatus("shareUnavailable");
    }
  }

  async function sharePassage() {
    if (!passageShare) return;
    if (typeof navigator.share !== "function") {
      await copyPassage();
      return;
    }
    try {
      await navigator.share({
        title: passageShare.title,
        text: passageShare.text,
        url: passageShare.url,
      });
      setShareStatus("passageShared");
    } catch (error) {
      if (error?.name !== "AbortError") setShareStatus("shareUnavailable");
    }
  }

  return (
    <aside className="annotation-notebook" aria-label={t.notes}>
      <div className="annotation-header">
        <div>
          <p className="eyebrow">{t.yourAnnotation}</p>
          <h2>{scopeTitle}</h2>
        </div>
        <button onClick={onClose}>{t.close}</button>
      </div>
      <div className="annotation-modes" role="tablist" aria-label={t.annotationMode}>
        {[
          ["type", t.typeNote],
          ["draw", t.handwrite],
        ].map(([value, label]) => (
          <button
            aria-selected={mode === value}
            key={value}
            onClick={() => setMode(value)}
            role="tab"
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "type" ? (
        <div className="typed-annotation" role="tabpanel">
          <label htmlFor={`annotation-${scope}`}>{t.noteForYourself}</label>
          <textarea
            id={`annotation-${scope}`}
            onChange={(event) => updateEntry({ text: event.target.value })}
            placeholder={t.annotationPlaceholder}
            value={entry.text}
          />
        </div>
      ) : (
        <div className="handwritten-annotation" role="tabpanel">
          <HandwritingCanvas
            ariaLabel={t.handwritingCanvas}
            onChange={(strokes) => updateEntry({ strokes })}
            strokes={entry.strokes}
          />
          <button
            disabled={entry.strokes.length === 0}
            onClick={() => updateEntry({ strokes: entry.strokes.slice(0, -1) })}
          >
            {t.undoStroke}
          </button>
        </div>
      )}
      {scope === "letter" ? (
        <div className="saved-highlights">
          <p>{t.savedPassages}</p>
          <h3>{t.highlights}</h3>
          {highlights.length ? (
            <ol>
              {highlights.map((highlight) => (
                <li key={highlight.id}>
                  <button onClick={() => onOpenHighlight(highlight)}>{highlight.quote}</button>
                </li>
              ))}
            </ol>
          ) : (
            <span>{t.noHighlights}</span>
          )}
          <h3>{t.bookmarks}</h3>
          {bookmarks.length ? (
            <ol className="saved-bookmarks">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.id}>
                  <button onClick={() => onOpenBookmark(bookmark)}>{bookmark.excerpt}</button>
                </li>
              ))}
            </ol>
          ) : (
            <span>{t.noBookmarks}</span>
          )}
        </div>
      ) : null}
      {scope.startsWith("highlight:") ? (
        <>
          <button
            className="return-to-passage"
            disabled={!scopedHighlight}
            onClick={() => onReturnHighlight(scopedHighlight)}
            type="button"
          >
            {t.returnToPassage}
          </button>
          {passageShare ? (
            <section className="highlight-share" aria-label={t.sharePassage}>
              <div>
                <p>{t.sharePassage}</p>
                <span>{t.sharePassageHint}</span>
              </div>
              <div className="highlight-share-actions">
                <button onClick={sharePassage} type="button">{t.share}</button>
                <a href={createXShareUrl(passageShare)} rel="noreferrer" target="_blank">
                  {t.shareOnX}
                </a>
                <button onClick={copyPassage} type="button">{t.copyLink}</button>
              </div>
              <p className="share-status" role="status">
                {shareStatus ? t[shareStatus] : ""}
              </p>
            </section>
          ) : null}
          <button
            className="delete-highlight"
            onClick={() => onDeleteHighlight(scope.replace("highlight:", ""))}
          >
            {t.deleteHighlight}
          </button>
        </>
      ) : null}
      <p className="annotation-status">{t.annotationSavedLocally}</p>
    </aside>
  );
}

function HandwritingCanvas({ ariaLabel, onChange, strokes }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    function redraw() {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      const context = canvas.getContext("2d");
      context.scale(ratio, ratio);
      context.clearRect(0, 0, rect.width, rect.height);
      context.strokeStyle = getComputedStyle(canvas).color;
      context.lineWidth = 2.1;
      context.lineCap = "round";
      context.lineJoin = "round";

      strokes.forEach((stroke) => {
        if (stroke.length === 1) {
          context.beginPath();
          context.arc(stroke[0].x * rect.width, stroke[0].y * rect.height, 1.05, 0, Math.PI * 2);
          context.fillStyle = getComputedStyle(canvas).color;
          context.fill();
          return;
        }
        context.beginPath();
        stroke.forEach((point, index) => {
          const x = point.x * rect.width;
          const y = point.y * rect.height;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();
      });
    }

    redraw();
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [strokes]);

  function pointFromEvent(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }

  function drawSegment(canvas, from, to) {
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    context.strokeStyle = getComputedStyle(canvas).color;
    context.lineWidth = 2.1;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(from.x * rect.width, from.y * rect.height);
    context.lineTo(to.x * rect.width, to.y * rect.height);
    context.stroke();
  }

  function finishStroke(event) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const completed = currentStrokeRef.current;
    currentStrokeRef.current = [];
    if (completed.length > 0) onChange([...strokes, completed]);
  }

  return (
    <canvas
      aria-label={ariaLabel}
      className="handwriting-canvas"
      onPointerCancel={finishStroke}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        drawingRef.current = true;
        currentStrokeRef.current = [pointFromEvent(event)];
      }}
      onPointerMove={(event) => {
        if (!drawingRef.current) return;
        const next = pointFromEvent(event);
        const current = currentStrokeRef.current;
        const previous = current.at(-1);
        if (previous) drawSegment(event.currentTarget, previous, next);
        current.push(next);
      }}
      onPointerUp={finishStroke}
      ref={canvasRef}
      role="img"
    />
  );
}

function InterpretationBlock({ label, text, detail }) {
  return (
    <div className="interpretation-block">
      <h3>{label}</h3>
      <p>{text}</p>
      {detail ? <p className="phrase-detail">{detail}</p> : null}
    </div>
  );
}

function Letters({ locale, onOpen }) {
  const t = copy[locale];
  const [query, setQuery] = useState("");
  const [voice, setVoice] = useState("all");
  const [work, setWork] = useState("all");
  const selectedWorks = voice === "all" ? [] : worksForAuthor(voice, locale);
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const visibleLetters = readings.filter((letter) => (
    (voice === "all" || letter.authorId === voice)
    && (work === "all" || letter.work.en === work)
    && (
      !normalizedQuery
      || String(letter.number).includes(normalizedQuery)
      || letter.author.toLocaleLowerCase(locale).includes(normalizedQuery)
      || letter.work[locale].toLocaleLowerCase(locale).includes(normalizedQuery)
      || letter[locale].title.toLocaleLowerCase(locale).includes(normalizedQuery)
    )
  ));

  return (
    <main id="main-content" className="index-page library-page">
      <header className="page-intro">
        <p className="eyebrow">{t.nav.letters}</p>
        <h1>{t.libraryTitle}</h1>
        <p>{t.libraryIntro}</p>
      </header>
      <div className="library-selectors" aria-label={t.chooseReading}>
        <label>
          <span>{t.author}</span>
          <select
            aria-label={t.author}
            onChange={(event) => {
              setVoice(event.target.value);
              setWork("all");
            }}
            value={voice}
          >
            <option value="all">{t.allVoices}</option>
            {voices.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.work}</span>
          <select
            aria-label={t.work}
            disabled={voice === "all"}
            onChange={(event) => setWork(event.target.value)}
            value={work}
          >
            <option value="all">{t.allWorks}</option>
            {selectedWorks.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="letter-search">
        <label htmlFor="letter-search">{t.searchLetters}</label>
        <input
          id="letter-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchLettersPlaceholder}
          type="search"
          value={query}
        />
        <span>{visibleLetters.length} / {readings.length}</span>
      </div>
      <div className="letter-index-list">
        {visibleLetters.map((letter) => (
          <button key={letter.number} onClick={() => onOpen(letter.number)}>
            <span>{formatReadingCode(letter, locale)}</span>
            <strong>{letter[locale].title}<i>{letter.author} · {letter.work[locale]}</i></strong>
            <small>{readingTime(letter[locale].minutes, locale)}</small>
          </button>
        ))}
      </div>
      <section className="voice-catalog" aria-labelledby="voice-catalog-title">
        <div>
          <p className="eyebrow">{t.nextVoices}</p>
          <h2 id="voice-catalog-title">{t.editionsInPreparation}</h2>
          <p>{t.publicDomainReview}</p>
        </div>
        <ul>
          {requestedVoices.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <small>{item.status === "guide-only" ? t.readingGuideOnly : t.sourceReview}</small>
            </li>
          ))}
        </ul>
      </section>
      <p className="collection-note">
        {t.collectionNote}{" "}
        <a
          href={locale === "fr"
            ? "https://fr.wikisource.org/wiki/Lettres_%C3%A0_Lucilius"
            : "https://en.wikisource.org/wiki/Moral_letters_to_Lucilius"}
          target="_blank"
          rel="noreferrer"
        >
          {t.sourceCollection}
        </a>
      </p>
    </main>
  );
}

function YourLetters({
  importStatus,
  locale,
  obsidianStatus,
  onClear,
  onExport,
  onImport,
  onLoadReading,
  onOpen,
  onSaveObsidian,
  onDownloadObsidianKit,
  replies,
}) {
  const t = copy[locale];
  const [loadedReadings, setLoadedReadings] = useState({});
  const [openNumber, setOpenNumber] = useState(null);
  const savedLetters = readings.filter((letter) => replies[letter.number]?.text);

  async function toggleComparison(letterNumber) {
    if (openNumber === letterNumber) {
      setOpenNumber(null);
      return;
    }
    setOpenNumber(letterNumber);
    if (loadedReadings[letterNumber]) return;
    try {
      const reading = await onLoadReading(letterNumber);
      setLoadedReadings((current) => ({ ...current, [letterNumber]: reading }));
    } catch {
      setOpenNumber(null);
    }
  }

  return (
    <main id="main-content" className="index-page archive-page">
      <header className="page-intro">
        <p className="eyebrow">{t.nav.yourLetters}</p>
        <h1>{t.yourLettersTitle}</h1>
        <p>{t.yourLettersIntro}</p>
      </header>
      {savedLetters.length ? (
        <div className="paired-archive">
          {savedLetters.map((letter) => {
            const reply = replies[letter.number];
            const isOpen = openNumber === letter.number;
            const sourceReading = loadedReadings[letter.number];
            const preview = replyExcerpt(reply.text);
            return (
              <article className="saved-letter" key={letter.number}>
                <div className="saved-letter-summary">
                  <span>{formatReadingLabel(letter, locale)}</span>
                  <strong>{letter[locale].title}</strong>
                  <p>{preview.slice(0, 110)}{preview.length > 110 ? "…" : ""}</p>
                  <time dateTime={reply.savedAt}>{formatDate(reply.savedAt, locale)}</time>
                  <button
                    aria-expanded={isOpen}
                    onClick={() => toggleComparison(letter.number)}
                  >
                    {isOpen ? t.closeReading : t.compareLetters}
                  </button>
                </div>
                {isOpen ? (
                  sourceReading ? <div className="letter-comparison">
                    <section aria-labelledby={`seneca-${letter.number}`}>
                      <p className="comparison-label">{t.senecaLetter}</p>
                      <h2 id={`seneca-${letter.number}`}>{sourceReading[locale].title}</h2>
                      <div className="comparison-copy seneca-comparison-copy" data-selection-surface>
                        {sourceReading[locale].text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      </div>
                    </section>
                    <section aria-labelledby={`reply-${letter.number}`}>
                      <p className="comparison-label">{t.yourLetter}</p>
                      <h2 id={`reply-${letter.number}`}>{formatReadingLabel(letter, locale)}</h2>
                      <div className="comparison-copy" data-selection-surface><MarkdownPreview text={reply.text} /></div>
                    </section>
                    <div className="comparison-actions">
                      <button onClick={() => onOpen(letter.number)}>{t.continueWriting}</button>
                      <button onClick={() => onSaveObsidian(letter.number)}>{t.saveToObsidian}</button>
                      <details className="download-menu">
                        <summary>{t.download}</summary>
                        <div>
                          <button onClick={() => onExport("markdown", letter.number)}>{t.exportMarkdown}</button>
                          <button onClick={() => onExport("text", letter.number)}>{t.exportText}</button>
                          <button onClick={() => onExport("json", letter.number)}>{t.exportBackup}</button>
                          <button onClick={() => onExport("print", letter.number)}>{t.printPdf}</button>
                        </div>
                      </details>
                      <button className="quiet-danger" onClick={() => onClear(letter.number)}>{t.delete}</button>
                    </div>
                  </div> : <p className="archive-reading-loading">{t.preparingReading}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">{t.emptyLetters}</p>
      )}
      <div className="archive-tools">
        <p>{t.localFiles}</p>
        <div className="archive-actions">
          <label className="import-letter">
            {t.importLetter}
            <input
              accept=".json,.md,.txt,application/json,text/markdown,text/plain"
              className="sr-only"
              onChange={onImport}
              type="file"
            />
          </label>
        </div>
        <p className="import-status" role="status">
          {importStatus ? t[importStatus] : obsidianStatus ? t[obsidianStatus] : ""}
        </p>
        <section className="obsidian-kit" aria-labelledby="obsidian-kit-title">
          <div>
            <p className="eyebrow">OBSIDIAN</p>
            <h2 id="obsidian-kit-title">{t.obsidianKitTitle}</h2>
            <p>{t.obsidianKitIntro}</p>
            <ol className="obsidian-flow">
              {t.obsidianFlow.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <div className="obsidian-kit-actions">
            <button onClick={() => onDownloadObsidianKit("template")}>{t.downloadObsidianTemplate}</button>
            <button onClick={() => onDownloadObsidianKit("index")}>{t.downloadObsidianIndex}</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export function App() {
  const [locale, setLocale] = useState(loadLocale);
  const [theme, setTheme] = useState(loadTheme);
  const [readerPreferences, setReaderPreferences] = useState(loadReaderPreferences);
  const [section, setSection] = useState("today");
  const [activeLetterNumber, setActiveLetterNumber] = useState(() => {
    const requested = Number(new URLSearchParams(window.location.search).get("reading"));
    if (readings.some((reading) => reading.number === requested)) return requested;
    const saved = loadActiveLetter();
    return readings.some((reading) => reading.number === saved) ? saved : readings[0].number;
  });
  const [activeLetter, setActiveLetter] = useState(null);
  const [readingLoadError, setReadingLoadError] = useState(false);
  const [readingLoadRevision, setReadingLoadRevision] = useState(0);
  const [replies, setReplies] = useState(() => loadReplies(readings.map((letter) => letter.number)));
  const [importStatus, setImportStatus] = useState("");
  const [obsidianStatus, setObsidianStatus] = useState("");
  const [readingInstrumentVisible, setReadingInstrumentVisible] = useState(true);
  const [timerDuration, setTimerDuration] = useState(loadTimerMinutes);
  const [timerRemaining, setTimerRemaining] = useState(() => loadTimerMinutes() * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const timerEndsAtRef = useRef(null);
  const activeLetterMetadata = getReading(activeLetterNumber);
  const activeReply = replies[activeLetterNumber] ?? { text: "", savedAt: "" };
  const draft = activeReply.text;
  const savedAt = activeReply.savedAt;

  useEffect(() => {
    document.documentElement.lang = locale;
    saveLocale(locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.readerAlignment = readerPreferences.alignment;
    root.dataset.readerContrast = readerPreferences.contrast;
    root.dataset.readerDisplay = readerPreferences.display;
    root.dataset.readerHyphenation = readerPreferences.hyphenation ? "on" : "off";
    root.dataset.readerPreset = readerPreferences.preset;
    root.dataset.readerScope = readerPreferences.scope;
    root.dataset.readerTypeface = readerPreferences.typeface;
    const fontScale = readerPreferences.fontSize / 100;
    root.style.setProperty("--site-reader-prose-size", `${1.22 * fontScale}rem`);
    root.style.setProperty("--site-reader-supporting-size", `${fontScale}rem`);
    root.style.setProperty("--site-reader-writing-size", `${1.35 * fontScale}rem`);
    root.style.setProperty("--site-reader-line-height", readerPreferences.lineHeight);
    root.style.setProperty("--site-reader-measure", `${readerPreferences.measure}px`);
    root.style.setProperty("--site-reader-paragraph-spacing", `${readerPreferences.paragraphSpacing}rem`);
    saveReaderPreferences(readerPreferences);
  }, [readerPreferences]);

  useEffect(() => {
    saveActiveLetter(activeLetterNumber);
  }, [activeLetterNumber]);

  useEffect(() => {
    let cancelled = false;
    setReadingLoadError(false);
    loadReading(activeLetterNumber)
      .then((reading) => {
        if (!cancelled) setActiveLetter(reading);
      })
      .catch(() => {
        if (!cancelled) setReadingLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activeLetterNumber, readingLoadRevision]);

  useEffect(() => {
    if (activeLetter?.number !== activeLetterNumber) return undefined;
    const currentIndex = readings.findIndex((reading) => reading.number === activeLetterNumber);
    const nextReading = readings[currentIndex + 1];
    if (!nextReading) return undefined;
    const schedule = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = schedule(() => preloadReading(nextReading.number));
    return () => cancel(handle);
  }, [activeLetter, activeLetterNumber]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const updateTimer = () => {
      const seconds = remainingTimerSeconds(timerEndsAtRef.current);
      setTimerRemaining(seconds);
      if (seconds === 0) {
        timerEndsAtRef.current = null;
        setTimerRunning(false);
        setTimerCompleted(true);
      }
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!draft) {
      clearReply(activeLetterNumber);
      return undefined;
    }
    const timeout = window.setTimeout(() => {
      const timestamp = new Date().toISOString();
      saveReply(activeLetterNumber, draft, timestamp);
      setReplies((current) => ({
        ...current,
        [activeLetterNumber]: { text: draft, savedAt: timestamp },
      }));
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [activeLetterNumber, draft]);

  function openToday(letterNumber = activeLetterNumber) {
    setActiveLetterNumber(letterNumber);
    setSection("today");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeSection(nextSection) {
    setSection(nextSection);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateDraft(text) {
    setReplies((current) => ({
      ...current,
      [activeLetterNumber]: { text, savedAt: text ? current[activeLetterNumber]?.savedAt ?? "" : "" },
    }));
  }

  function changeTimerDuration(minutes) {
    saveTimerMinutes(minutes);
    setTimerDuration(minutes);
    setTimerRemaining(minutes * 60);
    setTimerRunning(false);
    setTimerCompleted(false);
    timerEndsAtRef.current = null;
  }

  function toggleTimer() {
    if (timerRunning) {
      setTimerRunning(false);
      timerEndsAtRef.current = null;
      return;
    }
    const nextRemaining = timerRemaining > 0 ? timerRemaining : timerDuration * 60;
    if (timerRemaining === 0) setTimerRemaining(nextRemaining);
    setTimerCompleted(false);
    timerEndsAtRef.current = Date.now() + nextRemaining * 1000;
    setTimerRunning(true);
  }

  function resetTimer() {
    timerEndsAtRef.current = null;
    setTimerRunning(false);
    setTimerCompleted(false);
    setTimerRemaining(timerDuration * 60);
  }

  function toggleSiteTheme() {
    if (readerPreferences.scope === "site") {
      const nextTheme = readerPreferences.display === "night" ? "light" : "dark";
      setTheme(nextTheme);
      setReaderPreferences((current) => ({
        ...current,
        display: nextTheme === "dark" ? "night" : "warm",
      }));
      return;
    }
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  function deleteReply(letterNumber) {
    if (!window.confirm(copy[locale].confirmDelete)) return;
    clearReply(letterNumber);
    setReplies((current) => {
      const next = { ...current };
      delete next[letterNumber];
      return next;
    });
  }

  function downloadReply(filename, body, type) {
    const url = URL.createObjectURL(new Blob([body], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function createObsidianNote(letterNumber) {
    const reply = replies[letterNumber];
    if (!reply?.text) return null;
    const letter = await loadReading(letterNumber);
    return createObsidianExport({
      annotations: loadAnnotations(letterNumber),
      bookmarks: loadBookmarks(letterNumber).filter((bookmark) => bookmark.locale === locale),
      highlights: loadHighlights(letterNumber).filter((highlight) => highlight.locale === locale),
      author: letter.author,
      authorTag: letter.authorId,
      label: formatReadingLabel(letter, locale),
      letter: letterNumber,
      locale,
      original: letter[locale].text,
      reply: reply.text,
      savedAt: reply.savedAt,
      sourceUrl: letter.sources[locale],
      sourceName: letter.sources[locale].includes("wikisource.org") ? "Wikisource" : "Project Gutenberg",
      title: letter[locale].title,
      work: letter.work[locale],
    });
  }

  function obsidianFilename(letterNumber) {
    const letter = getReading(letterNumber);
    const date = (replies[letterNumber]?.savedAt || new Date().toISOString()).slice(0, 10);
    const safeTitle = letter[locale].title.replace(/[\\/:*?"<>|]/gu, "").trim();
    return `${date} - ${letter.author} ${formatReadingCode(letter, locale)} - ${safeTitle}.md`;
  }

  async function saveToObsidian(letterNumber = activeLetterNumber) {
    const note = await createObsidianNote(letterNumber);
    if (!note) return;
    const filename = obsidianFilename(letterNumber);
    setObsidianStatus("");

    if (typeof window.showDirectoryPicker !== "function") {
      downloadReply(filename, note, "text/markdown;charset=utf-8");
      setObsidianStatus("obsidianDownloaded");
      return;
    }

    try {
      const directory = await window.showDirectoryPicker({ id: "cura-obsidian", mode: "readwrite" });
      const available = await availableFilename(filename, async (candidate) => {
        try {
          await directory.getFileHandle(candidate);
          return true;
        } catch (error) {
          if (error?.name === "NotFoundError") return false;
          throw error;
        }
      });
      const file = await directory.getFileHandle(available, { create: true });
      const writable = await file.createWritable();
      await writable.write(note);
      await writable.close();
      setObsidianStatus("obsidianSaved");
    } catch (error) {
      if (error?.name !== "AbortError") setObsidianStatus("obsidianError");
    }
  }

  function downloadObsidianKit(kind) {
    if (kind === "template") {
      downloadReply(
        locale === "fr" ? "Cura - Modele de lettre quotidienne.md" : "Cura - Daily Letter Template.md",
        createObsidianTemplate(locale),
        "text/markdown;charset=utf-8",
      );
      return;
    }
    downloadReply(
      locale === "fr" ? "Cura - Mes retours.md" : "Cura - My Returns.md",
      createObsidianIndex(locale),
      "text/markdown;charset=utf-8",
    );
  }

  async function exportReply(format, letterNumber = activeLetterNumber) {
    const reply = replies[letterNumber];
    if (!reply?.text) return;
    const letter = await loadReading(letterNumber);
    if (format === "print") {
      setActiveLetterNumber(letterNumber);
      window.setTimeout(() => window.print(), 0);
      return;
    }
    if (format === "json") {
      downloadReply(
        `cura-reading-${letterNumber}-backup.json`,
        JSON.stringify({
          version: 1,
          kind: "cura-letter",
          letter: letterNumber,
          locale,
          text: reply.text,
          savedAt: reply.savedAt,
          annotations: loadAnnotations(letterNumber),
          bookmarks: loadBookmarks(letterNumber),
          highlights: loadHighlights(letterNumber),
        }, null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }
    if (format === "text") {
      downloadReply(
        `cura-reading-${letterNumber}.txt`,
        `${formatReadingLabel(letter, locale)}: ${letter[locale].title}\n\n${markdownToPlainText(reply.text)}\n`,
        "text/plain;charset=utf-8",
      );
      return;
    }
    downloadReply(
      `cura-reading-${letterNumber}.md`,
      createMarkdownExport({
        label: formatReadingLabel(letter, locale),
        letter: letterNumber,
        title: letter[locale].title,
        locale,
        savedAt: reply.savedAt,
        text: reply.text,
      }),
      "text/markdown;charset=utf-8",
    );
  }

  async function importReply(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const fileText = await file.text();
      let importedText = fileText;
      let importedSavedAt = new Date().toISOString();
      let targetLetter = activeLetterNumber;
      if (file.name.toLowerCase().endsWith(".json")) {
        const backup = JSON.parse(fileText);
        if (
          backup?.version !== 1
          || backup?.kind !== "cura-letter"
          || !readings.some((letter) => letter.number === backup?.letter)
          || typeof backup?.text !== "string"
        ) {
          throw new Error("Invalid Cura backup");
        }
        targetLetter = backup.letter;
        importedText = backup.text;
        importedSavedAt = typeof backup.savedAt === "string" && Number.isFinite(Date.parse(backup.savedAt))
          ? backup.savedAt
          : importedSavedAt;
        if (backup.annotations && typeof backup.annotations === "object") {
          saveAnnotations(targetLetter, backup.annotations);
        }
        if (Array.isArray(backup.bookmarks)) saveBookmarks(targetLetter, backup.bookmarks);
        if (Array.isArray(backup.highlights)) saveHighlights(targetLetter, backup.highlights);
      } else if (file.name.toLowerCase().endsWith(".md")) {
        const target = await loadReading(targetLetter);
        const knownTitles = ["en", "fr"].map((language) => (
          `${formatReadingLabel(target, language)}: ${target[language].title}`
        ));
        importedText = readMarkdownImport(fileText, knownTitles);
      }
      saveReply(targetLetter, importedText, importedSavedAt);
      setReplies((current) => ({
        ...current,
        [targetLetter]: { text: importedText, savedAt: importedSavedAt },
      }));
      setActiveLetterNumber(targetLetter);
      setImportStatus("importSuccess");
    } catch {
      setImportStatus("importError");
    } finally {
      event.target.value = "";
    }
  }

  function closeLetter() {
    if (!draft) return;
    const timestamp = new Date().toISOString();
    saveReply(activeLetterNumber, draft, timestamp);
    setReplies((current) => ({
      ...current,
      [activeLetterNumber]: { text: draft, savedAt: timestamp },
    }));
  }

  const timer = {
    completed: timerCompleted,
    duration: timerDuration,
    locale,
    onDurationChange: changeTimerDuration,
    onReset: resetTimer,
    onToggle: toggleTimer,
    remaining: timerRemaining,
    running: timerRunning,
  };
  const loadedActiveLetter = activeLetter?.number === activeLetterNumber ? activeLetter : null;
  const effectiveTheme = readerPreferences.scope === "site"
    ? (readerPreferences.display === "night" ? "dark" : "light")
    : theme;

  return (
    <>
      <SelectionPaint />
      <a className="skip-link" href="#main-content">{copy[locale].skip}</a>
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onThemeToggle={toggleSiteTheme}
        section={section}
        onSectionChange={changeSection}
        theme={effectiveTheme}
      />
      {section === "today" ? (
        loadedActiveLetter ? <Today
          key={loadedActiveLetter.number}
          initialFocus={new URLSearchParams(window.location.search).get("focus") === "reading"}
          locale={locale}
          draft={draft}
          letter={loadedActiveLetter}
          obsidianStatus={obsidianStatus}
          onCloseLetter={closeLetter}
          onDraftChange={updateDraft}
          onLocaleChange={setLocale}
          onReadingSelect={openToday}
          onReadingVisibilityChange={setReadingInstrumentVisible}
          onReaderPreferencesChange={setReaderPreferences}
          onSaveObsidian={saveToObsidian}
          readerPreferences={readerPreferences}
          savedAt={savedAt}
          timer={timer}
        /> : (
          <main className="reading-loading" id="main-content">
            <span className="short-rule" aria-hidden="true" />
            <p>{readingLoadError ? copy[locale].readingLoadError : copy[locale].preparingReading}</p>
            <strong>{activeLetterMetadata[locale].title}</strong>
            {readingLoadError ? (
              <button onClick={() => setReadingLoadRevision((current) => current + 1)} type="button">
                {copy[locale].retryReading}
              </button>
            ) : null}
          </main>
        )
      ) : null}
      {section === "letters" ? <Letters locale={locale} onOpen={openToday} /> : null}
      {section === "yourLetters" ? (
        <YourLetters
          importStatus={importStatus}
          locale={locale}
          obsidianStatus={obsidianStatus}
          onOpen={openToday}
          onSaveObsidian={saveToObsidian}
          onDownloadObsidianKit={downloadObsidianKit}
          onClear={deleteReply}
          onExport={exportReply}
          onImport={importReply}
          onLoadReading={loadReading}
          replies={replies}
        />
      ) : null}
      {section !== "today" || !readingInstrumentVisible ? <ReadingTimerDock {...timer} /> : null}
      <footer>
        <span>CURA</span>
        <p>{copy[locale].footer}</p>
        <a href="https://github.com/md7-debug/cura" target="_blank" rel="noreferrer">
          {copy[locale].openSource}
        </a>
      </footer>
    </>
  );
}

function MarkdownPreview({ emptyText = "", text }) {
  const blocks = parseMarkdown(text);

  if (!blocks.length) return <p className="markdown-empty">{emptyText}</p>;

  return (
    <div className="markdown-body" data-selection-surface>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "heading") {
          const Heading = `h${block.level}`;
          return <Heading key={key}><InlineMarkdown text={block.content} /></Heading>;
        }
        if (block.type === "quote") {
          return <blockquote key={key}><InlineMarkdown text={block.content} /></blockquote>;
        }
        if (block.type === "code") {
          return <pre key={key}><code>{block.content}</code></pre>;
        }
        if (block.type === "rule") return <hr key={key} />;
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}><InlineMarkdown text={item} /></li>
              ))}
            </List>
          );
        }
        return <p key={key}><InlineMarkdown text={block.content} /></p>;
      })}
    </div>
  );
}

function InlineMarkdown({ text }) {
  return parseInlineMarkdown(text).map((token, index) => {
    const key = `${token.type}-${index}`;
    if (token.type === "strong") return <strong key={key}>{token.value}</strong>;
    if (token.type === "emphasis") return <em key={key}>{token.value}</em>;
    if (token.type === "code") return <code key={key}>{token.value}</code>;
    if (token.type === "link") {
      return <a href={token.href} key={key} target="_blank" rel="noreferrer">{token.value}</a>;
    }
    return token.value;
  });
}

function readingTime(minutes, locale) {
  return copy[locale].minutes.replace("{number}", minutes);
}

function worksForAuthor(authorId, locale) {
  const works = new Map();
  readings
    .filter((reading) => reading.authorId === authorId)
    .forEach((reading) => {
      if (!works.has(reading.work.en)) {
        works.set(reading.work.en, {
          key: reading.work.en,
          label: reading.work[locale],
          reading: reading.number,
        });
      }
    });
  return [...works.values()];
}

function formatAvailableReadings(count, locale) {
  return count === 1
    ? copy[locale].oneReadingAvailable
    : copy[locale].collectionPosition.replace("{count}", String(count));
}

function formatReadingCode(reading, locale) {
  return readingCode(reading, locale) ?? formatLetterCode(reading.number);
}

function formatReadingLabel(reading, locale) {
  return readingCode(reading, locale) ?? formatLetterLabel(reading.number, locale);
}

function replyExcerpt(text) {
  return markdownToPlainText(text).replace(/\s+/gu, " ").trim();
}

function closestReadingParagraph(node) {
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  return element?.closest?.("[data-paragraph-index]") ?? null;
}

function textOffsetWithin(root, node, offset) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(node, offset);
  return range.toString().length;
}

function renderHighlightedText(text, baseOffset, highlights, onHighlightOpen, interactive) {
  const endOffset = baseOffset + text.length;
  const matches = highlights
    .filter((highlight) => highlight.start < endOffset && highlight.end > baseOffset)
    .sort((a, b) => a.start - b.start);
  if (!matches.length) return text;

  const parts = [];
  let cursor = 0;
  matches.forEach((highlight) => {
    const start = Math.max(0, highlight.start - baseOffset);
    const end = Math.min(text.length, highlight.end - baseOffset);
    if (start > cursor) parts.push(text.slice(cursor, start));
    const highlightedText = text.slice(Math.max(cursor, start), end);
    if (highlightedText) {
      parts.push(interactive ? (
        <mark
          className={`user-highlight${highlight.hasNote ? " has-note" : ""}`}
          data-highlight-id={highlight.id}
          key={highlight.id}
          onClick={() => onHighlightOpen(highlight)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onHighlightOpen(highlight);
            }
          }}
          role="button"
          tabIndex={0}
        >
          {highlightedText}
        </mark>
      ) : (
        <mark
          className="user-highlight-inline"
          data-highlight-id={highlight.id}
          key={highlight.id}
        >
          {highlightedText}
        </mark>
      ));
    }
    cursor = Math.max(cursor, end);
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function AnnotatedParagraph({
  activeNote,
  highlights,
  isBookmarked,
  isReadingPosition,
  locale,
  notes,
  onBookmarkToggle,
  onHighlightOpen,
  onSelect,
  paragraphIndex,
  text,
}) {
  const matches = notes
    .map((note) => ({ note, index: text.indexOf(note.phrase) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index);

  const isActiveContext = activeNote ? text.includes(activeNote.phrase) : false;
  const paragraphClass = [
    "reading-paragraph",
    isActiveContext ? "is-active-context" : "",
    isReadingPosition ? "is-reading-position" : "",
  ].filter(Boolean).join(" ");
  const bookmarkLabel = copy[locale][isBookmarked ? "removeBookmark" : "addBookmark"]
    .replace("{number}", String(paragraphIndex + 1));
  const bookmarkControl = (
    <button
      aria-label={bookmarkLabel}
      aria-pressed={isBookmarked}
      className="paragraph-bookmark"
      onClick={() => onBookmarkToggle(paragraphIndex)}
      title={bookmarkLabel}
      type="button"
    >
      <svg aria-hidden="true" viewBox="0 0 16 20">
        <path d="M3.25 2.5h9.5v14.75L8 14.2l-4.75 3.05V2.5Z" />
      </svg>
    </button>
  );

  if (!matches.length) {
    return (
      <p className={paragraphClass} data-paragraph-index={paragraphIndex}>
        {bookmarkControl}
        {renderHighlightedText(text, 0, highlights, onHighlightOpen, true)}
      </p>
    );
  }

  const parts = [];
  let cursor = 0;
  matches.forEach(({ note, index }) => {
    if (index > cursor) {
      parts.push(renderHighlightedText(
        text.slice(cursor, index),
        cursor,
        highlights,
        onHighlightOpen,
        true,
      ));
    }
    parts.push(
      <button
        aria-expanded={activeNote?.id === note.id}
        aria-controls={activeNote ? "reader-note" : undefined}
        className="annotated-term"
        data-note-id={note.id}
        key={note.id}
        onClick={() => onSelect(activeNote?.id === note.id ? null : note)}
      >
        {renderHighlightedText(note.phrase, index, highlights, onHighlightOpen, false)}
      </button>,
    );
    cursor = index + note.phrase.length;
  });
  if (cursor < text.length) {
    parts.push(renderHighlightedText(
      text.slice(cursor),
      cursor,
      highlights,
      onHighlightOpen,
      true,
    ));
  }

  return (
    <p className={paragraphClass} data-paragraph-index={paragraphIndex}>
      {bookmarkControl}
      {parts}
    </p>
  );
}

function formatTime(value, locale) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

function formatDate(value, locale) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(value));
}

function formatCalendarDate(value, locale) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(`${value}T12:00:00`),
  );
}

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
