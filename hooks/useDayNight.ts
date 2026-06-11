// hooks/useDayNight.ts
// Hook för att hantera dag/natt-cykeln baserat på enhetens klocka
// Uppdateras varje minut och returnerar aktuell tidsfas och färger
// Tidsfaser: gryning, dag, kväll, solnedgång, natt

import { useEffect, useState } from 'react';

// Alla möjliga tidsfaser
export type TimeOfDay =
  | 'dawn'     // Gryning — 05:00-07:00
  | 'morning'  // Morgon — 07:00-12:00
  | 'day'      // Dag — 12:00-17:00
  | 'evening'  // Kväll — 17:00-20:00
  | 'sunset'   // Solnedgång — 20:00-22:00
  | 'night';   // Natt — 22:00-05:00

// Färger för varje tidsfas — himmel, mark och ljus
export type DayNightColors = {
  sky: string;        // Himmelsfärg
  skyGlow: string;    // Nedre del av himlen — gradient-känsla
  ground: string;     // Markfärg
  grass: string;      // Gräsfärg
  treeDark: string;   // Mörka trädfärger
  treeLight: string;  // Ljusa trädfärger
  ambientLight: string; // Omgivningsljus — påverkar övriga färger
};

// Färgpaletter per tidsfas
const TIME_COLORS: Record<TimeOfDay, DayNightColors> = {
  dawn: {
    sky: '#1A1A3A',
    skyGlow: '#4A2A4A',
    ground: '#1E3010',
    grass: '#2A4A18',
    treeDark: '#122108',
    treeLight: '#1A3010',
    ambientLight: '#4A3A5A',
  },
  morning: {
    sky: '#87CEEB',
    skyGlow: '#FFF5CC',
    ground: '#2D4A1E',
    grass: '#3A6028',
    treeDark: '#1A4010',
    treeLight: '#2A5A1E',
    ambientLight: '#FFFAEE',
  },
  day: {
    sky: '#4A90D9',
    skyGlow: '#87CEEB',
    ground: '#2D4A1E',
    grass: '#3A6028',
    treeDark: '#1A4010',
    treeLight: '#2A5A1E',
    ambientLight: '#FFFFFF',
  },
  evening: {
    sky: '#2A5A8A',
    skyGlow: '#E8A050',
    ground: '#243A18',
    grass: '#304E20',
    treeDark: '#162E0C',
    treeLight: '#204018',
    ambientLight: '#E8C080',
  },
  sunset: {
    sky: '#1A2A4A',
    skyGlow: '#CC5500',
    ground: '#1E3010',
    grass: '#2A4018',
    treeDark: '#122108',
    treeLight: '#1A3010',
    ambientLight: '#CC7040',
  },
  night: {
    sky: '#0A0A1A',
    skyGlow: '#1A2D40',
    ground: '#1A2A0E',
    grass: '#223A14',
    treeDark: '#0A1A06',
    treeLight: '#122108',
    ambientLight: '#1A2A3A',
  },
};

// Returnerar tidsfas baserat på timme
const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 7)   return 'dawn';
  if (hour >= 7 && hour < 12)  return 'morning';
  if (hour >= 12 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  if (hour >= 20 && hour < 22) return 'sunset';
  return 'night';
};

// Formaterar timme och minut till läsbar tid — t.ex. "14:32"
const formatTime = (hour: number, minute: number): string =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

// Hook som exponerar dag/natt-data till UI-komponenter
const useDayNight = () => {
  const now = new Date();

  // Aktuell tidsfas
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    getTimeOfDay(now.getHours())
  );

  // Aktuell tid som sträng — t.ex. "14:32"
  const [currentTime, setCurrentTime] = useState(
    formatTime(now.getHours(), now.getMinutes())
  );

  // Aktuella färger baserat på tidsfas
  const [colors, setColors] = useState<DayNightColors>(
    TIME_COLORS[getTimeOfDay(now.getHours())]
  );

  // Visar sol eller måne
  const [showSun, setShowSun] = useState(
    now.getHours() >= 7 && now.getHours() < 20
  );

  useEffect(() => {
    // Uppdaterar tidsfas och färger varje minut
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const phase = getTimeOfDay(hour);

      setTimeOfDay(phase);
      setCurrentTime(formatTime(hour, minute));
      setColors(TIME_COLORS[phase]);
      setShowSun(hour >= 7 && hour < 20);
    }, 60000); // Uppdaterar varje minut

    return () => clearInterval(interval);
  }, []);

  return { timeOfDay, currentTime, colors, showSun };
};

export default useDayNight;