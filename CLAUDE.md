@AGENTS.md

# Projekt: Finanz-Kids

## Ziel
Mobile App für Google Play (Android), mit der man auch komplexe Finanzinstrumente
(z. B. Optionen) schnell und einfach bewerten kann. Gedacht, um Kindern auf
zugängliche Weise zu zeigen, wie Finanzbewertung funktioniert — sinngemäß eine
mobile, kindgerechte Version der Optionsbewertungs-Logik aus dem Excel-Modell
im Projekt `Ki_mit_Kindern`.

Entwickelt gemeinsam mit den Kindern, Ziel: Veröffentlichung im Google Play Store.

## Tech-Stack
- Expo / React Native, SDK 54 (bewusst gepinnt, NICHT auf "Latest" upgraden —
  neuere SDKs sind oft noch nicht mit der offiziellen Expo-Go-App aus dem
  App Store/Play Store kompatibel)
- Sprache: JavaScript

## Workflow
- Code wird per Prompt hier in Claude Code geschrieben, nicht von Hand getippt
- Live-Test läuft über Expo Go auf dem eigenen Handy (QR-Code scannen), nicht
  über Xcode/Simulator
- Xcode wird nur für den finalen iOS-Build/App-Store-Upload gebraucht
- Commits/Push über GitHub Desktop

## Wichtig beim Programmieren mit den Kindern
(Übernommen als Standard aus den anderen Familien-Projekten — bei Bedarf an das
tatsächliche Alter/Kenntnisstand hier anpassen, siehe Offene Punkte.)
- Bei jedem Code-Block kurz erklären, was er tut, nicht nur liefern
- Kleine, nachvollziehbare Schritte statt große Sprünge
- Bei Fehlern: erst gemeinsam die Fehlermeldung lesen und verstehen lassen,
  dann erst nach der Lösung fragen

## Fachlicher Hintergrund (Finanzbewertung)
Im Projekt `Ki_mit_Kindern` existiert bereits ein ausführliches Excel-Bewertungsmodell
(`Optionsbewertung_Europaeisch_Amerikanisch.xlsx`): Black-Scholes-Merton für
europäische Optionen (mit diskreten Dividenden und interpolierter Zinskurve),
CRR-Binomialbaum für amerikanische Optionen, Black-76 + Binomialbaum für
Optionen auf Futures (WTI Crude Oil). Diese App soll denselben fachlichen Kern
kindgerecht/mobil zugänglich machen — die Formellogik von dort ist ein
sinnvoller Ausgangspunkt statt einer Neuherleitung.

## Bekannte Stolperfallen
- Tunnel-Modus ("--tunnel") bei der Expo-CLI kann fehlerhaft sein, im Zweifel
  ohne `--tunnel` starten
- Bei Versions-Warnungen: `npx expo install --fix`
- Handy nicht gleichzeitig als Hotspot UND Testgerät nutzen

## Offene Punkte
- Genauer Funktionsumfang der App (welche Finanzinstrumente, welche Eingaben,
  wie stark vereinfacht für Kinder) noch offen — vermutlich Thema der ersten
  gemeinsamen Session
- Alter/Anzahl der beteiligten Kinder hier noch nicht bestätigt
- App-Icon/Branding noch nicht gestaltet (Standard-Expo-Icons als Platzhalter)
- EAS-Projekt: `eas.json` ist vorbereitet, aber noch nicht mit einem echten
  Expo-Account/Projekt verknüpft (passiert beim ersten `eas build`)
- Google-Play-Konto/Erstveröffentlichung noch nicht eingerichtet

## Status
Grundgerüst (Expo SDK 54, blank template) steht, lokal git-initialisiert
(Stand 2026-07-21). Noch kein Feature-Code geschrieben — bereit für den Start
der eigentlichen Entwicklung mit den Kindern im Terminal.
