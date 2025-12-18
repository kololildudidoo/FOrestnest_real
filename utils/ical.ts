export type IcalEvent = {
  start: Date;
  endExclusive: Date;
  summary?: string;
};

const parseIcsDate = (raw: string): Date | null => {
  const value = raw.trim();

  // All-day: YYYYMMDD
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Date-time: YYYYMMDDTHHMMSSZ (or without seconds)
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?Z?$/);
  if (match) {
    const [, y, m, d, hh, mm, ss] = match;
    const year = Number(y);
    const month = Number(m) - 1;
    const day = Number(d);
    const hour = Number(hh);
    const minute = Number(mm);
    const second = ss ? Number(ss) : 0;
    const date = value.endsWith('Z')
      ? new Date(Date.UTC(year, month, day, hour, minute, second))
      : new Date(year, month, day, hour, minute, second);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Fallback to Date parsing
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const parseIcalEvents = (icsText: string): IcalEvent[] => {
  const lines = icsText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  // Unfold lines (RFC 5545): a line starting with space/tab continues previous line.
  const unfolded: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length) {
      unfolded[unfolded.length - 1] += line.trimStart();
    } else {
      unfolded.push(line);
    }
  }

  const events: IcalEvent[] = [];
  let inEvent = false;
  let dtStartRaw: string | null = null;
  let dtEndRaw: string | null = null;
  let summary: string | null = null;

  const flush = () => {
    if (!dtStartRaw || !dtEndRaw) {
      return;
    }

    const start = parseIcsDate(dtStartRaw);
    const endExclusive = parseIcsDate(dtEndRaw);
    if (!start || !endExclusive) {
      return;
    }

    // iCal DTEND is typically exclusive for all-day events.
    // Keep it exclusive here; callers can convert to inclusive if needed.
    events.push({
      start,
      endExclusive,
      summary: summary ?? undefined,
    });
  };

  for (const line of unfolded) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      dtStartRaw = null;
      dtEndRaw = null;
      summary = null;
      continue;
    }

    if (line === 'END:VEVENT') {
      if (inEvent) {
        flush();
      }
      inEvent = false;
      continue;
    }

    if (!inEvent) {
      continue;
    }

    const [keyPart, ...rest] = line.split(':');
    if (!keyPart || rest.length === 0) {
      continue;
    }
    const value = rest.join(':'); // in case value contains ':'
    const key = keyPart.split(';')[0];

    if (key === 'DTSTART') {
      dtStartRaw = value;
    } else if (key === 'DTEND') {
      dtEndRaw = value;
    } else if (key === 'SUMMARY') {
      summary = value.trim();
    }
  }

  return events;
};

export const toInclusiveDateRange = (event: IcalEvent): { start: Date; end: Date } => {
  // Convert exclusive end into inclusive end used by the app calendar blocking logic.
  const end = addDays(event.endExclusive, -1);
  if (end < event.start) {
    return { start: event.start, end: event.start };
  }
  return { start: event.start, end };
};

