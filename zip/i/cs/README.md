# Prohlížeč objektů - přehled

V tomto **ObjectExplorer** zásuvném modulu můžete procházet data modulů, které jsou v této relaci aktivní. Modul využívá shod struktury modulů s doporučovanou notací pro moduly. Pokud v rámci vývoje svého modulu nedodržíte notaci, je možné, že se zde některé položky nenačtou a nebo se zařadí do jiné typové skupiny než podle Vaší potřeby patří. Postup vývoje modulu je popsán v [dokumentaci pro autory][authDoc].

⚠️ **ObjectExplorer** zásuvný modul je načten pouze pokud aplikace **běží s DEBUG_MODE = true v hvdata/appmain.js**. V opačném případě není k dispozici žádná funkcionalita ani výstup a aplikace vrací odpověď nenalezeno pro kapitoly, které modul obsluhuje.

## Skupiny

Ve stromě v bočním panelu jsou veškeré položky rozděleny hierarchicky ve struktuře skupina - modul - instance - poskytované objekty.

| Skupina | Význam |
|---|---|
<!-- %GROUPS% -->

## Objekty

Objekty jsou v přehledu rozlišeny hierarchií a ikonou. Význam ikon je tento:

| Objekt | Význam |
|---|---|
<!-- %OBJCLASS% -->

[authDoc]: https://helpviewer.github.io/?d=hlp-aguide/Help-__.zip "Dokumentace pro autory"
