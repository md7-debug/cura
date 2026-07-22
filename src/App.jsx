import { useEffect, useRef, useState } from "react";
import { getLetter, letters } from "./content/letters.js";
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
import {
  clearReply,
  loadAnnotations,
  loadActiveLetter,
  loadHighlights,
  loadLocale,
  loadReaderPreferences,
  loadReadingPosition,
  loadReplies,
  loadTheme,
  saveLocale,
  saveAnnotations,
  saveActiveLetter,
  saveHighlights,
  saveReaderPreferences,
  saveReadingPosition,
  saveReply,
  saveTheme,
} from "./lib/storage.js";

const sections = ["today", "letters", "yourLetters"];

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

function Today({
  draft,
  letter,
  locale,
  obsidianStatus,
  onCloseLetter,
  onDraftChange,
  onSaveObsidian,
  savedAt,
}) {
  const t = copy[locale];
  const content = letter[locale];
  const letterNumber = letter.number;
  const letterLabel = formatLetterLabel(letterNumber, locale);
  const composerRef = useRef(null);
  const focusDialogRef = useRef(null);
  const resumeButtonRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [annotations, setAnnotations] = useState(() => loadAnnotations(letterNumber));
  const [highlights, setHighlights] = useState(() => loadHighlights(letterNumber));
  const [annotationScope, setAnnotationScope] = useState("letter");
  const [pendingHighlight, setPendingHighlight] = useState(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isReaderSettingsOpen, setIsReaderSettingsOpen] = useState(false);
  const [replyMode, setReplyMode] = useState("write");
  const [readerPreferences, setReaderPreferences] = useState(loadReaderPreferences);
  const [readingPosition, setReadingPosition] = useState(() => loadReadingPosition(letterNumber));
  const visibleHighlights = highlights.flatMap((highlight) => {
    if (highlight.locale !== locale) return [];
    const paragraph = content.text[highlight.paragraphIndex];
    if (typeof paragraph !== "string") return [];
    if (paragraph.slice(highlight.start, highlight.end) === highlight.quote) return [highlight];
    const start = paragraph.indexOf(highlight.quote);
    return start >= 0 ? [{ ...highlight, start, end: start + highlight.quote.length }] : [];
  });

  useEffect(() => {
    saveReaderPreferences(readerPreferences);
  }, [readerPreferences]);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveAnnotations(letterNumber, annotations), 250);
    return () => window.clearTimeout(timeout);
  }, [annotations]);

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

    const paragraphs = document.querySelectorAll("[data-paragraph-index]");
    paragraphs.forEach((paragraph) => observer.observe(paragraph));
    return () => observer.disconnect();
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return undefined;
    document.addEventListener("selectionchange", captureHighlightSelection);
    document.addEventListener("pointerup", captureHighlightSelection, true);
    document.addEventListener("mouseup", captureHighlightSelection, true);
    return () => {
      document.removeEventListener("selectionchange", captureHighlightSelection);
      document.removeEventListener("pointerup", captureHighlightSelection, true);
      document.removeEventListener("mouseup", captureHighlightSelection, true);
    };
  }, [isFocused]);

  function closeFocusedReading() {
    setIsFocused(false);
    setActiveNote(null);
    setIsNotebookOpen(false);
    setIsReaderSettingsOpen(false);
    setPendingHighlight(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => {
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
      setPendingHighlight({
        paragraphIndex,
        start,
        end,
        quote,
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

  function deleteSavedHighlight(highlightId) {
    setHighlights((current) => current.filter((highlight) => highlight.id !== highlightId));
    setAnnotations((current) => {
      const next = { ...current };
      delete next[`highlight:${highlightId}`];
      return next;
    });
    openNotebook("letter");
  }

  if (isFocused) {
    return (
      <dialog
        aria-labelledby="focused-letter-title"
        className="focus-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeFocusedReading();
        }}
        ref={focusDialogRef}
      >
        <main id="main-content" className="focus-page">
          <article
            className={`focused-reader reader-size-${readerPreferences.size} reader-spacing-${readerPreferences.spacing}`}
            aria-labelledby="focused-letter-title"
          >
            <div className="focus-header">
              <p className="eyebrow">{letterLabel}</p>
              <div className="reader-actions">
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
                <button onClick={closeFocusedReading}>{t.returnToReflection}</button>
              </div>
            </div>
            {isReaderSettingsOpen ? (
              <ReaderPreferences
                locale={locale}
                onChange={setReaderPreferences}
                preferences={readerPreferences}
              />
            ) : null}
            <span className="short-rule" aria-hidden="true" />
            <h1 id="focused-letter-title">{content.title}</h1>
            <p className="glossary-hint">{t.glossaryHint}</p>
            <div
              className={`focused-copy${activeNote ? " has-active-note" : ""}`}
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
                  key={paragraph}
                  notes={content.notes}
                  onHighlightOpen={openSavedHighlight}
                  onSelect={showNote}
                  paragraphIndex={paragraphIndex}
                  text={paragraph}
                />
              ))}
            </div>
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
            <button className="finish-reading" onClick={closeFocusedReading}>
              {t.finishReading}
            </button>
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
              highlights={visibleHighlights}
              locale={locale}
              onChange={setAnnotations}
              onClose={() => setIsNotebookOpen(false)}
              onDeleteHighlight={deleteSavedHighlight}
              onOpenHighlight={openSavedHighlight}
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
      <article className="reading-layout">
        <section className="letter" aria-labelledby="letter-title">
          <p className="eyebrow">{letterLabel}</p>
          <span className="short-rule" aria-hidden="true" />
          <h1 id="letter-title" className="sr-only">{content.title}</h1>
          <div className="letter-copy">
            <p>{content.preview}</p>
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

        <section className="interpretation" aria-labelledby="interpretation-title">
          <span className="vertical-rule" aria-hidden="true" />
          <div className="interpretation-copy">
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

      <section className="composer" ref={composerRef} aria-labelledby="composer-title">
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
    </main>
  );
}

