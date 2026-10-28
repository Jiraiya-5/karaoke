import { Lrc } from "lrc-kit";

// Timeline de sílabas + luces. La UI pinta `{ before, painted, rest }` (sin HTML).
const selectLineRegex = /^\s*(\d+)\s*:\s*(\d+(\s*[\.:]\s*\d+)?)\s*$/;
const selectWordRegex = /(<|\[)+(\d*:\d*.\d*)+(>|\])/g;

function roundTime(value) {
  return value.toFixed(2) * 1;
}

function parseTime(tag) {
  const matches = selectLineRegex.exec(tag);
  const minutes = parseFloat(matches[1]);
  const seconds = parseFloat(matches[2].replace(/\s+/g, "").replace(":", "."));
  return minutes * 60 + seconds;
}

function syllablesInLine(lineContent) {
  const lyrics = [];
  let content = "";

  lineContent
    .trim()
    .split(/<|>/g)
    .forEach(function (part, index) {
      if (index % 2) {
        lyrics.push({
          timestamp: parseTime(part),
          content: content,
        });
      } else {
        content = part;
      }
    });

  return lyrics;
}

function plainLine(line) {
  return line.content.replace(selectWordRegex, "");
}

function emptyKaraokeLine() {
  return { before: "", painted: "", rest: "" };
}

function karaokeLine(text, painted) {
  const prefix = painted || "";
  if (!text) {
    return emptyKaraokeLine();
  }
  if (!prefix) {
    return { before: "", painted: "", rest: text };
  }
  // Equivale a String.replace(prefix, span): solo la primera coincidencia.
  const at = text.indexOf(prefix);
  if (at === -1) {
    return { before: "", painted: "", rest: text };
  }
  return {
    before: text.slice(0, at),
    painted: prefix,
    rest: text.slice(at + prefix.length),
  };
}

function paintEventsForLine(songLrc, pos, size) {
  const line = songLrc[pos];
  const nextLine = pos + 1 < size ? songLrc[pos + 1] : null;
  const events = [];
  const syllables = syllablesInLine(line.content);
  const syllablesSize = syllables.length;
  let painted = "";

  for (let index = 0; index < syllablesSize; index++) {
    const syllable = syllables[index];
    painted += syllable.content;
    events.push({
      showLight: null,
      timestamp: roundTime(syllable.timestamp),
      classicEmpty: false,
      introCountdown: false,
      linePos: pos,
      painted,
    });
  }

  if (
    nextLine &&
    syllablesSize > 0 &&
    nextLine.timestamp - syllables[syllablesSize - 1].timestamp >= 5
  ) {
    const lastStamp = syllables[syllablesSize - 1].timestamp;
    events.push({
      showLight: null,
      timestamp: roundTime(lastStamp + 0.5),
      classicEmpty: true,
      introCountdown: false,
      linePos: pos,
      painted,
    });
    events.push(
      {
        showLight: "3",
        timestamp: roundTime(nextLine.timestamp - 3.2),
        classicEmpty: false,
        introCountdown: false,
        linePos: pos,
        painted,
      },
      {
        showLight: "2",
        timestamp: roundTime(nextLine.timestamp - 2.2),
        classicEmpty: false,
        introCountdown: false,
        linePos: pos,
        painted,
      },
      {
        showLight: "1",
        timestamp: roundTime(nextLine.timestamp - 1.2),
        classicEmpty: false,
        introCountdown: false,
        linePos: pos,
        painted,
      },
      {
        showLight: "0",
        timestamp: roundTime(nextLine.timestamp - 0.2),
        classicEmpty: false,
        introCountdown: false,
        linePos: pos,
        painted,
      }
    );
  }

  return events;
}

export function buildKaraokeTimeline(rawLyrics) {
  const songLrc = Lrc.parse(rawLyrics).lyrics;
  const size = songLrc.length;
  const lines = songLrc.map((line) => ({
    text: plainLine(line),
    timestamp: line.timestamp,
  }));

  const events = [];
  const firstTime = songLrc[0].timestamp - 3.2;

  for (let index = 0; index < size; index++) {
    if (index === 0) {
      events.push(
        {
          showLight: "3",
          timestamp: roundTime(firstTime),
          classicEmpty: false,
          introCountdown: true,
          linePos: 0,
          painted: "",
        },
        {
          showLight: "2",
          timestamp: roundTime(firstTime + 1),
          classicEmpty: false,
          introCountdown: true,
          linePos: 0,
          painted: "",
        },
        {
          showLight: "1",
          timestamp: roundTime(firstTime + 2),
          classicEmpty: false,
          introCountdown: true,
          linePos: 0,
          painted: "",
        },
        {
          showLight: "0",
          timestamp: roundTime(firstTime + 3),
          classicEmpty: false,
          introCountdown: true,
          linePos: 0,
          painted: "",
        }
      );
    }
    events.push(...paintEventsForLine(songLrc, index, size));
  }

  return {
    lines,
    events,
    timeRange: [events[0].timestamp, events[events.length - 1].timestamp],
  };
}

function classicLines(event, lines) {
  if (event.classicEmpty) {
    return [];
  }

  const pos = event.linePos;
  const current = lines[pos];
  const next = lines[pos + 1];
  const prev = lines[pos - 1];
  const painted = event.painted;

  // Par: línea actual + siguiente. Impar: siguiente (o previa si es la última) + actual.
  if (event.introCountdown || pos % 2 === 0) {
    return [
      karaokeLine(current?.text, painted),
      karaokeLine(next?.text, ""),
    ];
  }

  if (!next) {
    return [
      karaokeLine(prev?.text, prev?.text),
      karaokeLine(current?.text, painted),
    ];
  }

  return [
    karaokeLine(next.text, ""),
    karaokeLine(current.text, painted),
  ];
}

function fullLyricLines(event, lines) {
  const size = lines.length;
  const display = [];

  if (event.introCountdown) {
    for (let i = 0; i < 4; i++) {
      display.push(emptyKaraokeLine());
    }
    display.push(emptyKaraokeLine());
    for (let index = 0; index < 4; index++) {
      display.push(karaokeLine(lines[index]?.text, ""));
    }
    return display;
  }

  const pos = event.linePos;
  for (let index = 4; index > 0; index--) {
    const itemIndex = pos - index;
    if (itemIndex >= 0) {
      display.push(karaokeLine(lines[itemIndex].text, lines[itemIndex].text));
    } else {
      display.push(emptyKaraokeLine());
    }
  }

  display.push(karaokeLine(lines[pos]?.text, event.painted));

  for (let index = 1; index <= 4; index++) {
    const itemIndex = pos + index;
    if (itemIndex >= 0 && itemIndex < size) {
      display.push(karaokeLine(lines[itemIndex].text, ""));
    } else {
      display.push(emptyKaraokeLine());
    }
  }

  return display;
}

export function getDisplayedKaraokeLines(event, lines, showAllLyric) {
  if (!event || !lines) {
    return [];
  }
  if (showAllLyric) {
    return fullLyricLines(event, lines);
  }
  return classicLines(event, lines);
}