function ReaderPreferences({ locale, onChange, preferences }) {
  const t = copy[locale];

  function updatePreference(key, value) {
    onChange((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="reader-preferences" id="reader-preferences">
      <div className="preference-group">
        <span>{t.textSize}</span>
        <div role="group" aria-label={t.textSize}>
          {["small", "regular", "large"].map((size) => (
            <button
              aria-pressed={preferences.size === size}
              key={size}
              onClick={() => updatePreference("size", size)}
            >
              {t.readerSizes[size]}
            </button>
          ))}
        </div>
      </div>
      <div className="preference-group">
        <span>{t.lineSpacing}</span>
        <div role="group" aria-label={t.lineSpacing}>
          {["comfortable", "open"].map((spacing) => (
            <button
              aria-pressed={preferences.spacing === spacing}
              key={spacing}
              onClick={() => updatePreference("spacing", spacing)}
            >
              {t.readerSpacing[spacing]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnotationNotebook({
  annotations,
  highlights,
  locale,
  onChange,
  onClose,
  onDeleteHighlight,
  onOpenHighlight,
  scope,
  scopeTitle,
}) {
  const t = copy[locale];
  const [mode, setMode] = useState("type");
  const entry = annotations[scope] ?? { text: "", strokes: [] };

  function updateEntry(nextEntry) {
    onChange((current) => ({
      ...current,
      [scope]: { ...entry, ...nextEntry },
    }));
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
          <p>{t.highlights}</p>
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
        </div>
      ) : null}
      {scope.startsWith("highlight:") ? (
        <button
          className="delete-highlight"
          onClick={() => onDeleteHighlight(scope.replace("highlight:", ""))}
        >
          {t.deleteHighlight}
        </button>
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
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const visibleLetters = letters.filter((letter) => (
    !normalizedQuery
    || String(letter.number).includes(normalizedQuery)
    || letter[locale].title.toLocaleLowerCase(locale).includes(normalizedQuery)
  ));

  return (
    <main id="main-content" className="index-page library-page">
      <header className="page-intro">
        <p className="eyebrow">{t.nav.letters}</p>
        <h1>{t.libraryTitle}</h1>
        <p>{t.libraryIntro}</p>
      </header>
      <div className="letter-search">
        <label htmlFor="letter-search">{t.searchLetters}</label>
        <input
          id="letter-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchLettersPlaceholder}
          type="search"
          value={query}
        />
        <span>{visibleLetters.length} / {letters.length}</span>
      </div>
      <div className="letter-index-list">
        {visibleLetters.map((letter) => (
          <button key={letter.number} onClick={() => onOpen(letter.number)}>
            <span>{formatLetterCode(letter.number)}</span>
            <strong>{letter[locale].title}</strong>
            <small>{readingTime(letter[locale].text, locale)}</small>
          </button>
        ))}
      </div>
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
  onOpen,
  onSaveObsidian,
  onDownloadObsidianKit,
  replies,
}) {
  const t = copy[locale];
  const [openNumber, setOpenNumber] = useState(null);
  const savedLetters = letters.filter((letter) => replies[letter.number]?.text);

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
            const preview = replyExcerpt(reply.text);
            return (
              <article className="saved-letter" key={letter.number}>
                <div className="saved-letter-summary">
                  <span>{formatLetterLabel(letter.number, locale)}</span>
                  <strong>{letter[locale].title}</strong>
                  <p>{preview.slice(0, 110)}{preview.length > 110 ? "…" : ""}</p>
                  <time dateTime={reply.savedAt}>{formatDate(reply.savedAt, locale)}</time>
                  <button
                    aria-expanded={isOpen}
                    onClick={() => setOpenNumber(isOpen ? null : letter.number)}
                  >
                    {isOpen ? t.closeReading : t.compareLetters}
                  </button>
                </div>
                {isOpen ? (
                  <div className="letter-comparison">
                    <section aria-labelledby={`seneca-${letter.number}`}>
                      <p className="comparison-label">{t.senecaLetter}</p>
                      <h2 id={`seneca-${letter.number}`}>{letter[locale].title}</h2>
                      <div className="comparison-copy seneca-comparison-copy">
                        {letter[locale].text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      </div>
                    </section>
                    <section aria-labelledby={`reply-${letter.number}`}>
                      <p className="comparison-label">{t.yourLetter}</p>
                      <h2 id={`reply-${letter.number}`}>{formatLetterLabel(letter.number, locale)}</h2>
                      <div className="comparison-copy"><MarkdownPreview text={reply.text} /></div>
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
                  </div>
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
  const [section, setSection] = useState("today");
  const [activeLetterNumber, setActiveLetterNumber] = useState(loadActiveLetter);
  const [replies, setReplies] = useState(() => loadReplies(letters.map((letter) => letter.number)));
  const [importStatus, setImportStatus] = useState("");
  const [obsidianStatus, setObsidianStatus] = useState("");
  const activeLetter = getLetter(activeLetterNumber);
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
    saveActiveLetter(activeLetterNumber);
  }, [activeLetterNumber]);

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

  function createObsidianNote(letterNumber) {
    const letter = getLetter(letterNumber);
    const reply = replies[letterNumber];
    if (!reply?.text) return null;
    return createObsidianExport({
      annotations: loadAnnotations(letterNumber),
      highlights: loadHighlights(letterNumber).filter((highlight) => highlight.locale === locale),
      label: formatLetterLabel(letterNumber, locale),
      letter: letterNumber,
      locale,
      original: letter[locale].text,
      reply: reply.text,
      savedAt: reply.savedAt,
      sourceUrl: letter.sources[locale],
      title: letter[locale].title,
    });
  }

  function obsidianFilename(letterNumber) {
    const letter = getLetter(letterNumber);
    const date = (replies[letterNumber]?.savedAt || new Date().toISOString()).slice(0, 10);
    const safeTitle = letter[locale].title.replace(/[\\/:*?"<>|]/gu, "").trim();
    return `${date} - Seneca ${formatLetterCode(letterNumber)} - ${safeTitle}.md`;
  }

  async function saveToObsidian(letterNumber = activeLetterNumber) {
    const note = createObsidianNote(letterNumber);
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

  function exportReply(format, letterNumber = activeLetterNumber) {
    const letter = getLetter(letterNumber);
    const reply = replies[letterNumber];
    if (!reply?.text) return;
    if (format === "print") {
      setActiveLetterNumber(letterNumber);
      window.print();
      return;
    }
    if (format === "json") {
      downloadReply(
        `cura-letter-${formatLetterCode(letterNumber)}-backup.json`,
        JSON.stringify({
          version: 1,
          kind: "cura-letter",
          letter: letterNumber,
          locale,
          text: reply.text,
          savedAt: reply.savedAt,
          annotations: loadAnnotations(letterNumber),
          highlights: loadHighlights(letterNumber),
        }, null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }
    if (format === "text") {
      downloadReply(
        `cura-letter-${formatLetterCode(letterNumber)}.txt`,
        `${formatLetterLabel(letterNumber, locale)}: ${letter[locale].title}\n\n${markdownToPlainText(reply.text)}\n`,
        "text/plain;charset=utf-8",
      );
      return;
    }
    downloadReply(
      `cura-letter-${formatLetterCode(letterNumber)}.md`,
      createMarkdownExport({
        label: formatLetterLabel(letterNumber, locale),
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
          || !letters.some((letter) => letter.number === backup?.letter)
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
        if (Array.isArray(backup.highlights)) saveHighlights(targetLetter, backup.highlights);
      } else if (file.name.toLowerCase().endsWith(".md")) {
        const target = getLetter(targetLetter);
        const knownTitles = ["en", "fr"].map((language) => (
          `${formatLetterLabel(targetLetter, language)}: ${target[language].title}`
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

  return (
    <>
      <a className="skip-link" href="#main-content">{copy[locale].skip}</a>
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onThemeToggle={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
        section={section}
        onSectionChange={changeSection}
        theme={theme}
      />
      {section === "today" ? (
        <Today
          key={activeLetter.number}
          locale={locale}
          draft={draft}
          letter={activeLetter}
          obsidianStatus={obsidianStatus}
          onCloseLetter={closeLetter}
          onDraftChange={updateDraft}
          onSaveObsidian={saveToObsidian}
          savedAt={savedAt}
        />
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
          replies={replies}
        />
      ) : null}
      <footer>
        <span>CURA</span>
        <p>{copy[locale].footer}</p>
        <a href="https://github.com/md7-debug/cura-seneca" target="_blank" rel="noreferrer">
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
    <div className="markdown-body">
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

function readingTime(paragraphs, locale) {
  const words = paragraphs.join(" ").trim().split(/\s+/u).filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(words / 220));
  return copy[locale].minutes.replace("{number}", minutes);
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
        <button
          className="user-highlight"
          data-highlight-id={highlight.id}
          key={highlight.id}
          onClick={() => onHighlightOpen(highlight)}
        >
          {highlightedText}
        </button>
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
  notes,
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
  const paragraphClass = `reading-paragraph${isActiveContext ? " is-active-context" : ""}`;

  if (!matches.length) {
    return (
      <p className={paragraphClass} data-paragraph-index={paragraphIndex}>
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

  return <p className={paragraphClass} data-paragraph-index={paragraphIndex}>{parts}</p>;
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
